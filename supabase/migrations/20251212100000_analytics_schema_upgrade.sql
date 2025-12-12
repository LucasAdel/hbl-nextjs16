-- ============================================================================
-- Analytics Schema Upgrade
-- Adds missing columns to analytics_events table for comprehensive tracking
-- Based on BMAD methodology: track everything needed for conversion optimisation
-- ============================================================================

-- ============================================================================
-- Add missing columns to analytics_events table
-- Using DO block with IF NOT EXISTS checks for idempotency
-- ============================================================================

DO $$
BEGIN
  -- Add event_name if it doesn't exist (may have event_type instead)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'event_name'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN event_name TEXT;

    -- Copy from event_type if that exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'analytics_events' AND column_name = 'event_type'
    ) THEN
      UPDATE analytics_events SET event_name = event_type WHERE event_name IS NULL;
    END IF;
  END IF;

  -- Add event_category for categorising events
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'event_category'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN event_category TEXT DEFAULT 'custom';
  END IF;

  -- Add user_id for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  -- Add device_type (mobile, tablet, desktop)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'device_type'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN device_type TEXT;
  END IF;

  -- Add browser detection
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'browser'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN browser TEXT;
  END IF;

  -- Add operating system detection
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'os'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN os TEXT;
  END IF;

  -- Add screen dimensions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'screen_width'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN screen_width INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'screen_height'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN screen_height INTEGER;
  END IF;

  -- Add viewport dimensions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'viewport_width'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN viewport_width INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'viewport_height'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN viewport_height INTEGER;
  END IF;

  -- Add properties JSONB for flexible event data
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'properties'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN properties JSONB DEFAULT '{}';
  END IF;

  -- Add IP hash for geo/rate limiting (privacy-friendly)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'ip_hash'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN ip_hash TEXT;
  END IF;

  -- ============================================================================
  -- Future-proofing columns for advanced analytics
  -- ============================================================================

  -- Country code from IP geolocation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'country_code'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN country_code TEXT;
  END IF;

  -- Region/state
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'region'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN region TEXT;
  END IF;

  -- City
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'city'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN city TEXT;
  END IF;

  -- UTM parameters (flattened for easy querying)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'utm_source'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN utm_source TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'utm_medium'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN utm_medium TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'utm_campaign'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN utm_campaign TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'utm_term'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN utm_term TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'utm_content'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN utm_content TEXT;
  END IF;

  -- Landing page for attribution
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'landing_page'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN landing_page TEXT;
  END IF;

  -- Exit page for session analysis
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'exit_page'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN exit_page TEXT;
  END IF;

  -- Session duration in seconds
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'session_duration'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN session_duration INTEGER;
  END IF;

  -- Page view count in session
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'page_view_count'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN page_view_count INTEGER;
  END IF;

  -- Is bounce (single page session)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'is_bounce'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN is_bounce BOOLEAN;
  END IF;

  -- Is returning visitor
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'is_returning'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN is_returning BOOLEAN DEFAULT FALSE;
  END IF;

  -- Language preference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'language'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN language TEXT;
  END IF;

  -- Timezone offset
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'timezone_offset'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN timezone_offset INTEGER;
  END IF;

  -- Connection type (for performance analysis)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'connection_type'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN connection_type TEXT;
  END IF;

  -- Performance metrics
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'page_load_time'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN page_load_time INTEGER; -- milliseconds
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'dom_ready_time'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN dom_ready_time INTEGER; -- milliseconds
  END IF;

  -- Conversion tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'conversion_value'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN conversion_value DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'conversion_currency'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN conversion_currency TEXT DEFAULT 'AUD';
  END IF;

  -- A/B test tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'experiment_id'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN experiment_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'variant_id'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN variant_id TEXT;
  END IF;

  -- Gamification tracking (XP system)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'xp_earned'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN xp_earned INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'streak_day'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN streak_day INTEGER;
  END IF;

END $$;

