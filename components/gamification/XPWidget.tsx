"use client";

import { useState, useEffect, useMemo } from "react";
import { Coins, ChevronUp, ChevronDown, Sparkles, X, Zap, Target, Gift, Flame, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  XP_CONFIG,
  formatXP,
  getLevel,
  getNextDiscountTier,
  xpToDiscount,
} from "@/lib/xp-economy";

interface XPWidgetProps {
  initialXP?: number;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  className?: string;
}

export function XPWidget({
  initialXP,
  position = "bottom-right",
  className = "",
}: XPWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);
  const [userXP, setUserXP] = useState(initialXP || 0);
  const [prevXP, setPrevXP] = useState(initialXP || 0);
  const [loading, setLoading] = useState(true);
  const [streakDays, setStreakDays] = useState(0);
  const [showXPGain, setShowXPGain] = useState(false);
  const [xpGainAmount, setXPGainAmount] = useState(0);

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  // Fetch XP balance
  useEffect(() => {
    const fetchXPBalance = async () => {
      try {
        const response = await fetch("/api/xp/balance");
        if (response.ok) {
          const data = await response.json();
          setUserXP(data.availableXP || 0);
          setStreakDays(data.streakDays || 0);
        }
      } catch {
        // Demo fallback
        setUserXP(1750);
        setStreakDays(7);
      } finally {
        setLoading(false);
      }
    };

    fetchXPBalance();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchXPBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen for XP earn events
  useEffect(() => {
    const handleXPEarn = (event: CustomEvent<{ amount: number; bonusType?: string }>) => {
      const { amount } = event.detail;
      setPrevXP(userXP);
      setUserXP((prev) => prev + amount);
      setXPGainAmount(amount);
      setShowXPGain(true);

      // Celebrate big gains
      if (amount >= 100) {
        confetti({
          particleCount: Math.min(amount / 2, 100),
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#40E0D0", "#00CED1", "#FFD700"],
        });
      }

      setTimeout(() => setShowXPGain(false), 2500);
    };

    window.addEventListener("xp-earned" as never, handleXPEarn as never);
    return () => window.removeEventListener("xp-earned" as never, handleXPEarn as never);
  }, [userXP]);

  // Calculate level and tier info
  const levelInfo = useMemo(() => getLevel(userXP), [userXP]);
  const nextTierInfo = useMemo(() => getNextDiscountTier(userXP), [userXP]);
  const potentialDiscount = useMemo(() => xpToDiscount(userXP), [userXP]);

  // XP earning opportunities
  const earningOpportunities = [
    { icon: Target, label: "Daily Visit", xp: "+10 XP", completed: false },
    { icon: Flame, label: "7-Day Streak", xp: "+105 XP", completed: streakDays >= 7 },
    { icon: Gift, label: "Write Review", xp: "+50-100 XP", completed: false },
    { icon: TrendingUp, label: "Complete Quiz", xp: "+200 XP", completed: false },
  ];

  if (!visible) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <AnimatePresence>
        {/* XP Gain Animation */}
        {showXPGain && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-tiffany text-white px-4 py-2 rounded-full font-bold shadow-lg"
          >
            +{xpGainAmount} XP
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${
          expanded ? "w-80" : "w-auto"
        }`}
      >
        {/* Collapsed State - XP Balance Pill */}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-tiffany to-tiffany-dark rounded-full flex items-center justify-center">
                <Coins className="h-5 w-5 text-white" />
              </div>
              {/* Level badge */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white dark:border-gray-900">
                {levelInfo.level}
              </div>
            </div>

            <div className="text-left">
              {loading ? (
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                <>
                  <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                    {formatXP(userXP)} XP
                    {streakDays > 0 && (
                      <span className="flex items-center text-orange-500 text-xs">
                        <Flame className="h-3 w-3" />
                        {streakDays}
                      </span>
                    )}
                  </div>
                  {nextTierInfo.xpNeeded > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatXP(nextTierInfo.xpNeeded)} to ${nextTierInfo.nextTier?.discount}
                    </div>
                  )}
                </>
              )}
            </div>

            <ChevronUp className="h-4 w-4 text-gray-400" />
          </button>
        )}

        {/* Expanded State */}
        {expanded && (
          <div className="p-4 space-y-4">
            {/* Header with close */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-tiffany to-tiffany-dark rounded-full flex items-center justify-center">
                  <Coins className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {formatXP(userXP)} XP
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Level {levelInfo.level} • {levelInfo.title}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Discount Value */}
            <div className="bg-gradient-to-r from-tiffany/10 to-blue-500/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-tiffany">
                ${potentialDiscount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Available discount value
              </div>
            </div>

            {/* Progress to Next Tier */}
            {nextTierInfo.nextTier && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Next: ${nextTierInfo.nextTier.discount} off
                  </span>
                  <span className="font-semibold text-tiffany">
                    {formatXP(nextTierInfo.xpNeeded)} XP away
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-tiffany to-tiffany-dark rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        ((userXP - (nextTierInfo.nextTier.xp - nextTierInfo.xpNeeded - nextTierInfo.xpNeeded)) /
                          nextTierInfo.nextTier.xp) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-center text-amber-600 dark:text-amber-400 font-medium">
                  {nextTierInfo.message}
                </div>
              </div>
            )}

            {/* Level Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Level {levelInfo.level} → {levelInfo.level + 1}
                </span>
                <span className="text-gray-500">
                  {levelInfo.progress}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
            </div>

            {/* Earning Opportunities */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Ways to earn XP:
              </div>
              <div className="space-y-1">
                {earningOpportunities.map((opp, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                      opp.completed
                        ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <opp.icon className={`h-4 w-4 ${opp.completed ? "text-green-500" : "text-gray-400"}`} />
                      <span className={opp.completed ? "line-through" : ""}>
                        {opp.label}
                      </span>
                    </div>
                    <span className={`font-medium ${opp.completed ? "text-green-600" : "text-tiffany"}`}>
                      {opp.completed ? "✓" : opp.xp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak */}
            {streakDays > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="font-medium text-orange-700 dark:text-orange-400">
                    {streakDays}-day streak!
                  </span>
                </div>
                <span className="text-sm text-orange-600 dark:text-orange-400">
                  +{streakDays * 15} XP/day
                </span>
              </div>
            )}

            {/* CTA */}
            <a
              href="/shop"
              className="block w-full py-2.5 bg-tiffany text-white text-center rounded-xl font-semibold hover:bg-tiffany-dark transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                Shop & Earn XP
              </span>
            </a>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/**
 * Hook to trigger XP earned event
 */
export function useXPEarnTrigger() {
  const triggerXPEarn = (amount: number, bonusType?: string) => {
    window.dispatchEvent(
      new CustomEvent("xp-earned", {
        detail: { amount, bonusType },
      })
    );
  };

  return { triggerXPEarn };
}

/**
 * Mini XP display for navbars/headers
 */
export function XPBadge({ className = "" }: { className?: string }) {
  const [userXP, setUserXP] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchXP = async () => {
      try {
        const response = await fetch("/api/xp/balance");
        if (response.ok) {
          const data = await response.json();
          setUserXP(data.availableXP || 0);
        }
      } catch {
        setUserXP(1750);
      } finally {
        setLoading(false);
      }
    };

    fetchXP();
  }, []);

  if (loading) {
    return (
      <div className={`h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse ${className}`} />
    );
  }

  return (
    <div className={`flex items-center gap-1 px-2.5 py-1 bg-tiffany/10 rounded-full ${className}`}>
      <Coins className="h-4 w-4 text-tiffany" />
      <span className="text-sm font-semibold text-tiffany">{formatXP(userXP)}</span>
    </div>
  );
}

export default XPWidget;
