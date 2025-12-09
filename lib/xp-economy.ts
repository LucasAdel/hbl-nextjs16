/**
 * XP Economy Core Library
 *
 * This library manages the XP (experience points) economy for the BMAD gamification system.
 * It handles XP earning, spending, redemption for discounts, and tier calculations.
 *
 * Key principles:
 * - Variable reinforcement: Random bonus chances to create slot-machine psychology
 * - Loss aversion: XP expires after inactivity to drive engagement
 * - Near-miss messaging: Show how close users are to rewards
 */

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

export const XP_CONFIG = {
  // Conversion rate: XP to dollars
  XP_TO_DOLLAR_RATE: 100, // 100 XP = $1

  // Redemption limits
  MIN_REDEMPTION_XP: 500, // Minimum 500 XP = $5 off
  MAX_DISCOUNT_PERCENTAGE: 25, // Maximum 25% off per order

  // Discount tiers for display/targeting
  DISCOUNT_TIERS: [
    { xp: 500, discount: 5, label: "$5 off" },
    { xp: 1000, discount: 10, label: "$10 off" },
    { xp: 1500, discount: 15, label: "$15 off" },
    { xp: 2000, discount: 20, label: "$20 off" },
    { xp: 2500, discount: 25, label: "$25 off" },
    { xp: 5000, discount: 50, label: "$50 off" },
  ],

  // XP expiration (inactive days before XP starts expiring)
  XP_EXPIRATION_DAYS: 365,

  // Variable reinforcement percentages for purchases
  PURCHASE_REWARDS: {
    BASE_RATE: 0.10, // 10% of purchase amount as XP (1 XP per $0.10)
    BONUS_CHANCES: [
      { chance: 0.20, multiplier: 2, label: "Bonus!" },
      { chance: 0.05, multiplier: 3, label: "Super Bonus!" },
      { chance: 0.01, multiplier: 5, label: "JACKPOT!" },
    ],
  },

  // Action-based XP rewards
  ACTION_REWARDS: {
    // Account & Profile
    account_create: { base: 100, label: "Welcome Bonus" },
    profile_complete: { base: 50, label: "Complete Profile" },
    avatar_upload: { base: 25, label: "Upload Avatar" },

    // Engagement
    daily_visit: { base: 10, label: "Daily Visit" },
    streak_day: { base: 15, label: "Streak Day", multiplier: "streak" },

    // Content
    review_submit: { base: 50, label: "Write Review", bonus: { detailed: 25, photo: 25 } },
    quiz_complete: { base: 200, label: "Quiz Completion", bonus: { per_question: 50 } },
    calculator_use: { base: 150, label: "Use Calculator" },
    configurator_complete: { base: 100, label: "Configure Document" },

    // Social
    referral_signup: { base: 75, label: "Referral Signup" },
    referral_purchase: { base: 500, label: "Referral Purchase" },
    newsletter_signup: { base: 100, label: "Newsletter Signup" },
    social_share: { base: 25, label: "Social Share" },

    // Purchases
    first_purchase: { base: 250, label: "First Purchase Bonus" },
    bundle_purchase: { base: 100, label: "Bundle Bonus" },
    repeat_purchase: { base: 50, label: "Repeat Customer Bonus" },

    // Challenges
    daily_challenge_complete: { base: 75, label: "Daily Challenge" },
    weekly_challenge_complete: { base: 200, label: "Weekly Challenge" },

    // Push notifications opt-in
    push_notifications_enabled: { base: 100, label: "Enable Notifications" },

    // Onboarding
    onboarding_step: { base: 50, label: "Onboarding Progress" },
    onboarding_complete: { base: 155, label: "Onboarding Complete" },
  },

  // Level thresholds (XP required to reach each level)
  LEVELS: [
    { level: 1, xp: 0, title: "Newcomer" },
    { level: 2, xp: 500, title: "Explorer" },
    { level: 3, xp: 1500, title: "Practitioner" },
    { level: 4, xp: 3000, title: "Professional" },
    { level: 5, xp: 5000, title: "Expert" },
    { level: 6, xp: 8000, title: "Master" },
    { level: 7, xp: 12000, title: "Authority" },
    { level: 8, xp: 18000, title: "Legend" },
    { level: 9, xp: 25000, title: "Icon" },
    { level: 10, xp: 35000, title: "Transcendent" },
  ],

  // Membership tiers (based on lifetime spend + XP)
  MEMBERSHIP_TIERS: [
    {
      tier: "bronze",
      label: "Bronze",
      minSpend: 0,
      minXP: 0,
      discount: 0,
      benefits: ["Standard pricing", "Basic support"]
    },
    {
      tier: "silver",
      label: "Silver",
      minSpend: 500,
      minXP: 5000,
      discount: 10,
      benefits: ["10% off all purchases", "Priority support", "Early access to new templates"]
    },
    {
      tier: "gold",
      label: "Gold",
      minSpend: 1500,
      minXP: 15000,
      discount: 15,
      benefits: ["15% off all purchases", "Free lifetime updates", "Dedicated support line", "Beta feature access"]
    },
    {
      tier: "platinum",
      label: "Platinum",
      minSpend: 3000,
      minXP: 30000,
      discount: 20,
      benefits: ["20% off all purchases", "Personal account manager", "Custom document requests", "VIP events access"]
    },
  ],
} as const;

