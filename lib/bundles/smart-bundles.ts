/**
 * Smart Bundles - BMAD Phase 2
 *
 * Dynamic package deals with:
 * - Pre-built bundles with savings
 * - Dynamic bundle suggestions based on cart
 * - XP bonuses for bundle purchases (3x normal)
 * - Variable reinforcement on bundle completion
 */

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  products: BundleProduct[];
  totalValue: number;
  bundlePrice: number;
  savings: number;
  savingsPercent: number;
  badge?: "best_value" | "most_popular" | "new" | "limited";
  category: BundleCategory;
  targetAudience: string[];
  xpMultiplier: number;
  popularityRank: number;
  purchaseCount: number;
}

export interface BundleProduct {
  productId: string;
  productName: string;
  originalPrice: number;
  included: boolean;
}

export type BundleCategory =
  | "starter"
  | "compliance"
  | "employment"
  | "telehealth"
  | "complete";

export interface DynamicBundleSuggestion {
  existingProducts: string[];
  suggestedProducts: BundleProduct[];
  bundle: Bundle;
  currentTotal: number;
  bundleTotal: number;
  additionalSavings: number;
  xpBonus: number;
  message: string;
}

export interface BundlePurchaseResult {
  bundleId: string;
  baseXp: number;
  bonusXp: number;
  totalXp: number;
  rarity: "normal" | "bonus" | "rare" | "jackpot";
  message: string;
  celebrationTier: "standard" | "great" | "amazing" | "legendary";
}

// XP multipliers for bundles
export const BUNDLE_XP = {
  baseMultiplier: 3, // 3x normal XP for bundles
  completePackage: 500, // Bonus for buying complete bundle
  firstBundle: 200, // First-time bundle buyer bonus
} as const;

// Pre-defined bundles
export const SMART_BUNDLES: Bundle[] = [
  {
    id: "new-practice-starter",
    name: "New Practice Starter Kit",
    slug: "new-practice-starter",
    description: "Everything you need to launch your practice with confidence. Includes all essential legal documents and compliance templates.",
    products: [
      { productId: "ahpra-compliance-bundle", productName: "AHPRA Compliance Bundle", originalPrice: 599, included: true },
      { productId: "employment-contract-pack", productName: "Employment Contract Pack", originalPrice: 349, included: true },
      { productId: "privacy-policy-bundle", productName: "Privacy Policy Bundle", originalPrice: 299, included: true },
      { productId: "patient-consent-forms", productName: "Patient Consent Forms", originalPrice: 199, included: true },
    ],
    totalValue: 1446,
    bundlePrice: 999,
    savings: 447,
    savingsPercent: 31,
    badge: "best_value",
    category: "starter",
    targetAudience: ["solo", "small"],
    xpMultiplier: 3,
    popularityRank: 1,
    purchaseCount: 234,
  },
  {
    id: "ahpra-complete",
    name: "AHPRA Complete Package",
    slug: "ahpra-complete",
    description: "Comprehensive AHPRA compliance coverage for medical practitioners. Stay compliant with all advertising and practice requirements.",
    products: [
      { productId: "ahpra-compliance-bundle", productName: "AHPRA Compliance Bundle", originalPrice: 599, included: true },
      { productId: "patient-consent-forms", productName: "Patient Consent Forms", originalPrice: 199, included: true },
      { productId: "privacy-policy-bundle", productName: "Privacy Policy Bundle", originalPrice: 299, included: true },
    ],
    totalValue: 1097,
    bundlePrice: 799,
    savings: 298,
    savingsPercent: 27,
    badge: "most_popular",
    category: "compliance",
    targetAudience: ["solo", "small", "medium"],
    xpMultiplier: 3,
    popularityRank: 2,
    purchaseCount: 456,
  },
  {
    id: "telehealth-professional",
    name: "Telehealth Professional Bundle",
    slug: "telehealth-professional",
    description: "Complete telehealth setup for virtual practice. Includes all necessary consent, privacy, and compliance documents.",
    products: [
      { productId: "telehealth-complete", productName: "Telehealth Complete Bundle", originalPrice: 449, included: true },
      { productId: "privacy-policy-bundle", productName: "Privacy Policy Bundle", originalPrice: 299, included: true },
      { productId: "patient-consent-forms", productName: "Patient Consent Forms", originalPrice: 199, included: true },
    ],
    totalValue: 947,
    bundlePrice: 699,
    savings: 248,
    savingsPercent: 26,
    badge: "new",
    category: "telehealth",
    targetAudience: ["solo", "small", "medium"],
    xpMultiplier: 3,
    popularityRank: 3,
    purchaseCount: 189,
  },
  {
    id: "employment-essentials",
    name: "Employment Essentials",
    slug: "employment-essentials",
    description: "All the employment documents you need to hire and manage staff. From contracts to policies.",
    products: [
      { productId: "employment-contract-pack", productName: "Employment Contract Pack", originalPrice: 349, included: true },
      { productId: "locum-agreement-template", productName: "Locum Agreement Template", originalPrice: 149, included: true },
    ],
    totalValue: 498,
    bundlePrice: 399,
    savings: 99,
    savingsPercent: 20,
    category: "employment",
    targetAudience: ["small", "medium", "large"],
    xpMultiplier: 3,
    popularityRank: 4,
    purchaseCount: 312,
  },
  {
    id: "partnership-complete",
    name: "Partnership Complete",
    slug: "partnership-complete",
    description: "Everything for medical practice partnerships. Protect your business and relationships.",
    products: [
      { productId: "partnership-agreement", productName: "Medical Partnership Agreement", originalPrice: 499, included: true },
      { productId: "employment-contract-pack", productName: "Employment Contract Pack", originalPrice: 349, included: true },
      { productId: "privacy-policy-bundle", productName: "Privacy Policy Bundle", originalPrice: 299, included: true },
    ],
    totalValue: 1147,
    bundlePrice: 899,
    savings: 248,
    savingsPercent: 22,
    category: "complete",
    targetAudience: ["small", "medium"],
    xpMultiplier: 3,
    popularityRank: 5,
    purchaseCount: 98,
  },
];

