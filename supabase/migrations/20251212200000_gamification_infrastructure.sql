-- ============================================================================
-- GAMIFICATION INFRASTRUCTURE - Complete System
-- Implements addiction mechanics with privacy-first design
-- Based on BMAD methodology: variable reinforcement, streaks, leaderboards
-- ============================================================================

-- ============================================================================
-- PART 1: PRIVACY SETTINGS (Foundation - must come first)
-- Allows users to control their visibility on leaderboards, social proof, etc.
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Leaderboard visibility
  show_on_leaderboard BOOLEAN DEFAULT TRUE,
  leaderboard_display_name TEXT, -- Optional alias instead of real name
  show_xp_publicly BOOLEAN DEFAULT TRUE,
  show_level_publicly BOOLEAN DEFAULT TRUE,
  show_achievements_publicly BOOLEAN DEFAULT TRUE,

  -- Activity visibility
  show_activity_status BOOLEAN DEFAULT TRUE, -- "Active now" indicator
  show_streak_publicly BOOLEAN DEFAULT FALSE, -- Streaks can be sensitive
  show_recent_activity BOOLEAN DEFAULT FALSE, -- "John just completed X"

  -- Social proof participation
  include_in_social_proof BOOLEAN DEFAULT TRUE, -- "847 users completed this"
  include_in_testimonials BOOLEAN DEFAULT FALSE, -- Requires explicit opt-in

  -- Professional privacy (for job seekers/employers)
  hide_from_employer_search BOOLEAN DEFAULT FALSE,
  hide_activity_from_connections BOOLEAN DEFAULT FALSE,
  anonymous_mode BOOLEAN DEFAULT FALSE, -- Complete anonymity on platform

  -- Data preferences
  allow_activity_analytics BOOLEAN DEFAULT TRUE,
  allow_personalisation BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_user_privacy UNIQUE (user_id)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_privacy_user ON user_privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_leaderboard ON user_privacy_settings(show_on_leaderboard) WHERE show_on_leaderboard = TRUE;
CREATE INDEX IF NOT EXISTS idx_privacy_anonymous ON user_privacy_settings(anonymous_mode) WHERE anonymous_mode = TRUE;

-- Enable RLS
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own privacy settings
DROP POLICY IF EXISTS "Users can view own privacy settings" ON user_privacy_settings;
CREATE POLICY "Users can view own privacy settings"
ON user_privacy_settings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own privacy settings" ON user_privacy_settings;
CREATE POLICY "Users can update own privacy settings"
ON user_privacy_settings FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own privacy settings" ON user_privacy_settings;
CREATE POLICY "Users can insert own privacy settings"
ON user_privacy_settings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Service role full access
DROP POLICY IF EXISTS "Service role full access to privacy" ON user_privacy_settings;
CREATE POLICY "Service role full access to privacy"
ON user_privacy_settings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Function to get or create privacy settings with sensible defaults
CREATE OR REPLACE FUNCTION get_or_create_privacy_settings(p_user_id UUID)
RETURNS user_privacy_settings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result user_privacy_settings;
BEGIN
  SELECT * INTO result FROM user_privacy_settings WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO user_privacy_settings (user_id)
    VALUES (p_user_id)
    RETURNING * INTO result;
  END IF;

  RETURN result;
END;
$$;

-- ============================================================================
-- PART 2: GAMIFICATION NOTIFICATIONS
-- Stores all XP awards, level-ups, achievements for display with animations
-- ============================================================================

CREATE TABLE IF NOT EXISTS gamification_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification type
  type TEXT NOT NULL CHECK (type IN (
    'xp_earned', 'level_up', 'achievement_unlocked', 'streak_milestone',
    'streak_at_risk', 'streak_broken', 'streak_frozen', 'challenge_complete',
    'challenge_progress', 'leaderboard_rank_up', 'leaderboard_rank_down',
    'near_miss', 'jackpot', 'referral_bonus', 'daily_bonus', 'welcome_bonus'
  )),

  -- Display content
  title TEXT NOT NULL,
  message TEXT,

  -- Reward details
  xp_amount INTEGER DEFAULT 0,
  bonus_multiplier DECIMAL(3,2) DEFAULT 1.0,
  reward_tier TEXT CHECK (reward_tier IN ('base', 'bonus', 'rare', 'jackpot')),

  -- Visual effects
  animation_type TEXT DEFAULT 'sparkle' CHECK (animation_type IN (
    'confetti', 'sparkle', 'pulse', 'shake', 'glow', 'fireworks', 'coins', 'levelup'
  )),
  icon TEXT, -- Emoji or icon name
  colour TEXT, -- Hex colour for theming

  -- Related entities
  achievement_id UUID,
  challenge_id UUID,
  leaderboard_period TEXT,

  -- Near-miss data (for "You're #11, just 2 away from Top 10!")
  current_value INTEGER,
  target_value INTEGER,
  gap_amount INTEGER,

  -- State
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  display_priority INTEGER DEFAULT 5, -- 1 = highest priority
  expires_at TIMESTAMPTZ, -- Optional expiry for time-sensitive notifications

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_notif_user_unread ON gamification_notifications(user_id, is_read, is_dismissed)
  WHERE is_read = FALSE AND is_dismissed = FALSE;