// ============================================================================
// TYPES
// ============================================================================

export type XPActionType = keyof typeof XP_CONFIG.ACTION_REWARDS;
export type MembershipTier = "bronze" | "silver" | "gold" | "platinum";

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  type: "earn" | "spend" | "expire" | "adjustment";
  source: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface XPRedemption {
  id: string;
  userId: string;
  orderId: string;
  xpSpent: number;
  discountAmount: number;
  createdAt: string;
}

export interface UserXPState {
  totalXP: number;
  availableXP: number;
  lifetimeXP: number;
  redeemedXP: number;
  expiredXP: number;
  level: number;
  levelTitle: string;
  xpToNextLevel: number;
  progressToNextLevel: number;
  tier: MembershipTier;
  tierDiscount: number;
}

export interface EarnResult {
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  bonusType: string | null;
  bonusChance: number;
  message: string;
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Calculate XP reward for a purchase with variable reinforcement
 */
export function calculatePurchaseXP(purchaseAmount: number): EarnResult {
  const baseXP = Math.floor(purchaseAmount * XP_CONFIG.PURCHASE_REWARDS.BASE_RATE * XP_CONFIG.XP_TO_DOLLAR_RATE);

  // Roll for bonus
  const roll = Math.random();
  let bonusMultiplier = 1;
  let bonusType: string | null = null;
  let bonusChance = 0;

  // Check bonus chances from highest to lowest
  const sortedBonuses = [...XP_CONFIG.PURCHASE_REWARDS.BONUS_CHANCES].sort((a, b) => a.chance - b.chance);

  for (const bonus of sortedBonuses) {
    if (roll < bonus.chance) {
      bonusMultiplier = bonus.multiplier;
      bonusType = bonus.label;
      bonusChance = bonus.chance;
      break;
    }
  }

  const totalXP = baseXP * bonusMultiplier;
  const bonusXP = totalXP - baseXP;

  return {
    baseXP,
    bonusXP,
    totalXP,
    bonusType,
    bonusChance,
    message: bonusType
      ? `${bonusType} You earned ${totalXP} XP (${bonusMultiplier}x bonus!)`
      : `You earned ${totalXP} XP for your purchase`,
  };
}

/**
 * Calculate XP for a specific action with optional variable reinforcement
 */
export function calculateActionXP(
  action: XPActionType,
  options: {
    enableVariableReinforcement?: boolean;
    streakDays?: number;
    bonusConditions?: Record<string, boolean>;
  } = {}
): EarnResult {
  const actionConfig = XP_CONFIG.ACTION_REWARDS[action];
  let baseXP = actionConfig.base;

  // Apply streak multiplier if applicable
  if ("multiplier" in actionConfig && actionConfig.multiplier === "streak" && options.streakDays) {
    baseXP = baseXP * Math.min(options.streakDays, 30); // Cap at 30x
  }

  // Apply bonus conditions
  if (options.bonusConditions && "bonus" in actionConfig) {
    const bonuses = actionConfig.bonus as Record<string, number>;
    for (const [condition, value] of Object.entries(bonuses)) {
      if (options.bonusConditions[condition]) {
        baseXP += value;
      }
    }
  }

  // Variable reinforcement for eligible actions
  if (options.enableVariableReinforcement) {
    const roll = Math.random();

    // 20% chance for 1.5x, 5% for 2x, 1% for 3x
    if (roll < 0.01) {
      return {
        baseXP,
        bonusXP: baseXP * 2,
        totalXP: baseXP * 3,
        bonusType: "JACKPOT!",
        bonusChance: 0.01,
        message: `JACKPOT! You earned ${baseXP * 3} XP (3x bonus!)`,
      };
    }
    if (roll < 0.05) {
      return {
        baseXP,
        bonusXP: baseXP,
        totalXP: baseXP * 2,
        bonusType: "Double XP!",
        bonusChance: 0.05,
        message: `Double XP! You earned ${baseXP * 2} XP`,
      };
    }
    if (roll < 0.20) {
      const bonusXP = Math.floor(baseXP * 0.5);
      return {
        baseXP,
        bonusXP,
        totalXP: baseXP + bonusXP,
        bonusType: "Bonus!",
        bonusChance: 0.20,
        message: `Bonus! You earned ${baseXP + bonusXP} XP`,
      };
    }
  }

  return {
    baseXP,
    bonusXP: 0,
    totalXP: baseXP,
    bonusType: null,
    bonusChance: 0,
    message: `You earned ${baseXP} XP for ${actionConfig.label}`,
  };
}

/**
 * Convert XP to discount amount
 */
export function xpToDiscount(xp: number): number {
  return Math.floor(xp / XP_CONFIG.XP_TO_DOLLAR_RATE);
}

/**
 * Convert discount amount to required XP
 */
export function discountToXP(discount: number): number {
  return discount * XP_CONFIG.XP_TO_DOLLAR_RATE;
}

/**
 * Calculate maximum redeemable XP for an order (respects max discount cap)
 */
export function calculateMaxRedeemableXP(orderTotal: number, availableXP: number): {
  maxXP: number;
  maxDiscount: number;
  reason: string;
} {
  // Check minimum redemption
  if (availableXP < XP_CONFIG.MIN_REDEMPTION_XP) {
    return {
      maxXP: 0,
      maxDiscount: 0,
      reason: `Minimum ${XP_CONFIG.MIN_REDEMPTION_XP} XP required to redeem (${XP_CONFIG.MIN_REDEMPTION_XP / XP_CONFIG.XP_TO_DOLLAR_RATE} off)`,
    };
  }

  // Calculate max discount based on order total cap
  const maxDiscountByPercentage = Math.floor(orderTotal * (XP_CONFIG.MAX_DISCOUNT_PERCENTAGE / 100));
  const maxDiscountByXP = xpToDiscount(availableXP);

  const maxDiscount = Math.min(maxDiscountByPercentage, maxDiscountByXP);
  const maxXP = discountToXP(maxDiscount);

  if (maxDiscount < maxDiscountByXP) {
    return {
      maxXP,
      maxDiscount,
      reason: `Maximum ${XP_CONFIG.MAX_DISCOUNT_PERCENTAGE}% discount applies ($${maxDiscount} off this order)`,
    };
  }

  return {
    maxXP,
    maxDiscount,
    reason: `You can redeem up to ${maxXP} XP for $${maxDiscount} off`,
  };
}

/**
 * Get the user's current level based on total XP
 */
export function getLevel(totalXP: number): {
  level: number;
  title: string;
  xpForCurrentLevel: number;
  xpForNextLevel: number | null;
  progress: number;
} {
  type LevelType = typeof XP_CONFIG.LEVELS[number];
  let currentLevel: LevelType = XP_CONFIG.LEVELS[0];
  let nextLevel: LevelType | null = null;

  for (let i = 0; i < XP_CONFIG.LEVELS.length; i++) {
    if (totalXP >= XP_CONFIG.LEVELS[i].xp) {
      currentLevel = XP_CONFIG.LEVELS[i];
      nextLevel = XP_CONFIG.LEVELS[i + 1] || null;
    }
  }

  let progress = 100;
  if (nextLevel) {
    const xpInCurrentLevel = totalXP - currentLevel.xp;
    const xpNeededForNext = nextLevel.xp - currentLevel.xp;
    progress = Math.floor((xpInCurrentLevel / xpNeededForNext) * 100);
  }

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    xpForCurrentLevel: currentLevel.xp,
    xpForNextLevel: nextLevel?.xp ?? null,
    progress,
  };
}

