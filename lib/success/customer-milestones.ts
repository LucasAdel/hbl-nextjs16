/**
 * Customer Success Milestones - BMAD Phase 3
 *
 * Track customer outcomes for:
 * - Demonstrating value (reducing buyer's remorse)
 * - Generating testimonials
 * - Increasing customer lifetime value
 */

export interface CustomerMilestone {
  id: string;
  name: string;
  description: string;
  category: MilestoneCategory;
  trigger: MilestoneTrigger;
  xpReward: number;
  celebrationMessage: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export type MilestoneCategory =
  | "onboarding"
  | "purchase"
  | "implementation"
  | "compliance"
  | "engagement"
  | "advocacy";

export interface MilestoneTrigger {
  type: string;
  threshold: number;
  unit: string;
}

export interface UserMilestone {
  id: string;
  userId: string;
  milestoneId: string;
  earnedAt: string;
  metadata?: Record<string, unknown>;
  celebrated: boolean;
  sharedAt?: string;
}

export interface SuccessMetrics {
  userId: string;
  templatesSaved: number;
  moneySaved: number;
  timeSaved: number; // hours
  complianceScore: number;
  documentsGenerated: number;
  monthsCompliant: number;
}

export interface SuccessStory {
  id: string;
  userId: string;
  headline: string;
  story: string;
  metrics: Partial<SuccessMetrics>;
  approved: boolean;
  featured: boolean;
  createdAt: string;
}

// In-memory storage
const userMilestones = new Map<string, UserMilestone[]>();
const successMetrics = new Map<string, SuccessMetrics>();
const successStories = new Map<string, SuccessStory[]>();

// Pre-defined milestones
export const CUSTOMER_MILESTONES: CustomerMilestone[] = [
  // Onboarding
  {
    id: "first-template",
    name: "First Template",
    description: "Downloaded your first template",
    category: "onboarding",
    trigger: { type: "templates_downloaded", threshold: 1, unit: "templates" },
    xpReward: 100,
    celebrationMessage: "You've taken the first step to compliance!",
    icon: "file-check",
    rarity: "common",
  },
  {
    id: "profile-complete",
    name: "Profile Pro",
    description: "Completed your practice profile",
    category: "onboarding",
    trigger: { type: "profile_completion", threshold: 100, unit: "percent" },
    xpReward: 150,
    celebrationMessage: "Your profile is complete! Personalized recommendations unlocked.",
    icon: "user-check",
    rarity: "common",
  },

  // Purchase milestones
  {
    id: "first-purchase",
    name: "First Purchase",
    description: "Made your first purchase",
    category: "purchase",
    trigger: { type: "purchases", threshold: 1, unit: "orders" },
    xpReward: 200,
    celebrationMessage: "Welcome to the Hamilton Bailey Law family!",
    icon: "shopping-bag",
    rarity: "common",
  },
  {
    id: "bundle-buyer",
    name: "Bundle Buyer",
    description: "Purchased a bundle package",
    category: "purchase",
    trigger: { type: "bundle_purchases", threshold: 1, unit: "bundles" },
    xpReward: 500,
    celebrationMessage: "Smart choice! Bundles save you time and money.",
    icon: "package",
    rarity: "rare",
  },
  {
    id: "big-spender",
    name: "Committed to Compliance",
    description: "Invested $1,000+ in compliance tools",
    category: "purchase",
    trigger: { type: "total_spent", threshold: 1000, unit: "dollars" },
    xpReward: 1000,
    celebrationMessage: "You're serious about compliance. That's a winning strategy!",
    icon: "award",
    rarity: "epic",
  },

  // Implementation milestones
  {
    id: "template-customized",
    name: "Template Customizer",
    description: "Customized a template with your practice details",
    category: "implementation",
    trigger: { type: "templates_customized", threshold: 1, unit: "templates" },
    xpReward: 150,
    celebrationMessage: "Making it your own! Templates work best when personalized.",
    icon: "edit",
    rarity: "common",
  },
  {
    id: "full-implementation",
    name: "Full Implementation",
    description: "Implemented 5+ templates in your practice",
    category: "implementation",
    trigger: { type: "templates_implemented", threshold: 5, unit: "templates" },
    xpReward: 750,
    celebrationMessage: "Your practice is now well-documented and protected!",
    icon: "shield-check",
    rarity: "epic",
  },

  // Compliance milestones
  {
    id: "compliance-90",
    name: "Compliance Champion",
    description: "Achieved 90%+ compliance score",
    category: "compliance",
    trigger: { type: "compliance_score", threshold: 90, unit: "percent" },
    xpReward: 1000,
    celebrationMessage: "Outstanding! You're a compliance leader.",
    icon: "trophy",
    rarity: "legendary",
  },
  {
    id: "six-months-compliant",
    name: "6 Months Compliant",
    description: "Maintained compliance for 6 months",
    category: "compliance",
    trigger: { type: "months_compliant", threshold: 6, unit: "months" },
    xpReward: 500,
    celebrationMessage: "Half a year of peace of mind!",
    icon: "calendar-check",
    rarity: "rare",
  },
  {
    id: "one-year-compliant",
    name: "Annual Compliance Master",
    description: "Maintained compliance for 12 months",
    category: "compliance",
    trigger: { type: "months_compliant", threshold: 12, unit: "months" },
    xpReward: 2000,
    celebrationMessage: "A full year of compliance excellence!",
    icon: "star",
    rarity: "legendary",
  },

  // Engagement milestones
  {
    id: "tool-master",
    name: "Tool Master",
    description: "Completed all interactive tools",
    category: "engagement",
    trigger: { type: "tools_completed", threshold: 3, unit: "tools" },
    xpReward: 500,
    celebrationMessage: "You know your practice inside and out!",
    icon: "wrench",
    rarity: "rare",
  },
  {
    id: "30-day-streak",
    name: "30-Day Warrior",
    description: "Maintained a 30-day login streak",
    category: "engagement",
    trigger: { type: "streak_days", threshold: 30, unit: "days" },
    xpReward: 1000,
    celebrationMessage: "Your dedication is inspiring!",
    icon: "flame",
    rarity: "epic",
  },

  // Advocacy milestones
  {
    id: "first-referral",
    name: "Advocate",
    description: "Made your first successful referral",
    category: "advocacy",
    trigger: { type: "referrals", threshold: 1, unit: "referrals" },
    xpReward: 500,
    celebrationMessage: "Thanks for spreading the word!",
    icon: "users",
    rarity: "rare",
  },
  {
    id: "review-hero",
    name: "Review Hero",
    description: "Left a product review",
    category: "advocacy",
    trigger: { type: "reviews", threshold: 1, unit: "reviews" },
    xpReward: 200,
    celebrationMessage: "Your feedback helps others make informed decisions!",
    icon: "message-circle",
    rarity: "common",
  },
  {
    id: "success-story",
    name: "Success Story",
    description: "Shared your success story",
    category: "advocacy",
    trigger: { type: "success_stories", threshold: 1, unit: "stories" },
    xpReward: 1000,
    celebrationMessage: "Your story inspires others on their compliance journey!",
    icon: "book-open",
    rarity: "epic",
  },
];

/**
 * Check and award milestones for a user
 */
export function checkMilestones(
  userId: string,
  metrics: Partial<SuccessMetrics>
): UserMilestone[] {
  const currentMilestones = userMilestones.get(userId) || [];
  const earnedMilestoneIds = currentMilestones.map((m) => m.milestoneId);

  const newMilestones: UserMilestone[] = [];

  // Map metrics to trigger types
  const metricMap: Record<string, number> = {
    templates_downloaded: metrics.templatesSaved || 0,
    templates_customized: metrics.templatesSaved || 0,
    templates_implemented: metrics.templatesSaved || 0,
    total_spent: metrics.moneySaved || 0, // In real app, would track actual spend
    compliance_score: metrics.complianceScore || 0,
    months_compliant: metrics.monthsCompliant || 0,
    documents_generated: metrics.documentsGenerated || 0,
  };

  for (const milestone of CUSTOMER_MILESTONES) {
    // Skip if already earned
    if (earnedMilestoneIds.includes(milestone.id)) continue;

    // Check if threshold met
    const metricValue = metricMap[milestone.trigger.type] || 0;
    if (metricValue >= milestone.trigger.threshold) {
      const newMilestone: UserMilestone = {
        id: `um-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        milestoneId: milestone.id,
        earnedAt: new Date().toISOString(),
        celebrated: false,
      };

      newMilestones.push(newMilestone);
      currentMilestones.push(newMilestone);
    }
  }

  userMilestones.set(userId, currentMilestones);

  return newMilestones;
}

/**
 * Get user's earned milestones
 */
export function getUserMilestones(userId: string): Array<{
  milestone: CustomerMilestone;
  userMilestone: UserMilestone;
}> {
  const userMils = userMilestones.get(userId) || [];

  return userMils.map((um) => ({
    milestone: CUSTOMER_MILESTONES.find((m) => m.id === um.milestoneId)!,
    userMilestone: um,
  })).filter((m) => m.milestone);
}

/**
 * Get milestone progress for a user
 */
export function getMilestoneProgress(
  userId: string,
  metrics: Partial<SuccessMetrics>
): Array<{
  milestone: CustomerMilestone;
  progress: number;
  isEarned: boolean;
}> {
  const earnedIds = (userMilestones.get(userId) || []).map((m) => m.milestoneId);

  const metricMap: Record<string, number> = {
    templates_downloaded: metrics.templatesSaved || 0,
    total_spent: metrics.moneySaved || 0,
    compliance_score: metrics.complianceScore || 0,
    months_compliant: metrics.monthsCompliant || 0,
  };

  return CUSTOMER_MILESTONES.map((milestone) => {
    const metricValue = metricMap[milestone.trigger.type] || 0;
    const progress = Math.min(100, (metricValue / milestone.trigger.threshold) * 100);

    return {
      milestone,
      progress,
      isEarned: earnedIds.includes(milestone.id),
    };
  });
}

/**
 * Calculate and update success metrics
 */
export function updateSuccessMetrics(
  userId: string,
  updates: Partial<SuccessMetrics>
): SuccessMetrics {
  const current = successMetrics.get(userId) || {
    userId,
    templatesSaved: 0,
    moneySaved: 0,
    timeSaved: 0,
    complianceScore: 0,
    documentsGenerated: 0,
    monthsCompliant: 0,
  };

  const updated: SuccessMetrics = {
    ...current,
    ...updates,
  };

  successMetrics.set(userId, updated);

  // Check for new milestones
  checkMilestones(userId, updated);

  return updated;
}

/**
 * Get success metrics for a user
 */
export function getSuccessMetrics(userId: string): SuccessMetrics | null {
  return successMetrics.get(userId) || null;
}

/**
 * Submit success story
 */
export function submitSuccessStory(
  userId: string,
  headline: string,
  story: string,
  metrics: Partial<SuccessMetrics>
): SuccessStory {
  const successStory: SuccessStory = {
    id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    headline,
    story,
    metrics,
    approved: false,
    featured: false,
    createdAt: new Date().toISOString(),
  };

  const userStories = successStories.get(userId) || [];
  userStories.push(successStory);
  successStories.set(userId, userStories);

  // Award XP for submitting story
  checkMilestones(userId, { ...metrics });

  return successStory;
}

/**
 * Get featured success stories
 */
export function getFeaturedSuccessStories(limit = 5): SuccessStory[] {
  const allStories: SuccessStory[] = [];
  successStories.forEach((stories) => allStories.push(...stories));

  return allStories
    .filter((s) => s.approved && s.featured)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

/**
 * Generate success celebration message
 */
export function generateCelebrationEmail(
  userId: string,
  milestone: CustomerMilestone
): {
  subject: string;
  previewText: string;
  content: string;
} {
  return {
    subject: `🎉 Congratulations! You've earned "${milestone.name}"!`,
    previewText: milestone.celebrationMessage,
    content: `
      <h1>You did it!</h1>
      <p>${milestone.celebrationMessage}</p>
      <p>You've earned <strong>${milestone.xpReward} XP</strong> for this achievement!</p>
      <p>${milestone.description}</p>
      <a href="/dashboard/achievements" class="button">View Your Achievements</a>
    `,
  };
}
