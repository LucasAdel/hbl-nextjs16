"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins, TrendingUp, Target, Gift, Star, ChevronRight, Sparkles,
  Calendar, Flame, Trophy, Users, ShoppingBag, ArrowUp, Zap
} from "lucide-react";
import { formatXP, xpToDiscount, XP_CONFIG, getLevel, getMembershipTier, getNextDiscountTier } from "@/lib/xp-economy";

interface ProgressData {
  totalXP: number;
  availableXP: number;
  lifetimeXP: number;
  redeemedXP: number;
  lifetimeSpend: number;
  streakDays: number;
  level: number;
  levelTitle: string;
  tier: string;
  totalSaved: number;
  projectedSavings: number;
  recentActivity: {
    type: string;
    xp: number;
    description: string;
    timestamp: string;
  }[];
  milestones: {
    name: string;
    target: number;
    current: number;
    reward: number;
    completed: boolean;
  }[];
}

interface EnhancedProgressProps {
  userId?: string;
  className?: string;
}

/**
 * Enhanced Progress Dashboard Component
 * Shows XP savings calculator, visual roadmap, and progress metrics
 */
export function EnhancedProgress({
  userId,
  className = "",
}: EnhancedProgressProps) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "milestones" | "activity">("overview");

  // Fetch progress data
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch("/api/gamification/progress");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch {
        // Demo data
        setData(generateDemoProgressData());
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  // Calculate derived metrics
  const metrics = useMemo(() => {
    if (!data) return null;

    const levelInfo = getLevel(data.lifetimeXP);
    const tierInfo = getMembershipTier(data.lifetimeSpend, data.lifetimeXP);
    const nextDiscountInfo = getNextDiscountTier(data.availableXP);
    const currentDiscount = xpToDiscount(data.availableXP);

    // Calculate projected monthly savings based on current activity
    const monthlyXPRate = data.lifetimeXP / Math.max(1, getMonthsSinceStart());
    const projectedMonthlyDiscount = xpToDiscount(monthlyXPRate);

    return {
      levelInfo,
      tierInfo,
      nextDiscountInfo,
      currentDiscount,
      projectedMonthlyDiscount,
      xpEarnRate: monthlyXPRate,
    };
  }, [data]);

  if (loading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || !metrics) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Progress Card */}
      <div className="bg-gradient-to-br from-tiffany/10 via-blue-500/10 to-purple-500/10 dark:from-tiffany/20 dark:via-blue-500/20 dark:to-purple-500/20 rounded-2xl p-6 border border-tiffany/20">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* XP Circle */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-gray-200 dark:stroke-gray-700"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-tiffany"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${metrics.levelInfo.progress * 3.02} 302`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.level}
                </span>
                <span className="text-xs text-gray-500">Level</span>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {data.levelTitle}
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatXP(data.availableXP)} XP
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-green-600 font-semibold">
                  ${metrics.currentDiscount}
                </span>
                <span className="text-sm text-gray-500">available</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickStat
              icon={Flame}
              label="Streak"
              value={`${data.streakDays} days`}
              subValue={`+${Math.min(data.streakDays * 5, 100)}% bonus`}
              iconColor="text-orange-500"
              bgColor="bg-orange-100 dark:bg-orange-900/30"
            />
            <QuickStat
              icon={Gift}
              label="Total Saved"
              value={`$${data.totalSaved.toFixed(0)}`}
              subValue="all time"
              iconColor="text-green-500"
              bgColor="bg-green-100 dark:bg-green-900/30"
            />
            <QuickStat
              icon={Star}
              label="Tier"
              value={data.tier}
              subValue={metrics.tierInfo.discount > 0 ? `${metrics.tierInfo.discount}% off` : "Standard"}
              iconColor="text-purple-500"
              bgColor="bg-purple-100 dark:bg-purple-900/30"
            />
            <QuickStat
              icon={TrendingUp}
              label="Projected"
              value={`$${metrics.projectedMonthlyDiscount}/mo`}
              subValue="savings rate"
              iconColor="text-blue-500"
              bgColor="bg-blue-100 dark:bg-blue-900/30"
            />
          </div>
        </div>

        {/* Progress to Next Tier */}
        {metrics.nextDiscountInfo.nextTier && (
          <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Next reward: {metrics.nextDiscountInfo.nextTier.label}
              </span>
              <span className="text-sm text-tiffany font-semibold">
                {formatXP(metrics.nextDiscountInfo.xpNeeded)} XP to go
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(
                    (data.availableXP / metrics.nextDiscountInfo.nextTier.xp) * 100,
                    100
                  )}%`,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-tiffany to-blue-500 rounded-full"
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{formatXP(data.availableXP)} XP</span>
              <span>{formatXP(metrics.nextDiscountInfo.nextTier.xp)} XP</span>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: "overview", label: "Overview", icon: Zap },
          { id: "milestones", label: "Milestones", icon: Target },
          { id: "activity", label: "Activity", icon: Calendar },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "text-tiffany border-tiffany"
                : "text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* XP Roadmap */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-tiffany" />
                XP Discount Roadmap
              </h3>
              <div className="space-y-4">
                {XP_CONFIG.DISCOUNT_TIERS.slice(0, 5).map((tier, idx) => {
                  const isCompleted = data.availableXP >= tier.xp;
                  const isNext =
                    !isCompleted &&
                    (idx === 0 || data.availableXP >= XP_CONFIG.DISCOUNT_TIERS[idx - 1].xp);

                  return (
                    <div key={tier.xp} className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isNext
                            ? "bg-tiffany text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                        }`}
                      >
                        {isCompleted ? (
                          <Sparkles className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-bold">{idx + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span
                            className={`font-medium ${
                              isCompleted
                                ? "text-green-600"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {tier.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatXP(tier.xp)} XP
                          </span>
                        </div>
                        {isNext && (
                          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                            <div
                              className="h-full bg-tiffany rounded-full"
                              style={{
                                width: `${(data.availableXP / tier.xp) * 100}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Savings Calculator */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Coins className="h-5 w-5 text-tiffany" />
                Savings Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-green-700 dark:text-green-400">
                    Total Saved (All Time)
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ${data.totalSaved.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-blue-700 dark:text-blue-400">
                    Available to Redeem
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    ${metrics.currentDiscount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-purple-700 dark:text-purple-400">
                    Projected This Month
                  </span>
                  <span className="text-lg font-bold text-purple-600">
                    +${data.projectedSavings.toFixed(2)}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href="/shop"
                    className="w-full py-3 bg-tiffany text-white font-semibold rounded-xl hover:bg-tiffany-dark transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Shop & Earn More XP
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "milestones" && (
          <motion.div
            key="milestones"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="space-y-4">
              {data.milestones.map((milestone, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    milestone.completed
                      ? "bg-green-50 dark:bg-green-900/20"
                      : "bg-gray-50 dark:bg-gray-900/50"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      milestone.completed
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                    }`}
                  >
                    {milestone.completed ? (
                      <Trophy className="h-6 w-6" />
                    ) : (
                      <Target className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-medium ${
                          milestone.completed
                            ? "text-green-700 dark:text-green-400"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {milestone.name}
                      </span>
                      <span className="text-tiffany font-semibold">
                        +{formatXP(milestone.reward)} XP
                      </span>
                    </div>
                    {!milestone.completed && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>
                            {milestone.current} / {milestone.target}
                          </span>
                          <span>
                            {Math.round((milestone.current / milestone.target) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-tiffany rounded-full"
                            style={{
                              width: `${(milestone.current / milestone.target) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="space-y-4">
              {data.recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-tiffany/10 rounded-full flex items-center justify-center">
                    <Coins className="h-5 w-5 text-tiffany" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {activity.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatRelativeTime(activity.timestamp)}
                    </div>
                  </div>
                  <div className="text-green-600 font-semibold">
                    +{formatXP(activity.xp)} XP
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Quick stat component
function QuickStat({
  icon: Icon,
  label,
  value,
  subValue,
  iconColor,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue: string;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${bgColor}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className="font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs text-gray-500">{subValue}</div>
    </div>
  );
}

// Helper functions
function getMonthsSinceStart(): number {
  // Would calculate from actual account creation date
  return 3;
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Generate demo data
function generateDemoProgressData(): ProgressData {
  return {
    totalXP: 2500,
    availableXP: 1750,
    lifetimeXP: 3500,
    redeemedXP: 750,
    lifetimeSpend: 450,
    streakDays: 12,
    level: 5,
    levelTitle: "Expert",
    tier: "Silver",
    totalSaved: 45,
    projectedSavings: 25,
    recentActivity: [
      { type: "purchase", xp: 150, description: "Purchase completed", timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
      { type: "review", xp: 75, description: "Wrote a review", timestamp: new Date(Date.now() - 24 * 3600000).toISOString() },
      { type: "daily", xp: 10, description: "Daily visit bonus", timestamp: new Date(Date.now() - 48 * 3600000).toISOString() },
      { type: "streak", xp: 105, description: "7-day streak milestone", timestamp: new Date(Date.now() - 5 * 24 * 3600000).toISOString() },
      { type: "quiz", xp: 200, description: "Completed compliance quiz", timestamp: new Date(Date.now() - 7 * 24 * 3600000).toISOString() },
    ],
    milestones: [
      { name: "First Purchase", target: 1, current: 1, reward: 250, completed: true },
      { name: "Write 3 Reviews", target: 3, current: 2, reward: 150, completed: false },
      { name: "7-Day Streak", target: 7, current: 7, reward: 200, completed: true },
      { name: "Refer 5 Friends", target: 5, current: 2, reward: 500, completed: false },
      { name: "Complete Quiz", target: 1, current: 1, reward: 200, completed: true },
    ],
  };
}

export default EnhancedProgress;
