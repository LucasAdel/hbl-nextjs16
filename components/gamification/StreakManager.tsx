"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Snowflake, Shield, Clock, AlertTriangle, CheckCircle2,
  Calendar, ChevronRight, Zap, Gift, TrendingUp
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatXP } from "@/lib/xp-economy";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  freezeTokens: number;
  maxFreezeTokens: number;
  lastActivityDate: string;
  streakAtRisk: boolean;
  hoursUntilLoss: number;
  nextMilestone: {
    days: number;
    reward: number;
    freezeToken: boolean;
  };
  weeklyActivity: boolean[];
}

interface StreakManagerProps {
  userId?: string;
  className?: string;
  variant?: "full" | "compact" | "inline";
  onStreakUpdate?: (streak: number) => void;
}

/**
 * Streak Manager Component
 * Displays streak status, freeze tokens, and streak protection options
 */
export function StreakManager({
  userId,
  className = "",
  variant = "full",
  onStreakUpdate,
}: StreakManagerProps) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFreeze, setUsingFreeze] = useState(false);
  const [showFreezeConfirm, setShowFreezeConfirm] = useState(false);

  // Fetch streak data
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const response = await fetch("/api/gamification/streak");
        if (response.ok) {
          const data = await response.json();
          setStreakData(data);
          onStreakUpdate?.(data.currentStreak);
        }
      } catch {
        // Demo data
        setStreakData(generateDemoStreak());
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();

    // Check for at-risk notifications
    const checkAtRisk = setInterval(() => {
      fetchStreak();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(checkAtRisk);
  }, [userId, onStreakUpdate]);

  // Use freeze token
  const handleUseFreeze = async () => {
    if (!streakData || streakData.freezeTokens === 0 || usingFreeze) return;

    setUsingFreeze(true);

    try {
      const response = await fetch("/api/gamification/streak/freeze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "use" }),
      });

      if (response.ok) {
        const data = await response.json();
        setStreakData((prev) =>
          prev
            ? {
                ...prev,
                freezeTokens: prev.freezeTokens - 1,
                streakAtRisk: false,
              }
            : prev
        );

        // Celebrate!
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#87CEEB", "#ADD8E6", "#B0E0E6"],
        });

        setShowFreezeConfirm(false);
      }
    } catch {
      console.error("Failed to use freeze token");
    } finally {
      setUsingFreeze(false);
    }
  };

  // Calculate streak XP bonus
  const streakXPBonus = useMemo(() => {
    if (!streakData) return 0;
    return Math.min(streakData.currentStreak * 5, 100); // Max 100% bonus
  }, [streakData]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    );
  }

  if (!streakData) return null;

  // Inline variant - minimal display
  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
          streakData.streakAtRisk
            ? "bg-red-100 dark:bg-red-900/30 text-red-600"
            : "bg-orange-100 dark:bg-orange-900/30 text-orange-600"
        }`}>
          <Flame className="h-4 w-4" />
          <span className="font-bold">{streakData.currentStreak}</span>
        </div>
        {streakData.freezeTokens > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full">
            <Snowflake className="h-3 w-3" />
            <span className="text-xs">{streakData.freezeTokens}</span>
          </div>
        )}
      </div>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <div className={`p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                streakData.streakAtRisk
                  ? "bg-red-500"
                  : "bg-gradient-to-br from-orange-500 to-red-500"
              }`}>
                <Flame className="h-6 w-6 text-white" />
              </div>
              {streakData.streakAtRisk && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center"
                >
                  <AlertTriangle className="h-3 w-3 text-white" />
                </motion.div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {streakData.currentStreak}
                </span>
                <span className="text-gray-600 dark:text-gray-400">day streak</span>
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">
                +{streakXPBonus}% XP bonus
              </div>
            </div>
          </div>

          {streakData.freezeTokens > 0 && (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Snowflake className="h-4 w-4 text-blue-500" />
                <span className="font-bold text-blue-600">{streakData.freezeTokens}</span>
              </div>
              <span className="text-xs text-gray-500 mt-1">freezes</span>
            </div>
          )}
        </div>

        {/* At-risk warning */}
        <AnimatePresence>
          {streakData.streakAtRisk && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Streak at risk! {streakData.hoursUntilLoss}h left
                  </span>
                </div>
                {streakData.freezeTokens > 0 && (
                  <button
                    onClick={() => setShowFreezeConfirm(true)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Use Freeze
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-900/30 dark:to-red-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                streakData.streakAtRisk
                  ? "bg-red-500"
                  : "bg-gradient-to-br from-orange-500 to-red-500"
              }`}>
                <Flame className="h-8 w-8 text-white" />
              </div>
              {streakData.streakAtRisk && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center"
                >
                  <AlertTriangle className="h-4 w-4 text-white" />
                </motion.div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {streakData.currentStreak}
                </span>
                <span className="text-xl text-gray-600 dark:text-gray-400">
                  day{streakData.currentStreak !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  +{streakXPBonus}% XP bonus active
                </span>
                {streakData.longestStreak > streakData.currentStreak && (
                  <span className="text-gray-500">
                    Best: {streakData.longestStreak} days
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Freeze Tokens */}
          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              {Array.from({ length: streakData.maxFreezeTokens }).map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i < streakData.freezeTokens
                      ? "bg-blue-500"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <Snowflake
                    className={`h-4 w-4 ${
                      i < streakData.freezeTokens ? "text-white" : "text-gray-400"
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Freeze Tokens
            </div>
          </div>
        </div>
      </div>

      {/* At-risk warning */}
      <AnimatePresence>
        {streakData.streakAtRisk && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <Clock className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="font-semibold text-red-700 dark:text-red-400">
                    Your streak is at risk!
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-500">
                    Complete an action in the next {streakData.hoursUntilLoss} hours to keep your streak
                  </div>
                </div>
              </div>
              {streakData.freezeTokens > 0 && (
                <button
                  onClick={() => setShowFreezeConfirm(true)}
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Protect Streak
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly activity */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            This Week
          </span>
          <Calendar className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex justify-between">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div key={i} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{day}</div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  streakData.weeklyActivity[i]
                    ? "bg-green-500 text-white"
                    : i === new Date().getDay()
                    ? "border-2 border-tiffany text-tiffany"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                {streakData.weeklyActivity[i] ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : i === new Date().getDay() ? (
                  <span className="text-xs font-bold">!</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next milestone */}
      <div className="p-6">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Gift className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Next milestone in {streakData.nextMilestone.days - streakData.currentStreak} days
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {streakData.nextMilestone.days}-Day Streak
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-purple-600 font-bold">
              +{formatXP(streakData.nextMilestone.reward)} XP
            </div>
            {streakData.nextMilestone.freezeToken && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Snowflake className="h-3 w-3" />
                +1 Freeze Token
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Freeze Confirmation Modal */}
      <AnimatePresence>
        {showFreezeConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowFreezeConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Snowflake className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Use Freeze Token?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This will protect your {streakData.currentStreak}-day streak for 24 hours.
                  You have {streakData.freezeTokens} token{streakData.freezeTokens !== 1 ? "s" : ""} remaining.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFreezeConfirm(false)}
                    className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUseFreeze}
                    disabled={usingFreeze}
                    className="flex-1 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {usingFreeze ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Protect Streak
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Streak at-risk notification banner
 */
export function StreakAtRiskBanner({
  streak,
  hoursRemaining,
  freezeTokens,
  onUseFreeze,
  onDismiss,
  className = "",
}: {
  streak: number;
  hoursRemaining: number;
  freezeTokens: number;
  onUseFreeze: () => void;
  onDismiss: () => void;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Flame className="h-8 w-8" />
          </motion.div>
          <div>
            <div className="font-bold">
              Your {streak}-day streak is at risk!
            </div>
            <div className="text-sm text-white/80">
              Complete an action in the next {hoursRemaining}h to keep it
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {freezeTokens > 0 && (
            <button
              onClick={onUseFreeze}
              className="px-4 py-2 bg-white text-red-600 font-semibold rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2"
            >
              <Snowflake className="h-4 w-4" />
              Use Freeze ({freezeTokens})
            </button>
          )}
          <button
            onClick={onDismiss}
            className="px-4 py-2 bg-white/20 font-medium rounded-lg hover:bg-white/30 transition-colors"
          >
            Complete Task
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Generate demo streak data
function generateDemoStreak(): StreakData {
  const today = new Date().getDay();
  const weeklyActivity = Array.from({ length: 7 }, (_, i) => i <= today && Math.random() > 0.2);

  return {
    currentStreak: 7,
    longestStreak: 14,
    freezeTokens: 2,
    maxFreezeTokens: 3,
    lastActivityDate: new Date().toISOString(),
    streakAtRisk: Math.random() > 0.7,
    hoursUntilLoss: Math.floor(Math.random() * 12) + 1,
    nextMilestone: {
      days: 14,
      reward: 500,
      freezeToken: true,
    },
    weeklyActivity,
  };
}

export default StreakManager;
