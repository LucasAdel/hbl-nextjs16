/**
 * Private Client Discussions - BMAD Phase 3
 *
 * Authenticated client-only discussions with:
 * - XP rewards for participation
 * - Moderation controls
 * - Professional, law-firm appropriate engagement
 */

export interface Discussion {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  category: DiscussionCategory;
  status: DiscussionStatus;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  content: string;
  authorId: string;
  authorName: string;
  isStaffReply: boolean;
  isHelpful: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export type DiscussionCategory =
  | "general"
  | "compliance"
  | "templates"
  | "telehealth"
  | "employment"
  | "practice_management"
  | "announcements";

export type DiscussionStatus =
  | "open"
  | "answered"
  | "closed"
  | "archived";

export interface DiscussionStats {
  totalDiscussions: number;
  totalReplies: number;
  userDiscussions: number;
  userReplies: number;
  helpfulMarks: number;
  xpEarnedFromDiscussions: number;
}

// In-memory storage
const discussions = new Map<string, Discussion>();
const replies = new Map<string, DiscussionReply[]>();
const userStats = new Map<string, DiscussionStats>();

// XP rewards for discussion participation (professional, not gamey)
export const DISCUSSION_XP_REWARDS = {
  createDiscussion: 25,
  postReply: 15,
  receiveHelpfulMark: 50,
  staffReplyToYourThread: 10, // Bonus when staff helps you
  firstDiscussion: 100, // One-time bonus
} as const;

// Variable reinforcement for quality participation
export function calculateDiscussionXP(
  action: keyof typeof DISCUSSION_XP_REWARDS,
  userTotalContributions: number
): {
  xpEarned: number;
  bonusXp: number;
  rarity: "normal" | "bonus" | "exceptional";
  message: string;
} {
  const baseXp = DISCUSSION_XP_REWARDS[action];
  let bonusXp = 0;
  let rarity: "normal" | "bonus" | "exceptional" = "normal";
  let message = "";

  // Variable reinforcement (subtle, professional)
  const roll = Math.random();
  if (roll < 0.05) {
    // 5% exceptional - for quality contributions
    bonusXp = Math.round(baseXp * 0.5);
    rarity = "exceptional";
    message = "Your contribution was particularly valuable!";
  } else if (roll < 0.20) {
    // 15% bonus
    bonusXp = Math.round(baseXp * 0.25);
    rarity = "bonus";
    message = "Great contribution to the community!";
  }

  // Milestone bonuses (every 10 contributions)
  if (userTotalContributions > 0 && userTotalContributions % 10 === 0) {
    bonusXp += 50;
    message = `Community milestone: ${userTotalContributions} contributions!`;
  }

  return {
    xpEarned: baseXp + bonusXp,
    bonusXp,
    rarity,
    message,
  };
}

/**
 * Create a new discussion (client-only)
 */
export function createDiscussion(
  authorId: string,
  authorName: string,
  title: string,
  content: string,
  category: DiscussionCategory
): { discussion: Discussion; xpResult: ReturnType<typeof calculateDiscussionXP> } {
  const discussion: Discussion = {
    id: `disc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    content,
    authorId,
    authorName,
    category,
    status: "open",
    isPinned: false,
    isLocked: false,
    viewCount: 0,
    replyCount: 0,
    lastActivityAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  discussions.set(discussion.id, discussion);
  replies.set(discussion.id, []);

  // Update user stats
  const stats = getUserDiscussionStats(authorId);
  const isFirst = stats.userDiscussions === 0;
  stats.userDiscussions++;
  stats.totalDiscussions++;
  userStats.set(authorId, stats);

  // Calculate XP (with first discussion bonus)
  const action = isFirst ? "firstDiscussion" : "createDiscussion";
  const xpResult = calculateDiscussionXP(
    action as keyof typeof DISCUSSION_XP_REWARDS,
    stats.userDiscussions + stats.userReplies
  );
  stats.xpEarnedFromDiscussions += xpResult.xpEarned;

  return { discussion, xpResult };
}

/**
 * Post a reply to a discussion
 */
export function postReply(
  discussionId: string,
  authorId: string,
  authorName: string,
  content: string,
  isStaff: boolean = false
): { reply: DiscussionReply; xpResult: ReturnType<typeof calculateDiscussionXP> } | null {
  const discussion = discussions.get(discussionId);
  if (!discussion || discussion.isLocked) return null;

  const reply: DiscussionReply = {
    id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    discussionId,
    content,
    authorId,
    authorName,
    isStaffReply: isStaff,
    isHelpful: false,
    helpfulCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const discussionReplies = replies.get(discussionId) || [];
  discussionReplies.push(reply);
  replies.set(discussionId, discussionReplies);

  // Update discussion
  discussion.replyCount++;
  discussion.lastActivityAt = new Date().toISOString();
  if (isStaff) {
    discussion.status = "answered";
  }

  // Update user stats
  const stats = getUserDiscussionStats(authorId);
  stats.userReplies++;
  stats.totalReplies++;
  userStats.set(authorId, stats);

  // Calculate XP
  const xpResult = calculateDiscussionXP(
    "postReply",
    stats.userDiscussions + stats.userReplies
  );
  stats.xpEarnedFromDiscussions += xpResult.xpEarned;

  // If staff replied, give bonus to discussion author
  if (isStaff && discussion.authorId !== authorId) {
    const authorStats = getUserDiscussionStats(discussion.authorId);
    const bonusXp = calculateDiscussionXP("staffReplyToYourThread", 0);
    authorStats.xpEarnedFromDiscussions += bonusXp.xpEarned;
    userStats.set(discussion.authorId, authorStats);
  }

  return { reply, xpResult };
}

/**
 * Mark a reply as helpful
 */
export function markReplyHelpful(
  replyId: string,
  markerId: string
): { success: boolean; xpAwarded: number } {
  // Find the reply
  let foundReply: DiscussionReply | null = null;
  replies.forEach((replyList) => {
    const reply = replyList.find((r) => r.id === replyId);
    if (reply) foundReply = reply;
  });

  if (!foundReply) return { success: false, xpAwarded: 0 };

  // Cast to proper type after null check
  const replyToUpdate = foundReply as DiscussionReply;

  // Can't mark your own reply as helpful
  if (replyToUpdate.authorId === markerId) {
    return { success: false, xpAwarded: 0 };
  }

  replyToUpdate.helpfulCount++;
  if (replyToUpdate.helpfulCount >= 3) {
    replyToUpdate.isHelpful = true;
  }

  // Award XP to reply author
  const stats = getUserDiscussionStats(replyToUpdate.authorId);
  const xpResult = calculateDiscussionXP("receiveHelpfulMark", 0);
  stats.helpfulMarks++;
  stats.xpEarnedFromDiscussions += xpResult.xpEarned;
  userStats.set(replyToUpdate.authorId, stats);

  return { success: true, xpAwarded: xpResult.xpEarned };
}

/**
 * Get discussions with pagination
 */
export function getDiscussions(
  options: {
    category?: DiscussionCategory;
    status?: DiscussionStatus;
    limit?: number;
    offset?: number;
  } = {}
): { discussions: Discussion[]; total: number } {
  let allDiscussions = Array.from(discussions.values());

  // Filter by category
  if (options.category) {
    allDiscussions = allDiscussions.filter((d) => d.category === options.category);
  }

  // Filter by status
  if (options.status) {
    allDiscussions = allDiscussions.filter((d) => d.status === options.status);
  }

  // Sort: pinned first, then by last activity
  allDiscussions.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
  });

  const total = allDiscussions.length;
  const limit = options.limit || 20;
  const offset = options.offset || 0;

  return {
    discussions: allDiscussions.slice(offset, offset + limit),
    total,
  };
}

/**
 * Get a single discussion with replies
 */
export function getDiscussion(discussionId: string): {
  discussion: Discussion;
  replies: DiscussionReply[];
} | null {
  const discussion = discussions.get(discussionId);
  if (!discussion) return null;

  // Increment view count
  discussion.viewCount++;

  return {
    discussion,
    replies: replies.get(discussionId) || [],
  };
}

/**
 * Get user discussion stats
 */
export function getUserDiscussionStats(userId: string): DiscussionStats {
  return userStats.get(userId) || {
    totalDiscussions: discussions.size,
    totalReplies: Array.from(replies.values()).flat().length,
    userDiscussions: 0,
    userReplies: 0,
    helpfulMarks: 0,
    xpEarnedFromDiscussions: 0,
  };
}

/**
 * Get category list with counts
 */
export function getCategories(): Array<{
  category: DiscussionCategory;
  label: string;
  count: number;
  description: string;
}> {
  const categoryCounts = new Map<DiscussionCategory, number>();
  discussions.forEach((d) => {
    categoryCounts.set(d.category, (categoryCounts.get(d.category) || 0) + 1);
  });

  return [
    {
      category: "announcements",
      label: "Announcements",
      count: categoryCounts.get("announcements") || 0,
      description: "Official updates and news",
    },
    {
      category: "compliance",
      label: "Compliance",
      count: categoryCounts.get("compliance") || 0,
      description: "AHPRA, regulatory, and compliance discussions",
    },
    {
      category: "templates",
      label: "Templates & Documents",
      count: categoryCounts.get("templates") || 0,
      description: "Questions about templates and documentation",
    },
    {
      category: "telehealth",
      label: "Telehealth",
      count: categoryCounts.get("telehealth") || 0,
      description: "Virtual practice and telehealth topics",
    },
    {
      category: "employment",
      label: "Employment",
      count: categoryCounts.get("employment") || 0,
      description: "Staff contracts and employment matters",
    },
    {
      category: "practice_management",
      label: "Practice Management",
      count: categoryCounts.get("practice_management") || 0,
      description: "Running your practice effectively",
    },
    {
      category: "general",
      label: "General Discussion",
      count: categoryCounts.get("general") || 0,
      description: "Other topics and general questions",
    },
  ];
}

/**
 * Moderate a discussion (staff only)
 */
export function moderateDiscussion(
  discussionId: string,
  action: "pin" | "unpin" | "lock" | "unlock" | "archive" | "close"
): boolean {
  const discussion = discussions.get(discussionId);
  if (!discussion) return false;

  switch (action) {
    case "pin":
      discussion.isPinned = true;
      break;
    case "unpin":
      discussion.isPinned = false;
      break;
    case "lock":
      discussion.isLocked = true;
      break;
    case "unlock":
      discussion.isLocked = false;
      break;
    case "archive":
      discussion.status = "archived";
      discussion.isLocked = true;
      break;
    case "close":
      discussion.status = "closed";
      break;
  }

  discussion.updatedAt = new Date().toISOString();
  return true;
}
