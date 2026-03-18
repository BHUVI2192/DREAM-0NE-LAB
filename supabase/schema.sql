-- Dream One Lab Database Schema (Enhanced with Google Drive & Additional Features)
-- This schema is idempotent - safe to run multiple times

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT UNIQUE,
    phone_number TEXT,
    email TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
    subscription_expiry TIMESTAMP WITH TIME ZONE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    blurb TEXT,
    genre TEXT,
    language TEXT DEFAULT 'English',
    cover_url TEXT,
    cover_drive_id TEXT,
    tags TEXT[],
    episode_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_special BOOLEAN DEFAULT FALSE,
    price NUMERIC DEFAULT 49,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Episodes table
CREATE TABLE IF NOT EXISTS episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL,
    episode_order INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    audio_url TEXT NOT NULL,
    audio_drive_id TEXT,
    duration_seconds INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    is_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(book_id, episode_number)
);

-- Purchases table (PhonePe integrated)
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE SET NULL,
    amount_inr NUMERIC NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'cancelled')),
    payment_ref TEXT UNIQUE,
    phonepe_transaction_id TEXT,
    is_special BOOLEAN DEFAULT FALSE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listening history
CREATE TABLE IF NOT EXISTS listening_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    progress_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_listened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, episode_id)
);

-- Listen progress (real-time tracking)
CREATE TABLE IF NOT EXISTS listen_progress (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    position_seconds INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, episode_id)
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- Downloads tracking
CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listens (analytics)
CREATE TABLE IF NOT EXISTS listens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    listened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_listened INTEGER
);

-- Alerts (admin notifications)
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    audience TEXT DEFAULT 'all' CHECK (audience IN ('all', 'premium', 'free')),
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs (system logging)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing tables (for schema updates)
DO $$ 
BEGIN
    -- Add columns to profiles if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone_number') THEN
        ALTER TABLE profiles ADD COLUMN phone_number TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='subscription_tier') THEN
        ALTER TABLE profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='subscription_expiry') THEN
        ALTER TABLE profiles ADD COLUMN subscription_expiry TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_admin') THEN
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;

    -- Add columns to books if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='books' AND column_name='blurb') THEN
        ALTER TABLE books ADD COLUMN blurb TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='books' AND column_name='language') THEN
        ALTER TABLE books ADD COLUMN language TEXT DEFAULT 'English';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='books' AND column_name='cover_drive_id') THEN
        ALTER TABLE books ADD COLUMN cover_drive_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='books' AND column_name='is_published') THEN
        ALTER TABLE books ADD COLUMN is_published BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='books' AND column_name='is_special') THEN
        ALTER TABLE books ADD COLUMN is_special BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add columns to episodes if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='episodes' AND column_name='audio_drive_id') THEN
        ALTER TABLE episodes ADD COLUMN audio_drive_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='episodes' AND column_name='duration_seconds') THEN
        ALTER TABLE episodes ADD COLUMN duration_seconds INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='episodes' AND column_name='is_free') THEN
        ALTER TABLE episodes ADD COLUMN is_free BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='episodes' AND column_name='episode_order') THEN
        ALTER TABLE episodes ADD COLUMN episode_order INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='episodes' AND column_name='thumbnail_url') THEN
        ALTER TABLE episodes ADD COLUMN thumbnail_url TEXT;
    END IF;

    -- Add columns to alerts if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='audience') THEN
        ALTER TABLE alerts ADD COLUMN audience TEXT DEFAULT 'all';
    END IF;

    -- Add columns to purchases if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='purchases' AND column_name='payment_ref') THEN
        ALTER TABLE purchases ADD COLUMN payment_ref TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='purchases' AND column_name='phonepe_transaction_id') THEN
        ALTER TABLE purchases ADD COLUMN phonepe_transaction_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='purchases' AND column_name='amount_inr') THEN
        ALTER TABLE purchases ADD COLUMN amount_inr NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='purchases' AND column_name='payment_status') THEN
        ALTER TABLE purchases ADD COLUMN payment_status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Add constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_subscription_tier_check'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check 
            CHECK (subscription_tier IN ('free', 'premium'));
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'purchases_payment_status_check'
    ) THEN
        ALTER TABLE purchases ADD CONSTRAINT purchases_payment_status_check 
            CHECK (payment_status IN ('pending', 'success', 'failed', 'cancelled'));
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Row Level Security Policies

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Books
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published books" ON books;
CREATE POLICY "Anyone can view published books"
    ON books FOR SELECT
    USING (is_published = TRUE OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    ));

DROP POLICY IF EXISTS "Admins can manage books" ON books;
CREATE POLICY "Admins can manage books"
    ON books FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Episodes
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view episodes of published books" ON episodes;
CREATE POLICY "Anyone can view episodes of published books"
    ON episodes FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM books WHERE id = episodes.book_id AND is_published = TRUE)
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

DROP POLICY IF EXISTS "Admins can manage episodes" ON episodes;
CREATE POLICY "Admins can manage episodes"
    ON episodes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Purchases
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
CREATE POLICY "Users can view own purchases"
    ON purchases FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all purchases" ON purchases;
CREATE POLICY "Admins can view all purchases"
    ON purchases FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Listening history
ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own listening history" ON listening_history;
CREATE POLICY "Users can view own listening history"
    ON listening_history FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own listening history" ON listening_history;
CREATE POLICY "Users can update own listening history"
    ON listening_history FOR ALL
    USING (auth.uid() = user_id);

