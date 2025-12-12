-- ============================================================================
-- GAMIFICATION HELPER FUNCTIONS
-- Additional functions needed by edge functions
-- ============================================================================

-- Function to get leaderboard data with privacy filtering
CREATE OR REPLACE FUNCTION get_leaderboard_data(
  p_period_start TIMESTAMPTZ,
  p_period_end TIMESTAMPTZ
)
RETURNS TABLE (
  user_id UUID,
  total_xp INTEGER,
  period_xp INTEGER,
  display_name TEXT,
  avatar_url TEXT,
  level INTEGER,
  streak_days INTEGER,
  achievements_count INTEGER,
  show_on_leaderboard BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.user_id,
    up.xp_total::INTEGER as total_xp,
    COALESCE(
      (SELECT SUM(xt.amount)::INTEGER
       FROM xp_transactions xt
       WHERE xt.user_id = up.user_id
         AND xt.created_at >= p_period_start
         AND xt.created_at < p_period_end),
      0
    ) as period_xp,
    COALESCE(
      ps.leaderboard_display_name,
      COALESCE(up.display_name, 'Anonymous User')
    ) as display_name,
    up.avatar_url,
    up.level,
    up.current_streak as streak_days,
    (SELECT COUNT(*)::INTEGER FROM user_achievements ua WHERE ua.user_id = up.user_id) as achievements_count,
    COALESCE(ps.show_on_leaderboard, TRUE) as show_on_leaderboard
  FROM user_profiles up
  LEFT JOIN user_privacy_settings ps ON ps.user_id = up.user_id
  WHERE up.xp_total > 0
    AND (ps.anonymous_mode IS NULL OR ps.anonymous_mode = FALSE)
  ORDER BY period_xp DESC, total_xp DESC;
END;
$$;

-- Function to award XP with notification
CREATE OR REPLACE FUNCTION award_xp_with_notification(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_total INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_reward_tier TEXT;
  v_bonus_multiplier DECIMAL;
  v_animation TEXT;
  v_roll DECIMAL;
BEGIN
  -- Get current level
  SELECT level INTO v_old_level FROM user_profiles WHERE user_id = p_user_id;

  -- Variable reinforcement schedule
  v_roll := RANDOM();
  IF v_roll < 0.01 THEN
    -- 1% jackpot
    v_reward_tier := 'jackpot';
    v_bonus_multiplier := 5.0;
    v_animation := 'fireworks';
  ELSIF v_roll < 0.05 THEN
    -- 4% rare
    v_reward_tier := 'rare';
    v_bonus_multiplier := 2.5;
    v_animation := 'confetti';
  ELSIF v_roll < 0.20 THEN
    -- 15% bonus
    v_reward_tier := 'bonus';
    v_bonus_multiplier := 1.5;
    v_animation := 'sparkle';
  ELSE
    -- 80% base
    v_reward_tier := 'base';
    v_bonus_multiplier := 1.0;
    v_animation := 'pulse';
  END IF;

  -- Calculate final amount
  p_amount := ROUND(p_amount * v_bonus_multiplier)::INTEGER;

  -- Insert XP transaction
  INSERT INTO xp_transactions (user_id, amount, source, description, multiplier)
  VALUES (p_user_id, p_amount, p_source, p_description, v_bonus_multiplier);

  -- Update user profile
  UPDATE user_profiles
  SET xp_total = xp_total + p_amount,
      level = CASE
        WHEN xp_total + p_amount >= 55000 THEN 10
        WHEN xp_total + p_amount >= 35000 THEN 9
        WHEN xp_total + p_amount >= 20000 THEN 8
        WHEN xp_total + p_amount >= 10000 THEN 7
        WHEN xp_total + p_amount >= 5000 THEN 6
        WHEN xp_total + p_amount >= 2000 THEN 5
        WHEN xp_total + p_amount >= 1000 THEN 4
        WHEN xp_total + p_amount >= 500 THEN 3
        WHEN xp_total + p_amount >= 250 THEN 2
        ELSE 1
      END,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING xp_total, level INTO v_new_total, v_new_level;

  -- Create XP notification
  PERFORM create_gamification_notification(
    p_user_id,
    CASE WHEN v_reward_tier = 'jackpot' THEN 'jackpot' ELSE 'xp_earned' END,
    CASE v_reward_tier
      WHEN 'jackpot' THEN '🎰 JACKPOT! +' || p_amount || ' XP!'
      WHEN 'rare' THEN '✨ Rare Bonus! +' || p_amount || ' XP'
      WHEN 'bonus' THEN '🎁 Bonus! +' || p_amount || ' XP'
      ELSE '+' || p_amount || ' XP'
    END,
    COALESCE(p_description, 'For ' || p_source),
    p_amount,
    v_bonus_multiplier,
    v_reward_tier,
    v_animation,
    CASE v_reward_tier
      WHEN 'jackpot' THEN '🎰'
      WHEN 'rare' THEN '✨'
      WHEN 'bonus' THEN '🎁'
      ELSE '⭐'
    END
  );

  -- Check for level up
  IF v_new_level > v_old_level THEN
    PERFORM create_gamification_notification(
      p_user_id,
      'level_up',
      '🎉 Level Up! Level ' || v_new_level,
      'Congratulations on reaching level ' || v_new_level || '!',
      0,
      1.0,
      'rare',
      'levelup',
      '🎉'
    );

    -- Award freeze token at certain levels
    IF v_new_level IN (5, 7, 10) THEN
      PERFORM award_streak_freeze_token(p_user_id, 'Level ' || v_new_level || ' reward');
    END IF;
  END IF;

  RETURN v_new_total;
END;
$$;

-- Function to check and update streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile user_profiles;
  v_today DATE := CURRENT_DATE;
  v_last_active DATE;
  v_new_streak INTEGER;
  v_multiplier DECIMAL;
BEGIN
  SELECT * INTO v_profile FROM user_profiles WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  v_last_active := v_profile.last_active_date;

  IF v_last_active = v_today THEN
    -- Already active today, no change
    RETURN v_profile.current_streak;
  ELSIF v_last_active = v_today - 1 THEN
    -- Active yesterday, increment streak
    v_new_streak := v_profile.current_streak + 1;
  ELSIF v_last_active IS NULL OR v_last_active < v_today - 1 THEN
    -- Streak broken or first activity
    v_new_streak := 1;
  ELSE
    v_new_streak := v_profile.current_streak;
  END IF;

  -- Calculate multiplier
  v_multiplier := CASE
    WHEN v_new_streak >= 90 THEN 3.0
    WHEN v_new_streak >= 60 THEN 2.5
    WHEN v_new_streak >= 30 THEN 2.0
    WHEN v_new_streak >= 14 THEN 1.5
    WHEN v_new_streak >= 7 THEN 1.25
    WHEN v_new_streak >= 3 THEN 1.1
    ELSE 1.0
  END;

  -- Update profile
  UPDATE user_profiles
  SET current_streak = v_new_streak,
      longest_streak = GREATEST(longest_streak, v_new_streak),
      last_active_date = v_today,
      streak_multiplier = v_multiplier,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log streak event
  INSERT INTO streak_events (user_id, event_type, streak_day, streak_multiplier)
  VALUES (p_user_id, 'streak_continued', v_new_streak, v_multiplier);

  RETURN v_new_streak;
END;
$$;

-- Function to handle referral conversion
CREATE OR REPLACE FUNCTION process_referral_conversion(
  p_referral_code TEXT,
  p_referred_user_id UUID,
  p_conversion_type TEXT DEFAULT 'signup',
  p_conversion_value DECIMAL DEFAULT 0
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral referrals;
  v_referrer_xp INTEGER := 500; -- Base referral XP
  v_referred_xp INTEGER := 100; -- Welcome bonus for referred user
BEGIN
  -- Find the referral
  SELECT * INTO v_referral
  FROM referrals
  WHERE referral_code = p_referral_code
    AND status IN ('pending', 'clicked', 'signed_up')
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Update referral record
  UPDATE referrals
  SET referred_user_id = p_referred_user_id,
      status = 'converted',
      conversion_type = p_conversion_type,
      conversion_value = p_conversion_value,
      converted_at = NOW(),
      referrer_xp_reward = v_referrer_xp
  WHERE id = v_referral.id;

  -- Award XP to referrer
  PERFORM award_xp_with_notification(
    v_referral.referrer_id,
    v_referrer_xp,
    'referral',
    'Referral bonus for inviting a new user'
  );

  -- Award welcome XP to referred user
  PERFORM award_xp_with_notification(
    p_referred_user_id,
    v_referred_xp,
    'welcome_bonus',
    'Welcome bonus for joining via referral'
  );

  -- Update referrer stats
  INSERT INTO referral_stats (user_id, total_referrals, successful_referrals, total_xp_earned, last_referral_at)
  VALUES (v_referral.referrer_id, 1, 1, v_referrer_xp, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET total_referrals = referral_stats.total_referrals + 1,
      successful_referrals = referral_stats.successful_referrals + 1,
      total_xp_earned = referral_stats.total_xp_earned + v_referrer_xp,
      current_month_referrals = referral_stats.current_month_referrals + 1,
      best_month_referrals = GREATEST(referral_stats.best_month_referrals, referral_stats.current_month_referrals + 1),
      last_referral_at = NOW(),
      updated_at = NOW();

  -- Create notification for referrer
  PERFORM create_gamification_notification(
    v_referral.referrer_id,
    'referral_bonus',
    '👥 Referral Success!',
    'Your referral just converted! You earned ' || v_referrer_xp || ' XP.',
    v_referrer_xp,
    1.0,
    'bonus',
    'confetti',
    '👥'
  );

  RETURN TRUE;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_leaderboard_data TO service_role;
GRANT EXECUTE ON FUNCTION award_xp_with_notification TO service_role;
GRANT EXECUTE ON FUNCTION update_user_streak TO service_role;
GRANT EXECUTE ON FUNCTION process_referral_conversion TO service_role;

-- Trigger to auto-create privacy settings on new user
CREATE OR REPLACE FUNCTION create_default_privacy_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_privacy_settings (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO streak_freeze_tokens (user_id, tokens_available, tokens_earned_total)
  VALUES (NEW.user_id, 1, 1) -- Start with 1 free freeze token
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create trigger on user_profiles
DROP TRIGGER IF EXISTS create_privacy_settings_trigger ON user_profiles;
CREATE TRIGGER create_privacy_settings_trigger
AFTER INSERT ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION create_default_privacy_settings();
