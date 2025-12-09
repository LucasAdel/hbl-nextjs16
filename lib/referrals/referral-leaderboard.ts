/**
 * Referral Leaderboard - BMAD Phase 3
 *
 * Public leaderboard for referrals with:
 * - Monthly competitions
 * - Variable XP rewards
 * - Team referral challenges
 */

export interface Referral {
  id: string;
  referrerId: string;
  referrerEmail: string;
  referredEmail: string;
  status: ReferralStatus;
  xpAwarded: number;
  commissionEarned: number;
  createdAt: string;
  convertedAt?: string;
}

export type ReferralStatus =
  | "pending"
  | "signed_up"
  | "first_purchase"
  | "qualified"
  | "expired";

export interface ReferralLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  referralCount: number;
  totalEarnings: number;
  totalXp: number;
  monthlyReferrals: number;
  isCurrentUser: boolean;
  badges: ReferralBadge[];
}

export interface ReferralBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  totalEarnings: number;
  totalXpEarned: number;
  rank: number;
  percentile: number;
  nextMilestone: {
    referralsNeeded: number;
    reward: string;
    xpBonus: number;
  };
}

export interface MonthlyChallenge {
  id: string;
  month: string;
  year: number;
  targetReferrals: number;
  prizePool: number;
  topPrizes: Prize[];
  participantCount: number;
  isActive: boolean;
}

export interface Prize {
  rank: number;
  prize: string;
  value: number;
  xpBonus: number;
}

// In-memory storage
const referrals = new Map<string, Referral[]>();
const leaderboard: ReferralLeaderboardEntry[] = [];

// Referral milestones for BMAD variable reinforcement
export const REFERRAL_MILESTONES = [
  { count: 1, xpBonus: 500, badge: "First Referral", description: "Made your first referral!" },
  { count: 5, xpBonus: 1000, badge: "Connector", description: "Referred 5 practitioners" },
  { count: 10, xpBonus: 2500, badge: "Influencer", description: "Referred 10 practitioners" },
  { count: 25, xpBonus: 5000, badge: "Ambassador", description: "Referred 25 practitioners" },
  { count: 50, xpBonus: 10000, badge: "Champion", description: "Referred 50 practitioners" },
  { count: 100, xpBonus: 25000, badge: "Legend", description: "Referred 100 practitioners" },
] as const;

// Commission rates
export const REFERRAL_COMMISSION = {
  signupBonus: 50, // $50 credit for signup
  purchaseCommission: 0.10, // 10% of referred purchase
  maxCommissionPerReferral: 200, // Cap at $200 per referral
  xpPerReferral: 500, // Base XP per successful referral
} as const;

/**
 * Calculate referral reward with variable reinforcement
 */
export function calculateReferralReward(
  purchaseAmount: number,
  referrerTotalReferrals: number
): {
  xpEarned: number;
  commission: number;
  bonusXp: number;
  milestone?: typeof REFERRAL_MILESTONES[number];
  rarity: "normal" | "bonus" | "rare" | "jackpot";
} {
  // Base commission
  const commission = Math.min(
    purchaseAmount * REFERRAL_COMMISSION.purchaseCommission,
    REFERRAL_COMMISSION.maxCommissionPerReferral
  );

  // Base XP
  let xpEarned = REFERRAL_COMMISSION.xpPerReferral;

  // Check for milestone
  const milestone = REFERRAL_MILESTONES.find(
    (m) => m.count === referrerTotalReferrals + 1
  );

  let bonusXp = milestone?.xpBonus || 0;

  // Variable reinforcement roll
  const roll = Math.random();
  let rarity: "normal" | "bonus" | "rare" | "jackpot" = "normal";

  if (roll < 0.01) {
    // 1% jackpot
    bonusXp += 2500;
    rarity = "jackpot";
  } else if (roll < 0.05) {
    // 4% rare
    bonusXp += 1000;
    rarity = "rare";
  } else if (roll < 0.15) {
    // 10% bonus
    bonusXp += 250;
    rarity = "bonus";
  }

  return {
    xpEarned: xpEarned + bonusXp,
    commission,
    bonusXp,
    milestone,
    rarity,
  };
}

/**
 * Create a referral
 */
export function createReferral(
  referrerId: string,
  referrerEmail: string,
  referredEmail: string
): Referral {
  const referral: Referral = {
    id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    referrerId,
    referrerEmail,
    referredEmail,
    status: "pending",
    xpAwarded: 0,
    commissionEarned: 0,
    createdAt: new Date().toISOString(),
  };

  const userReferrals = referrals.get(referrerId) || [];
  userReferrals.push(referral);
  referrals.set(referrerId, userReferrals);

  return referral;
}

/**
 * Convert a referral (when referred user makes first purchase)
 */
