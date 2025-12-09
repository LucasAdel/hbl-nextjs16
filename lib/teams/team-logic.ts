/**
 * Team Challenges Logic - BMAD Phase 3
 *
 * Implements team-based gamification with variable reinforcement
 * for B2B purchases and social competition
 */

import type {
  Team,
  TeamMember,
  TeamStats,
  TeamChallenge,
  TeamChallengeProgress,
  TeamLeaderboardEntry,
  TeamRewardResult,
  ChallengeType,
  ChallengeRarity,
  TEAM_DISCOUNT_TIERS,
} from "./team-types";

// In-memory storage for demo (replace with Supabase in production)
const teams = new Map<string, Team>();
const teamMembers = new Map<string, TeamMember[]>();
const teamChallenges = new Map<string, TeamChallengeProgress[]>();
const teamStats = new Map<string, TeamStats>();

/**
 * BMAD Variable Reinforcement for Team Rewards
 * Makes team achievements exciting with unpredictable bonuses
 */
export function calculateTeamReward(
  baseXp: number,
  challengeRarity: ChallengeRarity,
  memberCount: number
): TeamRewardResult {
  // Rarity multipliers
  const rarityMultipliers: Record<ChallengeRarity, number> = {
    common: 1,
    rare: 1.5,
    epic: 2,
    legendary: 3,
  };

  // Team size bonus (more members = more XP potential)
  const teamBonus = Math.min(memberCount * 0.05, 0.5); // Up to 50% bonus for large teams

  // Calculate base with multipliers
  const adjustedBase = Math.round(
    baseXp * rarityMultipliers[challengeRarity] * (1 + teamBonus)
  );

  // Variable reinforcement chances
  const roll = Math.random();
  let bonusXp = 0;
  let rarity: TeamRewardResult["rarity"] = "normal";
  let message = "Challenge completed!";
  let animation: TeamRewardResult["animation"] = "confetti";

  if (roll < 0.01) {
    // 1% chance - JACKPOT
    bonusXp = adjustedBase * 4; // 5x total
    rarity = "jackpot";
    message = "TEAM JACKPOT! Your team hit the mega bonus!";
    animation = "team_celebration";
  } else if (roll < 0.06) {
    // 5% chance - Rare
    bonusXp = adjustedBase * 2; // 3x total
    rarity = "rare";
    message = "RARE TEAM BONUS! Incredible teamwork!";
    animation = "gold_shower";
  } else if (roll < 0.21) {
    // 15% chance - Bonus
    bonusXp = adjustedBase; // 2x total
    rarity = "bonus";
    message = "Team bonus earned! Great collaboration!";
    animation = "fireworks";
  }

  return {
    baseXp: adjustedBase,
    bonusXp,
    totalXp: adjustedBase + bonusXp,
    rarity,
    message,
    animation,
  };
}

/**
 * Get team discount based on member count
 */
export function getTeamDiscount(memberCount: number): {
  discount: number;
  tier: string;
  nextTier?: { membersNeeded: number; discount: number };
} {
  const TEAM_DISCOUNT_TIERS = [
    { minMembers: 3, discount: 0.10, label: "Team of 3+" },
    { minMembers: 5, discount: 0.15, label: "Team of 5+" },
    { minMembers: 10, discount: 0.20, label: "Team of 10+" },
    { minMembers: 20, discount: 0.25, label: "Enterprise Team" },
  ];

  let currentTier = { discount: 0, label: "No team discount" };
  let nextTier: { membersNeeded: number; discount: number } | undefined;

  for (let i = 0; i < TEAM_DISCOUNT_TIERS.length; i++) {
    const tier = TEAM_DISCOUNT_TIERS[i];
    if (memberCount >= tier.minMembers) {
      currentTier = tier;
      if (i < TEAM_DISCOUNT_TIERS.length - 1) {
        const next = TEAM_DISCOUNT_TIERS[i + 1];
        nextTier = {
          membersNeeded: next.minMembers - memberCount,
          discount: next.discount,
        };
      }
    }
  }

  // If not at any tier yet, show next tier
  if (currentTier.discount === 0 && memberCount < 3) {
    nextTier = {
      membersNeeded: 3 - memberCount,
      discount: 0.10,
    };
  }

  return {
    discount: currentTier.discount,
    tier: currentTier.label,
    nextTier,
  };
}

/**
 * Pre-defined team challenges with BMAD mechanics
 */
