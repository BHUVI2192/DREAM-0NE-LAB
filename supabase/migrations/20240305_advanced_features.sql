-- Advanced features migration for Dream One Lab

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);
CREATE INDEX IF NOT EXISTS idx_books_is_special ON books(is_special);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_book_id ON purchases(book_id);

-- Add updated_at trigger for books
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add function to check user access to book
CREATE OR REPLACE FUNCTION has_book_access(user_uuid UUID, book_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    book_is_special BOOLEAN;
    user_sub_end TIMESTAMP WITH TIME ZONE;
    has_purchase BOOLEAN;
BEGIN
    -- Get book type
    SELECT is_special INTO book_is_special
    FROM books WHERE id = book_uuid;

    IF book_is_special THEN
        -- Check for purchase
        SELECT EXISTS(
            SELECT 1 FROM purchases
            WHERE user_id = user_uuid
            AND book_id = book_uuid
            AND status = 'success'
        ) INTO has_purchase;
        RETURN has_purchase;
    ELSE
        -- Check subscription
        SELECT subscription_end INTO user_sub_end
        FROM profiles WHERE id = user_uuid;
        
        RETURN user_sub_end IS NOT NULL AND user_sub_end > NOW();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add function to get user's accessible books
CREATE OR REPLACE FUNCTION get_accessible_books(user_uuid UUID)
RETURNS TABLE(book_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT b.id
    FROM books b
    WHERE
        -- Standard books with active subscription
        (NOT b.is_special AND EXISTS(
            SELECT 1 FROM profiles p
            WHERE p.id = user_uuid
            AND p.subscription_end > NOW()
        ))
        OR
        -- Special books that are purchased
        (b.is_special AND EXISTS(
            SELECT 1 FROM purchases pur
            WHERE pur.user_id = user_uuid
            AND pur.book_id = b.id
            AND pur.status = 'success'
        ));
END;
$$ LANGUAGE plpgsql;
