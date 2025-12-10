-- Email Sequence Enrollments Table
-- Tracks users enrolled in automated email sequences

CREATE TABLE IF NOT EXISTS email_sequence_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  sequence_type TEXT NOT NULL CHECK (sequence_type IN ('welcome_series', 'post_consultation', 'post_purchase', 'booking_reminder', 're_engagement', 'cart_abandonment', 'financial_year_review')),
  current_step INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  trigger_data JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_email_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_email_sequence_enrollments_email ON email_sequence_enrollments(email);
CREATE INDEX IF NOT EXISTS idx_email_sequence_enrollments_status ON email_sequence_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_email_sequence_enrollments_next_email ON email_sequence_enrollments(next_email_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_email_sequence_enrollments_type_status ON email_sequence_enrollments(sequence_type, status);

-- Unique constraint to prevent duplicate active enrollments
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_sequence_unique_active
ON email_sequence_enrollments(email, sequence_type)
WHERE status IN ('active', 'paused');

-- Email Sequence Events Table
-- Tracks events like opens, clicks, etc. for each email sent

CREATE TABLE IF NOT EXISTS email_sequence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES email_sequence_enrollments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'opened', 'clicked', 'bounced', 'unsubscribed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for event queries
CREATE INDEX IF NOT EXISTS idx_email_sequence_events_enrollment ON email_sequence_events(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_email_sequence_events_type ON email_sequence_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_sequence_events_created ON email_sequence_events(created_at);

-- User Actions Table (for tracking user behaviors that affect sequences)
CREATE TABLE IF NOT EXISTS user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_actions_email ON user_actions(email);
CREATE INDEX IF NOT EXISTS idx_user_actions_action ON user_actions(action);
CREATE INDEX IF NOT EXISTS idx_user_actions_email_action ON user_actions(email, action);

-- User Conditions Table (for tracking user states/conditions)
CREATE TABLE IF NOT EXISTS user_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  condition TEXT NOT NULL,
  value JSONB DEFAULT 'true'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_conditions_email ON user_conditions(email);
CREATE INDEX IF NOT EXISTS idx_user_conditions_condition ON user_conditions(condition);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_conditions_unique ON user_conditions(email, condition);

-- Update trigger for email_sequence_enrollments
CREATE OR REPLACE FUNCTION update_email_sequence_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_email_sequence_enrollments_updated_at
  BEFORE UPDATE ON email_sequence_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_email_sequence_enrollments_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE email_sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequence_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_conditions ENABLE ROW LEVEL SECURITY;

-- Policies for server-side access (service role can do everything)
CREATE POLICY "Service role can manage email_sequence_enrollments"
ON email_sequence_enrollments FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage email_sequence_events"
ON email_sequence_events FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage user_actions"
ON user_actions FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage user_conditions"
ON user_conditions FOR ALL
USING (true)
WITH CHECK (true);

-- Note: newsletter_subscribers.name column is created in 20251205_newsletter_subscribers.sql
