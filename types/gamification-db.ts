/**
 * Gamification Database Types
 * TypeScript types for the gamification infrastructure tables
 */

// ============================================================================
// Privacy Settings
// ============================================================================

export interface UserPrivacySettings {
  id: string
  user_id: string

  // Leaderboard visibility
  show_on_leaderboard: boolean
  leaderboard_display_name: string | null
  show_xp_publicly: boolean
  show_level_publicly: boolean
  show_achievements_publicly: boolean

  // Activity visibility
  show_activity_status: boolean
  show_streak_publicly: boolean
  show_recent_activity: boolean

  // Social proof participation
  include_in_social_proof: boolean
  include_in_testimonials: boolean

  // Professional privacy
  hide_from_employer_search: boolean
  hide_activity_from_connections: boolean
  anonymous_mode: boolean

  // Data preferences
  allow_activity_analytics: boolean
  allow_personalisation: boolean

  // Timestamps
  created_at: string
  updated_at: string
}

export type UserPrivacySettingsInsert = Omit<UserPrivacySettings, 'id' | 'created_at' | 'updated_at'>
export type UserPrivacySettingsUpdate = Partial<Omit<UserPrivacySettings, 'id' | 'user_id' | 'created_at'>>

// ============================================================================
// Gamification Notifications
// ============================================================================

export type GamificationNotificationType =
  | 'xp_earned'
  | 'level_up'
  | 'achievement_unlocked'
  | 'streak_milestone'
  | 'streak_at_risk'
  | 'streak_broken'
  | 'streak_frozen'
  | 'challenge_complete'
  | 'challenge_progress'
  | 'leaderboard_rank_up'
  | 'leaderboard_rank_down'
  | 'near_miss'
  | 'jackpot'
  | 'referral_bonus'
  | 'daily_bonus'
  | 'welcome_bonus'

export type RewardTier = 'base' | 'bonus' | 'rare' | 'jackpot'

export type AnimationType =
  | 'confetti'
  | 'sparkle'
  | 'pulse'
  | 'shake'
  | 'glow'
  | 'fireworks'
  | 'coins'
  | 'levelup'

export interface GamificationNotification {
  id: string
  user_id: string

  type: GamificationNotificationType
  title: string
  message: string | null

  xp_amount: number
  bonus_multiplier: number
  reward_tier: RewardTier | null

  animation_type: AnimationType
  icon: string | null
  colour: string | null

  achievement_id: string | null
  challenge_id: string | null
  leaderboard_period: string | null

  // Near-miss data
  current_value: number | null
  target_value: number | null
  gap_amount: number | null

  // State
  is_read: boolean
  is_dismissed: boolean
  display_priority: number
  expires_at: string | null

  // Timestamps
  created_at: string
  read_at: string | null
  dismissed_at: string | null
}

// ============================================================================
// Leaderboards
// ============================================================================

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time'

export interface LeaderboardSnapshot {
  id: string
  period_type: LeaderboardPeriod
  period_start: string
  period_end: string

  user_id: string
  rank: number
  previous_rank: number | null
  rank_change: number | null

  xp_total: number
  xp_earned_in_period: number

  achievements_count: number
  streak_days: number
  challenges_completed: number

  display_name: string | null
  avatar_url: string | null
  level: number

  is_visible: boolean
  computed_at: string
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  display_name: string | null
  avatar_url: string | null
  level: number
  xp_total: number
  xp_earned_in_period: number
  rank_change: number | null
  rank_direction: 'up' | 'down' | 'same'
  streak_days: number
  achievements_count: number
  is_current_user: boolean
}

export interface UserRanks {
  period_type: LeaderboardPeriod
  rank: number
  total_participants: number
  percentile: number
  xp_earned: number
}

// ============================================================================
// Challenges
// ============================================================================

export type ChallengeType = 'daily' | 'weekly' | 'monthly' | 'special' | 'community' | 'onboarding'
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'expert'
export type ChallengeStatus = 'in_progress' | 'completed' | 'failed' | 'expired'

export interface ChallengeRequirements {
  event_name?: string
  event_category?: string
  count?: number
  time_limit_hours?: number
  property_match?: Record<string, unknown>
  unit?: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  short_description: string | null

  type: ChallengeType
  difficulty: ChallengeDifficulty
  requirements: ChallengeRequirements

  xp_reward: number
  bonus_reward_type: string | null
  bonus_reward_value: string | null
  achievement_id: string | null

  icon: string
  colour: string
  badge_image_url: string | null

  is_active: boolean
  is_featured: boolean
  start_date: string | null
  end_date: string | null
  max_completions: number | null
  current_completions: number

  recurrence_rule: string | null
  min_level: number
  max_level: number | null
  required_achievement_ids: string[] | null

  created_at: string
  updated_at: string
  created_by: string | null
}

export interface UserChallengeProgress {
  id: string
  user_id: string
  challenge_id: string