export const TEAM_CHALLENGES: TeamChallenge[] = [
  // Weekly Challenges
  {
    id: "weekly-xp-sprint",
    name: "XP Sprint",
    description: "Your team earns 5,000 XP collectively this week",
    type: "collective_xp",
    target: 5000,
    xpReward: 1000,
    bonusXpReward: 500,
    startDate: "",
    endDate: "",
    isActive: true,
    rarity: "common",
  },
  {
    id: "weekly-purchase-power",
    name: "Purchase Power",
    description: "Team members make 5 purchases this week",
    type: "collective_purchases",
    target: 5,
    xpReward: 1500,
    bonusXpReward: 750,
    startDate: "",
    endDate: "",
    isActive: true,
    rarity: "rare",
  },
  {
    id: "weekly-all-hands",
    name: "All Hands on Deck",
    description: "Every team member logs in this week",
    type: "member_activity",
    target: 100, // 100% participation
    xpReward: 2000,
    bonusXpReward: 1000,
    startDate: "",
    endDate: "",
    isActive: true,
    rarity: "epic",
  },

  // Monthly Challenges
  {
    id: "monthly-streak-chain",
    name: "Streak Chain",
    description: "All members maintain a 7-day streak simultaneously",
    type: "streak_chain",
    target: 7,
    xpReward: 5000,
    bonusXpReward: 2500,
    startDate: "",
    endDate: "",
    isActive: true,
    rarity: "legendary",
  },
  {
    id: "monthly-compliance-bundle",
    name: "Compliance Complete",
    description: "Team purchases the full Compliance Bundle",
    type: "document_bundle",
    target: 1,
    xpReward: 3000,
    bonusXpReward: 1500,
    startDate: "",
    endDate: "",
    isActive: true,
    rarity: "epic",
  },
  {
    id: "monthly-referral-race",
    name: "Referral Race",
    description: "Team generates 10 successful referrals",
    type: "referral_race",
    target: 10,
    xpReward: 4000,
    bonusXpReward: 2000,
    startDate: "",
    endDate: "",
    isActive: true,
    rarity: "rare",
  },

  // Special Challenges
  {
    id: "special-quiz-masters",
    name: "Quiz Masters",
    description: "Team completes 20 compliance quizzes",
    type: "quiz_completion",
    target: 20,
    xpReward: 2500,
    bonusXpReward: 1250,
    startDate: "",
    endDate: "",
    isActive: true,
    rarity: "rare",
  },
  {
    id: "special-big-spenders",
    name: "Big Spenders",
    description: "Team spends $5,000 total",
    type: "spending_goal",
    target: 5000,
    xpReward: 10000,
    bonusXpReward: 5000,
    startDate: "",
    endDate: "",
    isActive: true,
    rarity: "legendary",
  },
];

/**
 * Create a new team
 */