-- ============================================================================
-- Add indexes for new columns (if they don't exist)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_device_type ON analytics_events(device_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_country ON analytics_events(country_code);
CREATE INDEX IF NOT EXISTS idx_analytics_events_utm_source ON analytics_events(utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_events_utm_campaign ON analytics_events(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_analytics_events_experiment ON analytics_events(experiment_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_session ON analytics_events(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category_name ON analytics_events(event_category, event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_timestamp ON analytics_events(session_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_conversion ON analytics_events(event_category, conversion_value) WHERE conversion_value IS NOT NULL;

-- ============================================================================
-- Update analytics_events_daily to have event_count column
-- ============================================================================

DO $$
BEGIN
  -- Add event_count if it doesn't exist (may have 'count' instead)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events_daily' AND column_name = 'event_count'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'analytics_events_daily' AND column_name = 'count'
    ) THEN
      ALTER TABLE analytics_events_daily RENAME COLUMN count TO event_count;
    ELSE
      ALTER TABLE analytics_events_daily ADD COLUMN event_count INTEGER DEFAULT 0;
    END IF;
  END IF;

  -- Add updated_at for tracking last update
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events_daily' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE analytics_events_daily ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ============================================================================
-- Create helper view for analytics dashboard
-- ============================================================================

CREATE OR REPLACE VIEW analytics_summary AS
SELECT
  DATE(timestamp) as date,
  COUNT(*) as total_events,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN event_category = 'conversion' THEN 1 END) as conversions,
  SUM(COALESCE(conversion_value, 0)) as total_revenue,
  COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) as mobile_events,
  COUNT(CASE WHEN device_type = 'tablet' THEN 1 END) as tablet_events,
  COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) as desktop_events
FROM analytics_events
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Grant access to the view
GRANT SELECT ON analytics_summary TO authenticated;
GRANT SELECT ON analytics_summary TO service_role;

-- ============================================================================
-- Create function for daily rollup (for performance)
-- ============================================================================

CREATE OR REPLACE FUNCTION rollup_daily_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_date DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
  -- Delete existing rollup for the day
  DELETE FROM analytics_events_daily WHERE date = target_date;

  -- Insert fresh rollup
  INSERT INTO analytics_events_daily (date, event_name, event_category, event_count, unique_users)
  SELECT
    target_date,
    event_name,
    COALESCE(event_category, 'custom'),
    COUNT(*),
    COUNT(DISTINCT COALESCE(user_id::TEXT, session_id))
  FROM analytics_events
  WHERE DATE(timestamp) = target_date
    AND event_name IS NOT NULL
  GROUP BY event_name, event_category;
END;
$$;

-- Grant execute
GRANT EXECUTE ON FUNCTION rollup_daily_analytics TO service_role;

-- ============================================================================
-- Session analytics helper
-- ============================================================================

CREATE OR REPLACE FUNCTION get_session_metrics(
  p_session_id TEXT
)
RETURNS TABLE (
  total_events BIGINT,
  page_views BIGINT,
  conversions BIGINT,
  first_event TIMESTAMPTZ,
  last_event TIMESTAMPTZ,
  duration_seconds INTEGER,
  device_type TEXT,
  entry_page TEXT,
  exit_page TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_events,
    COUNT(CASE WHEN ae.event_name = 'page_view' THEN 1 END)::BIGINT as page_views,
    COUNT(CASE WHEN ae.event_category = 'conversion' THEN 1 END)::BIGINT as conversions,
    MIN(ae.timestamp) as first_event,
    MAX(ae.timestamp) as last_event,
    EXTRACT(EPOCH FROM (MAX(ae.timestamp) - MIN(ae.timestamp)))::INTEGER as duration_seconds,
    (ARRAY_AGG(ae.device_type ORDER BY ae.timestamp) FILTER (WHERE ae.device_type IS NOT NULL))[1] as device_type,
    (ARRAY_AGG(ae.page_url ORDER BY ae.timestamp))[1] as entry_page,
    (ARRAY_AGG(ae.page_url ORDER BY ae.timestamp DESC))[1] as exit_page
  FROM analytics_events ae
  WHERE ae.session_id = p_session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_session_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_session_metrics TO service_role;

-- ============================================================================
-- Conversion funnel analysis
-- ============================================================================

CREATE OR REPLACE FUNCTION get_funnel_analysis(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  stage_name TEXT,
  stage_order INTEGER,
  event_count BIGINT,
  unique_users BIGINT,
  conversion_rate DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  first_stage_users BIGINT;
BEGIN
  -- Get the count for first stage
  SELECT COUNT(DISTINCT COALESCE(user_id::TEXT, session_id))
  INTO first_stage_users
  FROM analytics_events
  WHERE timestamp BETWEEN p_start_date AND p_end_date
    AND event_name = 'page_view';

  RETURN QUERY
  WITH funnel_stages AS (
    SELECT
      e.stage_name,
      e.stage_order,
      e.event_name
    FROM (VALUES
      ('Page View', 1, 'page_view'),
      ('Document View', 2, 'document_view'),
      ('Add to Cart', 3, 'add_to_cart'),
      ('Checkout Start', 4, 'checkout_start'),
      ('Purchase Complete', 5, 'purchase_complete'),
      ('Consultation Booked', 6, 'consultation_booked')
    ) AS e(stage_name, stage_order, event_name)
  )
  SELECT
    fs.stage_name,
    fs.stage_order,
    COUNT(ae.id)::BIGINT as event_count,
    COUNT(DISTINCT COALESCE(ae.user_id::TEXT, ae.session_id))::BIGINT as unique_users,
    CASE
      WHEN first_stage_users > 0 THEN
        ROUND(
          COUNT(DISTINCT COALESCE(ae.user_id::TEXT, ae.session_id))::DECIMAL /
          first_stage_users * 100,
          2
        )
      ELSE 0
    END as conversion_rate
  FROM funnel_stages fs
  LEFT JOIN analytics_events ae ON ae.event_name = fs.event_name
    AND ae.timestamp BETWEEN p_start_date AND p_end_date
  GROUP BY fs.stage_name, fs.stage_order
  ORDER BY fs.stage_order;
END;
$$;

GRANT EXECUTE ON FUNCTION get_funnel_analysis TO authenticated;
GRANT EXECUTE ON FUNCTION get_funnel_analysis TO service_role;

-- ============================================================================
-- Cleanup: Comment noting schema is now comprehensive
-- ============================================================================

COMMENT ON TABLE analytics_events IS 'Comprehensive analytics events table with full device, geo, UTM, and conversion tracking. Last updated: 2025-12-12';
