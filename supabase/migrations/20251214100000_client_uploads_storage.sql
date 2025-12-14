-- ============================================================================
-- Client Documents Storage Migration (Idempotent)
-- Creates table and policies for secure client document uploads
-- ============================================================================

-- Create client_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.client_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending'
);

-- Add columns if they don't exist (idempotent)
DO $$
BEGIN
    -- Status column (needed first for constraint)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_documents' AND column_name = 'status') THEN
        ALTER TABLE public.client_documents ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
    END IF;

    -- User columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_documents' AND column_name = 'user_id') THEN
        ALTER TABLE public.client_documents ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_documents' AND column_name = 'user_email') THEN
        ALTER TABLE public.client_documents ADD COLUMN user_email TEXT;
    END IF;

    -- Booking reference
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_documents' AND column_name = 'booking_id') THEN
        ALTER TABLE public.client_documents ADD COLUMN booking_id UUID;
    END IF;

    -- File metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_documents' AND column_name = 'file_name') THEN
        ALTER TABLE public.client_documents ADD COLUMN file_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_documents' AND column_name = 'original_name') THEN
        ALTER TABLE public.client_documents ADD COLUMN original_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_documents' AND column_name = 'file_size') THEN
        ALTER TABLE public.client_documents ADD COLUMN file_size INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_documents' AND column_name = 'mime_type') THEN
        ALTER TABLE public.client_documents ADD COLUMN mime_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_documents' AND column_name = 'storage_path') THEN
        ALTER TABLE public.client_documents ADD COLUMN storage_path TEXT;
    END IF;

    -- Review tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_documents' AND column_name = 'reviewed_at') THEN
        ALTER TABLE public.client_documents ADD COLUMN reviewed_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_documents' AND column_name = 'reviewed_by') THEN
        ALTER TABLE public.client_documents ADD COLUMN reviewed_by UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_documents' AND column_name = 'notes') THEN
        ALTER TABLE public.client_documents ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Add status constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'client_documents' AND constraint_name = 'client_documents_status_check'
    ) THEN
        ALTER TABLE public.client_documents ADD CONSTRAINT client_documents_status_check
            CHECK (status IN ('pending', 'processed', 'archived', 'deleted'));
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_client_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS client_documents_updated_at ON public.client_documents;
CREATE TRIGGER client_documents_updated_at
    BEFORE UPDATE ON public.client_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_client_documents_updated_at();

-- Create indexes (conditional on column existence)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_documents' AND column_name = 'user_email') THEN
        CREATE INDEX IF NOT EXISTS idx_client_documents_user_email ON public.client_documents(user_email);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_documents' AND column_name = 'booking_id') THEN
        CREATE INDEX IF NOT EXISTS idx_client_documents_booking_id ON public.client_documents(booking_id);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_documents' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_client_documents_status ON public.client_documents(status);
    END IF;

    CREATE INDEX IF NOT EXISTS idx_client_documents_created_at ON public.client_documents(created_at DESC);
END $$;

-- Enable RLS
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can view own documents" ON public.client_documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.client_documents;
DROP POLICY IF EXISTS "Admins have full access to documents" ON public.client_documents;

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
    ON public.client_documents
    FOR SELECT
    USING (
        user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Users can insert their own documents
CREATE POLICY "Users can insert own documents"
    ON public.client_documents
    FOR INSERT
    WITH CHECK (
        user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Admins have full access
CREATE POLICY "Admins have full access to documents"
    ON public.client_documents
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' IN ('admin', 'staff', 'super_admin')
        )
    );

-- ============================================================================
-- Storage Bucket Policies (for client-uploads bucket)
-- NOTE: These need to be run after creating the bucket in Supabase Dashboard
-- ============================================================================

-- Only create storage policies if the bucket exists
DO $$
BEGIN
    -- Check if bucket exists before creating policies
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'client-uploads') THEN
        -- Drop existing policies
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
    END IF;
END $$;
