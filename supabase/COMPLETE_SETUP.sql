-- COMPLETE DATABASE SETUP FOR DREAM ONE LAB
-- Run this entire file in your Supabase SQL Editor
-- This will create all tables, functions, and policies needed

-- ==============================================
-- STEP 1: Add missing columns to existing tables
-- ==============================================

-- Add subscription and special series columns to books
-- Note: Using is_premium instead of is_special (column already exists)
ALTER TABLE books ADD COLUMN IF NOT EXISTS special_price NUMERIC;

-- Add purchase_type to purchases table
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS purchase_type TEXT DEFAULT 'book' CHECK (purchase_type IN ('book', 'subscription', 'special_series'));
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS subscription_id UUID;

-- Add book_id to downloads if missing
ALTER TABLE downloads ADD COLUMN IF NOT EXISTS book_id UUID REFERENCES books(id) ON DELETE CASCADE;
ALTER TABLE downloads ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- ==============================================
-- STEP 2: Create subscriptions table
-- ==============================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL DEFAULT 'monthly' CHECK (plan_type IN ('monthly', 'yearly')),
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_ref TEXT,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for fast subscription lookup
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status, expires_at);

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- STEP 3: Create subscription functions
-- ==============================================

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM subscriptions
        WHERE user_id = p_user_id
        AND status = 'active'
        AND expires_at > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check episode access with subscription model
CREATE OR REPLACE FUNCTION can_access_episode(
    p_user_id UUID,
    p_episode_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_free BOOLEAN;
    v_book_id UUID;
    v_is_special BOOLEAN;
    v_has_subscription BOOLEAN;
    v_has_purchased BOOLEAN;
BEGIN
    -- Get episode details
    SELECT e.is_free, e.book_id, COALESCE(b.is_premium, false)
    INTO v_is_free, v_book_id, v_is_special
    FROM episodes e
    JOIN books b ON b.id = e.book_id
    WHERE e.id = p_episode_id;

    -- Free episodes are always accessible
    IF v_is_free THEN
        RETURN TRUE;
    END IF;

    -- Check if user has active subscription (unlocks all regular books)
    IF NOT v_is_special THEN
        SELECT has_active_subscription(p_user_id) INTO v_has_subscription;
        IF v_has_subscription THEN
            RETURN TRUE;
        END IF;
    END IF;

    -- Check if user purchased this specific book
    SELECT EXISTS (
        SELECT 1 FROM purchases
        WHERE user_id = p_user_id
        AND book_id = v_book_id
        AND payment_status = 'success'
    ) INTO v_has_purchased;

    RETURN v_has_purchased;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- STEP 4: RLS Policies for subscriptions
-- ==============================================

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
CREATE POLICY "Users can insert their own subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
CREATE POLICY "Admins can view all subscriptions"
    ON subscriptions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND is_admin = TRUE
    ));

DROP POLICY IF EXISTS "Admins can manage subscriptions" ON subscriptions;
CREATE POLICY "Admins can manage subscriptions"
    ON subscriptions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND is_admin = TRUE
    ));

-- ==============================================
-- STEP 5: Create Storage Buckets (run these separately in Storage)
-- ==============================================

-- Run these in Supabase Dashboard > Storage (if not already created):
-- 1. Create bucket 'covers' with public access
-- 2. Create bucket 'audio' with public access
-- 3. Set file size limits: covers (5MB), audio (500MB)

-- ==============================================
-- STEP 6: Grant admin access to cnbhuvan011@gmail.com
-- ==============================================

UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'cnbhuvan011@gmail.com';

-- ==============================================
-- STEP 7: Update seed data to make books visible
-- ==============================================

UPDATE books SET is_published = TRUE WHERE is_published IS NULL OR is_published = FALSE;

-- ==============================================
-- DONE! Your database is now ready.
-- Next steps:
-- 1. Refresh your app
-- 2. Login with cnbhuvan011@gmail.com to access admin panel
-- 3. Upload books via the admin panel
-- ==============================================