/**
 * Get the user's membership tier
 */
export function getMembershipTier(lifetimeSpend: number, lifetimeXP: number): {
  tier: MembershipTier;
  label: string;
  discount: number;
  benefits: string[];
  nextTier: typeof XP_CONFIG.MEMBERSHIP_TIERS[number] | null;
  spendToNextTier: number;
  xpToNextTier: number;
} {
  type TierType = typeof XP_CONFIG.MEMBERSHIP_TIERS[number];
  let currentTier: TierType = XP_CONFIG.MEMBERSHIP_TIERS[0];
  let nextTier: TierType | null = null;

  for (let i = 0; i < XP_CONFIG.MEMBERSHIP_TIERS.length; i++) {
    const tier = XP_CONFIG.MEMBERSHIP_TIERS[i];
    if (lifetimeSpend >= tier.minSpend && lifetimeXP >= tier.minXP) {
      currentTier = tier;
      nextTier = XP_CONFIG.MEMBERSHIP_TIERS[i + 1] || null;
    }
  }

  return {
    tier: currentTier.tier as MembershipTier,
    label: currentTier.label,
    discount: currentTier.discount,
    benefits: [...currentTier.benefits],
    nextTier,
    spendToNextTier: nextTier ? Math.max(0, nextTier.minSpend - lifetimeSpend) : 0,
    xpToNextTier: nextTier ? Math.max(0, nextTier.minXP - lifetimeXP) : 0,
  };
}

