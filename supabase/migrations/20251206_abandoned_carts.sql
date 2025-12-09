-- Migration: Create abandoned_carts table for cart recovery emails
-- Date: 2025-12-06

-- Create abandoned_carts table
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  items JSONB NOT NULL,
  total_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  session_id VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  reminder_count INTEGER NOT NULL DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'recovered', 'expired', 'unsubscribed'))
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON abandoned_carts(email);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_status ON abandoned_carts(status);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_created_at ON abandoned_carts(created_at);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_pending_reminders
  ON abandoned_carts(status, reminder_count)
  WHERE status = 'pending';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_abandoned_carts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_abandoned_carts_updated_at
  BEFORE UPDATE ON abandoned_carts
  FOR EACH ROW
  EXECUTE FUNCTION update_abandoned_carts_updated_at();

-- Enable Row Level Security
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role full access to abandoned_carts"
  ON abandoned_carts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Comment on table
COMMENT ON TABLE abandoned_carts IS 'Tracks abandoned shopping carts for email recovery campaigns';
COMMENT ON COLUMN abandoned_carts.status IS 'pending: awaiting recovery, recovered: purchase completed, expired: max reminders sent, unsubscribed: user opted out';
COMMENT ON COLUMN abandoned_carts.reminder_count IS 'Number of reminder emails sent (max 3)';
