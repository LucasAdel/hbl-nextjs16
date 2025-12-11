-- Migration: Calendar Availability System
-- Description: Creates tables for randomized availability slots and Google Calendar sync
-- Author: Claude Code
-- Date: 2025-12-13

-- =====================================================
-- 1. AVAILABILITY SLOTS TABLE
-- =====================================================
-- Stores generated time slots for booking availability
-- Max 3 slots per day, 30-60 min each, 10:30am-4:30pm weekdays

CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Slot timing
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 30 AND duration_minutes <= 60),

  -- Availability flags
  is_available BOOLEAN NOT NULL DEFAULT true,
  blocked_by_calendar BOOLEAN NOT NULL DEFAULT false,
  blocked_by_booking BOOLEAN NOT NULL DEFAULT false,

  -- Google Calendar sync data
  google_event_id TEXT,
  google_event_summary TEXT,
  last_synced_at TIMESTAMPTZ,

  -- Generation metadata
  generation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  generation_method TEXT NOT NULL DEFAULT 'random' CHECK (generation_method IN ('random', 'manual', 'imported')),
  slot_priority INTEGER DEFAULT 50 CHECK (slot_priority >= 0 AND slot_priority <= 100),

  -- Booking link
  booking_id UUID REFERENCES advanced_bookings(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_slot_per_date_time UNIQUE (slot_date, start_time),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT business_hours_start CHECK (start_time >= '10:30:00'::TIME),
  CONSTRAINT business_hours_end CHECK (end_time <= '16:30:00'::TIME)
);

-- Add comment
COMMENT ON TABLE availability_slots IS 'Randomized booking availability slots synced with Google Calendar';

-- =====================================================
-- 2. INDEXES FOR AVAILABILITY SLOTS
-- =====================================================

-- Fast lookup by date
CREATE INDEX idx_availability_slots_date ON availability_slots(slot_date);

-- Fast lookup for available slots
CREATE INDEX idx_availability_slots_available ON availability_slots(slot_date, is_available)
  WHERE is_available = true;

-- Google Calendar event lookup
CREATE INDEX idx_availability_slots_google_event ON availability_slots(google_event_id)
  WHERE google_event_id IS NOT NULL;

-- Sync timestamp for polling
CREATE INDEX idx_availability_slots_sync ON availability_slots(last_synced_at);

-- Booking lookup
CREATE INDEX idx_availability_slots_booking ON availability_slots(booking_id)
  WHERE booking_id IS NOT NULL;

-- =====================================================
-- 3. CALENDAR SYNC STATE TABLE
-- =====================================================
-- Tracks the state of Google Calendar synchronization

CREATE TABLE IF NOT EXISTS calendar_sync_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Calendar identification
  calendar_email TEXT NOT NULL UNIQUE,

  -- Sync timing
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  sync_interval_minutes INTEGER NOT NULL DEFAULT 10,

  -- Sync metrics
  events_synced_count INTEGER NOT NULL DEFAULT 0,
  slots_blocked_count INTEGER NOT NULL DEFAULT 0,

  -- Health monitoring
  is_healthy BOOLEAN NOT NULL DEFAULT true,
  consecutive_errors INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  last_error_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment
COMMENT ON TABLE calendar_sync_state IS 'Tracks Google Calendar synchronization state and health';

-- =====================================================
-- 4. INITIALIZE DEFAULT CALENDAR SYNC STATE
-- =====================================================

INSERT INTO calendar_sync_state (
  calendar_email,
  sync_interval_minutes,
  is_healthy
) VALUES (
  'lw@hamiltonbailey.com',
  10,
  true
) ON CONFLICT (calendar_email) DO NOTHING;

