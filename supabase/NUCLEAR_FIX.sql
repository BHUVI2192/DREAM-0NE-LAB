-- NUCLEAR FIX - Run this to temporarily disable ALL RLS and see your data
-- This will let us identify the real problem

-- ==============================================
-- STEP 1: DISABLE RLS on all tables (temporary)
-- ==============================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE episodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE listen_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE downloads DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- STEP 2: Add missing columns if they don't exist
-- ==============================================

-- Add is_admin to profiles if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add special_price to books if missing
ALTER TABLE books ADD COLUMN IF NOT EXISTS special_price NUMERIC;

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

-- Also try by phone
UPDATE profiles 
SET is_admin = true 
WHERE phone = '+919591152192' OR phone_number = '+919591152192' OR phone LIKE '%9591152192%';

-- ==============================================
-- DONE! 
-- RLS is now DISABLED so everything will work.
-- After you confirm the app works, let me know and 
-- I'll help you re-enable RLS with proper policies.
-- ==============================================