CREATE INDEX IF NOT EXISTS idx_notif_user_created ON gamification_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_type ON gamification_notifications(type);
CREATE INDEX IF NOT EXISTS idx_notif_priority ON gamification_notifications(display_priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_expires ON gamification_notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE gamification_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON gamification_notifications;
CREATE POLICY "Users can view own notifications"
ON gamification_notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can update (mark read/dismissed) their own notifications
DROP POLICY IF EXISTS "Users can update own notifications" ON gamification_notifications;
CREATE POLICY "Users can update own notifications"
ON gamification_notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Only service role can create notifications
DROP POLICY IF EXISTS "Service role can create notifications" ON gamification_notifications;
CREATE POLICY "Service role can create notifications"
ON gamification_notifications FOR INSERT
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access notifications" ON gamification_notifications;
CREATE POLICY "Service role full access notifications"
ON gamification_notifications FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Function to create notification with automatic near-miss detection
CREATE OR REPLACE FUNCTION create_gamification_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_xp_amount INTEGER DEFAULT 0,
  p_bonus_multiplier DECIMAL DEFAULT 1.0,
  p_reward_tier TEXT DEFAULT 'base',
  p_animation_type TEXT DEFAULT 'sparkle',
  p_icon TEXT DEFAULT NULL,
  p_achievement_id UUID DEFAULT NULL,
  p_challenge_id UUID DEFAULT NULL,
  p_current_value INTEGER DEFAULT NULL,
  p_target_value INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
  v_gap INTEGER;
  v_priority INTEGER;
  v_colour TEXT;
BEGIN
  -- Calculate gap for near-miss
  IF p_current_value IS NOT NULL AND p_target_value IS NOT NULL THEN
    v_gap := p_target_value - p_current_value;
  END IF;

  -- Set priority based on type
  v_priority := CASE p_type
    WHEN 'jackpot' THEN 1
    WHEN 'level_up' THEN 2
    WHEN 'achievement_unlocked' THEN 3
    WHEN 'streak_at_risk' THEN 2
    WHEN 'near_miss' THEN 3
    WHEN 'leaderboard_rank_up' THEN 4
    ELSE 5
  END;

  -- Set colour based on reward tier
  v_colour := CASE p_reward_tier
    WHEN 'jackpot' THEN '#FFD700' -- Gold
    WHEN 'rare' THEN '#9B59B6' -- Purple
    WHEN 'bonus' THEN '#3498DB' -- Blue
    ELSE '#2AAFA2' -- Teal (brand colour)
  END;

  INSERT INTO gamification_notifications (
    user_id, type, title, message, xp_amount, bonus_multiplier,
    reward_tier, animation_type, icon, colour, achievement_id, challenge_id,
    current_value, target_value, gap_amount, display_priority
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_xp_amount, p_bonus_multiplier,
    p_reward_tier, p_animation_type, p_icon, v_colour, p_achievement_id, p_challenge_id,
    p_current_value, p_target_value, v_gap, v_priority
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM gamification_notifications
  WHERE user_id = p_user_id
    AND is_read = FALSE
    AND is_dismissed = FALSE
    AND (expires_at IS NULL OR expires_at > NOW());
$$;

-- Function to mark all as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE gamification_notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND is_read = FALSE;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ============================================================================
-- PART 3: LEADERBOARDS SYSTEM
-- Supports daily, weekly, monthly, all-time with privacy filtering
-- ============================================================================

-- Leaderboard snapshots (computed periodically)
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Period definition
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly', 'all_time')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- User ranking
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  previous_rank INTEGER, -- For rank change calculation
  rank_change INTEGER GENERATED ALWAYS AS (
    CASE WHEN previous_rank IS NOT NULL THEN previous_rank - rank ELSE NULL END
  ) STORED,

  -- XP data
  xp_total INTEGER NOT NULL DEFAULT 0,
  xp_earned_in_period INTEGER NOT NULL DEFAULT 0,

  -- Additional stats for interest
  achievements_count INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,

  -- Display info (denormalised for performance)
  display_name TEXT, -- From privacy settings or profile
  avatar_url TEXT,
  level INTEGER DEFAULT 1,

  -- Privacy flag (computed at snapshot time)
  is_visible BOOLEAN DEFAULT TRUE,

  -- Metadata
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_leaderboard_entry UNIQUE (period_type, period_start, user_id)
);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard_snapshots(period_type, period_start, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON leaderboard_snapshots(user_id, period_type);
CREATE INDEX IF NOT EXISTS idx_leaderboard_visible ON leaderboard_snapshots(period_type, period_start, is_visible, rank)
  WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_leaderboard_computed ON leaderboard_snapshots(computed_at DESC);

-- Enable RLS
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- Anyone can view visible leaderboard entries
DROP POLICY IF EXISTS "Anyone can view visible leaderboard entries" ON leaderboard_snapshots;
CREATE POLICY "Anyone can view visible leaderboard entries"
ON leaderboard_snapshots FOR SELECT
TO authenticated
USING (is_visible = TRUE OR user_id = auth.uid());

-- Service role manages snapshots
DROP POLICY IF EXISTS "Service role manages leaderboards" ON leaderboard_snapshots;
CREATE POLICY "Service role manages leaderboards"
ON leaderboard_snapshots FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Current leaderboard view (most recent snapshot per period)
CREATE OR REPLACE VIEW current_leaderboards AS
SELECT DISTINCT ON (period_type, user_id)
  ls.*,
  CASE
    WHEN ls.rank_change > 0 THEN 'up'
    WHEN ls.rank_change < 0 THEN 'down'
    ELSE 'same'
  END as rank_direction
FROM leaderboard_snapshots ls
WHERE ls.is_visible = TRUE
  AND ls.period_start = (
    SELECT MAX(period_start)
    FROM leaderboard_snapshots ls2
    WHERE ls2.period_type = ls.period_type
  )
ORDER BY period_type, user_id, computed_at DESC;

GRANT SELECT ON current_leaderboards TO authenticated;
GRANT SELECT ON current_leaderboards TO service_role;

-- Function to get leaderboard with pagination
CREATE OR REPLACE FUNCTION get_leaderboard(
  p_period_type TEXT DEFAULT 'weekly',
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0,
  p_include_user_rank UUID DEFAULT NULL
)
RETURNS TABLE (
  rank INTEGER,
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  level INTEGER,
  xp_total INTEGER,
  xp_earned_in_period INTEGER,
  rank_change INTEGER,
  rank_direction TEXT,
  streak_days INTEGER,
  achievements_count INTEGER,
  is_current_user BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_latest_period DATE;
BEGIN
  -- Get latest period for this type
  SELECT MAX(period_start) INTO v_latest_period
  FROM leaderboard_snapshots
  WHERE period_type = p_period_type;

  RETURN QUERY
  SELECT
    ls.rank,
    ls.user_id,
    ls.display_name,
    ls.avatar_url,
    ls.level,
    ls.xp_total,
    ls.xp_earned_in_period,
    ls.rank_change,
    CASE
      WHEN ls.rank_change > 0 THEN 'up'
      WHEN ls.rank_change < 0 THEN 'down'
      ELSE 'same'
    END::TEXT as rank_direction,
    ls.streak_days,
    ls.achievements_count,
    (ls.user_id = p_include_user_rank) as is_current_user
  FROM leaderboard_snapshots ls
  WHERE ls.period_type = p_period_type
    AND ls.period_start = v_latest_period
    AND ls.is_visible = TRUE
  ORDER BY ls.rank ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to get user's rank across all periods
CREATE OR REPLACE FUNCTION get_user_ranks(p_user_id UUID)
RETURNS TABLE (
  period_type TEXT,
  rank INTEGER,
  total_participants INTEGER,
  percentile DECIMAL(5,2),
  xp_earned INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH latest_periods AS (
    SELECT period_type, MAX(period_start) as latest_start
    FROM leaderboard_snapshots
    GROUP BY period_type
  ),
  user_ranks AS (
    SELECT
      ls.period_type,
      ls.rank,
      ls.xp_earned_in_period
    FROM leaderboard_snapshots ls
    JOIN latest_periods lp ON ls.period_type = lp.period_type AND ls.period_start = lp.latest_start
    WHERE ls.user_id = p_user_id
  ),
  totals AS (
    SELECT
      ls.period_type,
      COUNT(*)::INTEGER as total
    FROM leaderboard_snapshots ls
    JOIN latest_periods lp ON ls.period_type = lp.period_type AND ls.period_start = lp.latest_start
    WHERE ls.is_visible = TRUE
    GROUP BY ls.period_type
  )
  SELECT
    ur.period_type,
    ur.rank,
    t.total as total_participants,
    ROUND((1 - (ur.rank::DECIMAL / NULLIF(t.total, 0))) * 100, 2) as percentile,
    ur.xp_earned_in_period as xp_earned
  FROM user_ranks ur
  JOIN totals t ON ur.period_type = t.period_type;
END;
$$;

GRANT EXECUTE ON FUNCTION get_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_ranks TO authenticated;

-- ============================================================================
-- PART 4: CHALLENGES SYSTEM
-- Daily, weekly, monthly, and special event challenges
-- ============================================================================

-- Challenge definitions
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT, -- For compact display

  -- Challenge type and timing
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'special', 'community', 'onboarding')),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),

  -- Requirements (JSONB for flexibility)
  -- Example: {"event_name": "document_view", "count": 5, "time_limit_hours": 24}
  requirements JSONB NOT NULL DEFAULT '{}',

  -- Rewards
  xp_reward INTEGER NOT NULL DEFAULT 100,
  bonus_reward_type TEXT, -- 'streak_freeze', 'xp_multiplier', 'badge', etc.
  bonus_reward_value TEXT, -- Depends on type
  achievement_id UUID, -- Achievement unlocked on completion

  -- Visual
  icon TEXT DEFAULT '🎯',
  colour TEXT DEFAULT '#2AAFA2',
  badge_image_url TEXT,

  -- Availability
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  max_completions INTEGER, -- NULL = unlimited
  current_completions INTEGER DEFAULT 0,

  -- For recurring challenges
  recurrence_rule TEXT, -- iCal RRULE format or simple: 'daily', 'weekly:monday', etc.

  -- Targeting (who can see this challenge)
  min_level INTEGER DEFAULT 1,
  max_level INTEGER,
  required_achievement_ids UUID[],

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(is_active, type) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_challenges_featured ON challenges(is_featured, start_date) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(type, difficulty);

-- User challenge progress
CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,

  -- Progress tracking
  progress INTEGER NOT NULL DEFAULT 0,
  target INTEGER NOT NULL, -- Copied from challenge requirements
  progress_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN target > 0 THEN LEAST(progress::DECIMAL / target * 100, 100) ELSE 0 END
  ) STORED,

  -- Progress details (for complex challenges)
  progress_details JSONB DEFAULT '{}',

  -- State
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'expired')),

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Rewards claimed
  xp_claimed INTEGER DEFAULT 0,
  bonus_claimed BOOLEAN DEFAULT FALSE,

  CONSTRAINT unique_user_challenge UNIQUE (user_id, challenge_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user ON user_challenge_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_active ON user_challenge_progress(user_id, status, expires_at)
  WHERE status = 'in_progress';
CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge ON user_challenge_progress(challenge_id, status);

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Anyone can view active challenges
DROP POLICY IF EXISTS "Anyone can view active challenges" ON challenges;
CREATE POLICY "Anyone can view active challenges"
ON challenges FOR SELECT
TO authenticated
USING (is_active = TRUE AND (start_date IS NULL OR start_date <= NOW()));

-- Service role manages challenges
DROP POLICY IF EXISTS "Service role manages challenges" ON challenges;
CREATE POLICY "Service role manages challenges"
ON challenges FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view and update their own progress
DROP POLICY IF EXISTS "Users can view own challenge progress" ON user_challenge_progress;
CREATE POLICY "Users can view own challenge progress"
ON user_challenge_progress FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own challenge progress" ON user_challenge_progress;
CREATE POLICY "Users can update own challenge progress"
ON user_challenge_progress FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages challenge progress" ON user_challenge_progress;
CREATE POLICY "Service role manages challenge progress"
ON user_challenge_progress FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Function to enrol user in a challenge
CREATE OR REPLACE FUNCTION enrol_in_challenge(
  p_user_id UUID,
  p_challenge_id UUID
)
RETURNS user_challenge_progress
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge challenges;
  v_progress user_challenge_progress;
  v_target INTEGER;
BEGIN
  -- Get challenge details
  SELECT * INTO v_challenge FROM challenges WHERE id = p_challenge_id AND is_active = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Challenge not found or inactive';
  END IF;

  -- Check if already enrolled
  SELECT * INTO v_progress FROM user_challenge_progress
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id;

  IF FOUND THEN
    RETURN v_progress; -- Already enrolled
  END IF;

  -- Extract target from requirements
  v_target := COALESCE((v_challenge.requirements->>'count')::INTEGER, 1);

  -- Create enrolment
  INSERT INTO user_challenge_progress (
    user_id, challenge_id, target, expires_at
  ) VALUES (
    p_user_id,
    p_challenge_id,
    v_target,
    CASE v_challenge.type
      WHEN 'daily' THEN NOW() + INTERVAL '1 day'
      WHEN 'weekly' THEN NOW() + INTERVAL '7 days'
      WHEN 'monthly' THEN NOW() + INTERVAL '30 days'
      ELSE v_challenge.end_date
    END
  )
  RETURNING * INTO v_progress;

  RETURN v_progress;
END;
$$;

-- Function to update challenge progress
CREATE OR REPLACE FUNCTION update_challenge_progress(
  p_user_id UUID,
  p_challenge_id UUID,
  p_increment INTEGER DEFAULT 1
)
RETURNS user_challenge_progress
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_progress user_challenge_progress;
  v_challenge challenges;
BEGIN
  -- Get current progress
  SELECT * INTO v_progress FROM user_challenge_progress
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id AND status = 'in_progress'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Update progress
  UPDATE user_challenge_progress
  SET progress = progress + p_increment,
      progress_details = progress_details || jsonb_build_object('last_update', NOW())
  WHERE id = v_progress.id
  RETURNING * INTO v_progress;

  -- Check if completed
  IF v_progress.progress >= v_progress.target THEN
    -- Get challenge for rewards
    SELECT * INTO v_challenge FROM challenges WHERE id = p_challenge_id;

    -- Mark as completed
    UPDATE user_challenge_progress
    SET status = 'completed', completed_at = NOW(), xp_claimed = v_challenge.xp_reward
    WHERE id = v_progress.id
    RETURNING * INTO v_progress;

    -- Update challenge completion count
    UPDATE challenges SET current_completions = current_completions + 1
    WHERE id = p_challenge_id;

    -- Create notification
    PERFORM create_gamification_notification(
      p_user_id,
      'challenge_complete',
      'Challenge Complete! 🎉',
      'You completed: ' || v_challenge.title,
      v_challenge.xp_reward,
      1.0,
      'bonus',
      'confetti',
      v_challenge.icon,
      NULL,
      p_challenge_id
    );
  END IF;

  RETURN v_progress;
END;
$$;

GRANT EXECUTE ON FUNCTION enrol_in_challenge TO authenticated;
GRANT EXECUTE ON FUNCTION update_challenge_progress TO service_role;

-- ============================================================================
-- PART 5: REFERRAL TRACKING SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referrer info
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,

  -- Referred person
  referred_email TEXT,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'clicked', 'signed_up', 'converted', 'rewarded', 'expired', 'rejected'
  )),

  -- Conversion details
  conversion_type TEXT, -- 'signup', 'purchase', 'subscription'
  conversion_value DECIMAL(10,2),

  -- Rewards
  referrer_xp_reward INTEGER DEFAULT 0,
  referrer_bonus_reward TEXT, -- 'discount_10', 'free_document', etc.
  referred_bonus TEXT, -- What the referred person gets

  -- Commission (if applicable)
  commission_rate DECIMAL(5,4), -- e.g., 0.10 for 10%
  commission_amount DECIMAL(10,2),
  commission_paid BOOLEAN DEFAULT FALSE,
  commission_paid_at TIMESTAMPTZ,

  -- Tracking
  click_count INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,
  utm_source TEXT,
  utm_campaign TEXT,
  landing_page TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clicked_at TIMESTAMPTZ,
  signed_up_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '90 days'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id, status);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_user_id) WHERE referred_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status, created_at);