  progress: number
  target: number
  progress_percentage: number
  progress_details: Record<string, unknown>

  status: ChallengeStatus

  started_at: string
  completed_at: string | null
  expires_at: string | null

  xp_claimed: number
  bonus_claimed: boolean
}

export interface ChallengeWithProgress extends Challenge {
  user_progress?: UserChallengeProgress
}

// ============================================================================
// Referrals
// ============================================================================

export type ReferralStatus =
  | 'pending'
  | 'clicked'
  | 'signed_up'
  | 'converted'
  | 'rewarded'
  | 'expired'
  | 'rejected'

export interface Referral {
  id: string
  referrer_id: string
  referral_code: string

  referred_email: string | null
  referred_user_id: string | null

  status: ReferralStatus
  conversion_type: string | null
  conversion_value: number | null

  referrer_xp_reward: number
  referrer_bonus_reward: string | null
  referred_bonus: string | null

  commission_rate: number | null
  commission_amount: number | null
  commission_paid: boolean
  commission_paid_at: string | null

  click_count: number
  last_clicked_at: string | null
  utm_source: string | null
  utm_campaign: string | null
  landing_page: string | null

  created_at: string
  clicked_at: string | null
  signed_up_at: string | null
  converted_at: string | null
  expires_at: string | null
}

export interface ReferralStats {
  id: string
  user_id: string

  total_referrals: number
  successful_referrals: number
  pending_referrals: number

  total_xp_earned: number
  total_commission_earned: number
  total_commission_paid: number

  current_month_referrals: number
  best_month_referrals: number

  milestones_reached: number[]

  last_referral_at: string | null
  updated_at: string
}

// ============================================================================
// Streak System
// ============================================================================

export interface StreakFreezeTokens {
  id: string
  user_id: string

  tokens_available: number
  tokens_used: number
  tokens_earned_total: number

  last_earned_at: string | null
  last_used_at: string | null

  auto_use_enabled: boolean

  created_at: string
  updated_at: string
}

export type StreakEventType =
  | 'streak_started'
  | 'streak_continued'
  | 'streak_milestone'
  | 'streak_at_risk'
  | 'streak_frozen'
  | 'streak_broken'
  | 'streak_recovered'
  | 'freeze_token_earned'
  | 'freeze_token_used'
  | 'freeze_token_expired'

export interface StreakEvent {
  id: string
  user_id: string

  event_type: StreakEventType
  streak_day: number | null
  streak_multiplier: number | null

  freeze_token_change: number | null
  freeze_reason: string | null

  event_date: string
  created_at: string
}

// ============================================================================
// Social Proof
// ============================================================================

export type SocialProofEventType =
  | 'signup'
  | 'purchase'
  | 'document_view'
  | 'challenge_complete'
  | 'achievement_unlock'
  | 'consultation_booked'
  | 'article_read'
  | 'review_submitted'
  | 'referral_success'
  | 'milestone_reached'

export type SocialProofPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'all_time'

export interface SocialProofAggregate {
  id: string
  event_type: SocialProofEventType
  period_type: SocialProofPeriod
  period_start: string

  event_count: number
  unique_users: number

  message_template: string | null
  action_verb: string | null

  country_breakdown: Record<string, number>
  computed_at: string
}

export interface SocialProofMessage {
  event_type: SocialProofEventType
  count: number
  message: string
  time_ago: string
}

// ============================================================================
// Article Reading Progress
// ============================================================================

export interface ArticleReadingProgress {
  id: string
  user_id: string

  article_slug: string
  article_title: string | null
  article_category: string | null

  scroll_depth: number
  time_spent_seconds: number
  word_count: number | null
  estimated_read_time: number | null

  is_completed: boolean
  completion_threshold: number

  xp_awarded: number
  xp_award_breakdown: {
    scroll?: number
    time?: number
    completion?: number
  }

  sections_viewed: string[] | null
  highlights_count: number
  notes_count: number

  visit_count: number
  first_visited_at: string
  last_visited_at: string
  completed_at: string | null
}

export interface ReadingStats {
  articles_started: number
  articles_completed: number
  total_time_minutes: number
  total_xp_earned: number
  completion_rate: number
  favourite_category: string | null
}

// ============================================================================
// API Response Types
// ============================================================================

export interface GamificationDashboardData {
  notifications: GamificationNotification[]
  unread_count: number
  user_ranks: UserRanks[]
  active_challenges: ChallengeWithProgress[]
  streak: {
    current: number
    longest: number
    multiplier: number
    freeze_tokens: number
    is_at_risk: boolean
  }
  reading_stats: ReadingStats
  referral_code: string
  referral_stats: ReferralStats | null
}

export interface LeaderboardResponse {
  period_type: LeaderboardPeriod
  entries: LeaderboardEntry[]
  total_participants: number
  user_rank?: LeaderboardEntry
}
