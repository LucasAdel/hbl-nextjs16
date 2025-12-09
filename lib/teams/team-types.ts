/**
 * Team Challenges Types - BMAD Phase 3
 *
 * Team-based gamification for B2B group purchases and social competition
 */

export interface Team {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  description?: string;
  avatarUrl?: string;
  isPrivate: boolean;
  maxMembers: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  xpContributed: number;
  challengesCompleted: number;
  joinedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export type TeamRole = "owner" | "admin" | "member";

export interface TeamStats {
  teamId: string;
  totalXp: number;
  totalPurchases: number;
  totalSpent: number;
  challengesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
  percentile: number;
}

export interface TeamChallenge {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  target: number;
  xpReward: number;
  bonusXpReward: number; // Variable reinforcement bonus
  startDate: string;
  endDate: string;
  isActive: boolean;
  rarity: ChallengeRarity;
  requirements?: ChallengeRequirement[];
}

export type ChallengeType =
  | "collective_xp"      // Team earns X total XP
  | "collective_purchases" // Team makes X purchases
  | "member_activity"    // X members active in period
  | "streak_chain"       // All members maintain streak
  | "document_bundle"    // Team purchases specific bundle
  | "referral_race"      // Team generates X referrals
  | "quiz_completion"    // Team completes X quizzes
  | "spending_goal";     // Team spends $X total

export type ChallengeRarity = "common" | "rare" | "epic" | "legendary";

export interface ChallengeRequirement {
  type: string;
  value: number;
  description: string;
}

export interface TeamChallengeProgress {
  challengeId: string;
  teamId: string;
  currentProgress: number;
  target: number;
  percentComplete: number;
  contributors: ChallengeContributor[];
  completedAt?: string;
  bonusEarned: boolean;
}

export interface ChallengeContributor {
  userId: string;
  userName: string;
  contribution: number;
  percentage: number;
}

export interface TeamInvite {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  expiresAt: string;
  status: "pending" | "accepted" | "declined" | "expired";
  createdAt: string;
}

export interface TeamLeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  teamSlug: string;
  avatarUrl?: string;
  totalXp: number;
  memberCount: number;
  challengesCompleted: number;
  weeklyXp: number;
  isCurrentTeam: boolean;
}

// BMAD Variable Reinforcement for Team Challenges
export interface TeamRewardResult {
  baseXp: number;
  bonusXp: number;
  totalXp: number;
  rarity: "normal" | "bonus" | "rare" | "jackpot";
  message: string;
  animation: "confetti" | "fireworks" | "gold_shower" | "team_celebration";
}

// Team discount tiers (B2B incentive)
export const TEAM_DISCOUNT_TIERS = [
  { minMembers: 3, discount: 0.10, label: "Team of 3+" },
  { minMembers: 5, discount: 0.15, label: "Team of 5+" },
  { minMembers: 10, discount: 0.20, label: "Team of 10+" },
  { minMembers: 20, discount: 0.25, label: "Enterprise Team" },
] as const;

export type TeamDiscountTier = typeof TEAM_DISCOUNT_TIERS[number];
