ALTER TABLE alerts
ADD COLUMN IF NOT EXISTS audience TEXT DEFAULT 'all';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'alerts_audience_check'
    ) THEN
        ALTER TABLE alerts
            ADD CONSTRAINT alerts_audience_check
            CHECK (audience IN ('all', 'premium', 'free'));
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_alerts_active_created_at ON alerts(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_audience ON alerts(audience);
