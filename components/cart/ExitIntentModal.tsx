"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Coins, Sparkles, Clock, TrendingUp, Gift, AlertTriangle } from "lucide-react";
import { useExitIntent } from "@/hooks/useExitIntent";
import {
  formatXP,
  getNearMissMessage,
  calculatePurchaseXP,
  getLevel,
  xpToDiscount,
} from "@/lib/xp-economy";

interface ExitIntentModalProps {
  cartTotal: number;
  itemCount: number;
  userXP: number;
  streakDays?: number;
  onContinueShopping: () => void;
  onCheckout: () => void;
  enabled?: boolean;
}

export function ExitIntentModal({
  cartTotal,
  itemCount,
  userXP,
  streakDays = 0,
  onContinueShopping,
  onCheckout,
  enabled = true,
}: ExitIntentModalProps) {
  const { triggered, dismiss } = useExitIntent({
    delay: 3000, // Wait 3 seconds before enabling
    threshold: 20,
    oncePerSession: true,
    cookieKey: "cart_exit_intent",
  });

  const [isOpen, setIsOpen] = useState(false);

  // Open modal when exit intent triggered
  useEffect(() => {
    if (triggered && enabled && itemCount > 0) {
      setIsOpen(true);
    }
  }, [triggered, enabled, itemCount]);

  // Calculate what they could earn
  const purchaseXP = useMemo(
    () => calculatePurchaseXP(cartTotal),
    [cartTotal]
  );

  const nearMissInfo = useMemo(
    () => getNearMissMessage(userXP, cartTotal, purchaseXP.totalXP),
    [userXP, cartTotal, purchaseXP.totalXP]
  );

  const levelInfo = useMemo(
    () => getLevel(userXP + purchaseXP.totalXP),
    [userXP, purchaseXP.totalXP]
  );

  const potentialDiscount = useMemo(
    () => xpToDiscount(userXP + purchaseXP.totalXP),
    [userXP, purchaseXP.totalXP]
  );

  const handleClose = () => {
    setIsOpen(false);
    dismiss();
  };

  const handleCheckout = () => {
    handleClose();
    onCheckout();
  };

  const handleContinue = () => {
    handleClose();
    onContinueShopping();
  };

  if (!enabled || itemCount === 0) return null;

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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient */}
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-tiffany via-blue-500 to-purple-500" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="p-6 pt-8 space-y-5">
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Wait! Don&apos;t leave yet!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  You have {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
                </p>
              </div>

              {/* XP You'll Miss Out On */}
              <div className="bg-gradient-to-r from-tiffany/10 to-blue-500/10 dark:from-tiffany/20 dark:to-blue-500/20 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Coins className="h-5 w-5 text-tiffany" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    You&apos;ll earn
                  </span>
                </div>
                <div className="text-3xl font-bold text-tiffany">
                  +{formatXP(purchaseXP.totalXP)} XP
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Worth ${potentialDiscount} in future discounts
                </div>
              </div>

              {/* Near-Miss Messages */}
              <div className="space-y-3">
                {/* XP Tier Near-Miss */}
                {nearMissInfo.hasNearMiss && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-amber-800 dark:text-amber-300">
                        So Close!
                      </div>
                      <div className="text-sm text-amber-700 dark:text-amber-400">
                        {nearMissInfo.message}
                      </div>
                    </div>
                  </div>
                )}

                {/* Level Progress */}
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-800 dark:text-blue-300">
                      Level Up Progress
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-400">
                      This purchase brings you to Level {levelInfo.level} ({levelInfo.title})
                    </div>
                  </div>
                </div>

                {/* Streak Bonus */}
                {streakDays > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Gift className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-orange-800 dark:text-orange-300">
                        Streak Bonus Active
                      </div>
                      <div className="text-sm text-orange-700 dark:text-orange-400">
                        Your {streakDays}-day streak is adding +{streakDays * 5}% bonus XP
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Urgency Message */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Your cart items are reserved for a limited time</span>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-tiffany text-white font-semibold rounded-xl hover:bg-tiffany-dark transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Complete Purchase
                </button>
                <button
                  onClick={handleContinue}
                  className="w-full py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Keep Shopping
                </button>
                <button
                  onClick={handleClose}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Simplified exit intent for product pages (not cart)
 * Shows newsletter signup or special offer instead
 */
export function ProductExitIntentModal({
  onClose,
  onSubscribe,
}: {
  onClose: () => void;
  onSubscribe: (email: string) => void;
}) {
  const { triggered, dismiss } = useExitIntent({
    delay: 10000, // Wait 10 seconds on product pages
    threshold: 20,
    oncePerSession: true,
    cookieKey: "product_exit_intent",
  });

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (triggered) {
      setIsOpen(true);
    }
  }, [triggered]);

  const handleClose = () => {
    setIsOpen(false);
    dismiss();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onSubscribe(email);
      handleClose();
    }
  };

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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-tiffany/10 rounded-full flex items-center justify-center">
                <Gift className="h-8 w-8 text-tiffany" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Wait! Get 10% Off Your First Order
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Plus earn 100 bonus XP just for subscribing!
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-tiffany"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-tiffany text-white font-semibold rounded-xl hover:bg-tiffany-dark transition-colors"
                >
                  Get My 10% Off + 100 XP
                </button>
              </form>

              <button
                onClick={handleClose}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                No thanks, I&apos;ll pay full price
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ExitIntentModal;
