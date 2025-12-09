/**
 * Content Engagement Tracking - BMAD Phase 3
 *
 * Track engagement with content for:
 * - XP rewards for learning
 * - Lead scoring based on engagement
 * - Personalized content recommendations
 */

export interface ContentEngagement {
  id: string;
  userId: string;
  contentId: string;
  contentType: ContentType;
  action: EngagementAction;
  duration?: number; // seconds
  progress?: number; // percentage
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type ContentType =
  | "blog_post"
  | "video"
  | "webinar"
  | "podcast"
  | "resource"
  | "guide"
  | "case_study"
  | "faq";

export type EngagementAction =
  | "view"
  | "read_start"
  | "read_25"
  | "read_50"
  | "read_75"
  | "read_complete"
  | "watch_start"
  | "watch_25"
  | "watch_50"
  | "watch_75"
  | "watch_complete"
  | "download"
  | "share"
  | "bookmark"
  | "comment";

export interface ContentXPReward {
  action: EngagementAction;
  contentType: ContentType;
  xp: number;
}

export interface UserEngagementProfile {
  userId: string;
  totalEngagements: number;
  totalXpFromContent: number;
  contentPreferences: ContentPreference[];
  engagementScore: number; // 0-100
  leadScore: number; // 0-100
  topTopics: string[];
  lastEngagement: string;
}

export interface ContentPreference {
  contentType: ContentType;
  engagementCount: number;
  averageDuration: number;
  completionRate: number;
}

export interface LeadScoreFactors {
  contentEngagement: number;
  productViews: number;
  toolUsage: number;
  cartActivity: number;
  emailEngagement: number;
  recency: number;
}

// In-memory storage
const engagements = new Map<string, ContentEngagement[]>();
const profiles = new Map<string, UserEngagementProfile>();

// XP rewards for content engagement
export const CONTENT_XP_REWARDS: ContentXPReward[] = [
  // Blog posts
  { action: "view", contentType: "blog_post", xp: 5 },
  { action: "read_25", contentType: "blog_post", xp: 10 },
  { action: "read_50", contentType: "blog_post", xp: 15 },
  { action: "read_complete", contentType: "blog_post", xp: 30 },
  { action: "share", contentType: "blog_post", xp: 25 },

  // Videos
  { action: "watch_start", contentType: "video", xp: 10 },
  { action: "watch_25", contentType: "video", xp: 20 },
  { action: "watch_50", contentType: "video", xp: 35 },
  { action: "watch_complete", contentType: "video", xp: 75 },

  // Webinars
  { action: "watch_start", contentType: "webinar", xp: 25 },
  { action: "watch_50", contentType: "webinar", xp: 75 },
  { action: "watch_complete", contentType: "webinar", xp: 200 },

  // Resources/Downloads
  { action: "download", contentType: "resource", xp: 50 },
  { action: "download", contentType: "guide", xp: 75 },
  { action: "download", contentType: "case_study", xp: 40 },

  // General
  { action: "bookmark", contentType: "blog_post", xp: 5 },
  { action: "bookmark", contentType: "video", xp: 5 },
  { action: "comment", contentType: "blog_post", xp: 20 },
];

/**
 * Track content engagement
 */
export function trackContentEngagement(
  userId: string,
  contentId: string,
  contentType: ContentType,
  action: EngagementAction,
  metadata?: { duration?: number; progress?: number; topic?: string }
): { engagement: ContentEngagement; xpAwarded: number } {
  const engagement: ContentEngagement = {
    id: `eng-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    contentId,
    contentType,
    action,
    duration: metadata?.duration,
    progress: metadata?.progress,
    metadata,
    createdAt: new Date().toISOString(),
  };

  // Store engagement
  const userEngagements = engagements.get(userId) || [];
  userEngagements.push(engagement);
  engagements.set(userId, userEngagements);

  // Calculate XP reward
  const reward = CONTENT_XP_REWARDS.find(
    (r) => r.action === action && r.contentType === contentType
  );
  const xpAwarded = reward?.xp || 0;

  // Update user profile
  updateEngagementProfile(userId);

  return { engagement, xpAwarded };
}

/**
 * Update user engagement profile
 */
function updateEngagementProfile(userId: string): void {
  const userEngagements = engagements.get(userId) || [];

  if (userEngagements.length === 0) return;

  // Calculate preferences by content type
  const typeGroups = new Map<ContentType, ContentEngagement[]>();
  userEngagements.forEach((e) => {
    const group = typeGroups.get(e.contentType) || [];
    group.push(e);
    typeGroups.set(e.contentType, group);
  });

  const contentPreferences: ContentPreference[] = [];
  typeGroups.forEach((group, type) => {
    const completions = group.filter(
      (e) => e.action === "read_complete" || e.action === "watch_complete"
    ).length;
    const starts = group.filter(
      (e) => e.action === "view" || e.action === "read_start" || e.action === "watch_start"
    ).length;

    contentPreferences.push({
      contentType: type,
      engagementCount: group.length,
      averageDuration:
        group.reduce((sum, e) => sum + (e.duration || 0), 0) / group.length,
      completionRate: starts > 0 ? (completions / starts) * 100 : 0,
    });
  });

  // Calculate total XP from content
  const totalXpFromContent = userEngagements.reduce((sum, e) => {
    const reward = CONTENT_XP_REWARDS.find(
      (r) => r.action === e.action && r.contentType === e.contentType
    );
    return sum + (reward?.xp || 0);
  }, 0);

  // Calculate engagement score (0-100)
  const engagementScore = Math.min(
    100,
    Math.round(
      (userEngagements.length * 2 +
        totalXpFromContent / 10 +
        contentPreferences.reduce((sum, p) => sum + p.completionRate, 0) / 5) /
        3
    )
  );

  // Calculate lead score
  const leadScore = calculateLeadScore({
    contentEngagement: engagementScore,
    productViews: 0, // Would be calculated from product tracking
    toolUsage: 0,
    cartActivity: 0,
    emailEngagement: 0,
    recency: calculateRecency(userEngagements[userEngagements.length - 1].createdAt),
  });

  // Extract top topics
  const topics = new Map<string, number>();
  userEngagements.forEach((e) => {
    const topic = (e.metadata?.topic as string) || e.contentType;
    topics.set(topic, (topics.get(topic) || 0) + 1);
  });
  const topTopics = Array.from(topics.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);

  const profile: UserEngagementProfile = {
    userId,
    totalEngagements: userEngagements.length,
    totalXpFromContent,
    contentPreferences,
    engagementScore,
    leadScore,
    topTopics,
    lastEngagement: userEngagements[userEngagements.length - 1].createdAt,
  };

  profiles.set(userId, profile);
}

/**
 * Calculate recency score (0-100)
 */
function calculateRecency(lastEngagement: string): number {
  const daysSince =
    (Date.now() - new Date(lastEngagement).getTime()) / (1000 * 60 * 60 * 24);

  if (daysSince < 1) return 100;
  if (daysSince < 3) return 90;
  if (daysSince < 7) return 75;
  if (daysSince < 14) return 50;
  if (daysSince < 30) return 25;
  return 10;
}

/**
 * Calculate lead score
 */
function calculateLeadScore(factors: LeadScoreFactors): number {
  const weights = {
    contentEngagement: 0.2,
    productViews: 0.25,
    toolUsage: 0.2,
    cartActivity: 0.15,
    emailEngagement: 0.1,
    recency: 0.1,
  };

  return Math.round(
    factors.contentEngagement * weights.contentEngagement +
      factors.productViews * weights.productViews +
      factors.toolUsage * weights.toolUsage +
      factors.cartActivity * weights.cartActivity +
      factors.emailEngagement * weights.emailEngagement +
      factors.recency * weights.recency
  );
}

/**
 * Get user engagement profile
 */
export function getEngagementProfile(userId: string): UserEngagementProfile | null {
  return profiles.get(userId) || null;
}

/**
 * Get content recommendations based on engagement
 */
export function getContentRecommendations(
  userId: string
): Array<{
  contentId: string;
  contentType: ContentType;
  title: string;
  reason: string;
  xpReward: number;
}> {
  const profile = profiles.get(userId);

  // Default recommendations
  const recommendations = [
    {
      contentId: "ahpra-guide",
      contentType: "guide" as ContentType,
      title: "Complete AHPRA Compliance Guide",
      reason: "Most popular among practitioners like you",
      xpReward: 75,
    },
    {
      contentId: "telehealth-webinar",
      contentType: "webinar" as ContentType,
      title: "Telehealth Best Practices Webinar",
      reason: "Earn 200 XP by completing",
      xpReward: 200,
    },
    {
      contentId: "employment-law-video",
      contentType: "video" as ContentType,
      title: "Employment Law Essentials",
      reason: "Quick 10-minute overview",
      xpReward: 75,
    },
  ];

  // Personalize based on profile
  if (profile?.topTopics.includes("compliance")) {
    recommendations.unshift({
      contentId: "compliance-checklist",
      contentType: "resource" as ContentType,
      title: "2024 Compliance Checklist",
      reason: "Based on your compliance interest",
      xpReward: 50,
    });
  }

  return recommendations.slice(0, 5);
}

/**
 * Get engagement summary for dashboard
 */
export function getEngagementSummary(userId: string): {
  thisWeek: number;
  lastWeek: number;
  trend: "up" | "down" | "stable";
  topContent: string;
  xpEarned: number;
} {
  const userEngagements = engagements.get(userId) || [];
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  const thisWeek = userEngagements.filter(
    (e) => now - new Date(e.createdAt).getTime() < oneWeek
  ).length;

  const lastWeek = userEngagements.filter((e) => {
    const time = now - new Date(e.createdAt).getTime();
    return time >= oneWeek && time < oneWeek * 2;
  }).length;

  const trend =
    thisWeek > lastWeek ? "up" : thisWeek < lastWeek ? "down" : "stable";

  const typeCounts = new Map<ContentType, number>();
  userEngagements.forEach((e) => {
    typeCounts.set(e.contentType, (typeCounts.get(e.contentType) || 0) + 1);
  });
  const topContent =
    Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "None";

  const xpEarned = userEngagements.reduce((sum, e) => {
    const reward = CONTENT_XP_REWARDS.find(
      (r) => r.action === e.action && r.contentType === e.contentType
    );
    return sum + (reward?.xp || 0);
  }, 0);

  return { thisWeek, lastWeek, trend, topContent, xpEarned };
}
