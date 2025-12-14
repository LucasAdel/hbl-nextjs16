-- ============================================================================
-- Security Audit Logs Migration (Idempotent)
-- Creates/updates table for tracking security-relevant events
-- ============================================================================

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info',
    action TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add columns if they don't exist (idempotent)
DO $$
BEGIN
    -- Request context columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'ip_address') THEN
        ALTER TABLE public.audit_logs ADD COLUMN ip_address INET;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_agent') THEN
        ALTER TABLE public.audit_logs ADD COLUMN user_agent TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'endpoint') THEN
        ALTER TABLE public.audit_logs ADD COLUMN endpoint TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'method') THEN
        ALTER TABLE public.audit_logs ADD COLUMN method TEXT;
    END IF;

    -- User context columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_id') THEN
        ALTER TABLE public.audit_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_email') THEN
        ALTER TABLE public.audit_logs ADD COLUMN user_email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_role') THEN
        ALTER TABLE public.audit_logs ADD COLUMN user_role TEXT;
    END IF;

    -- Event details columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'resource_type') THEN
        ALTER TABLE public.audit_logs ADD COLUMN resource_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'resource_id') THEN
        ALTER TABLE public.audit_logs ADD COLUMN resource_id TEXT;
    END IF;

    -- Error columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'error_code') THEN
        ALTER TABLE public.audit_logs ADD COLUMN error_code TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'error_message') THEN
        ALTER TABLE public.audit_logs ADD COLUMN error_message TEXT;
    END IF;
END $$;

-- Add severity check constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'audit_logs' AND constraint_name = 'audit_logs_severity_check'
    ) THEN
        ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_severity_check
            CHECK (severity IN ('info', 'warning', 'error', 'critical'));
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes (IF NOT EXISTS handles idempotency)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON public.audit_logs(user_email);

-- Conditional indexes (only create if columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'severity') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'ip_address') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON public.audit_logs(ip_address);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'endpoint') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_logs_endpoint ON public.audit_logs(endpoint);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs" ON public.audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- Service role can insert (used by the application)
CREATE POLICY "Service role can insert audit logs" ON public.audit_logs
    FOR INSERT
    WITH CHECK (true);

-- Add comments
COMMENT ON TABLE public.audit_logs IS 'Security audit trail for tracking important system events';

-- Create cleanup function (idempotent with CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.audit_logs
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL
    AND severity NOT IN ('error', 'critical');

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;
