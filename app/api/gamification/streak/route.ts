import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  notifyStreakMilestone,
  notifyStreakAtRisk,
} from "@/lib/notifications/notification-triggers";

// Streak milestone configuration
const STREAK_MILESTONES = [
  { days: 7, xpReward: 200, freezeToken: true },
  { days: 14, xpReward: 500, freezeToken: true },
  { days: 30, xpReward: 1000, freezeToken: true },
  { days: 60, xpReward: 2000, freezeToken: false },
  { days: 90, xpReward: 5000, freezeToken: true },
  { days: 180, xpReward: 10000, freezeToken: true },
  { days: 365, xpReward: 25000, freezeToken: true },
];

// In-memory streak state for demo
const streakState = new Map<string, {
  currentStreak: number;
  longestStreak: number;
  freezeTokens: number;
  lastActivityDate: string;
}>();

/**
 * GET /api/gamification/streak
 * Returns the user's streak data
 * Currently uses demo mode - database tables will be added in future
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userId = user?.id || "demo-user";
    let state = streakState.get(userId);

    // Initialize state if not exists
    if (!state) {
      state = generateDemoStreakState(!!user);
      streakState.set(userId, state);
    }

    // Calculate streak status
    const now = new Date();
    const lastActivity = new Date(state.lastActivityDate);
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    const streakAtRisk = hoursSinceActivity > 20 && hoursSinceActivity < 48;
    const hoursUntilLoss = Math.max(0, 48 - hoursSinceActivity);

    // Send streak at risk notification (fire and forget)
    if (streakAtRisk && user?.email && state.currentStreak >= 3) {
      notifyStreakAtRisk(user.email, {
        currentStreak: state.currentStreak,
        hoursRemaining: Math.round(hoursUntilLoss),
        freezeTokens: state.freezeTokens,
      }).catch(() => {}); // Ignore errors
    }

    // Find next milestone
    const nextMilestone = STREAK_MILESTONES.find(
      (m) => m.days > state!.currentStreak
    ) || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];

    // Calculate weekly activity
    const weeklyActivity = generateWeeklyActivity(now.getDay());

    return NextResponse.json({
      currentStreak: state.currentStreak,
      longestStreak: state.longestStreak,
      freezeTokens: state.freezeTokens,
      maxFreezeTokens: 3,
      lastActivityDate: state.lastActivityDate,
      streakAtRisk,
      hoursUntilLoss: Math.round(hoursUntilLoss),
      nextMilestone: {
        days: nextMilestone.days,
        reward: nextMilestone.xpReward,
        freezeToken: nextMilestone.freezeToken,
      },
      weeklyActivity,
    });
  } catch (error) {
    console.error("Error fetching streak:", error);
    return NextResponse.json(generateDemoStreakData());
  }
}

/**
 * POST /api/gamification/streak
 * Updates streak (called when user completes an action)
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = user.id;
    let state = streakState.get(userId);

    if (!state) {
      state = generateDemoStreakState(true);
    }

    const now = new Date();
    const lastActivity = new Date(state.lastActivityDate);
    const hoursSince = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    // Same day - no streak change
    if (hoursSince < 24 && lastActivity.getDate() === now.getDate()) {
      return NextResponse.json({
        updated: false,
        currentStreak: state.currentStreak,
        message: "Already checked in today",
      });
    }

    let currentStreak = state.currentStreak;
    let milestonesEarned: typeof STREAK_MILESTONES = [];

    // Streak continues (within 48 hours)
    if (hoursSince < 48) {
      currentStreak = state.currentStreak + 1;
    } else {
      // Streak broken
      currentStreak = 1;
    }

    const longestStreak = Math.max(currentStreak, state.longestStreak);
    let freezeTokens = state.freezeTokens;

    // Check for milestone rewards
    milestonesEarned = STREAK_MILESTONES.filter(
      (m) => m.days === currentStreak
    );

    // Award milestone rewards (freeze tokens)
    for (const milestone of milestonesEarned) {
      if (milestone.freezeToken) {
        freezeTokens = Math.min(freezeTokens + 1, 3);
      }
    }

    // Update state
    state = {
      currentStreak,
      longestStreak,
      freezeTokens,
      lastActivityDate: now.toISOString(),
    };
    streakState.set(userId, state);

    // Send milestone notifications if user has email
    if (user.email && milestonesEarned.length > 0) {
      for (const milestone of milestonesEarned) {
        await notifyStreakMilestone(user.email, {
          days: milestone.days,
          xpBonus: milestone.xpReward,
          milestone: true,
        });
      }
    }

    return NextResponse.json({
      updated: true,
      currentStreak,
      longestStreak,
      freezeTokens,
      milestonesEarned: milestonesEarned.map((m) => ({
        days: m.days,
        xpReward: m.xpReward,
        freezeToken: m.freezeToken,
      })),
    });
  } catch (error) {
    console.error("Error updating streak:", error);
    return NextResponse.json(
      { error: "Failed to update streak" },
      { status: 500 }
    );
  }
}

// Generate demo streak state
function generateDemoStreakState(isAuthenticated: boolean) {
  const currentStreak = isAuthenticated ? 7 + Math.floor(Math.random() * 7) : 5;
  return {
    currentStreak,
    longestStreak: currentStreak + Math.floor(Math.random() * 10),
    freezeTokens: 2,
    lastActivityDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  };
}

// Generate weekly activity
function generateWeeklyActivity(today: number): boolean[] {
  const activity = new Array(7).fill(false);
  for (let i = 0; i <= today; i++) {
    activity[i] = Math.random() > 0.2;
  }
  return activity;
}

// Generate demo streak data
function generateDemoStreakData() {
  const today = new Date().getDay();
  const weeklyActivity = generateWeeklyActivity(today);

  const currentStreak = 7 + Math.floor(Math.random() * 7);
  const nextMilestone = STREAK_MILESTONES.find((m) => m.days > currentStreak) || STREAK_MILESTONES[0];

  return {
    currentStreak,
    longestStreak: currentStreak + Math.floor(Math.random() * 10),
    freezeTokens: 2,
    maxFreezeTokens: 3,
    lastActivityDate: new Date().toISOString(),
    streakAtRisk: Math.random() > 0.8,
    hoursUntilLoss: Math.floor(Math.random() * 12) + 1,
    nextMilestone: {
      days: nextMilestone.days,
      reward: nextMilestone.xpReward,
      freezeToken: nextMilestone.freezeToken,
    },
    weeklyActivity,
  };
}