/**
 * Get all bundles
 */
export function getAllBundles(): Bundle[] {
  return SMART_BUNDLES.sort((a, b) => a.popularityRank - b.popularityRank);
}

/**
 * Get bundle by ID
 */
export function getBundle(bundleId: string): Bundle | null {
  return SMART_BUNDLES.find((b) => b.id === bundleId) || null;
}

/**
 * Get bundles by category
 */
export function getBundlesByCategory(category: BundleCategory): Bundle[] {
  return SMART_BUNDLES.filter((b) => b.category === category);
}

/**
 * Get bundles for target audience
 */
export function getBundlesForAudience(practiceType: string): Bundle[] {
  return SMART_BUNDLES.filter((b) => b.targetAudience.includes(practiceType));
}

/**
 * Get featured bundles
 */
export function getFeaturedBundles(limit = 3): Bundle[] {
  return SMART_BUNDLES
    .filter((b) => b.badge)
    .sort((a, b) => a.popularityRank - b.popularityRank)
    .slice(0, limit);
}

/**
 * Find dynamic bundle suggestions based on cart contents
 */
export function getDynamicBundleSuggestions(
  cartProductIds: string[]
): DynamicBundleSuggestion[] {
  const suggestions: DynamicBundleSuggestion[] = [];

  for (const bundle of SMART_BUNDLES) {
    const bundleProductIds = bundle.products.map((p) => p.productId);
    const matchingProducts = cartProductIds.filter((id) => bundleProductIds.includes(id));

    // Need at least 1 matching product and at least 1 missing product
    if (matchingProducts.length > 0 && matchingProducts.length < bundleProductIds.length) {
      const missingProducts = bundle.products.filter(
        (p) => !cartProductIds.includes(p.productId)
      );

      const existingTotal = bundle.products
        .filter((p) => cartProductIds.includes(p.productId))
        .reduce((sum, p) => sum + p.originalPrice, 0);

      const missingTotal = missingProducts.reduce((sum, p) => sum + p.originalPrice, 0);

      // Calculate savings if they complete the bundle
      const currentCartTotal = existingTotal + missingTotal;
      const additionalCost = bundle.bundlePrice - existingTotal;
      const additionalSavings = missingTotal - additionalCost;

      // Only suggest if there's meaningful savings
      if (additionalSavings > 50) {
        const completionPercent = Math.round((matchingProducts.length / bundleProductIds.length) * 100);

        suggestions.push({
          existingProducts: matchingProducts,
          suggestedProducts: missingProducts,
          bundle,
          currentTotal: existingTotal,
          bundleTotal: bundle.bundlePrice,
          additionalSavings,
          xpBonus: BUNDLE_XP.completePackage,
          message: `You're ${completionPercent}% of the way to the ${bundle.name}! Add ${missingProducts.length} more item${missingProducts.length > 1 ? "s" : ""} and save $${additionalSavings.toFixed(0)} + earn ${BUNDLE_XP.completePackage} bonus XP!`,
        });
      }
    }
  }

  // Sort by savings
  return suggestions.sort((a, b) => b.additionalSavings - a.additionalSavings);
}