CREATE INDEX IF NOT EXISTS idx_referrals_email ON referrals(referred_email) WHERE referred_email IS NOT NULL;

-- Referral stats (denormalised for leaderboard)
CREATE TABLE IF NOT EXISTS referral_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Counts
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  pending_referrals INTEGER DEFAULT 0,

  -- Earnings
  total_xp_earned INTEGER DEFAULT 0,
  total_commission_earned DECIMAL(10,2) DEFAULT 0,
  total_commission_paid DECIMAL(10,2) DEFAULT 0,

  -- Streaks
  current_month_referrals INTEGER DEFAULT 0,
  best_month_referrals INTEGER DEFAULT 0,

  -- Milestones reached
  milestones_reached INTEGER[] DEFAULT '{}',

  -- Timestamps
  last_referral_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_stats_user ON referral_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_stats_monthly ON referral_stats(current_month_referrals DESC);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
CREATE POLICY "Users can view own referrals"
ON referrals FOR SELECT
TO authenticated
USING (referrer_id = auth.uid());

-- Service role full access
DROP POLICY IF EXISTS "Service role manages referrals" ON referrals;
CREATE POLICY "Service role manages referrals"
ON referrals FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view their own stats
DROP POLICY IF EXISTS "Users can view own referral stats" ON referral_stats;
CREATE POLICY "Users can view own referral stats"
ON referral_stats FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages referral stats" ON referral_stats;
CREATE POLICY "Service role manages referral stats"
ON referral_stats FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    v_code := UPPER(SUBSTRING(MD5(p_user_id::TEXT || NOW()::TEXT || RANDOM()::TEXT) FROM 1 FOR 8));

    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM referrals WHERE referral_code = v_code) INTO v_exists;

    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_code;