export function createTeam(
  name: string,
  ownerId: string,
  description?: string,
  isPrivate = false
): Team {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const team: Team = {
    id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    slug,
    ownerId,
    description,
    isPrivate,
    maxMembers: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  teams.set(team.id, team);

  // Add owner as first member
  const ownerMember: TeamMember = {
    id: `member-${Date.now()}`,
    teamId: team.id,
    userId: ownerId,
    role: "owner",
    xpContributed: 0,
    challengesCompleted: 0,
    joinedAt: new Date().toISOString(),
  };

  teamMembers.set(team.id, [ownerMember]);

  // Initialize team stats
  teamStats.set(team.id, {
    teamId: team.id,
    totalXp: 0,
    totalPurchases: 0,
    totalSpent: 0,
    challengesCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    rank: 0,
    percentile: 0,
  });

  return team;
}

/**
 * Get team by ID
 */
export function getTeam(teamId: string): Team | null {
  return teams.get(teamId) || null;
}

/**
 * Get team members
 */
export function getTeamMembers(teamId: string): TeamMember[] {
  return teamMembers.get(teamId) || [];
}

/**
 * Add member to team
 */
export function addTeamMember(
  teamId: string,
  userId: string,
  role: TeamMember["role"] = "member"
): TeamMember | null {
  const team = teams.get(teamId);
  if (!team) return null;

  const members = teamMembers.get(teamId) || [];

  // Check if already a member
  if (members.some((m) => m.userId === userId)) {
    return null;
  }

  // Check max members
  if (members.length >= team.maxMembers) {
    return null;
  }

  const member: TeamMember = {
    id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    teamId,
    userId,
    role,
    xpContributed: 0,
    challengesCompleted: 0,
    joinedAt: new Date().toISOString(),
  };

  members.push(member);
  teamMembers.set(teamId, members);

  return member;
}

/**
 * Get team challenges with progress
 */
export function getTeamChallengesWithProgress(
  teamId: string
): (TeamChallenge & { progress: TeamChallengeProgress })[] {
  const progress = teamChallenges.get(teamId) || [];
  const members = teamMembers.get(teamId) || [];

  return TEAM_CHALLENGES.map((challenge) => {
    const existingProgress = progress.find((p) => p.challengeId === challenge.id);

    const challengeProgress: TeamChallengeProgress = existingProgress || {
      challengeId: challenge.id,
      teamId,
      currentProgress: 0,
      target: challenge.target,
      percentComplete: 0,
      contributors: [],
      bonusEarned: false,
    };

    return {
      ...challenge,
      progress: challengeProgress,
    };
  });
}

/**
 * Update challenge progress
 */
export function updateChallengeProgress(
  teamId: string,
  challengeId: string,
  userId: string,
  contribution: number
): TeamChallengeProgress | null {
  const challenge = TEAM_CHALLENGES.find((c) => c.id === challengeId);
  if (!challenge) return null;

  const allProgress = teamChallenges.get(teamId) || [];
  let progress = allProgress.find((p) => p.challengeId === challengeId);

  if (!progress) {
    progress = {
      challengeId,
      teamId,
      currentProgress: 0,
      target: challenge.target,
      percentComplete: 0,
      contributors: [],
      bonusEarned: false,
    };
    allProgress.push(progress);
  }

  // Add contribution
  progress.currentProgress += contribution;
  progress.percentComplete = Math.min(
    (progress.currentProgress / progress.target) * 100,
    100
  );

  // Update contributor
  const existingContributor = progress.contributors.find(
    (c) => c.userId === userId
  );
  if (existingContributor) {
    existingContributor.contribution += contribution;
  } else {
    progress.contributors.push({
      userId,
      userName: `User ${userId.substring(0, 8)}`, // Replace with actual name lookup
      contribution,
      percentage: 0,
    });
  }

  // Recalculate percentages
  const totalContributions = progress.contributors.reduce(
    (sum, c) => sum + c.contribution,
    0
  );
  progress.contributors.forEach((c) => {
    c.percentage = (c.contribution / totalContributions) * 100;
  });

  // Check completion
  if (progress.currentProgress >= progress.target && !progress.completedAt) {
    progress.completedAt = new Date().toISOString();
  }

  teamChallenges.set(teamId, allProgress);

  return progress;
}

/**
 * Get team leaderboard
 */
export function getTeamLeaderboard(
  limit = 10,
  currentTeamId?: string
): TeamLeaderboardEntry[] {
  const allTeams = Array.from(teams.values());
  const allStats = Array.from(teamStats.entries());

  const leaderboard: TeamLeaderboardEntry[] = allTeams
    .map((team) => {
      const stats = teamStats.get(team.id);
      const members = teamMembers.get(team.id) || [];

      return {
        rank: 0,
        teamId: team.id,
        teamName: team.name,
        teamSlug: team.slug,
        avatarUrl: team.avatarUrl,
        totalXp: stats?.totalXp || 0,
        memberCount: members.length,
        challengesCompleted: stats?.challengesCompleted || 0,
        weeklyXp: 0, // Calculate from recent transactions
        isCurrentTeam: team.id === currentTeamId,
      };
    })
    .sort((a, b) => b.totalXp - a.totalXp)
    .slice(0, limit)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return leaderboard;
}

/**
 * Get team stats
 */
export function getTeamStats(teamId: string): TeamStats | null {
  return teamStats.get(teamId) || null;
}

/**
 * Add XP to team
 */
export function addTeamXp(
  teamId: string,
  userId: string,
  xp: number,
  source: string
): void {
  const stats = teamStats.get(teamId);
  if (!stats) return;

  stats.totalXp += xp;
  teamStats.set(teamId, stats);

  // Update member contribution
  const members = teamMembers.get(teamId) || [];
  const member = members.find((m) => m.userId === userId);
  if (member) {
    member.xpContributed += xp;
    teamMembers.set(teamId, members);
  }
}

/**
 * Generate near-miss messaging for team challenges
 * BMAD: Creates urgency and FOMO
 */
export function getTeamNearMissMessage(
  progress: TeamChallengeProgress,
  challenge: TeamChallenge
): string | null {
  const remaining = challenge.target - progress.currentProgress;
  const percentComplete = progress.percentComplete;

  if (percentComplete >= 100) return null;

  if (percentComplete >= 90) {
    return `Almost there! Just ${remaining} more to complete "${challenge.name}" and earn ${challenge.xpReward} XP for your team!`;
  }

  if (percentComplete >= 75) {
    return `Your team is 75% of the way to "${challenge.name}"! Keep pushing for that ${challenge.xpReward} XP reward!`;
  }

  if (percentComplete >= 50) {
    return `Halfway there! "${challenge.name}" is within reach. Rally your team!`;
  }

  return null;
}

/**
 * Get team activity feed (for social proof)
 */
export function getTeamActivityFeed(
  teamId: string,
  limit = 10
): {
  id: string;
  type: string;
  message: string;
  userId: string;
  timestamp: string;
  xpEarned?: number;
}[] {
  // In production, this would query activity logs
  // For demo, return sample activities
  return [
    {
      id: "1",
      type: "xp_earned",
      message: "earned 150 XP from ROI Calculator",
      userId: "user-1",
      timestamp: new Date().toISOString(),
      xpEarned: 150,
    },
    {
      id: "2",
      type: "challenge_progress",
      message: "contributed to 'XP Sprint' challenge",
      userId: "user-2",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "3",
      type: "purchase",
      message: "purchased Employment Contract Bundle",
      userId: "user-1",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      xpEarned: 500,
    },
  ];
}
