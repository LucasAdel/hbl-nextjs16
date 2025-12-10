-- Analytics Rollup Tables & Notification Persistence
-- Migration for remaining 5% production readiness

-- ============================================
-- ANALYTICS ROLLUP TABLES (5 tables)
-- ============================================

-- 1. Daily event aggregation
CREATE TABLE IF NOT EXISTS analytics_events_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  properties_summary JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, event_name)
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_events_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_category ON analytics_events_daily(event_category);

-- 2. XP economy daily health
CREATE TABLE IF NOT EXISTS xp_economy_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_redeemed INTEGER NOT NULL DEFAULT 0,
  unique_earners INTEGER NOT NULL DEFAULT 0,
  active_streaks INTEGER NOT NULL DEFAULT 0,
  avg_xp_per_user NUMERIC(10,2) DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  returning_users INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_daily_date ON xp_economy_daily(date DESC);

-- 3. Conversion funnel daily
CREATE TABLE IF NOT EXISTS conversion_funnel_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  stage_name TEXT NOT NULL,
  user_count INTEGER NOT NULL DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  drop_off_rate NUMERIC(5,2) DEFAULT 0,
  avg_time_in_stage_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, stage_name)
);

CREATE INDEX IF NOT EXISTS idx_funnel_date ON conversion_funnel_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_funnel_stage ON conversion_funnel_daily(stage_name);

-- 4. Feature engagement daily
CREATE TABLE IF NOT EXISTS feature_engagement_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  feature_name TEXT NOT NULL,
  feature_category TEXT NOT NULL,
  unique_users INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, feature_name)
);

CREATE INDEX IF NOT EXISTS idx_feature_date ON feature_engagement_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_feature_category ON feature_engagement_daily(feature_category);

-- 5. Weekly cohort retention
CREATE TABLE IF NOT EXISTS cohort_metrics_weekly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_week DATE NOT NULL,
  week_offset INTEGER NOT NULL,
  cohort_size INTEGER NOT NULL DEFAULT 0,
  retained_count INTEGER NOT NULL DEFAULT 0,
  retention_rate NUMERIC(5,2) DEFAULT 0,
  revenue_in_period INTEGER DEFAULT 0,
  avg_sessions_per_user NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_week, week_offset)
);

CREATE INDEX IF NOT EXISTS idx_cohort_week ON cohort_metrics_weekly(cohort_week DESC);

-- ============================================
-- NOTIFICATION PERSISTENCE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS client_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('booking', 'document', 'payment', 'message', 'system', 'achievement', 'xp', 'streak')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Indexes for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON client_notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON client_notifications(user_email, read) WHERE read = false AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON client_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON client_notifications(type);

-- RLS policies for notifications
ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON client_notifications;
CREATE POLICY "Users can view own notifications"
  ON client_notifications FOR SELECT
  USING (user_email = auth.jwt()->>'email');

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON client_notifications;
CREATE POLICY "Users can update own notifications"
  ON client_notifications FOR UPDATE
  USING (user_email = auth.jwt()->>'email');

-- Service role can insert notifications
DROP POLICY IF EXISTS "Service role can insert notifications" ON client_notifications;
CREATE POLICY "Service role can insert notifications"
  ON client_notifications FOR INSERT
  WITH CHECK (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_email TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM client_notifications
    WHERE user_email = p_user_email
      AND read = false
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_email TEXT)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE client_notifications
  SET read = true, read_at = NOW()
  WHERE user_email = p_user_email
    AND read = false
    AND deleted_at IS NULL;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to aggregate daily XP stats
CREATE OR REPLACE FUNCTION aggregate_xp_daily(p_date DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO xp_economy_daily (date, total_earned, total_redeemed, unique_earners, active_streaks, avg_xp_per_user)
  SELECT
    p_date,
    COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as total_earned,
    COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as total_redeemed,
    COUNT(DISTINCT user_email) as unique_earners,
    (SELECT COUNT(*) FROM user_profiles WHERE current_streak > 0) as active_streaks,
    COALESCE(AVG(CASE WHEN amount > 0 THEN amount ELSE NULL END), 0) as avg_xp_per_user
  FROM xp_transactions
  WHERE DATE(created_at) = p_date
  ON CONFLICT (date) DO UPDATE SET
    total_earned = EXCLUDED.total_earned,
    total_redeemed = EXCLUDED.total_redeemed,
    unique_earners = EXCLUDED.unique_earners,
    active_streaks = EXCLUDED.active_streaks,
    avg_xp_per_user = EXCLUDED.avg_xp_per_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANTS
-- ============================================

-- Grant access for analytics tables (read-only for authenticated, full for service)
GRANT SELECT ON analytics_events_daily TO authenticated;
GRANT SELECT ON xp_economy_daily TO authenticated;
GRANT SELECT ON conversion_funnel_daily TO authenticated;
GRANT SELECT ON feature_engagement_daily TO authenticated;
GRANT SELECT ON cohort_metrics_weekly TO authenticated;

GRANT ALL ON analytics_events_daily TO service_role;
GRANT ALL ON xp_economy_daily TO service_role;
GRANT ALL ON conversion_funnel_daily TO service_role;
GRANT ALL ON feature_engagement_daily TO service_role;
GRANT ALL ON cohort_metrics_weekly TO service_role;

-- Grant access for notifications
GRANT SELECT, UPDATE ON client_notifications TO authenticated;
GRANT ALL ON client_notifications TO service_role;