END;
$$;

-- Function to get or create user's referral link
CREATE OR REPLACE FUNCTION get_user_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Check for existing active referral
  SELECT referral_code INTO v_code
  FROM referrals
  WHERE referrer_id = p_user_id AND referred_user_id IS NULL AND status = 'pending'
  LIMIT 1;

  IF v_code IS NULL THEN
    -- Create new referral entry
    v_code := generate_referral_code(p_user_id);

    INSERT INTO referrals (referrer_id, referral_code)
    VALUES (p_user_id, v_code);

    -- Ensure stats row exists
    INSERT INTO referral_stats (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN v_code;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_referral_code TO authenticated;

-- ============================================================================
-- PART 6: STREAK FREEZE SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS streak_freeze_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Token balance
  tokens_available INTEGER NOT NULL DEFAULT 0,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  tokens_earned_total INTEGER NOT NULL DEFAULT 0,

  -- Last actions
  last_earned_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,

  -- Auto-freeze settings
  auto_use_enabled BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_user_freeze_tokens UNIQUE (user_id)
);

-- Streak events log
CREATE TABLE IF NOT EXISTS streak_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event type
  event_type TEXT NOT NULL CHECK (event_type IN (
    'streak_started', 'streak_continued', 'streak_milestone',
    'streak_at_risk', 'streak_frozen', 'streak_broken', 'streak_recovered',
    'freeze_token_earned', 'freeze_token_used', 'freeze_token_expired'
  )),

  -- Streak data at time of event
  streak_day INTEGER,
  streak_multiplier DECIMAL(3,2),

  -- Freeze data
  freeze_token_change INTEGER, -- +1 earned, -1 used
  freeze_reason TEXT,

  -- Timestamps
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_freeze_tokens_user ON streak_freeze_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_events_user ON streak_events(user_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_streak_events_type ON streak_events(event_type, created_at DESC);

-- Enable RLS
ALTER TABLE streak_freeze_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own freeze tokens
DROP POLICY IF EXISTS "Users can view own freeze tokens" ON streak_freeze_tokens;
CREATE POLICY "Users can view own freeze tokens"
ON streak_freeze_tokens FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Service role manages tokens
DROP POLICY IF EXISTS "Service role manages freeze tokens" ON streak_freeze_tokens;
CREATE POLICY "Service role manages freeze tokens"
ON streak_freeze_tokens FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view their own streak events
DROP POLICY IF EXISTS "Users can view own streak events" ON streak_events;
CREATE POLICY "Users can view own streak events"
ON streak_events FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages streak events" ON streak_events;
CREATE POLICY "Service role manages streak events"
ON streak_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Function to use a freeze token
CREATE OR REPLACE FUNCTION use_streak_freeze(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tokens streak_freeze_tokens;
BEGIN
  -- Get current tokens
  SELECT * INTO v_tokens FROM streak_freeze_tokens WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND OR v_tokens.tokens_available < 1 THEN
    RETURN FALSE;
  END IF;

  -- Use token
  UPDATE streak_freeze_tokens
  SET tokens_available = tokens_available - 1,
      tokens_used = tokens_used + 1,
      last_used_at = NOW(),
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log event
  INSERT INTO streak_events (user_id, event_type, freeze_token_change, freeze_reason)
  VALUES (p_user_id, 'freeze_token_used', -1, 'Manual freeze to protect streak');

  -- Create notification
  PERFORM create_gamification_notification(
    p_user_id,
    'streak_frozen',
    'Streak Protected! ❄️',
    'Your freeze token saved your streak. You have ' || (v_tokens.tokens_available - 1) || ' tokens left.',
    0,
    1.0,
    'base',
    'glow',
    '❄️'
  );

  RETURN TRUE;
END;
$$;

-- Function to award freeze token
CREATE OR REPLACE FUNCTION award_streak_freeze_token(
  p_user_id UUID,
  p_reason TEXT DEFAULT 'Achievement reward'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_total INTEGER;
BEGIN
  -- Ensure row exists
  INSERT INTO streak_freeze_tokens (user_id, tokens_available, tokens_earned_total)
  VALUES (p_user_id, 1, 1)
  ON CONFLICT (user_id) DO UPDATE
  SET tokens_available = streak_freeze_tokens.tokens_available + 1,
      tokens_earned_total = streak_freeze_tokens.tokens_earned_total + 1,
      last_earned_at = NOW(),
      updated_at = NOW()
  RETURNING tokens_available INTO v_new_total;

  -- Log event
  INSERT INTO streak_events (user_id, event_type, freeze_token_change, freeze_reason)
  VALUES (p_user_id, 'freeze_token_earned', 1, p_reason);

  RETURN v_new_total;
END;
$$;

GRANT EXECUTE ON FUNCTION use_streak_freeze TO authenticated;
GRANT EXECUTE ON FUNCTION award_streak_freeze_token TO service_role;

-- ============================================================================
-- PART 7: SOCIAL PROOF AGGREGATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_proof_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event categorisation
  event_type TEXT NOT NULL CHECK (event_type IN (
    'signup', 'purchase', 'document_view', 'challenge_complete',
    'achievement_unlock', 'consultation_booked', 'article_read',
    'review_submitted', 'referral_success', 'milestone_reached'
  )),

  -- Aggregation period
  period_type TEXT DEFAULT 'daily' CHECK (period_type IN ('hourly', 'daily', 'weekly', 'monthly', 'all_time')),
  period_start TIMESTAMPTZ NOT NULL,

  -- Counts
  event_count INTEGER NOT NULL DEFAULT 0,
  unique_users INTEGER NOT NULL DEFAULT 0,

  -- Display message template
  -- e.g., "{count} users {action} today" -> "847 users completed a challenge today"
  message_template TEXT,
  action_verb TEXT, -- 'signed up', 'purchased', 'completed', etc.

  -- Geographic breakdown (optional)
  country_breakdown JSONB DEFAULT '{}',

  -- Timestamps
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_social_proof UNIQUE (event_type, period_type, period_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_proof_type ON social_proof_aggregates(event_type, period_type);
CREATE INDEX IF NOT EXISTS idx_social_proof_recent ON social_proof_aggregates(period_start DESC, event_type);

-- Enable RLS (public read)
ALTER TABLE social_proof_aggregates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view social proof" ON social_proof_aggregates;
CREATE POLICY "Anyone can view social proof"
ON social_proof_aggregates FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "Service role manages social proof" ON social_proof_aggregates;
CREATE POLICY "Service role manages social proof"
ON social_proof_aggregates FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Function to get current social proof messages
CREATE OR REPLACE FUNCTION get_social_proof_messages(p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  event_type TEXT,
  count INTEGER,
  message TEXT,
  time_ago TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.event_type,
    sp.event_count,
    REPLACE(
      COALESCE(sp.message_template, '{count} users {action} recently'),
      '{count}', sp.event_count::TEXT
    ) as message,
    CASE
      WHEN sp.period_start > NOW() - INTERVAL '1 hour' THEN 'in the last hour'
      WHEN sp.period_start > NOW() - INTERVAL '1 day' THEN 'today'
      WHEN sp.period_start > NOW() - INTERVAL '7 days' THEN 'this week'
      ELSE 'recently'
    END as time_ago
  FROM social_proof_aggregates sp
  WHERE sp.period_start > NOW() - INTERVAL '7 days'
    AND sp.event_count > 0
  ORDER BY sp.event_count DESC, sp.period_start DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION get_social_proof_messages TO authenticated;
GRANT EXECUTE ON FUNCTION get_social_proof_messages TO anon;

-- ============================================================================
-- PART 8: ARTICLE READING PROGRESS
-- ============================================================================

CREATE TABLE IF NOT EXISTS article_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Article identification
  article_slug TEXT NOT NULL,
  article_title TEXT,
  article_category TEXT,

  -- Progress tracking
  scroll_depth INTEGER DEFAULT 0, -- 0-100
  time_spent_seconds INTEGER DEFAULT 0,
  word_count INTEGER,
  estimated_read_time INTEGER, -- seconds

  -- Completion
  is_completed BOOLEAN DEFAULT FALSE,
  completion_threshold INTEGER DEFAULT 80, -- % scroll depth to count as complete

  -- XP tracking
  xp_awarded INTEGER DEFAULT 0,
  xp_award_breakdown JSONB DEFAULT '{}', -- {scroll: 10, time: 5, completion: 20}

  -- Engagement metrics
  sections_viewed TEXT[], -- For TOC tracking
  highlights_count INTEGER DEFAULT 0,
  notes_count INTEGER DEFAULT 0,

  -- Sessions
  visit_count INTEGER DEFAULT 1,
  first_visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  CONSTRAINT unique_user_article UNIQUE (user_id, article_slug)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_article_progress_user ON article_reading_progress(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_article_progress_article ON article_reading_progress(article_slug);
CREATE INDEX IF NOT EXISTS idx_article_progress_completed ON article_reading_progress(user_id, completed_at DESC)
  WHERE is_completed = TRUE;

-- Enable RLS
ALTER TABLE article_reading_progress ENABLE ROW LEVEL SECURITY;

-- Users can view/update their own progress
DROP POLICY IF EXISTS "Users can manage own reading progress" ON article_reading_progress;
CREATE POLICY "Users can manage own reading progress"
ON article_reading_progress FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages reading progress" ON article_reading_progress;
CREATE POLICY "Service role manages reading progress"
ON article_reading_progress FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Function to update reading progress and award XP
CREATE OR REPLACE FUNCTION update_reading_progress(
  p_user_id UUID,
  p_article_slug TEXT,
  p_scroll_depth INTEGER,
  p_time_spent INTEGER,
  p_article_title TEXT DEFAULT NULL,
  p_article_category TEXT DEFAULT NULL
)
RETURNS article_reading_progress
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_progress article_reading_progress;
  v_was_completed BOOLEAN;
  v_new_xp INTEGER := 0;
  v_completion_bonus INTEGER := 50;
  v_time_xp INTEGER;
  v_scroll_xp INTEGER;
BEGIN
  -- Check if record exists and get current completion status
  SELECT is_completed INTO v_was_completed
  FROM article_reading_progress
  WHERE user_id = p_user_id AND article_slug = p_article_slug;

  -- Default to false if not found
  v_was_completed := COALESCE(v_was_completed, FALSE);

  -- Get or create progress record
  INSERT INTO article_reading_progress (
    user_id, article_slug, article_title, article_category,
    scroll_depth, time_spent_seconds
  ) VALUES (
    p_user_id, p_article_slug, p_article_title, p_article_category,
    p_scroll_depth, p_time_spent
  )
  ON CONFLICT (user_id, article_slug) DO UPDATE
  SET scroll_depth = GREATEST(article_reading_progress.scroll_depth, p_scroll_depth),
      time_spent_seconds = article_reading_progress.time_spent_seconds + p_time_spent,
      visit_count = article_reading_progress.visit_count + 1,
      last_visited_at = NOW(),
      article_title = COALESCE(p_article_title, article_reading_progress.article_title),
      article_category = COALESCE(p_article_category, article_reading_progress.article_category)
  RETURNING * INTO v_progress;

  -- Calculate XP awards
  -- Time XP: 1 XP per 30 seconds, max 20 XP
  v_time_xp := LEAST(p_time_spent / 30, 20);

  -- Scroll XP: Milestone-based (25%, 50%, 75%, 100%)
  v_scroll_xp := CASE
    WHEN p_scroll_depth >= 100 AND v_progress.scroll_depth < 100 THEN 15
    WHEN p_scroll_depth >= 75 AND v_progress.scroll_depth < 75 THEN 10
    WHEN p_scroll_depth >= 50 AND v_progress.scroll_depth < 50 THEN 5
    WHEN p_scroll_depth >= 25 AND v_progress.scroll_depth < 25 THEN 2
    ELSE 0
  END;

  v_new_xp := v_time_xp + v_scroll_xp;

  -- Check for completion
  IF NOT v_was_completed AND p_scroll_depth >= v_progress.completion_threshold THEN
    UPDATE article_reading_progress
    SET is_completed = TRUE,
        completed_at = NOW(),
        xp_awarded = xp_awarded + v_completion_bonus + v_new_xp,
        xp_award_breakdown = jsonb_build_object(
          'time', v_time_xp,
          'scroll', v_scroll_xp,
          'completion', v_completion_bonus
        )
    WHERE id = v_progress.id
    RETURNING * INTO v_progress;

    -- Create completion notification
    PERFORM create_gamification_notification(
      p_user_id,
      'xp_earned',
      'Article Completed! 📚',
      'You finished reading: ' || COALESCE(p_article_title, p_article_slug),
      v_completion_bonus + v_new_xp,
      1.0,
      'bonus',
      'sparkle',
      '📚'
    );
  ELSIF v_new_xp > 0 THEN
    -- Award incremental XP
    UPDATE article_reading_progress
    SET xp_awarded = xp_awarded + v_new_xp
    WHERE id = v_progress.id
    RETURNING * INTO v_progress;
  END IF;

  RETURN v_progress;
END;
$$;

-- Function to get user's reading stats
CREATE OR REPLACE FUNCTION get_reading_stats(p_user_id UUID)
RETURNS TABLE (
  articles_started INTEGER,
  articles_completed INTEGER,
  total_time_minutes INTEGER,
  total_xp_earned INTEGER,
  completion_rate DECIMAL(5,2),
  favourite_category TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as articles_started,
    COUNT(*) FILTER (WHERE is_completed)::INTEGER as articles_completed,
    (SUM(time_spent_seconds) / 60)::INTEGER as total_time_minutes,
    SUM(xp_awarded)::INTEGER as total_xp_earned,
    ROUND(
      COUNT(*) FILTER (WHERE is_completed)::DECIMAL / NULLIF(COUNT(*), 0) * 100,
      2
    ) as completion_rate,
    MODE() WITHIN GROUP (ORDER BY article_category) as favourite_category
  FROM article_reading_progress
  WHERE user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION update_reading_progress TO authenticated;
GRANT EXECUTE ON FUNCTION get_reading_stats TO authenticated;

-- ============================================================================
-- PART 9: SEED DATA - Default Challenges
-- ============================================================================

INSERT INTO challenges (title, description, short_description, type, difficulty, requirements, xp_reward, icon, is_active, is_featured)
VALUES
  -- Daily challenges
  ('Daily Reader', 'Read any article from the Codex today', 'Read 1 article', 'daily', 'easy',
   '{"event_name": "article_read", "count": 1}', 25, '📖', TRUE, TRUE),

  ('Curious Mind', 'View 3 different legal documents', 'View 3 documents', 'daily', 'medium',
   '{"event_name": "document_view", "count": 3}', 50, '🔍', TRUE, FALSE),

  ('Engaged Learner', 'Spend 10 minutes reading on the platform', 'Read for 10 mins', 'daily', 'medium',
   '{"event_name": "time_spent", "count": 600, "unit": "seconds"}', 75, '⏱️', TRUE, FALSE),

  -- Weekly challenges
  ('Knowledge Seeker', 'Complete reading 5 Codex articles this week', 'Complete 5 articles', 'weekly', 'medium',
   '{"event_name": "article_completed", "count": 5}', 200, '🎓', TRUE, TRUE),

  ('Conversation Starter', 'Have 3 conversations with Bailey AI', 'Chat with Bailey 3x', 'weekly', 'easy',
   '{"event_name": "chat_conversation", "count": 3}', 150, '💬', TRUE, FALSE),

  ('Deep Diver', 'Reach 100% scroll depth on 3 different articles', 'Fully read 3 articles', 'weekly', 'hard',
   '{"event_name": "scroll_100", "count": 3}', 300, '🏊', TRUE, FALSE),

  -- Monthly challenges
  ('Legal Scholar', 'Complete 20 Codex articles this month', 'Complete 20 articles', 'monthly', 'hard',
   '{"event_name": "article_completed", "count": 20}', 1000, '🏆', TRUE, TRUE),

  ('Referral Champion', 'Successfully refer 3 colleagues this month', 'Refer 3 people', 'monthly', 'expert',
   '{"event_name": "referral_success", "count": 3}', 1500, '👥', TRUE, FALSE),

  -- Onboarding challenges
  ('First Steps', 'Complete your profile setup', 'Set up profile', 'onboarding', 'easy',
   '{"event_name": "profile_complete", "count": 1}', 100, '👋', TRUE, TRUE),

  ('Meet Bailey', 'Have your first conversation with Bailey AI', 'Chat with Bailey', 'onboarding', 'easy',
   '{"event_name": "first_chat", "count": 1}', 50, '🤖', TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 10: COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE user_privacy_settings IS 'User privacy preferences for leaderboards, social proof, and activity visibility. Privacy-first design allows users to control their public presence.';
COMMENT ON TABLE gamification_notifications IS 'Stores all gamification events for user display with animation triggers. Core to the addiction loop.';
COMMENT ON TABLE leaderboard_snapshots IS 'Periodically computed leaderboard rankings with rank change tracking.';
COMMENT ON TABLE challenges IS 'Challenge definitions with requirements, rewards, and targeting rules.';
COMMENT ON TABLE user_challenge_progress IS 'User progress on active challenges with completion tracking.';
COMMENT ON TABLE referrals IS 'Referral tracking with commission support for viral growth.';
COMMENT ON TABLE referral_stats IS 'Denormalised referral statistics for leaderboard performance.';
COMMENT ON TABLE streak_freeze_tokens IS 'User freeze token balance for streak protection (loss aversion mechanic).';
COMMENT ON TABLE streak_events IS 'Audit log of all streak-related events.';
COMMENT ON TABLE social_proof_aggregates IS 'Aggregated event counts for social proof display ("847 users did X today").';
COMMENT ON TABLE article_reading_progress IS 'Codex article reading progress with XP awards for engagement.';

-- Grant function permissions (with explicit parameter types to avoid ambiguity)
GRANT EXECUTE ON FUNCTION get_or_create_privacy_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_gamification_notification(UUID, TEXT, TEXT, TEXT, INTEGER, DECIMAL, TEXT, TEXT, TEXT, UUID, UUID, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(UUID) TO authenticated;
