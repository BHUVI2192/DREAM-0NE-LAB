-- Migration: Add Subscription Model
-- Monthly subscription (₹49) unlocks all regular books
-- Special series have separate pricing

-- Create subscriptions table
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

-- Add index for fast user subscription lookup
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status, expires_at);

-- Update purchases table to distinguish between book purchases and subscriptions
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS purchase_type TEXT DEFAULT 'book' CHECK (purchase_type IN ('book', 'subscription', 'special_series'));
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;

-- Add book_id to downloads table if missing
ALTER TABLE downloads ADD COLUMN IF NOT EXISTS book_id UUID REFERENCES books(id) ON DELETE CASCADE;
ALTER TABLE downloads ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- Update books table - premium books are separately purchasable content
ALTER TABLE books ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE books ADD COLUMN IF NOT EXISTS special_price NUMERIC;

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
    v_is_premium BOOLEAN;
    v_has_subscription BOOLEAN;
    v_has_purchased BOOLEAN;
BEGIN
    -- Get episode details
    SELECT e.is_free, e.book_id, COALESCE(b.is_premium, b.is_special, FALSE)
    INTO v_is_free, v_book_id, v_is_premium
    FROM episodes e
    JOIN books b ON b.id = e.book_id
    WHERE e.id = p_episode_id;

    -- Free episodes are always accessible
    IF v_is_free THEN
        RETURN TRUE;
    END IF;

    -- Check if user has active subscription (unlocks all regular books)
    IF NOT v_is_premium THEN
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
        AND purchase_type = 'book'
    ) INTO v_has_purchased;

    RETURN v_has_purchased;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admin-only policy for subscriptions management
CREATE POLICY "Admins can manage all subscriptions"
    ON subscriptions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Grant access to authenticated users
GRANT SELECT, INSERT ON subscriptions TO authenticated;
