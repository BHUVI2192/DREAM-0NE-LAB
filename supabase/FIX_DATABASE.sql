-- FIX DATABASE ERRORS - Run this to fix 500 errors
-- This fixes RLS policies and makes books visible

-- ==============================================
-- STEP 1: Fix profiles RLS policies
-- ==============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Profiles are viewable by users who created them" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Create simple, working policies
CREATE POLICY "Enable read access for authenticated users"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ==============================================
-- STEP 2: Fix books RLS policies
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Books are viewable by everyone" ON books;
DROP POLICY IF EXISTS "Published books are viewable by everyone" ON books;
DROP POLICY IF EXISTS "Anyone can view books" ON books;
DROP POLICY IF EXISTS "Admins can manage books" ON books;

-- Create open read policy for books (everyone can see published books)
CREATE POLICY "Anyone can view books"
    ON books FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Admins can manage books"
    ON books FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- ==============================================
-- STEP 3: Make all books published
-- ==============================================

UPDATE books SET is_published = true WHERE is_published IS NULL OR is_published = false;

-- ==============================================
-- STEP 4: Grant admin access
-- ==============================================

UPDATE profiles 
SET is_admin = true 
WHERE email = 'cnbhuvan011@gmail.com';

-- Also update by phone if email doesn't match
UPDATE profiles 
SET is_admin = true 
WHERE phone = '+919591152192' OR phone_number = '+919591152192';

-- ==============================================
-- STEP 5: Fix subscriptions table policies
-- ==============================================

-- Enable RLS if not already enabled
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can create own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON subscriptions;

-- Create new policies
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
    ON subscriptions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
    ON subscriptions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- ==============================================
-- STEP 6: Fix purchases table policies
-- ==============================================

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can insert their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can create own purchases" ON purchases;
DROP POLICY IF EXISTS "Admins can view all purchases" ON purchases;

CREATE POLICY "Users can view own purchases"
    ON purchases FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own purchases"
    ON purchases FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases"
    ON purchases FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- ==============================================
-- DONE! Errors should be fixed now.
-- Refresh your app after running this script.
-- ==============================================
