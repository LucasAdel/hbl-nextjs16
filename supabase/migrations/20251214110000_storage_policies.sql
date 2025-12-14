-- ============================================================================
-- Storage Bucket Policies for client-uploads
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users view own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Admins view all uploads" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete uploads" ON storage.objects;

-- Users upload to own folder
CREATE POLICY "Users upload to own folder"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'client-uploads'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users view own uploads
CREATE POLICY "Users view own uploads"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'client-uploads'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Admins view all uploads
CREATE POLICY "Admins view all uploads"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'client-uploads'
        AND EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' IN ('admin', 'staff', 'super_admin')
        )
    );

-- Admins can delete uploads
CREATE POLICY "Admins can delete uploads"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'client-uploads'
        AND EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' IN ('admin', 'staff', 'super_admin')
        )
    );
