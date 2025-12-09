/**
 * Gamification System Type Definitions
 * Based on CORE PHILOSOPHY: WEAPONIZE ADDICTION FOR PRODUCTIVITY
 */

// ============================================
// Core Gamification Types
// ============================================

export interface UserProgress {
  userId: string;
  xp: number;
  level: number;
  levelProgress: number; // 0-100 percentage to next level
  streak: {
    current: number;
    longest: number;
    lastActivityDate: string;
    freezeTokens: number;
  };
  stats: UserStats;
}

export interface UserStats {
  totalXpEarned: number;
  documentsViewed: number;
  documentsPurchased: number;
  quizzesCompleted: number;
  toolsUsed: number;
  articlesRead: number;
  loginDays: number;
  referrals: number;
}

// ============================================
// XP & Rewards System
// ============================================

/**
 * Variable Reinforcement Schedule:
 * 100% chance: Base reward (+10 XP)
 *  20% chance: Bonus reward! (+20 XP)
 *   5% chance: Rare achievement! (+50 XP)
 *   1% chance: JACKPOT celebration! (+200 XP)
 */
export interface XPReward {
  baseXP: number;
  bonusXP?: number;
  bonusChance?: number;
  rareXP?: number;
  rareChance?: number;
  jackpotXP?: number;
  jackpotChance?: number;
  multiplier?: number;
}

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  type: XPTransactionType;
  source: string;
  description: string;
  isBonus: boolean;
  bonusType?: "standard" | "rare" | "jackpot";
  timestamp: Date;
}

export type XPTransactionType =
  | "earn"
  | "spend"
  | "bonus"
  | "streak"
  | "achievement"
  | "challenge"
  | "referral"
  | "admin_adjust";

// ============================================
// Level System
// ============================================

export interface Level {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  perks: LevelPerk[];
  badge?: Badge;
}

export interface LevelPerk {
  id: string;
  name: string;
  description: string;
  type: "discount" | "feature" | "badge" | "reward";
  value?: number | string;
}

export const LEVEL_THRESHOLDS: Level[] = [
  { level: 1, name: "Newcomer", minXP: 0, maxXP: 100, perks: [] },
  { level: 2, name: "Explorer", minXP: 100, maxXP: 300, perks: [] },
  { level: 3, name: "Regular", minXP: 300, maxXP: 600, perks: [] },
  { level: 4, name: "Committed", minXP: 600, maxXP: 1000, perks: [] },
  { level: 5, name: "Dedicated", minXP: 1000, maxXP: 1500, perks: [] },
  { level: 6, name: "Expert", minXP: 1500, maxXP: 2200, perks: [] },
  { level: 7, name: "Master", minXP: 2200, maxXP: 3000, perks: [] },
  { level: 8, name: "Champion", minXP: 3000, maxXP: 4000, perks: [] },
  { level: 9, name: "Legend", minXP: 4000, maxXP: 5500, perks: [] },
  { level: 10, name: "Elite", minXP: 5500, maxXP: Infinity, perks: [] },
];

// ============================================
// Streak System
// ============================================

export interface StreakConfig {
  minDaysForStreak: number;
  freezeTokensPerWeek: number;
  maxFreezeTokens: number;
  streakBonusMultipliers: StreakBonusMultiplier[];
}

export interface StreakBonusMultiplier {
  minDays: number;
  multiplier: number;
  bonusXP: number;
}

export const STREAK_BONUSES: StreakBonusMultiplier[] = [
  { minDays: 3, multiplier: 1.1, bonusXP: 10 },
  { minDays: 7, multiplier: 1.25, bonusXP: 25 },
  { minDays: 14, multiplier: 1.5, bonusXP: 50 },
  { minDays: 30, multiplier: 2.0, bonusXP: 100 },
  { minDays: 60, multiplier: 2.5, bonusXP: 200 },
  { minDays: 90, multiplier: 3.0, bonusXP: 500 },
];

// ============================================
// Achievements & Badges
// ============================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  xpReward: number;
  icon: string;
  rarity: AchievementRarity;
  requirements: AchievementRequirement[];
  secret?: boolean;
}

export type AchievementCategory =
  | "onboarding"
  | "engagement"
  | "learning"
  | "purchase"
  | "streak"
  | "social"
  | "milestone";

export type AchievementRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface AchievementRequirement {
  type: "count" | "streak" | "total" | "first";
  metric: string;
  target: number;
}

export interface UserAchievement {
  achievementId: string;
  userId: string;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: Date;
  claimed: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: AchievementRarity;
}

// ============================================
// Challenges & Competitions
// ============================================

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  startDate: Date;
  endDate: Date;
  xpReward: number;
  requirements: ChallengeRequirement[];
  participants?: number;
  leaderboard?: LeaderboardEntry[];
}

export type ChallengeType = "daily" | "weekly" | "monthly" | "special" | "community";

export interface ChallengeRequirement {
  action: string;
  count: number;
  description: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  rank: number;
  change?: number; // Position change from last period
}

// ============================================
// Notifications & Triggers
// ============================================

export interface GamificationNotification {
  id: string;
  userId: string;
  type: GamificationNotificationType;
  title: string;
  message: string;
  xpAmount?: number;
  achievementId?: string;
  badgeId?: string;
  animation?: NotificationAnimation;
  timestamp: Date;
  dismissed: boolean;
}

export type GamificationNotificationType =
  | "xp_earned"
  | "level_up"
  | "achievement_unlocked"
  | "badge_earned"
  | "streak_milestone"
  | "streak_at_risk"
  | "challenge_complete"
  | "leaderboard_change"
  | "jackpot";

export type NotificationAnimation =
  | "confetti"
  | "sparkle"
  | "pulse"
  | "shake"
  | "glow"
  | "fireworks";

// ============================================
// Near-Miss Psychology
// ============================================

export interface NearMissNotification {
  type: "leaderboard" | "achievement" | "level" | "streak";
  message: string;
  currentValue: number;
  targetValue: number;
  urgency: "low" | "medium" | "high";
}

// ============================================
// Social Proof
// ============================================

export interface SocialProofEvent {
  id: string;
  type: SocialProofType;
  message: string;
  timestamp: Date;
  location?: string;
}

export type SocialProofType =
  | "purchase"
  | "signup"
  | "achievement"
  | "review"
  | "milestone";

// ============================================
// Analytics & Metrics
// ============================================

export interface GamificationMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageStreakLength: number;
  streakRetentionRate: number; // % maintaining 7+ day streaks
  averageTasksPerUser: number;
  challengeParticipationRate: number;
  leaderboardEngagementRate: number;
  xpDistribution: XPDistributionBucket[];
}

export interface XPDistributionBucket {
  range: string;
  count: number;
  percentage: number;
}