-- Listen progress
ALTER TABLE listen_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own listen progress" ON listen_progress;
CREATE POLICY "Users can manage own listen progress"
    ON listen_progress FOR ALL
    USING (auth.uid() = user_id);

-- Bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own bookmarks" ON bookmarks;
CREATE POLICY "Users can manage own bookmarks"
    ON bookmarks FOR ALL
    USING (auth.uid() = user_id);

-- Downloads
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own downloads" ON downloads;
CREATE POLICY "Users can view own downloads"
    ON downloads FOR ALL
    USING (auth.uid() = user_id);

-- Listens (analytics)
ALTER TABLE listens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create own listens" ON listens;
CREATE POLICY "Users can create own listens"
    ON listens FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Alerts
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active alerts" ON alerts;
CREATE POLICY "Anyone can view active alerts"
    ON alerts FOR SELECT
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage alerts" ON alerts;
CREATE POLICY "Admins can manage alerts"
    ON alerts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_episodes_book_id ON episodes(book_id);
CREATE INDEX IF NOT EXISTS idx_episodes_episode_order ON episodes(episode_order);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_ref ON purchases(payment_ref);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);
CREATE INDEX IF NOT EXISTS idx_books_is_published ON books(is_published);
CREATE INDEX IF NOT EXISTS idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_history_episode_id ON listening_history(episode_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_listens_user_id ON listens(user_id);
CREATE INDEX IF NOT EXISTS idx_listens_episode_id ON listens(episode_id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, phone, phone_number, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.phone,
        COALESCE(NEW.raw_user_meta_data->>'phone_number', NEW.phone),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update episode count on books
CREATE OR REPLACE FUNCTION update_book_episode_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE books
    SET episode_count = (
        SELECT COUNT(*) FROM episodes WHERE book_id = COALESCE(NEW.book_id, OLD.book_id)
    )
    WHERE id = COALESCE(NEW.book_id, OLD.book_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_episode_count_on_insert ON episodes;
CREATE TRIGGER update_episode_count_on_insert
    AFTER INSERT ON episodes
    FOR EACH ROW
    EXECUTE FUNCTION update_book_episode_count();

DROP TRIGGER IF EXISTS update_episode_count_on_delete ON episodes;
CREATE TRIGGER update_episode_count_on_delete
    AFTER DELETE ON episodes
    FOR EACH ROW
    EXECUTE FUNCTION update_book_episode_count();

-- Function to extend subscription (for PhonePe payments)
CREATE OR REPLACE FUNCTION extend_subscription(user_uuid UUID, days INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles
    SET 
        subscription_tier = 'premium',
        subscription_expiry = CASE
            WHEN subscription_expiry IS NULL OR subscription_expiry < NOW()
            THEN NOW() + (days || ' days')::INTERVAL
            ELSE subscription_expiry + (days || ' days')::INTERVAL
        END,
        updated_at = NOW()
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to check user access to book
CREATE OR REPLACE FUNCTION has_book_access(user_uuid UUID, book_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    book_is_special BOOLEAN;
    book_is_premium BOOLEAN;
    user_is_premium BOOLEAN;
    has_purchase BOOLEAN;
BEGIN
    -- Get book info
    SELECT is_special, is_premium INTO book_is_special, book_is_premium
    FROM books WHERE id = book_uuid;

    -- Check if user has premium subscription
    SELECT 
        subscription_tier = 'premium' 
        AND subscription_expiry > NOW()
    INTO user_is_premium
    FROM profiles WHERE id = user_uuid;

    -- Special books require purchase
    IF book_is_special THEN
        SELECT EXISTS(
            SELECT 1 FROM purchases
            WHERE user_id = user_uuid
            AND book_id = book_uuid
            AND payment_status = 'success'
        ) INTO has_purchase;
        RETURN has_purchase;
    END IF;

    -- Premium books require subscription or purchase
    IF book_is_premium THEN
        SELECT EXISTS(
            SELECT 1 FROM purchases
            WHERE user_id = user_uuid
            AND book_id = book_uuid
            AND payment_status = 'success'
        ) INTO has_purchase;
        RETURN user_is_premium OR has_purchase;
    END IF;

    -- Free books accessible to all
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to check episode access
CREATE OR REPLACE FUNCTION has_episode_access(user_uuid UUID, episode_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    ep_is_free BOOLEAN;
    ep_book_id UUID;
BEGIN
    SELECT is_free, book_id INTO ep_is_free, ep_book_id
    FROM episodes WHERE id = episode_uuid;

    -- Free episodes accessible to all
    IF ep_is_free THEN
        RETURN TRUE;
    END IF;

    -- Check book access
    RETURN has_book_access(user_uuid, ep_book_id);
END;
$$ LANGUAGE plpgsql;

-- Function to update listen progress
CREATE OR REPLACE FUNCTION update_listen_progress(
    user_uuid UUID,
    episode_uuid UUID,
    position_secs INTEGER
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO listen_progress (user_id, episode_id, position_seconds, updated_at)
    VALUES (user_uuid, episode_uuid, position_secs, NOW())
    ON CONFLICT (user_id, episode_id)
    DO UPDATE SET
        position_seconds = position_secs,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to mark episode as completed
CREATE OR REPLACE FUNCTION mark_episode_completed(
    user_uuid UUID,
    episode_uuid UUID
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO listening_history (user_id, episode_id, completed, last_listened_at)
    VALUES (user_uuid, episode_uuid, TRUE, NOW())
    ON CONFLICT (user_id, episode_id)
    DO UPDATE SET
        completed = TRUE,
        last_listened_at = NOW();
END;
$$ LANGUAGE plpgsql;
