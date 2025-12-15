-- Analytics Session Summaries and Heatmaps Migration
-- Created: 2025-12-15
-- Purpose: Add session summary reports (AI-generated) and heatmap tracking

-- ============================================================================
-- 1. Session Summaries Table (AI-generated)
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_session_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  key_actions JSONB DEFAULT '[]'::jsonb,
  pages_visited INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  conversion_intent TEXT, -- 'high', 'medium', 'low', 'none'
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  model_used TEXT DEFAULT 'gpt-4o-mini',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast session lookup
CREATE INDEX IF NOT EXISTS idx_session_summaries_session_id
  ON analytics_session_summaries(session_id);

-- Index for listing summaries by date
CREATE INDEX IF NOT EXISTS idx_session_summaries_generated_at
  ON analytics_session_summaries(generated_at DESC);

-- Index for filtering by conversion intent
CREATE INDEX IF NOT EXISTS idx_session_summaries_conversion_intent
  ON analytics_session_summaries(conversion_intent);

-- ============================================================================
-- 2. Heatmap Configuration Table (per-page settings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_heatmap_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_pattern TEXT NOT NULL UNIQUE, -- e.g., '/services', '/contact', '/book-appointment/*'
  enabled BOOLEAN DEFAULT true,
  description TEXT, -- Optional description for admin UI
  click_count INTEGER DEFAULT 0, -- Cached click count for quick display
  last_click_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for enabled pages lookup
CREATE INDEX IF NOT EXISTS idx_heatmap_config_enabled
  ON analytics_heatmap_config(enabled) WHERE enabled = true;

-- ============================================================================
-- 3. Add Click Position Columns to analytics_events (if not exists)
-- ============================================================================
DO $$
BEGIN
  -- click_x: X coordinate of click (pageX)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'click_x'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN click_x INTEGER;
  END IF;

  -- click_y: Y coordinate of click (pageY)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'click_y'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN click_y INTEGER;
  END IF;

  -- viewport_height: Height of viewport at time of click
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'viewport_height'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN viewport_height INTEGER;
  END IF;

  -- element_selector: CSS selector of clicked element
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'element_selector'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN element_selector TEXT;
  END IF;

  -- element_text: Text content of clicked element (truncated)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'element_text'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN element_text TEXT;
  END IF;
END $$;

-- Index for heatmap queries (page + click coordinates)
CREATE INDEX IF NOT EXISTS idx_analytics_events_heatmap
  ON analytics_events(page_url, click_x, click_y)
  WHERE click_x IS NOT NULL AND click_y IS NOT NULL;

-- Index for real-time visitors (recent events by session)
-- Note: Partial index removed - NOW() is not immutable in PostgreSQL
-- The query will still be efficient with the standard timestamp index
CREATE INDEX IF NOT EXISTS idx_analytics_events_realtime
  ON analytics_events(timestamp DESC, session_id);

-- ============================================================================
-- 4. Helper Functions
-- ============================================================================

-- Function to get session statistics
CREATE OR REPLACE FUNCTION get_session_stats(p_session_id TEXT)
RETURNS TABLE (
  first_event TIMESTAMPTZ,
  last_event TIMESTAMPTZ,
  duration_seconds INTEGER,
  page_count INTEGER,
  event_count INTEGER,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country_code TEXT,
  city TEXT,
  has_conversion BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    MIN(ae.timestamp) AS first_event,
    MAX(ae.timestamp) AS last_event,
    EXTRACT(EPOCH FROM (MAX(ae.timestamp) - MIN(ae.timestamp)))::INTEGER AS duration_seconds,
    COUNT(DISTINCT ae.page_url)::INTEGER AS page_count,
    COUNT(*)::INTEGER AS event_count,
    MAX(ae.device_type) AS device_type,
    MAX(ae.browser) AS browser,
    MAX(ae.os) AS os,
    MAX(ae.country_code) AS country_code,
    MAX(ae.city) AS city,
    EXISTS(
      SELECT 1 FROM analytics_events ae2
      WHERE ae2.session_id = p_session_id
      AND ae2.event_name IN ('booking_confirmed', 'contact_submitted', 'purchase_complete')
    ) AS has_conversion
  FROM analytics_events ae
  WHERE ae.session_id = p_session_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to aggregate heatmap data for a page
CREATE OR REPLACE FUNCTION get_heatmap_data(
  p_page_pattern TEXT,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  click_x INTEGER,
  click_y INTEGER,
  click_count BIGINT,
  element_selector TEXT,
  viewport_width INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ae.click_x,
    ae.click_y,
    COUNT(*) AS click_count,
    MODE() WITHIN GROUP (ORDER BY ae.element_selector) AS element_selector,
    MODE() WITHIN GROUP (ORDER BY ae.viewport_width) AS viewport_width
  FROM analytics_events ae
  WHERE ae.page_url LIKE p_page_pattern
    AND ae.click_x IS NOT NULL
    AND ae.click_y IS NOT NULL
    AND ae.timestamp >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY ae.click_x, ae.click_y
  ORDER BY click_count DESC
  LIMIT 1000;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get real-time active visitors
CREATE OR REPLACE FUNCTION get_realtime_visitors(p_minutes INTEGER DEFAULT 5)
RETURNS TABLE (
  session_id TEXT,
  current_page TEXT,
  device_type TEXT,
  country_code TEXT,
  pages_viewed BIGINT,
  started_at TIMESTAMPTZ,
  last_activity TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH recent_sessions AS (
    SELECT DISTINCT ae.session_id
    FROM analytics_events ae
    WHERE ae.timestamp >= NOW() - (p_minutes || ' minutes')::INTERVAL
  )
  SELECT
    ae.session_id,
    (
      SELECT page_url FROM analytics_events ae2
      WHERE ae2.session_id = ae.session_id
      ORDER BY timestamp DESC LIMIT 1
    ) AS current_page,
    MAX(ae.device_type) AS device_type,
    MAX(ae.country_code) AS country_code,
    COUNT(DISTINCT ae.page_url) AS pages_viewed,
    MIN(ae.timestamp) AS started_at,
    MAX(ae.timestamp) AS last_activity
  FROM analytics_events ae
  WHERE ae.session_id IN (SELECT rs.session_id FROM recent_sessions rs)
  GROUP BY ae.session_id
  ORDER BY last_activity DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 5. RLS Policies (admin only access)
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE analytics_session_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_heatmap_config ENABLE ROW LEVEL SECURITY;

-- Session summaries: admin read/write only
CREATE POLICY "Admin read session summaries" ON analytics_session_summaries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin insert session summaries" ON analytics_session_summaries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Heatmap config: admin read/write only
CREATE POLICY "Admin read heatmap config" ON analytics_heatmap_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin manage heatmap config" ON analytics_heatmap_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Service role bypass for API operations
CREATE POLICY "Service role full access summaries" ON analytics_session_summaries
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access heatmap config" ON analytics_heatmap_config
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 6. Insert Default Heatmap Pages (common pages to track)
-- ============================================================================
INSERT INTO analytics_heatmap_config (page_pattern, enabled, description)
VALUES
  ('/', true, 'Homepage'),
  ('/services', true, 'Services page'),
  ('/contact', true, 'Contact page'),
  ('/book-appointment', true, 'Booking page'),
  ('/about', true, 'About page')
ON CONFLICT (page_pattern) DO NOTHING;

-- ============================================================================
-- Done
-- ============================================================================
