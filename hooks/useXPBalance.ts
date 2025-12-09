"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserXPState,
  calculateUserXPState,
  getLevel,
  getNextDiscountTier,
  getMembershipTier,
  formatXP,
  xpToDiscount,
} from "@/lib/xp-economy";

interface XPBalanceData extends UserXPState {
  loading: boolean;
  error: string | null;
  nextDiscountTier: ReturnType<typeof getNextDiscountTier>;
  membershipInfo: ReturnType<typeof getMembershipTier>;
  potentialDiscount: number;
  formatted: {
    availableXP: string;
    lifetimeXP: string;
    potentialDiscount: string;
  };
  isDemo: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing XP balance state throughout the app
 * Provides real-time XP tracking, level info, and discount calculations
 */
export function useXPBalance(): XPBalanceData {
  const [state, setState] = useState<Omit<XPBalanceData, "refresh">>({
    totalXP: 0,
    availableXP: 0,
    lifetimeXP: 0,
    redeemedXP: 0,
    expiredXP: 0,
    level: 1,
    levelTitle: "Newcomer",
    xpToNextLevel: 500,
    progressToNextLevel: 0,
    tier: "bronze",
    tierDiscount: 0,
    loading: true,
    error: null,
    nextDiscountTier: { nextTier: null, xpNeeded: 0, message: "" },
    membershipInfo: {
      tier: "bronze",
      label: "Bronze",
      discount: 0,
      benefits: [],
      nextTier: null,
      spendToNextTier: 0,
      xpToNextTier: 0,
    },
    potentialDiscount: 0,
    formatted: {
      availableXP: "0",
      lifetimeXP: "0",
      potentialDiscount: "$0.00",
    },
    isDemo: false,
  });

  const fetchBalance = useCallback(async () => {
    try {
      const response = await fetch("/api/xp/balance");

      if (!response.ok) {
        throw new Error("Failed to fetch XP balance");
      }

      const data = await response.json();

      const xpState = calculateUserXPState(
        data.totalXP || 0,
        data.redeemedXP || 0,
        data.expiredXP || 0,
        data.lifetimeSpend || 0
      );

      const nextDiscountTier = getNextDiscountTier(xpState.availableXP);
      const membershipInfo = getMembershipTier(data.lifetimeSpend || 0, xpState.lifetimeXP);
      const potentialDiscount = xpToDiscount(xpState.availableXP);

      setState({
        ...xpState,
        loading: false,
        error: null,
        nextDiscountTier,
        membershipInfo,
        potentialDiscount,
        formatted: {
          availableXP: formatXP(xpState.availableXP),
          lifetimeXP: formatXP(xpState.lifetimeXP),
          potentialDiscount: `$${potentialDiscount.toFixed(2)}`,
        },
        isDemo: data.isDemo || false,
      });
    } catch {
      // Fallback to demo data
      const demoState = calculateUserXPState(1750, 500, 0, 250);
      const nextDiscountTier = getNextDiscountTier(demoState.availableXP);
      const membershipInfo = getMembershipTier(250, demoState.lifetimeXP);
      const potentialDiscount = xpToDiscount(demoState.availableXP);

      setState({
        ...demoState,
        loading: false,
        error: null,
        nextDiscountTier,
        membershipInfo,
        potentialDiscount,
        formatted: {
          availableXP: formatXP(demoState.availableXP),
          lifetimeXP: formatXP(demoState.lifetimeXP),
          potentialDiscount: `$${potentialDiscount.toFixed(2)}`,
        },
        isDemo: true,
      });
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Listen for XP changes
  useEffect(() => {
    const handleXPChange = () => {
      fetchBalance();
    };

    window.addEventListener("xp-earned", handleXPChange);
    window.addEventListener("xp-redeemed", handleXPChange);

    return () => {
      window.removeEventListener("xp-earned", handleXPChange);
      window.removeEventListener("xp-redeemed", handleXPChange);
    };
  }, [fetchBalance]);

  return {
    ...state,
    refresh: fetchBalance,
  };
}

/**
 * Trigger XP earn event (use after actions that award XP)
 */
export function triggerXPEarn(amount: number, bonusType?: string) {
  window.dispatchEvent(
    new CustomEvent("xp-earned", {
      detail: { amount, bonusType },
    })
  );
}

/**
 * Trigger XP redeemed event (use after checkout)
 */
export function triggerXPRedeemed(amount: number) {
  window.dispatchEvent(
    new CustomEvent("xp-redeemed", {
      detail: { amount },
    })
  );
}

export default useXPBalance;