-- =====================================================
-- 5. UPDATE ADVANCED_BOOKINGS TABLE
-- =====================================================
-- Add foreign key reference to availability slot

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'advanced_bookings'
    AND column_name = 'availability_slot_id'
  ) THEN
    ALTER TABLE advanced_bookings
    ADD COLUMN availability_slot_id UUID REFERENCES availability_slots(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Index for slot lookup
CREATE INDEX IF NOT EXISTS idx_advanced_bookings_slot
  ON advanced_bookings(availability_slot_id)
  WHERE availability_slot_id IS NOT NULL;

-- =====================================================
-- 6. UPDATED_AT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to availability_slots
DROP TRIGGER IF EXISTS trigger_availability_slots_updated_at ON availability_slots;
CREATE TRIGGER trigger_availability_slots_updated_at
  BEFORE UPDATE ON availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_availability_updated_at();

-- Apply to calendar_sync_state
DROP TRIGGER IF EXISTS trigger_calendar_sync_state_updated_at ON calendar_sync_state;
CREATE TRIGGER trigger_calendar_sync_state_updated_at
  BEFORE UPDATE ON calendar_sync_state
  FOR EACH ROW
  EXECUTE FUNCTION update_availability_updated_at();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_state ENABLE ROW LEVEL SECURITY;

-- Availability Slots: Public can read available slots
CREATE POLICY "availability_slots_public_read" ON availability_slots
  FOR SELECT
  TO anon, authenticated
  USING (is_available = true AND slot_date >= CURRENT_DATE);

-- Availability Slots: Service role has full access
CREATE POLICY "availability_slots_service_full" ON availability_slots
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Calendar Sync State: Service role only
CREATE POLICY "calendar_sync_state_service_only" ON calendar_sync_state
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 8. HELPER FUNCTIONS
-- =====================================================

-- Function to check if a slot conflicts with existing slots on same date
CREATE OR REPLACE FUNCTION check_slot_overlap(
  p_slot_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  has_conflict BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM availability_slots
    WHERE slot_date = p_slot_date
    AND id != COALESCE(p_exclude_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      (p_start_time >= start_time AND p_start_time < end_time) OR
      (p_end_time > start_time AND p_end_time <= end_time) OR
      (p_start_time <= start_time AND p_end_time >= end_time)
    )
  ) INTO has_conflict;

  RETURN has_conflict;
END;
$$ LANGUAGE plpgsql;

-- Function to count available slots for a date
CREATE OR REPLACE FUNCTION count_slots_for_date(p_date DATE)
RETURNS INTEGER AS $$
DECLARE
  slot_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO slot_count
  FROM availability_slots
  WHERE slot_date = p_date;

  RETURN slot_count;
END;
$$ LANGUAGE plpgsql;

-- Function to block a slot atomically
CREATE OR REPLACE FUNCTION block_slot_for_booking(
  p_slot_id UUID,
  p_booking_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  slot_available BOOLEAN;
BEGIN
  -- Check if slot is still available
  SELECT is_available AND NOT blocked_by_calendar AND NOT blocked_by_booking
  INTO slot_available
  FROM availability_slots
  WHERE id = p_slot_id
  FOR UPDATE; -- Lock the row

  IF slot_available IS NULL THEN
    RETURN false; -- Slot doesn't exist
  END IF;

  IF NOT slot_available THEN
    RETURN false; -- Slot not available
  END IF;

  -- Block the slot
  UPDATE availability_slots
  SET
    blocked_by_booking = true,
    is_available = false,
    booking_id = p_booking_id,
    updated_at = now()
  WHERE id = p_slot_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. CLEANUP OLD SLOTS (for daily maintenance)
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_availability_slots()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM availability_slots
  WHERE slot_date < CURRENT_DATE - INTERVAL '1 day'
  AND booking_id IS NULL; -- Don't delete slots linked to historical bookings

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Grant usage to authenticated users
GRANT SELECT ON availability_slots TO authenticated;
GRANT SELECT ON availability_slots TO anon;

-- Grant full access to service role
GRANT ALL ON availability_slots TO service_role;
GRANT ALL ON calendar_sync_state TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION check_slot_overlap TO service_role;
GRANT EXECUTE ON FUNCTION count_slots_for_date TO service_role;
GRANT EXECUTE ON FUNCTION block_slot_for_booking TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_availability_slots TO service_role;
