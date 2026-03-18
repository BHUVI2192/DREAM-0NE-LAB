-- Create Storage Buckets and Policies for Dream One Lab
-- Run this in Supabase SQL Editor

-- Create 'covers' bucket for book cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Create 'audio' bucket for episode audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for covers bucket
CREATE POLICY "Public Access for Covers"
ON storage.objects FOR SELECT
USING ( bucket_id = 'covers' );

CREATE POLICY "Authenticated users can upload covers"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'covers'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Admins can update covers"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'covers'
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND (is_admin = TRUE OR email = 'cnbhuvan011@gmail.com')
    )
);

CREATE POLICY "Admins can delete covers"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'covers'
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND (is_admin = TRUE OR email = 'cnbhuvan011@gmail.com')
    )
);

-- Storage policies for audio bucket
CREATE POLICY "Public Access for Audio"
ON storage.objects FOR SELECT
USING ( bucket_id = 'audio' );

CREATE POLICY "Authenticated users can upload audio"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'audio'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Admins can update audio"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'audio'
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND (is_admin = TRUE OR email = 'cnbhuvan011@gmail.com')
    )
);

CREATE POLICY "Admins can delete audio"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'audio'
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND (is_admin = TRUE OR email = 'cnbhuvan011@gmail.com')
    )
);

-- Grant admin flag to specific email
UPDATE profiles
SET is_admin = TRUE
WHERE email = 'cnbhuvan011@gmail.com';
