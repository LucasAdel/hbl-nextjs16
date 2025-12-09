"use client";

import { useState, useEffect, useMemo } from "react";
import { Coins, ChevronDown, ChevronUp, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import {
  XP_CONFIG,
  xpToDiscount,
  discountToXP,
  calculateMaxRedeemableXP,
  formatXP,
  formatDiscount,
  getNextDiscountTier,
} from "@/lib/xp-economy";

interface XPRedemptionProps {
  orderTotal: number;
  onRedemptionChange: (xpToRedeem: number, discountAmount: number) => void;
  className?: string;
}

export function XPRedemption({
  orderTotal,
  onRedemptionChange,
  className = "",
}: XPRedemptionProps) {
  const [expanded, setExpanded] = useState(false);
  const [userXP, setUserXP] = useState(0);
  const [selectedXP, setSelectedXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  // Fetch user's XP balance
  useEffect(() => {
    const fetchXPBalance = async () => {
      try {
        const response = await fetch("/api/xp/balance");
        if (response.ok) {
          const data = await response.json();
          setUserXP(data.availableXP || 0);
        }
      } catch {
        // Use mock data for demo
        setUserXP(1750); // Demo: user has 1750 XP ($17.50 potential discount)
      } finally {
        setLoading(false);
      }
    };

    fetchXPBalance();
  }, []);

  // Calculate redemption limits
  const redemptionInfo = useMemo(
    () => calculateMaxRedeemableXP(orderTotal, userXP),
    [orderTotal, userXP]
  );

  const nextTierInfo = useMemo(
    () => getNextDiscountTier(userXP),
    [userXP]
  );

  const discount = useMemo(
    () => xpToDiscount(selectedXP),
    [selectedXP]
  );

  // Quick redemption tiers based on user's available XP
  const quickTiers = useMemo(() => {
    return XP_CONFIG.DISCOUNT_TIERS
      .filter((tier) => tier.xp <= userXP && tier.xp <= redemptionInfo.maxXP)
      .slice(-4); // Show up to 4 tiers
  }, [userXP, redemptionInfo.maxXP]);

  const handleApplyRedemption = async () => {
    if (selectedXP === 0) return;

    setApplying(true);

    try {
      // Validate redemption with server
      const response = await fetch("/api/xp/validate-redemption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xpToRedeem: selectedXP,
          orderTotal,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onRedemptionChange(selectedXP, data.discountAmount || discount);
        setApplied(true);

        // Celebration!
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#40E0D0", "#00CED1", "#48D1CC"],
        });
      } else {
        // Fallback: apply locally
        onRedemptionChange(selectedXP, discount);
        setApplied(true);
      }
    } catch {
      // Offline fallback: apply locally
      onRedemptionChange(selectedXP, discount);
      setApplied(true);
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveRedemption = () => {
    setSelectedXP(0);
    setApplied(false);
    onRedemptionChange(0, 0);
  };

  const canRedeem = userXP >= XP_CONFIG.MIN_REDEMPTION_XP;
  const potentialDiscount = xpToDiscount(Math.min(userXP, redemptionInfo.maxXP));

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-tiffany/5 to-blue-500/5 rounded-lg p-4 animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    );
  }

  // Don't show if user has no XP
  if (userXP === 0) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-tiffany/10 to-blue-500/10 dark:from-tiffany/20 dark:to-blue-500/20 rounded-lg border border-tiffany/30 overflow-hidden ${className}`}>
      {/* Header - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-tiffany/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-tiffany/20 rounded-full">
            <Coins className="h-5 w-5 text-tiffany" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {applied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>XP Discount Applied!</span>
                </>
              ) : canRedeem ? (
                <>You have {formatXP(userXP)} XP</>
              ) : (
                <>Earn more XP for discounts</>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {applied ? (
                `Saving ${formatDiscount(discount)} with ${formatXP(selectedXP)} XP`
              ) : canRedeem ? (
                `Save up to ${formatDiscount(potentialDiscount)} on this order`
              ) : (
                nextTierInfo.message
              )}
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Applied state */}
          {applied ? (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-green-700 dark:text-green-400">
                    {formatDiscount(discount)} discount applied
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-500">
                    Using {formatXP(selectedXP)} XP
                  </div>
                </div>
                <button
                  onClick={handleRemoveRedemption}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : canRedeem ? (
            <>
              {/* XP Balance display */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Your XP Balance:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatXP(userXP)} XP
                </span>
              </div>

              {/* Quick tier buttons */}
              {quickTiers.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {quickTiers.map((tier) => (
                    <button
                      key={tier.xp}
                      onClick={() => setSelectedXP(tier.xp)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedXP === tier.xp
                          ? "border-tiffany bg-tiffany/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-tiffany/50"
                      }`}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {tier.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatXP(tier.xp)} XP
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Custom amount slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Custom amount:</span>
                  <span className="font-semibold text-tiffany">
                    {formatXP(selectedXP)} XP = {formatDiscount(discount)} off
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={redemptionInfo.maxXP}
                  step={100}
                  value={selectedXP}
                  onChange={(e) => setSelectedXP(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-tiffany"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0 XP</span>
                  <span>{formatXP(redemptionInfo.maxXP)} XP (max)</span>
                </div>
              </div>

              {/* Redemption info */}
              <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{redemptionInfo.reason}</span>
              </div>

              {/* Apply button */}
              <button
                onClick={handleApplyRedemption}
                disabled={selectedXP === 0 || applying}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedXP > 0
                    ? "bg-tiffany text-white hover:bg-tiffany-dark"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                {applying ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Apply {formatDiscount(discount)} Discount
                  </>
                )}
              </button>
            </>
          ) : (
            /* Not enough XP */
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium">
                    Need {formatXP(XP_CONFIG.MIN_REDEMPTION_XP - userXP)} more XP to unlock discounts
                  </div>
                  <div className="text-amber-500">
                    Minimum {formatXP(XP_CONFIG.MIN_REDEMPTION_XP)} XP required for $5 off
                  </div>
                </div>
              </div>

              {/* Ways to earn XP */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Quick ways to earn XP:
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>✓ Complete purchase: ~{Math.floor(orderTotal * 10)} XP</li>
                  <li>✓ Write a review: 50-100 XP</li>
                  <li>✓ Take compliance quiz: 200 XP</li>
                  <li>✓ Refer a friend: 75 XP</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact XP redemption preview for checkout summary
 */
export function XPRedemptionSummary({
  xpRedeemed,
  discountAmount,
  className = "",
}: {
  xpRedeemed: number;
  discountAmount: number;
  className?: string;
}) {
  if (xpRedeemed === 0) return null;

  return (
    <div className={`flex items-center justify-between text-green-600 ${className}`}>
      <span className="flex items-center gap-2">
        <Coins className="h-4 w-4" />
        XP Discount ({formatXP(xpRedeemed)} XP)
      </span>
      <span className="font-semibold">-{formatDiscount(discountAmount)}</span>
    </div>
  );
}

export default XPRedemption;
