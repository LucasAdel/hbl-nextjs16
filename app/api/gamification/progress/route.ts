import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getLevel,
  getMembershipTier,
  XP_CONFIG,
} from "@/lib/xp-economy";

/**
 * GET /api/gamification/progress
 * Returns comprehensive gamification progress snapshot
 * Currently uses demo data - database tables will be added in future
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Generate progress data (demo mode until database tables exist)
    // When gamification tables are added, this will fetch real data
    const progress = generateDemoProgress(!!user);

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error fetching gamification progress:", error);
    return NextResponse.json(generateDemoProgress(false));
  }
}

/**
 * Generate demo progress data
 * When database tables are added, this will be replaced with real data fetching
 */
function generateDemoProgress(isAuthenticated: boolean = false) {
  // Higher XP for authenticated users (simulates real progress)
  const demoXP = isAuthenticated ? 3500 : 2750;
  const demoSpend = isAuthenticated ? 250 : 100; // Demo lifetime spend
  const level = getLevel(demoXP);
  const tier = getMembershipTier(demoSpend, demoXP);

  return {
    xp: {
      total: demoXP,
      available: demoXP,
      redeemed: 500,
      lifetime: demoXP + 500,
    },
    level: {
      current: level.level,
      title: level.title,
      bonus: 1 + (level.level * 0.05), // 5% bonus per level
      progress: level.progress,
      xpToNext: level.xpForNextLevel ? level.xpForNextLevel - demoXP : 0,
      perks: [`${5 * level.level}% bonus XP`, `Level ${level.level} badge`],
    },
    tier: {
      id: tier.tier,
      name: tier.label,
      discount: tier.discount,
      progress: 55,
      xpToNext: tier.nextTier ? tier.nextTier.minXP - demoXP : 0,
      nextTier: tier.nextTier?.label || null,
      benefits: tier.benefits,
    },
    streak: {
      current: 12,
      longest: 23,
      freezeTokens: 2,
      maxFreezeTokens: 3,
      atRisk: false,
      hoursUntilLoss: 18,
      lastActivity: new Date().toISOString(),
    },
    discount: {
      available: 27,
      maxPerOrder: 25,
      nearMissMessage: "Just 250 XP from $30 off!",
    },
    recentActivity: [
      { amount: 150, type: "earn", source: "purchase", date: new Date().toISOString(), formattedDate: "Today" },
      { amount: 50, type: "earn", source: "streak_bonus", date: new Date(Date.now() - 86400000).toISOString(), formattedDate: "Yesterday" },
      { amount: 25, type: "earn", source: "quiz_complete", date: new Date(Date.now() - 172800000).toISOString(), formattedDate: "2 days ago" },
    ],
    recentAchievements: [
      { id: "first_purchase", earnedAt: new Date(Date.now() - 604800000).toISOString() },
      { id: "7_day_streak", earnedAt: new Date(Date.now() - 432000000).toISOString() },
    ],
    stats: {
      totalEarned: 3250,
      totalRedeemed: 500,
      totalSaved: 5,
      achievementCount: 8,
      daysActive: 12,
    },
  };
}
