/**
 * Gamification System
 * Implements variable reinforcement, streaks, XP, and achievements
 * Based on the productive addiction philosophy
 */

import { createClient } from "@/lib/supabase/server";

// XP Reward Tiers with Variable Reinforcement
const XP_REWARDS = {
  page_view: { base: 2, bonus: 5, rare: 15, jackpot: 50 },
  document_view: { base: 5, bonus: 10, rare: 25, jackpot: 75 },
  newsletter_signup: { base: 25, bonus: 50, rare: 100, jackpot: 250 },
  consultation_booked: { base: 75, bonus: 150, rare: 300, jackpot: 750 },
  document_purchase: { base: 50, bonus: 100, rare: 200, jackpot: 500 },
  intake_complete: { base: 40, bonus: 80, rare: 160, jackpot: 400 },
  return_visit: { base: 10, bonus: 20, rare: 50, jackpot: 150 },
};

// Level thresholds (exponential growth)
const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 850, 1300, 1900, 2700, 3700, 5000,
  6500, 8500, 11000, 14000, 18000, 23000, 29000, 36000, 45000, 55000,
];

// Streak multipliers
const STREAK_MULTIPLIERS: Record<number, number> = {
  3: 1.1,   // 10% bonus at 3-day streak
  7: 1.25,  // 25% bonus at 7-day streak
  14: 1.5,  // 50% bonus at 14-day streak
  30: 2.0,  // 100% bonus at 30-day streak
  60: 2.5,  // 150% bonus at 60-day streak
  90: 3.0,  // 200% bonus at 90-day streak
};

export type ActivityType = keyof typeof XP_REWARDS;

export interface XPResult {
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  rewardType: "base" | "bonus" | "rare" | "jackpot";
  streakMultiplier: number;
  newTotalXP: number;
  levelUp: boolean;
  newLevel: number;
  achievementsEarned: string[];
}

/**
 * Calculate XP with variable reinforcement
 * Uses random chance to create dopamine-inducing reward variability
 */
function calculateXPReward(
  activity: ActivityType,
  currentStreak: number
): { amount: number; type: "base" | "bonus" | "rare" | "jackpot" } {
  const rewards = XP_REWARDS[activity];
  const roll = Math.random() * 100;

  let amount: number;
  let type: "base" | "bonus" | "rare" | "jackpot";

  // Variable reinforcement schedule:
  // 80% base, 15% bonus, 4% rare, 1% jackpot
  if (roll < 1) {
    amount = rewards.jackpot;
    type = "jackpot";
  } else if (roll < 5) {
    amount = rewards.rare;
    type = "rare";
  } else if (roll < 20) {
    amount = rewards.bonus;
    type = "bonus";
  } else {
    amount = rewards.base;
    type = "base";
  }

  return { amount, type };
}

/**
 * Get streak multiplier based on current streak
 */
function getStreakMultiplier(streak: number): number {
  let multiplier = 1.0;

  for (const [threshold, mult] of Object.entries(STREAK_MULTIPLIERS)) {
    if (streak >= parseInt(threshold)) {
      multiplier = mult;
    }
  }

  return multiplier;
}

/**
 * Calculate level from total XP
 */
function calculateLevel(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Award XP to a user with variable reinforcement
 */
export async function awardXP(
  email: string,
  activity: ActivityType,
  metadata: Record<string, unknown> = {}
): Promise<XPResult> {
  const supabase = await createClient();

  // Get or create user profile
  let { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (!profile) {
    // Create new profile
    const { data: newProfile } = await supabase
      .from("user_profiles")
      .insert({
        email: email.toLowerCase(),
        total_xp: 0,
        current_level: 1,
        current_streak: 0,
        longest_streak: 0,
      })
      .select()
      .single();

    profile = newProfile;
  }

  if (!profile) {
    throw new Error("Failed to create user profile");
  }

  // Calculate streak
  const today = new Date().toISOString().split("T")[0];
  const lastActive = profile.last_active_date;
  let newStreak = profile.current_streak;

  if (lastActive) {
    const lastDate = new Date(lastActive);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      // Consecutive day - increase streak
      newStreak++;
    } else if (diffDays > 1) {
      // Streak broken
      newStreak = 1;
    }
    // If same day, keep streak the same
  } else {
    newStreak = 1;
  }

  // Calculate XP with variable reinforcement
  const { amount: baseAmount, type: rewardType } = calculateXPReward(activity, newStreak);
  const streakMultiplier = getStreakMultiplier(newStreak);
  const totalXPEarned = Math.round(baseAmount * streakMultiplier);

  const previousLevel = profile.current_level;
  const newTotalXP = profile.total_xp + totalXPEarned;
  const newLevel = calculateLevel(newTotalXP);
  const levelUp = newLevel > previousLevel;

  // Update profile
  await supabase
    .from("user_profiles")
    .update({
      total_xp: newTotalXP,
      current_level: newLevel,
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, profile.longest_streak),
      last_active_date: today,
    })
    .eq("id", profile.id);

  // Record XP transaction
  await supabase.from("xp_transactions").insert({
    user_email: email.toLowerCase(),
    amount: totalXPEarned,
    source: activity,
    multiplier: streakMultiplier,
    description: `${rewardType.toUpperCase()} reward for ${activity.replace(/_/g, " ")}`,
    metadata: metadata as unknown as Record<string, never>,
  });

  // Check for new achievements
  const achievementsEarned = await checkAndAwardAchievements(email, {
    activity,
    totalXP: newTotalXP,
    level: newLevel,
    streak: newStreak,
  });

  return {
    baseXP: baseAmount,
    bonusXP: totalXPEarned - baseAmount,
    totalXP: totalXPEarned,
    rewardType,
    streakMultiplier,
    newTotalXP,
    levelUp,
    newLevel,
    achievementsEarned,
  };
}

