"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coins, Star, Sparkles, Gift, Trophy, Flame, ArrowRight, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { formatXP, EarnResult, getLevel, getNextDiscountTier } from "@/lib/xp-economy";
import { triggerXPEarn } from "@/hooks/useXPBalance";

interface PurchaseCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseAmount: number;
  xpResult: EarnResult;
  orderId: string;
  itemCount: number;
  newTotalXP?: number;
  isFirstPurchase?: boolean;
  streakDays?: number;
}

export function PurchaseCelebration({
  isOpen,
  onClose,
  purchaseAmount,
  xpResult,
  orderId,
  itemCount,
  newTotalXP = 0,
  isFirstPurchase = false,
  streakDays = 0,
}: PurchaseCelebrationProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Level calculations
  const levelInfo = getLevel(newTotalXP);
  const nextTierInfo = getNextDiscountTier(newTotalXP);

  // Trigger confetti and XP animation on open
  useEffect(() => {
    if (isOpen) {
      // Base confetti
      const baseCount = 50;
      const bonusCount = xpResult.bonusType ? 100 : 0;

      confetti({
        particleCount: baseCount + bonusCount,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#40E0D0", "#00CED1", "#FFD700", "#48D1CC", "#FAFAD2"],
      });

      // Extra celebration for jackpot
      if (xpResult.bonusType === "JACKPOT!") {
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.5, x: 0.3 },
            colors: ["#FFD700", "#FFA500", "#FF6347"],
          });
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.5, x: 0.7 },
            colors: ["#FFD700", "#FFA500", "#FF6347"],
          });
        }, 300);

        // Gold rain for jackpot
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        const goldRain = () => {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: ["#FFD700"],
            shapes: ["circle"],
          });
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: ["#FFD700"],
            shapes: ["circle"],
          });

          if (Date.now() < end) {
            requestAnimationFrame(goldRain);
          }
        };

        goldRain();
      }

      // Trigger XP earned event for widgets to update
      triggerXPEarn(xpResult.totalXP, xpResult.bonusType || undefined);

      // Show details after initial celebration
      setTimeout(() => setShowDetails(true), 800);
    }
  }, [isOpen, xpResult]);

  // Close handler
  const handleClose = () => {
    setShowDetails(false);
    onClose();
  };

  // Rarity-based styling
  const getRarityStyles = () => {
    if (xpResult.bonusType === "JACKPOT!") {
      return {
        gradient: "from-yellow-500 via-orange-500 to-red-500",
        textColor: "text-yellow-400",
        bgColor: "bg-gradient-to-br from-yellow-900/50 to-orange-900/50",
        icon: Trophy,
        animation: "animate-pulse",
      };
    }
    if (xpResult.bonusType === "Super Bonus!") {
      return {
        gradient: "from-purple-500 via-pink-500 to-red-500",
        textColor: "text-purple-400",
        bgColor: "bg-gradient-to-br from-purple-900/50 to-pink-900/50",
        icon: Star,
        animation: "",
      };
    }
    if (xpResult.bonusType === "Bonus!") {
      return {
        gradient: "from-tiffany to-blue-500",
        textColor: "text-tiffany",
        bgColor: "bg-gradient-to-br from-tiffany/20 to-blue-900/30",
        icon: Sparkles,
        animation: "",
      };
    }
    return {
      gradient: "from-tiffany to-tiffany-dark",
      textColor: "text-tiffany",
      bgColor: "bg-gray-900/90",
      icon: Coins,
      animation: "",
    };
  };

  const styles = getRarityStyles();
  const IconComponent = styles.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className={`relative max-w-md w-full rounded-3xl ${styles.bgColor} border border-white/10 overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background decoration */}
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-10`} />

            {/* Animated circles */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="relative p-8 text-center space-y-6">
              {/* Success checkmark */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </motion.div>
              </div>

              {/* Purchase confirmed */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Purchase Complete!
                </h2>
                <p className="text-white/70">
                  Order #{orderId.slice(-8).toUpperCase()} • {itemCount} item{itemCount !== 1 ? "s" : ""}
                </p>
              </div>

              {/* XP Earned - The big moment */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className={`p-6 rounded-2xl bg-gradient-to-br ${styles.gradient} ${styles.animation}`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <IconComponent className="h-8 w-8 text-white" />
                  {xpResult.bonusType && (
                    <span className="text-xl font-bold text-white/90">
                      {xpResult.bonusType}
                    </span>
                  )}
                </div>
                <div className="text-5xl font-bold text-white mb-1">
                  +{formatXP(xpResult.totalXP)} XP
                </div>
                {xpResult.bonusXP > 0 && (
                  <div className="text-white/80 text-sm">
                    Base {formatXP(xpResult.baseXP)} + {formatXP(xpResult.bonusXP)} bonus!
                  </div>
                )}
              </motion.div>

              {/* Additional rewards */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3"
                  >
                    {/* First purchase bonus */}
                    {isFirstPurchase && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center justify-between p-3 bg-white/10 rounded-xl"
                      >
                        <div className="flex items-center gap-2">
                          <Gift className="h-5 w-5 text-pink-400" />
                          <span className="text-white">First Purchase Bonus</span>
                        </div>
                        <span className="text-pink-400 font-bold">+250 XP</span>
                      </motion.div>
                    )}

                    {/* Streak bonus */}
                    {streakDays > 0 && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center justify-between p-3 bg-white/10 rounded-xl"
                      >
                        <div className="flex items-center gap-2">
                          <Flame className="h-5 w-5 text-orange-400" />
                          <span className="text-white">{streakDays}-Day Streak</span>
                        </div>
                        <span className="text-orange-400 font-bold">+{streakDays * 15} XP</span>
                      </motion.div>
                    )}

                    {/* New level info */}
                    <div className="p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                        <span>Level {levelInfo.level} • {levelInfo.title}</span>
                        <span>{levelInfo.progress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: `${levelInfo.progress}%` }}
                          transition={{ delay: 0.8, duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-tiffany to-tiffany-dark rounded-full"
                        />
                      </div>
                    </div>

                    {/* Next discount tier */}
                    {nextTierInfo.nextTier && (
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="text-sm text-amber-400 text-center"
                      >
                        <Sparkles className="h-4 w-4 inline mr-1" />
                        {nextTierInfo.message}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Continue shopping CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-col gap-3"
              >
                <a
                  href="/dashboard"
                  className="w-full py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  View Your Progress
                  <ArrowRight className="h-4 w-4" />
                </a>
                <button
                  onClick={handleClose}
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Continue Shopping
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to show purchase celebration
 */
export function usePurchaseCelebration() {
  const [celebrationState, setCelebrationState] = useState<{
    isOpen: boolean;
    props: Omit<PurchaseCelebrationProps, "isOpen" | "onClose"> | null;
  }>({
    isOpen: false,
    props: null,
  });

  const showCelebration = (props: Omit<PurchaseCelebrationProps, "isOpen" | "onClose">) => {
    setCelebrationState({ isOpen: true, props });
  };

  const closeCelebration = () => {
    setCelebrationState({ isOpen: false, props: null });
  };

  const CelebrationComponent = () => {
    if (!celebrationState.props) return null;
    return (
      <PurchaseCelebration
        {...celebrationState.props}
        isOpen={celebrationState.isOpen}
        onClose={closeCelebration}
      />
    );
  };

  return {
    showCelebration,
    closeCelebration,
    CelebrationComponent,
  };
}

export default PurchaseCelebration;