/**
 * Get the next discount tier the user can reach
 */
export function getNextDiscountTier(currentXP: number): {
  nextTier: typeof XP_CONFIG.DISCOUNT_TIERS[number] | null;
  xpNeeded: number;
  message: string;
} {
  for (const tier of XP_CONFIG.DISCOUNT_TIERS) {
    if (currentXP < tier.xp) {
      const xpNeeded = tier.xp - currentXP;
      return {
        nextTier: tier,
        xpNeeded,
        message: `Just ${xpNeeded} XP to unlock ${tier.label}!`,
      };
    }
  }

  return {
    nextTier: null,
    xpNeeded: 0,
    message: "You've unlocked maximum discount potential!",
  };
}

/**
 * Generate near-miss messaging for cart abandonment prevention
 */
export function getNearMissMessage(
  currentXP: number,
  cartTotal: number,
  purchaseXP: number
): {
  hasNearMiss: boolean;
  message: string;
  xpNeeded: number;
  discountUnlocked: number;
} {
  const potentialXP = currentXP + purchaseXP;

  // Check each tier
  for (const tier of XP_CONFIG.DISCOUNT_TIERS) {
    // If completing this purchase would unlock a new tier
    if (currentXP < tier.xp && potentialXP >= tier.xp) {
      const xpNeeded = tier.xp - currentXP;
      return {
        hasNearMiss: true,
        message: `Complete this purchase to earn ${purchaseXP} XP and unlock ${tier.label}! You need just ${xpNeeded} more XP.`,
        xpNeeded,
        discountUnlocked: tier.discount,
      };
    }

    // If user is close to unlocking a tier (within 200 XP after purchase)
    if (currentXP < tier.xp && tier.xp - potentialXP < 200) {
      const xpNeeded = tier.xp - potentialXP;
      return {
        hasNearMiss: true,
        message: `You're so close! Just ${xpNeeded} more XP after this purchase to unlock ${tier.label}!`,
        xpNeeded,
        discountUnlocked: tier.discount,
      };
    }
  }

  return {
    hasNearMiss: false,
    message: `Complete this purchase to earn ${purchaseXP} XP!`,
    xpNeeded: 0,
    discountUnlocked: 0,
  };
}

/**
 * Calculate all user XP state
 */
export function calculateUserXPState(
  totalXP: number,
  redeemedXP: number,
  expiredXP: number,
  lifetimeSpend: number
): UserXPState {
  const availableXP = totalXP - redeemedXP - expiredXP;
  const lifetimeXP = totalXP;
  const levelInfo = getLevel(lifetimeXP);
  const tierInfo = getMembershipTier(lifetimeSpend, lifetimeXP);

  return {
    totalXP,
    availableXP: Math.max(0, availableXP),
    lifetimeXP,
    redeemedXP,
    expiredXP,
    level: levelInfo.level,
    levelTitle: levelInfo.title,
    xpToNextLevel: levelInfo.xpForNextLevel
      ? levelInfo.xpForNextLevel - lifetimeXP
      : 0,
    progressToNextLevel: levelInfo.progress,
    tier: tierInfo.tier,
    tierDiscount: tierInfo.discount,
  };
}

/**
 * Format XP amount with commas
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString();
}

/**
 * Format discount amount as currency
 */
export function formatDiscount(discount: number): string {
  return `$${discount.toFixed(2)}`;
}

export default XP_CONFIG;