/**
 * Check if cart qualifies for any complete bundles
 */
export function checkBundleCompletion(
  cartProductIds: string[]
): Bundle | null {
  for (const bundle of SMART_BUNDLES) {
    const bundleProductIds = bundle.products.map((p) => p.productId);
    const hasAllProducts = bundleProductIds.every((id) => cartProductIds.includes(id));

    if (hasAllProducts) {
      return bundle;
    }
  }
  return null;
}

/**
 * Calculate XP for bundle purchase with variable reinforcement
 */
export function calculateBundlePurchaseXP(
  bundleId: string,
  purchaseAmount: number,
  isFirstBundle: boolean
): BundlePurchaseResult {
  const bundle = getBundle(bundleId);
  if (!bundle) {
    return {
      bundleId,
      baseXp: 0,
      bonusXp: 0,
      totalXp: 0,
      rarity: "normal",
      message: "Bundle not found",
      celebrationTier: "standard",
    };
  }

  // Base XP: 10% of purchase * 3x multiplier
  const baseXp = Math.round((purchaseAmount * 0.1) * bundle.xpMultiplier);
  let bonusXp = 0;
  let rarity: BundlePurchaseResult["rarity"] = "normal";
  let celebrationTier: BundlePurchaseResult["celebrationTier"] = "standard";

  // First bundle bonus
  if (isFirstBundle) {
    bonusXp += BUNDLE_XP.firstBundle;
  }

  // Complete package bonus
  bonusXp += BUNDLE_XP.completePackage;

  // Variable reinforcement roll
  const roll = Math.random();
  if (roll < 0.01) {
    // 1% jackpot - 5x additional
    bonusXp += baseXp * 4;
    rarity = "jackpot";
    celebrationTier = "legendary";
  } else if (roll < 0.05) {
    // 4% rare - 3x additional
    bonusXp += baseXp * 2;
    rarity = "rare";
    celebrationTier = "amazing";
  } else if (roll < 0.15) {
    // 10% bonus - 2x additional
    bonusXp += baseXp;
    rarity = "bonus";
    celebrationTier = "great";
  }

  const totalXp = baseXp + bonusXp;

  const messages = {
    normal: `Bundle purchased! You earned ${totalXp} XP (3x bonus)!`,
    bonus: `Great bundle choice! BONUS: ${totalXp} XP earned!`,
    rare: `RARE bundle reward! You earned ${totalXp} XP!`,
    jackpot: `JACKPOT! Bundle purchase earned you ${totalXp} XP!`,
  };

  return {
    bundleId,
    baseXp,
    bonusXp,
    totalXp,
    rarity,
    message: messages[rarity],
    celebrationTier,
  };
}

/**
 * Get bundle progress for a user's cart
 */
export function getBundleProgress(
  cartProductIds: string[]
): Array<{
  bundle: Bundle;
  ownedProducts: number;
  totalProducts: number;
  progressPercent: number;
  remainingValue: number;
  potentialSavings: number;
}> {
  return SMART_BUNDLES.map((bundle) => {
    const bundleProductIds = bundle.products.map((p) => p.productId);
    const ownedProducts = cartProductIds.filter((id) => bundleProductIds.includes(id)).length;
    const totalProducts = bundleProductIds.length;
    const progressPercent = Math.round((ownedProducts / totalProducts) * 100);

    const ownedValue = bundle.products
      .filter((p) => cartProductIds.includes(p.productId))
      .reduce((sum, p) => sum + p.originalPrice, 0);

    const remainingValue = bundle.totalValue - ownedValue;
    const remainingBundlePrice = bundle.bundlePrice - ownedValue;
    const potentialSavings = remainingValue - remainingBundlePrice;

    return {
      bundle,
      ownedProducts,
      totalProducts,
      progressPercent,
      remainingValue: Math.max(0, remainingBundlePrice),
      potentialSavings: Math.max(0, potentialSavings),
    };
  })
    .filter((p) => p.ownedProducts > 0 && p.ownedProducts < p.totalProducts)
    .sort((a, b) => b.progressPercent - a.progressPercent);
}
