-- Gamification System Tables
-- User activity and engagement tracking

-- User Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  streak_freeze_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns if table exists but doesn't have them
DO $$
BEGIN
  -- Add email column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email TEXT;
  END IF;

  -- Add total_xp column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'total_xp'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN total_xp INTEGER NOT NULL DEFAULT 0;
  END IF;

  -- Add current_level column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'current_level'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN current_level INTEGER NOT NULL DEFAULT 1;
  END IF;

  -- Add current_streak column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'current_streak'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN current_streak INTEGER NOT NULL DEFAULT 0;
  END IF;

  -- Add longest_streak column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'longest_streak'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN longest_streak INTEGER NOT NULL DEFAULT 0;
  END IF;

  -- Add last_active_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'last_active_date'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_active_date DATE;
  END IF;

  -- Add streak_freeze_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'streak_freeze_count'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN streak_freeze_count INTEGER NOT NULL DEFAULT 0;
  END IF;

  -- Add display_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN display_name TEXT;
  END IF;

  -- Add avatar_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_xp ON user_profiles(total_xp DESC);

-- Achievements/Badges
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  category TEXT NOT NULL CHECK (category IN ('engagement', 'purchase', 'consultation', 'milestone', 'special')),
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  is_secret BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Achievements (earned badges)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_email, achievement_id)
);

-- Add missing columns to user_achievements if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_achievements' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE user_achievements ADD COLUMN user_email TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_achievements' AND column_name = 'notified'
  ) THEN
    ALTER TABLE user_achievements ADD COLUMN notified BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_achievements_email ON user_achievements(user_email);

-- XP Transactions (for variable rewards)
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns to xp_transactions if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'xp_transactions' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE xp_transactions ADD COLUMN user_email TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'xp_transactions' AND column_name = 'amount'
  ) THEN
    ALTER TABLE xp_transactions ADD COLUMN amount INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'xp_transactions' AND column_name = 'source'
  ) THEN
    ALTER TABLE xp_transactions ADD COLUMN source TEXT NOT NULL DEFAULT 'unknown';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'xp_transactions' AND column_name = 'multiplier'
  ) THEN
    ALTER TABLE xp_transactions ADD COLUMN multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_xp_transactions_email ON xp_transactions(user_email);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created ON xp_transactions(created_at DESC);

-- User Activity Log (for behavior tracking)
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  session_id TEXT,
  activity_type TEXT NOT NULL,
  page_path TEXT,
  document_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns to user_activity_log if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_log' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE user_activity_log ADD COLUMN user_email TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_log' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE user_activity_log ADD COLUMN session_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_log' AND column_name = 'activity_type'
  ) THEN
    ALTER TABLE user_activity_log ADD COLUMN activity_type TEXT NOT NULL DEFAULT 'unknown';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_log' AND column_name = 'page_path'
  ) THEN
    ALTER TABLE user_activity_log ADD COLUMN page_path TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_log' AND column_name = 'document_id'
  ) THEN
    ALTER TABLE user_activity_log ADD COLUMN document_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_log' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE user_activity_log ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_activity_email ON user_activity_log(user_email);
CREATE INDEX IF NOT EXISTS idx_user_activity_session ON user_activity_log(session_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_document ON user_activity_log(document_id);

-- Document Views (for recommendations)
CREATE TABLE IF NOT EXISTS document_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  session_id TEXT,
  document_id TEXT NOT NULL,
  view_duration_seconds INTEGER DEFAULT 0,
  scroll_depth_percent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns to document_views if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'document_views' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE document_views ADD COLUMN user_email TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'document_views' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE document_views ADD COLUMN session_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'document_views' AND column_name = 'document_id'
  ) THEN
    ALTER TABLE document_views ADD COLUMN document_id TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'document_views' AND column_name = 'view_duration_seconds'
  ) THEN
    ALTER TABLE document_views ADD COLUMN view_duration_seconds INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'document_views' AND column_name = 'scroll_depth_percent'
  ) THEN
    ALTER TABLE document_views ADD COLUMN scroll_depth_percent INTEGER DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_document_views_document ON document_views(document_id);