export function convertReferral(
  referralId: string,
  purchaseAmount: number
): { referral: Referral; reward: ReturnType<typeof calculateReferralReward> } | null {
  // Find referral
  let foundReferral: Referral | null = null;
  let referrerId: string | null = null;

  referrals.forEach((userRefs, id) => {
    const ref = userRefs.find((r) => r.id === referralId);
    if (ref) {
      foundReferral = ref;
      referrerId = id;
    }
  });

  if (!foundReferral || !referrerId) return null;

  // Get referrer's total referrals
  const userReferrals = referrals.get(referrerId) || [];
  const convertedCount = userReferrals.filter(
    (r) => r.status === "qualified"
  ).length;

  // Calculate reward
  const reward = calculateReferralReward(purchaseAmount, convertedCount);

  // Update referral (cast to Referral since we've verified it's not null)
  const referralToUpdate = foundReferral as Referral;
  referralToUpdate.status = "qualified";
  referralToUpdate.xpAwarded = reward.xpEarned;
  referralToUpdate.commissionEarned = reward.commission;
  referralToUpdate.convertedAt = new Date().toISOString();

  return { referral: referralToUpdate, reward };
}

/**
 * Get referral stats for a user
 */
export function getReferralStats(userId: string): ReferralStats {
  const userReferrals = referrals.get(userId) || [];

  const totalReferrals = userReferrals.length;
  const pendingReferrals = userReferrals.filter(
    (r) => r.status === "pending" || r.status === "signed_up"
  ).length;
  const convertedReferrals = userReferrals.filter(
    (r) => r.status === "qualified"
  ).length;
  const totalEarnings = userReferrals.reduce(
    (sum, r) => sum + r.commissionEarned,
    0
  );
  const totalXpEarned = userReferrals.reduce((sum, r) => sum + r.xpAwarded, 0);

  // Calculate rank (demo)
  const rank = Math.floor(Math.random() * 50) + 1;
  const percentile = Math.max(0, 100 - rank);

  // Find next milestone
  const nextMilestone = REFERRAL_MILESTONES.find(
    (m) => m.count > convertedReferrals
  ) || REFERRAL_MILESTONES[REFERRAL_MILESTONES.length - 1];

  return {
    totalReferrals,
    pendingReferrals,
    convertedReferrals,
    totalEarnings,
    totalXpEarned,
    rank,
    percentile,
    nextMilestone: {
      referralsNeeded: nextMilestone.count - convertedReferrals,
      reward: nextMilestone.badge,
      xpBonus: nextMilestone.xpBonus,
    },
  };
}

/**
 * Get referral leaderboard
 */
export function getReferralLeaderboard(
  limit = 20,
  currentUserId?: string
): ReferralLeaderboardEntry[] {
  // Generate demo leaderboard
  const demoLeaderboard: ReferralLeaderboardEntry[] = Array.from(
    { length: limit },
    (_, i) => ({
      rank: i + 1,
      userId: `user-${i}`,
      displayName: `Practitioner ${i + 1}`,
      referralCount: Math.floor(50 - i * 2 + Math.random() * 5),
      totalEarnings: Math.floor((50 - i) * 150 + Math.random() * 500),
      totalXp: Math.floor((50 - i) * 1000 + Math.random() * 2000),
      monthlyReferrals: Math.floor((10 - i * 0.3) + Math.random() * 3),
      isCurrentUser: currentUserId === `user-${i}`,
      badges:
        i < 3
          ? [
              {
                id: "top-referrer",
                name: i === 0 ? "Top Referrer" : i === 1 ? "Runner Up" : "Third Place",
                description: `Ranked #${i + 1} in referrals`,
                icon: i === 0 ? "trophy" : i === 1 ? "medal-silver" : "medal-bronze",
                earnedAt: new Date().toISOString(),
              },
            ]
          : [],
    })
  );

  return demoLeaderboard;
}

/**
 * Get current monthly challenge
 */
export function getCurrentMonthlyChallenge(): MonthlyChallenge {
  const now = new Date();
  return {
    id: `challenge-${now.getFullYear()}-${now.getMonth() + 1}`,
    month: now.toLocaleString("default", { month: "long" }),
    year: now.getFullYear(),
    targetReferrals: 100,
    prizePool: 5000,
    topPrizes: [
      { rank: 1, prize: "$1,000 Store Credit", value: 1000, xpBonus: 10000 },
      { rank: 2, prize: "$500 Store Credit", value: 500, xpBonus: 5000 },
      { rank: 3, prize: "$250 Store Credit", value: 250, xpBonus: 2500 },
      { rank: 4, prize: "Compliance Bundle", value: 149, xpBonus: 1500 },
      { rank: 5, prize: "Template of Choice", value: 99, xpBonus: 1000 },
    ],
    participantCount: 234,
    isActive: true,
  };
}

/**
 * Generate referral link
 */
export function generateReferralLink(userId: string): string {
  const code = Buffer.from(userId).toString("base64").substring(0, 8);
  return `https://hamiltonbaileylaw.com.au/ref/${code}`;
}
