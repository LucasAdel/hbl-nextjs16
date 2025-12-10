-- ============================================================================
-- Analytics Events Persistence
-- Stores raw analytics events for historical analysis and conversion tracking
-- ============================================================================

-- Raw analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT, -- Hashed IP for privacy
  device_type TEXT, -- mobile, tablet, desktop
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);

-- Composite index for funnel queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_name ON analytics_events(user_id, event_name, timestamp DESC);

-- Composite index for category + name queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_category_name ON analytics_events(event_category, event_name);

-- ============================================================================
-- Cart Abandonment Tracking
-- For recovery email sequences
-- ============================================================================

-- Add recovery email tracking to abandoned_carts if not exists
DO $$
BEGIN
  -- Add recovery_email_1_sent
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'abandoned_carts' AND column_name = 'recovery_email_1_sent'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN recovery_email_1_sent TIMESTAMPTZ;
  END IF;

  -- Add recovery_email_2_sent
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'abandoned_carts' AND column_name = 'recovery_email_2_sent'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN recovery_email_2_sent TIMESTAMPTZ;
  END IF;

  -- Add recovery_email_3_sent
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'abandoned_carts' AND column_name = 'recovery_email_3_sent'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN recovery_email_3_sent TIMESTAMPTZ;
  END IF;

  -- Add recovered flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'abandoned_carts' AND column_name = 'recovered'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN recovered BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add recovered_at timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'abandoned_carts' AND column_name = 'recovered_at'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN recovered_at TIMESTAMPTZ;
  END IF;

  -- Add discount_code_used
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'abandoned_carts' AND column_name = 'discount_code_used'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN discount_code_used TEXT;
  END IF;
END $$;

-- Index for finding carts ready for recovery emails
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_recovery
ON abandoned_carts(abandoned_at, recovery_email_1_sent, recovered)
WHERE recovered = FALSE;

-- ============================================================================
-- Exit Intent Popup Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS exit_intent_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  email TEXT,
  offer_type TEXT NOT NULL, -- 'newsletter', 'cart_discount', 'document_bundle', 'consultation'
  offer_value TEXT, -- e.g., '10%', 'free-resource', etc.
  page_url TEXT,
  action TEXT NOT NULL, -- 'shown', 'dismissed', 'converted', 'closed'
  xp_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exit_intent_session ON exit_intent_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_exit_intent_action ON exit_intent_interactions(action);
CREATE INDEX IF NOT EXISTS idx_exit_intent_offer ON exit_intent_interactions(offer_type);
CREATE INDEX IF NOT EXISTS idx_exit_intent_created ON exit_intent_interactions(created_at DESC);

-- ============================================================================
-- Row Level Security
-- ============================================================================

-- Enable RLS on analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own events
DROP POLICY IF EXISTS "Users can insert their own analytics events" ON analytics_events;
CREATE POLICY "Users can insert their own analytics events"
ON analytics_events FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Allow service role full access for aggregation
DROP POLICY IF EXISTS "Service role has full access to analytics" ON analytics_events;
CREATE POLICY "Service role has full access to analytics"
ON analytics_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Anonymous users can insert events (with null user_id)
DROP POLICY IF EXISTS "Anonymous users can insert analytics events" ON analytics_events;
CREATE POLICY "Anonymous users can insert analytics events"
ON analytics_events FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Enable RLS on exit_intent_interactions
ALTER TABLE exit_intent_interactions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert
DROP POLICY IF EXISTS "Users can insert exit intent interactions" ON exit_intent_interactions;
CREATE POLICY "Users can insert exit intent interactions"
ON exit_intent_interactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Service role full access
DROP POLICY IF EXISTS "Service role has full access to exit intent" ON exit_intent_interactions;
CREATE POLICY "Service role has full access to exit intent"
ON exit_intent_interactions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Anonymous users can insert
DROP POLICY IF EXISTS "Anonymous users can insert exit intent" ON exit_intent_interactions;
CREATE POLICY "Anonymous users can insert exit intent"
ON exit_intent_interactions FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to get conversion funnel
CREATE OR REPLACE FUNCTION get_conversion_funnel(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  stage TEXT,
  event_count BIGINT,
  unique_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ae.event_name AS stage,
    COUNT(*)::BIGINT AS event_count,
    COUNT(DISTINCT COALESCE(ae.user_id::TEXT, ae.session_id))::BIGINT AS unique_users
  FROM analytics_events ae
  WHERE ae.timestamp BETWEEN start_date AND end_date
    AND ae.event_name IN (
      'page_view',
      'document_view',
      'add_to_cart',
      'checkout_start',
      'purchase_complete',
      'consultation_booked'
    )
  GROUP BY ae.event_name
  ORDER BY
    CASE ae.event_name
      WHEN 'page_view' THEN 1
      WHEN 'document_view' THEN 2
      WHEN 'add_to_cart' THEN 3
      WHEN 'checkout_start' THEN 4
      WHEN 'purchase_complete' THEN 5
      WHEN 'consultation_booked' THEN 6
    END;
END;
$$;

-- Function to get top events
CREATE OR REPLACE FUNCTION get_top_events(
  limit_count INTEGER DEFAULT 20,
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days'
)
RETURNS TABLE (
  event_name TEXT,
  event_category TEXT,
  total_count BIGINT,
  unique_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ae.event_name,
    ae.event_category,
    COUNT(*)::BIGINT AS total_count,
    COUNT(DISTINCT COALESCE(ae.user_id::TEXT, ae.session_id))::BIGINT AS unique_users
  FROM analytics_events ae
  WHERE ae.timestamp >= start_date
  GROUP BY ae.event_name, ae.event_category
  ORDER BY total_count DESC
  LIMIT limit_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_conversion_funnel TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversion_funnel TO service_role;
GRANT EXECUTE ON FUNCTION get_top_events TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_events TO service_role;

-- ============================================================================
-- Partitioning hint (for production scale)
-- ============================================================================
-- For high-volume production, consider partitioning analytics_events by month:
-- CREATE TABLE analytics_events_2025_12 PARTITION OF analytics_events
--   FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
