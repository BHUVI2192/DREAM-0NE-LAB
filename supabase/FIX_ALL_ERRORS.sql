-- ============================================================
-- FIX_ALL_ERRORS.sql
-- HOW TO RUN:
--   1. Open https://supabase.com/dashboard
--   2. Select your project
--   3. Go to SQL Editor (left sidebar)
--   4. Click "New query"
--   5. Paste this entire file and click "Run"
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- FIX 1: RLS infinite recursion on profiles
-- ──────────────────────────────────────────────────────────────
-- Every admin policy checks:
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
-- That inner SELECT also triggers RLS on profiles, which re-runs
-- the admin check, which runs the inner SELECT again → infinite
-- recursion → 500 on profiles, purchases, alerts, books, episodes.
--
-- Fix: replace the raw subquery with a SECURITY DEFINER function.
-- SECURITY DEFINER functions run with the owner's privileges and
-- BYPASS RLS, so the inner SELECT never triggers policies again.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND (is_admin = TRUE OR email = 'cnbhuvan011@gmail.com')
    )
    OR COALESCE(auth.jwt() ->> 'email', '') = 'cnbhuvan011@gmail.com';
END;
$$;

-- Allow every authenticated user to call this function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ── Profiles ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own profile"     ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles"   ON profiles;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (public.is_admin());

-- ── Books ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can view published books" ON books;
DROP POLICY IF EXISTS "Admins can manage books"         ON books;

CREATE POLICY "Anyone can view published books"
    ON books FOR SELECT
    USING (is_published = TRUE OR public.is_admin());

CREATE POLICY "Admins can manage books"
    ON books FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ── Episodes ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can view episodes of published books" ON episodes;
DROP POLICY IF EXISTS "Admins can manage episodes"                  ON episodes;

CREATE POLICY "Anyone can view episodes of published books"
    ON episodes FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM books WHERE id = episodes.book_id AND is_published = TRUE)
        OR public.is_admin()
    );

CREATE POLICY "Admins can manage episodes"
    ON episodes FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ── Purchases ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view all purchases" ON purchases;

CREATE POLICY "Admins can view all purchases"
    ON purchases FOR SELECT
    USING (public.is_admin());

-- ── Alerts ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can view active alerts" ON alerts;
DROP POLICY IF EXISTS "Admins can manage alerts" ON alerts;

CREATE POLICY "Anyone can view active alerts"
    ON alerts FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Admins can manage alerts"
    ON alerts FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ── Audit logs ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (public.is_admin());

-- ──────────────────────────────────────────────────────────────
-- FIX 2: Add audience column to alerts (idempotent)
-- ──────────────────────────────────────────────────────────────
ALTER TABLE alerts
    ADD COLUMN IF NOT EXISTS audience TEXT DEFAULT 'all';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'alerts_audience_check'
    ) THEN
        ALTER TABLE alerts
            ADD CONSTRAINT alerts_audience_check
            CHECK (audience IN ('all', 'premium', 'free'));
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ──────────────────────────────────────────────────────────────
-- FIX 4: Ensure admin flag is set for dashboard admin user
-- ──────────────────────────────────────────────────────────────
UPDATE public.profiles
SET is_admin = TRUE,
    updated_at = NOW()
WHERE email = 'cnbhuvan011@gmail.com'
   OR phone = '+919591152192'
   OR phone_number = '+919591152192';

CREATE INDEX IF NOT EXISTS idx_alerts_active_created_at
    ON alerts(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_audience
    ON alerts(audience);

-- ──────────────────────────────────────────────────────────────
-- FIX 3: Fix subscriptions admin policy recursion (if table exists)
-- ──────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'subscriptions'
    ) THEN
        EXECUTE 'ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY';

        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions';
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions';
        EXECUTE 'DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions';
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage subscriptions" ON subscriptions';
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions';
        EXECUTE 'DROP POLICY IF EXISTS "Users can create own subscriptions" ON subscriptions';
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON subscriptions';

        EXECUTE 'CREATE POLICY "Users can view own subscriptions"
            ON subscriptions FOR SELECT
            USING (auth.uid() = user_id)';

        EXECUTE 'CREATE POLICY "Users can create own subscriptions"
            ON subscriptions FOR INSERT
            WITH CHECK (auth.uid() = user_id)';

        EXECUTE 'CREATE POLICY "Admins can manage all subscriptions"
            ON subscriptions FOR ALL
            USING (public.is_admin())
            WITH CHECK (public.is_admin())';
    END IF;
END $$;

-- ──────────────────────────────────────────────────────────────
-- VERIFY after running (paste in a second query tab):
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';
-- SELECT proname FROM pg_proc WHERE proname = 'is_admin';
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'alerts' AND column_name = 'audience';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'subscriptions';
-- SELECT id, email, phone, phone_number, is_admin FROM profiles
--   WHERE email = 'cnbhuvan011@gmail.com'
--      OR phone = '+919591152192'
--      OR phone_number = '+919591152192';
-- ──────────────────────────────────────────────────────────────