CREATE INDEX IF NOT EXISTS idx_document_views_email ON document_views(user_email);

-- Document Purchase Correlations (for "also bought" recommendations)
CREATE TABLE IF NOT EXISTS document_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id_1 TEXT NOT NULL,
  document_id_2 TEXT NOT NULL,
  correlation_score DECIMAL(5,4) NOT NULL DEFAULT 0,
  co_purchase_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(document_id_1, document_id_2)
);

-- Add missing columns to document_correlations if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'document_correlations' AND column_name = 'document_id_1'
  ) THEN
    ALTER TABLE document_correlations ADD COLUMN document_id_1 TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'document_correlations' AND column_name = 'document_id_2'
  ) THEN
    ALTER TABLE document_correlations ADD COLUMN document_id_2 TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'document_correlations' AND column_name = 'correlation_score'
  ) THEN
    ALTER TABLE document_correlations ADD COLUMN correlation_score DECIMAL(5,4) NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'document_correlations' AND column_name = 'co_purchase_count'
  ) THEN
    ALTER TABLE document_correlations ADD COLUMN co_purchase_count INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_document_correlations_doc1 ON document_correlations(document_id_1);

-- Client Portal: Secure Messages
CREATE TABLE IF NOT EXISTS client_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'lawyer', 'system')),
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]'::jsonb,
  related_case_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns to client_messages if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'client_messages' AND column_name = 'client_email'
  ) THEN
    ALTER TABLE client_messages ADD COLUMN client_email TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'client_messages' AND column_name = 'is_read'
  ) THEN
    ALTER TABLE client_messages ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_client_messages_email ON client_messages(client_email);
CREATE INDEX IF NOT EXISTS idx_client_messages_unread ON client_messages(client_email, is_read) WHERE is_read = false;

-- Client Portal: Case Timeline Events
CREATE TABLE IF NOT EXISTS case_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  case_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'document_added', 'status_change', 'message', 'appointment', 'payment', 'milestone', 'completed')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_client_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns to case_timeline_events if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'case_timeline_events' AND column_name = 'client_email'
  ) THEN
    ALTER TABLE case_timeline_events ADD COLUMN client_email TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'case_timeline_events' AND column_name = 'case_id'
  ) THEN
    ALTER TABLE case_timeline_events ADD COLUMN case_id TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_case_timeline_email ON case_timeline_events(client_email);
CREATE INDEX IF NOT EXISTS idx_case_timeline_case ON case_timeline_events(case_id);

-- Client Portal: Invoice History
CREATE TABLE IF NOT EXISTS client_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  case_id TEXT,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  pdf_url TEXT,
  line_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns to client_invoices if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'client_invoices' AND column_name = 'client_email'
  ) THEN
    ALTER TABLE client_invoices ADD COLUMN client_email TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'client_invoices' AND column_name = 'status'
  ) THEN
    ALTER TABLE client_invoices ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_client_invoices_email ON client_invoices(client_email);
CREATE INDEX IF NOT EXISTS idx_client_invoices_status ON client_invoices(status);

-- Email Analytics: Aggregated Stats (for dashboard performance)
CREATE TABLE IF NOT EXISTS email_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  sequence_type TEXT NOT NULL,
  sent_count INTEGER NOT NULL DEFAULT 0,
  opened_count INTEGER NOT NULL DEFAULT 0,
  clicked_count INTEGER NOT NULL DEFAULT 0,
  bounced_count INTEGER NOT NULL DEFAULT 0,
  unsubscribed_count INTEGER NOT NULL DEFAULT 0,
  conversion_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(date, sequence_type)
);

