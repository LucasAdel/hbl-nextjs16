-- ============================================================================
-- Webhook Idempotency Migration
-- Prevents duplicate processing of webhook events
-- ============================================================================

-- Create webhook_events table for idempotency tracking
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL UNIQUE,  -- External event ID (e.g., Stripe event ID)
    provider TEXT NOT NULL,          -- 'stripe', 'resend', etc.
    event_type TEXT NOT NULL,        -- Event type (e.g., 'checkout.session.completed')
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'processed' CHECK (status IN ('processed', 'failed', 'skipped')),
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Composite index for lookups
    CONSTRAINT webhook_events_provider_event UNIQUE (provider, event_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON public.webhook_events(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON public.webhook_events(processed_at DESC);

-- Enable RLS
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Service role only" ON public.webhook_events;

-- Only service role can access webhook events
CREATE POLICY "Service role only" ON public.webhook_events
    FOR ALL
    USING (false)
    WITH CHECK (false);

-- Add comment
COMMENT ON TABLE public.webhook_events IS 'Tracks processed webhook events to prevent duplicate processing';

-- Cleanup function for old events (keep 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.webhook_events
    WHERE processed_at < NOW() - (days_to_keep || ' days')::INTERVAL;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;
