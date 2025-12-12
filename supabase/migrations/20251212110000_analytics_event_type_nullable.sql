-- ============================================================================
-- Make event_type nullable (legacy column)
-- The new event_name column is the primary field now
-- ============================================================================

-- Make event_type nullable if it exists and has NOT NULL constraint
DO $$
BEGIN
  -- Check if event_type column exists with NOT NULL constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events'
    AND column_name = 'event_type'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE analytics_events ALTER COLUMN event_type DROP NOT NULL;
  END IF;

  -- Also make page_url nullable since some events may not have it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events'
    AND column_name = 'page_url'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE analytics_events ALTER COLUMN page_url DROP NOT NULL;
  END IF;

  -- Make session_id nullable for server-side events
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events'
    AND column_name = 'session_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE analytics_events ALTER COLUMN session_id DROP NOT NULL;
  END IF;

  -- Make timestamp have a default value
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events'
    AND column_name = 'timestamp'
  ) THEN
    ALTER TABLE analytics_events ALTER COLUMN timestamp SET DEFAULT NOW();
  END IF;
END $$;

-- Copy event_name to event_type for legacy compatibility where event_type is null
UPDATE analytics_events
SET event_type = event_name
WHERE event_type IS NULL AND event_name IS NOT NULL;

-- Also copy event_type to event_name where event_name is null (for old data)
UPDATE analytics_events
SET event_name = event_type
WHERE event_name IS NULL AND event_type IS NOT NULL;