-- Add missing columns to email_analytics_daily if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_analytics_daily' AND column_name = 'date'
  ) THEN
    ALTER TABLE email_analytics_daily ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_analytics_daily' AND column_name = 'sequence_type'
  ) THEN
    ALTER TABLE email_analytics_daily ADD COLUMN sequence_type TEXT NOT NULL DEFAULT 'unknown';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_analytics_date ON email_analytics_daily(date DESC);

-- Insert default achievements
INSERT INTO achievements (slug, name, description, icon, xp_reward, rarity, category, requirement_type, requirement_value) VALUES
('first_visit', 'Welcome!', 'Made your first visit to Hamilton Bailey Law', 'sparkles', 10, 'common', 'engagement', 'visit_count', 1),
('returning_visitor', 'Coming Back', 'Visited the site 5 times', 'refresh-cw', 25, 'common', 'engagement', 'visit_count', 5),
('regular_visitor', 'Regular', 'Visited the site 20 times', 'calendar', 50, 'rare', 'engagement', 'visit_count', 20),
('streak_3', 'On Fire', 'Maintained a 3-day visit streak', 'flame', 30, 'common', 'engagement', 'streak_days', 3),
('streak_7', 'Week Warrior', 'Maintained a 7-day visit streak', 'zap', 75, 'rare', 'engagement', 'streak_days', 7),
('streak_30', 'Dedicated', 'Maintained a 30-day visit streak', 'trophy', 300, 'legendary', 'engagement', 'streak_days', 30),
('first_purchase', 'First Step', 'Made your first document purchase', 'shopping-bag', 50, 'common', 'purchase', 'purchase_count', 1),
('document_collector', 'Collector', 'Purchased 5 documents', 'folder', 100, 'rare', 'purchase', 'purchase_count', 5),
('legal_library', 'Legal Library', 'Purchased 10 documents', 'library', 250, 'epic', 'purchase', 'purchase_count', 10),
('first_consultation', 'Getting Advice', 'Booked your first consultation', 'calendar-check', 75, 'common', 'consultation', 'consultation_count', 1),
('trusted_client', 'Trusted Client', 'Completed 3 consultations', 'shield', 200, 'rare', 'consultation', 'consultation_count', 3),
('newsletter_subscriber', 'Informed', 'Subscribed to the newsletter', 'mail', 25, 'common', 'engagement', 'newsletter_subscribed', 1),
('intake_complete', 'Ready to Go', 'Completed the client intake form', 'clipboard-check', 40, 'common', 'milestone', 'intake_completed', 1),
('early_adopter', 'Early Adopter', 'One of our first 100 users', 'star', 500, 'legendary', 'special', 'user_number', 100)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analytics_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policies (service role access for all) - drop and recreate to be idempotent
DROP POLICY IF EXISTS "Service role full access user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access user_achievements" ON user_achievements;
DROP POLICY IF EXISTS "Service role full access xp_transactions" ON xp_transactions;
DROP POLICY IF EXISTS "Service role full access user_activity_log" ON user_activity_log;
DROP POLICY IF EXISTS "Service role full access document_views" ON document_views;
DROP POLICY IF EXISTS "Service role full access client_messages" ON client_messages;
DROP POLICY IF EXISTS "Service role full access case_timeline_events" ON case_timeline_events;
DROP POLICY IF EXISTS "Service role full access client_invoices" ON client_invoices;
DROP POLICY IF EXISTS "Service role full access email_analytics_daily" ON email_analytics_daily;

CREATE POLICY "Service role full access user_profiles" ON user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access user_achievements" ON user_achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access xp_transactions" ON xp_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access user_activity_log" ON user_activity_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access document_views" ON document_views FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access client_messages" ON client_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access case_timeline_events" ON case_timeline_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access client_invoices" ON client_invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access email_analytics_daily" ON email_analytics_daily FOR ALL USING (true) WITH CHECK (true);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_invoices_updated_at ON client_invoices;
CREATE TRIGGER update_client_invoices_updated_at BEFORE UPDATE ON client_invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