/**
 * Check and award any newly earned achievements
 */
async function checkAndAwardAchievements(
  email: string,
  context: {
    activity: ActivityType;
    totalXP: number;
    level: number;
    streak: number;
  }
): Promise<string[]> {
  const supabase = await createClient();
  const earnedAchievements: string[] = [];

  // Get all achievements
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*");

  if (!achievements) return [];

  // Get user's existing achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_email", email.toLowerCase());

  const earnedIds = new Set(userAchievements?.map((a: { achievement_id: string }) => a.achievement_id) || []);

  // Get activity counts
  const { count: visitCount } = await supabase
    .from("user_activity_log")
    .select("*", { count: "exact", head: true })
    .eq("user_email", email.toLowerCase())
    .eq("activity_type", "page_view");

  const { count: purchaseCount } = await supabase
    .from("user_activity_log")
    .select("*", { count: "exact", head: true })
    .eq("user_email", email.toLowerCase())
    .eq("activity_type", "document_purchase");

  const { count: consultationCount } = await supabase
    .from("user_activity_log")
    .select("*", { count: "exact", head: true })
    .eq("user_email", email.toLowerCase())
    .eq("activity_type", "consultation_booked");

  // Check each achievement
  for (const achievement of achievements) {
    if (earnedIds.has(achievement.id)) continue;

    let earned = false;

    switch (achievement.requirement_type) {
      case "visit_count":
        earned = (visitCount || 0) >= achievement.requirement_value;
        break;
      case "streak_days":
        earned = context.streak >= achievement.requirement_value;
        break;
      case "purchase_count":
        earned = (purchaseCount || 0) >= achievement.requirement_value;
        break;
      case "consultation_count":
        earned = (consultationCount || 0) >= achievement.requirement_value;
        break;
      case "newsletter_subscribed":
        earned = context.activity === "newsletter_signup";
        break;
      case "intake_completed":
        earned = context.activity === "intake_complete";
        break;
    }

    if (earned) {
      // Award achievement
      await supabase.from("user_achievements").insert({
        user_email: email.toLowerCase(),
        achievement_id: achievement.id,
      });

      // Award XP for achievement
      await supabase.from("xp_transactions").insert({
        user_email: email.toLowerCase(),
        amount: achievement.xp_reward,
        source: "achievement",
        description: `Achievement unlocked: ${achievement.name}`,
      });

      // Update total XP
      await supabase
        .from("user_profiles")
        .update({
          total_xp: context.totalXP + achievement.xp_reward,
        })
        .eq("email", email.toLowerCase());

      earnedAchievements.push(achievement.slug);
    }
  }

  return earnedAchievements;
}

/**
 * Get user's gamification profile
 */
export async function getUserProfile(email: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (!profile) return null;

  // Get achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select(`
      earned_at,
      achievements (*)
    `)
    .eq("user_email", email.toLowerCase());

  // Calculate progress to next level
  const currentLevelXP = LEVEL_THRESHOLDS[profile.current_level - 1] || 0;
  const nextLevelXP = LEVEL_THRESHOLDS[profile.current_level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const progressToNextLevel = Math.round(
    ((profile.total_xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
  );

  // Get recent XP history
  const { data: recentXP } = await supabase
    .from("xp_transactions")
    .select("*")
    .eq("user_email", email.toLowerCase())
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    ...profile,
    achievements: userAchievements || [],
    progressToNextLevel: Math.min(progressToNextLevel, 100),
    xpToNextLevel: nextLevelXP - profile.total_xp,
    recentXP: recentXP || [],
    streakMultiplier: getStreakMultiplier(profile.current_streak),
  };
}

/**
 * Track user activity (for recommendations and achievements)
 */
export async function trackActivity(
  email: string | null,
  sessionId: string,
  activityType: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const supabase = await createClient();

  await supabase.from("user_activity_log").insert({
    user_email: email?.toLowerCase() || null,
    session_id: sessionId,
    activity_type: activityType,
    page_path: metadata.pagePath as string || null,
    document_id: metadata.documentId as string || null,
    metadata: metadata as unknown as Record<string, never>,
  });
}

/**
 * Track document view for recommendations
 */
export async function trackDocumentView(
  email: string | null,
  sessionId: string,
  documentId: string,
  viewDuration: number = 0,
  scrollDepth: number = 0
): Promise<void> {
  const supabase = await createClient();

  await supabase.from("document_views").insert({
    user_email: email?.toLowerCase() || null,
    session_id: sessionId,
    document_id: documentId,
    view_duration_seconds: viewDuration,
    scroll_depth_percent: scrollDepth,
  });
}
