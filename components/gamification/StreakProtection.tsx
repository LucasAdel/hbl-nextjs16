"use client";

import { useState, useEffect } from "react";
import { X, Flame, Shield, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface StreakProtectionProps {
  currentStreak: number;
  lastActiveDate: string | null;
  email: string;
}

export function StreakProtection({
  currentStreak,
  lastActiveDate,
  email,
}: StreakProtectionProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [hoursRemaining, setHoursRemaining] = useState<number | null>(null);
  const [freezeTokens, setFreezeTokens] = useState(0);

  useEffect(() => {
    if (!lastActiveDate || currentStreak === 0) return;

    const calculateTimeRemaining = () => {
      const lastActive = new Date(lastActiveDate);
      const now = new Date();

      // Calculate midnight of the next day after last active
      const nextMidnight = new Date(lastActive);
      nextMidnight.setDate(nextMidnight.getDate() + 2);
      nextMidnight.setHours(0, 0, 0, 0);

      const timeRemaining = nextMidnight.getTime() - now.getTime();
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));

      setHoursRemaining(hours);

      // Show warning if less than 8 hours remaining
      if (hours > 0 && hours < 8 && currentStreak >= 3) {
        setShowWarning(true);
      }

      // Show urgent warning if less than 2 hours
      if (hours > 0 && hours < 2 && currentStreak >= 7) {
        toast.warning(
          `⚠️ Your ${currentStreak}-day streak expires in ${hours} hour${hours !== 1 ? "s" : ""}!`,
          { duration: 10000 }
        );
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastActiveDate, currentStreak]);

  // Load freeze tokens from storage/API
  useEffect(() => {
    // In production, fetch from API
    const stored = localStorage.getItem(`streak_freeze_${email}`);
    if (stored) {
      setFreezeTokens(parseInt(stored, 10));
    }
  }, [email]);

  const handleUseFreeze = async () => {
    if (freezeTokens <= 0) {
      toast.error("No freeze tokens available!");
      return;
    }

    try {
      // In production, call API to apply freeze
      const newTokens = freezeTokens - 1;
      localStorage.setItem(`streak_freeze_${email}`, newTokens.toString());
      setFreezeTokens(newTokens);
      setShowWarning(false);

      toast.success("🛡️ Streak freeze applied! Your streak is protected for today.", {
        duration: 5000,
      });
    } catch (error) {
      toast.error("Failed to apply streak freeze");
    }
  };

  if (!showWarning || !hoursRemaining) return null;

  const urgencyLevel =
    hoursRemaining < 2 ? "critical" : hoursRemaining < 4 ? "warning" : "info";

  const colors = {
    critical: "from-red-500 to-orange-500 border-red-400",
    warning: "from-amber-500 to-yellow-500 border-amber-400",
    info: "from-blue-500 to-cyan-500 border-blue-400",
  };

  const bgColors = {
    critical: "bg-red-50 dark:bg-red-900/20",
    warning: "bg-amber-50 dark:bg-amber-900/20",
    info: "bg-blue-50 dark:bg-blue-900/20",
  };

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 rounded-xl shadow-xl border ${bgColors[urgencyLevel]} overflow-hidden animate-in slide-in-from-bottom-5 duration-500`}
    >
      {/* Gradient header */}
      <div className={`bg-gradient-to-r ${colors[urgencyLevel]} p-3 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {urgencyLevel === "critical" ? (
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            ) : (
              <Flame className="h-5 w-5" />
            )}
            <span className="font-bold">Streak at Risk!</span>
          </div>
          <button
            onClick={() => setShowWarning(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl">🔥</div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentStreak} Day Streak
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t lose your progress!
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
          <Clock className="h-4 w-4" />
          <span>
            {hoursRemaining < 1
              ? "Less than 1 hour remaining"
              : `${hoursRemaining} hour${hoursRemaining !== 1 ? "s" : ""} remaining`}
          </span>
        </div>

        <div className="space-y-2">
          {/* Primary action */}
          <button
            onClick={() => setShowWarning(false)}
            className="w-full py-3 bg-gradient-to-r from-tiffany to-tiffany-dark text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Complete an Activity Now
          </button>

          {/* Freeze option */}
          {freezeTokens > 0 && (
            <button
              onClick={handleUseFreeze}
              className="w-full py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Use Streak Freeze ({freezeTokens} remaining)
            </button>
          )}
        </div>

        {/* Motivational message */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
          {currentStreak >= 30
            ? "You're a legend! Don't break your incredible streak!"
            : currentStreak >= 14
            ? "Two weeks strong! Keep the momentum going!"
            : currentStreak >= 7
            ? "One week down! You're building a great habit!"
            : "Great start! Maintain your streak for bonus XP!"}
        </p>
      </div>
    </div>
  );
}

// Hook to check streak status and trigger warnings
export function useStreakProtection(email: string | null) {
  const [streakData, setStreakData] = useState<{
    currentStreak: number;
    lastActiveDate: string | null;
    isAtRisk: boolean;
  } | null>(null);

  useEffect(() => {
    if (!email) return;

    const checkStreak = async () => {
      try {
        const response = await fetch(
          `/api/gamification?email=${encodeURIComponent(email)}`
        );
        if (response.ok) {
          const data = await response.json();

          const lastActive = data.last_active_date
            ? new Date(data.last_active_date)
            : null;
          const now = new Date();

          let isAtRisk = false;
          if (lastActive && data.current_streak > 0) {
            const hoursSinceActive =
              (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
            isAtRisk = hoursSinceActive >= 16; // At risk if more than 16 hours
          }

          setStreakData({
            currentStreak: data.current_streak || 0,
            lastActiveDate: data.last_active_date,
            isAtRisk,
          });
        }
      } catch (error) {
        console.error("Failed to check streak status:", error);
      }
    };

    checkStreak();
    // Check every 30 minutes
    const interval = setInterval(checkStreak, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [email]);

  return streakData;
}

export default StreakProtection;
