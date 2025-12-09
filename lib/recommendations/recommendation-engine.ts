/**
 * Personalized Recommendations Engine - BMAD Phase 2
 *
 * Product suggestions based on:
 * - User profile (practice type, specialty)
 * - Browse history
 * - Purchase history
 * - Quiz/calculator results
 * - Cart contents
 * - XP for purchasing recommended products
 */

import {
  recordDocumentView,
  getBrowseHistory,
  getPurchaseHistory,
  getUserRecommendationProfile,
  updateUserRecommendationProfile,
  getFrequentlyBoughtTogether,
  getTrendingProducts as dbGetTrendingProducts,
} from "@/lib/db/recommendations";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  price: number;
  tags: string[];
  practiceTypes: string[];
  specialties: string[];
  popularity: number;
  averageRating: number;
  purchaseCount: number;
}

export type ProductCategory =
  | "compliance"
  | "employment"
  | "telehealth"
  | "contracts"
  | "privacy"
  | "practice_setup"
  | "bundles";

export interface UserProfile {
  userId: string;
  practiceType?: string;
  practiceSize?: string;
  specialty?: string;
  complianceScore?: number;
  quizResults?: Record<string, unknown>;
  calculatorResults?: Record<string, unknown>;
}

export interface BrowseHistory {
  productId: string;
  viewedAt: string;
  duration?: number;
}

export interface PurchaseHistory {
  productId: string;
  purchasedAt: string;
  amount: number;
}

export interface Recommendation {
  product: Product;
  score: number;
  reason: string;
  reasonType: RecommendationReason;
  xpBonus: number;
  confidence: "high" | "medium" | "low";
}

export type RecommendationReason =
  | "profile_match"
  | "similar_users"
  | "complementary"
  | "trending"
  | "quiz_result"
  | "calculator_result"
  | "frequently_bought_together"
  | "complete_bundle";

// Legacy in-memory storage (kept for anonymous/session-based tracking)
// For logged-in users, data is persisted to database
const browseHistories = new Map<string, BrowseHistory[]>();
const purchaseHistories = new Map<string, PurchaseHistory[]>();
const userProfiles = new Map<string, UserProfile>();

// XP bonuses for recommendations
export const RECOMMENDATION_XP = {
  purchaseRecommended: 50, // Extra XP for buying recommended product
  completeBundle: 200, // Bonus for completing a bundle via recommendations
  firstRecommendedPurchase: 100, // First time buying a recommendation
} as const;

// Demo product catalog
export const PRODUCT_CATALOG: Product[] = [
  {
    id: "ahpra-compliance-bundle",
    name: "AHPRA Compliance Bundle",
    slug: "ahpra-compliance-bundle",
    category: "bundles",
    price: 599,
    tags: ["ahpra", "compliance", "advertising", "medical"],
    practiceTypes: ["solo", "small", "medium"],
    specialties: ["general-practice", "specialist", "allied-health"],
    popularity: 95,
    averageRating: 4.9,
    purchaseCount: 847,
  },
  {
    id: "employment-contract-pack",
    name: "Employment Contract Pack",
    slug: "employment-contract-pack",
    category: "employment",
    price: 349,
    tags: ["employment", "contracts", "staff", "hr"],
    practiceTypes: ["small", "medium", "large"],
    specialties: ["all"],
    popularity: 88,
    averageRating: 4.8,
    purchaseCount: 623,
  },
  {
    id: "telehealth-complete",
    name: "Telehealth Complete Bundle",
    slug: "telehealth-complete",
    category: "telehealth",
    price: 449,
    tags: ["telehealth", "virtual", "consent", "privacy"],
    practiceTypes: ["solo", "small", "medium"],
    specialties: ["general-practice", "psychology", "allied-health"],
    popularity: 92,
    averageRating: 4.9,
    purchaseCount: 534,
  },
  {
    id: "privacy-policy-bundle",
    name: "Privacy Policy Bundle",
    slug: "privacy-policy-bundle",
    category: "privacy",
    price: 299,
    tags: ["privacy", "data", "consent", "compliance"],
    practiceTypes: ["solo", "small", "medium", "large"],
    specialties: ["all"],
    popularity: 85,
    averageRating: 4.7,
    purchaseCount: 412,
  },
  {
    id: "patient-consent-forms",
    name: "Patient Consent Forms Pack",
    slug: "patient-consent-forms",
    category: "compliance",
    price: 199,
    tags: ["consent", "patients", "forms", "documentation"],
    practiceTypes: ["solo", "small", "medium"],
    specialties: ["general-practice", "specialist", "dental"],
    popularity: 90,
    averageRating: 4.9,
    purchaseCount: 789,
  },
  {
    id: "partnership-agreement",
    name: "Medical Partnership Agreement",
    slug: "partnership-agreement",
    category: "contracts",
    price: 499,
    tags: ["partnership", "business", "contracts", "governance"],
    practiceTypes: ["small", "medium"],
    specialties: ["all"],
    popularity: 75,
    averageRating: 4.8,
    purchaseCount: 234,
  },
  {
    id: "practice-setup-starter",
    name: "New Practice Starter Kit",
    slug: "practice-setup-starter",
    category: "practice_setup",
    price: 799,
    tags: ["setup", "new-practice", "starter", "comprehensive"],
    practiceTypes: ["solo", "small"],
    specialties: ["all"],
    popularity: 88,
    averageRating: 4.9,
    purchaseCount: 345,
  },
  {
    id: "locum-agreement-template",
    name: "Locum Agreement Template",
    slug: "locum-agreement-template",
    category: "employment",
    price: 149,
    tags: ["locum", "contractor", "agreement", "medical"],
    practiceTypes: ["solo", "small", "medium"],
    specialties: ["general-practice", "specialist"],
    popularity: 82,
    averageRating: 4.7,
    purchaseCount: 456,
  },
];

// Frequently bought together pairs
const BOUGHT_TOGETHER: Record<string, string[]> = {
  "ahpra-compliance-bundle": ["patient-consent-forms", "privacy-policy-bundle"],
  "employment-contract-pack": ["locum-agreement-template"],
  "telehealth-complete": ["privacy-policy-bundle", "patient-consent-forms"],
  "practice-setup-starter": ["employment-contract-pack", "ahpra-compliance-bundle"],
  "partnership-agreement": ["employment-contract-pack"],
};

/**
 * Track product view (persists to database for logged-in users)
 */
export async function trackProductView(
  userId: string,
  productId: string,
  duration?: number,
  userEmail?: string | null
): Promise<void> {
  // Store in memory for session-based tracking
  const history = browseHistories.get(userId) || [];
  history.push({
    productId,
    viewedAt: new Date().toISOString(),
    duration,
  });
  // Keep last 50 views
  if (history.length > 50) history.shift();
  browseHistories.set(userId, history);

  // Also persist to database if user is logged in
  if (userEmail) {
    try {
      await recordDocumentView(userEmail, userId, productId, duration || 0);
    } catch (error) {
      console.error("Error recording document view:", error);
    }
  }
}

/**
 * Track purchase
 */
export function trackPurchase(
  userId: string,
  productId: string,
  amount: number
): void {
  const history = purchaseHistories.get(userId) || [];
  history.push({
    productId,
    purchasedAt: new Date().toISOString(),
    amount,
  });
  purchaseHistories.set(userId, history);
}

/**
 * Update user profile
 */
export function updateUserProfile(
  userId: string,
  profile: Partial<UserProfile>
): UserProfile {
  const current = userProfiles.get(userId) || { userId };
  const updated = { ...current, ...profile };
  userProfiles.set(userId, updated);
  return updated;
}

/**
 * Get personalized recommendations (uses database for logged-in users)
 */
export async function getRecommendations(
  userId: string,
  options: {
    limit?: number;
    excludeOwned?: boolean;
    cartProductIds?: string[];
    context?: "homepage" | "product_page" | "cart" | "checkout";
    userEmail?: string | null;
  } = {}
): Promise<Recommendation[]> {
  const { limit = 5, excludeOwned = true, cartProductIds = [], context = "homepage", userEmail } = options;

  // Get data from database for logged-in users, otherwise use in-memory
  let profile: UserProfile | null = userProfiles.get(userId) || null;
  let browseHistory: BrowseHistory[] = browseHistories.get(userId) || [];
  let purchases: PurchaseHistory[] = purchaseHistories.get(userId) || [];

  if (userEmail) {
    try {
      // Fetch from database for persistent data
      const [dbProfile, dbBrowseHistory, dbPurchaseHistory] = await Promise.all([
        getUserRecommendationProfile(userEmail),
        getBrowseHistory(userEmail),
        getPurchaseHistory(userEmail),
      ]);

      if (dbProfile) {
        profile = { userId, ...dbProfile };
      }
      if (dbBrowseHistory.length > 0) {
        browseHistory = dbBrowseHistory;
      }
      if (dbPurchaseHistory.length > 0) {
        purchases = dbPurchaseHistory;
      }
    } catch (error) {
      console.error("Error fetching recommendation data:", error);
    }
  }

  const purchasedIds = purchases.map((p) => p.productId);

  const recommendations: Recommendation[] = [];

  // Filter out owned products if requested
  let availableProducts = PRODUCT_CATALOG;
  if (excludeOwned) {
    availableProducts = availableProducts.filter(
      (p) => !purchasedIds.includes(p.id) && !cartProductIds.includes(p.id)
    );
  }

  // Score each product
  for (const product of availableProducts) {
    let score = 0;
    let reason = "";
    let reasonType: RecommendationReason = "trending";

    // Profile matching (highest weight)
    if (profile) {
      if (profile.practiceType && product.practiceTypes.includes(profile.practiceType)) {
        score += 30;
      }
      if (profile.specialty && (product.specialties.includes(profile.specialty) || product.specialties.includes("all"))) {
        score += 25;
      }
      if (profile.complianceScore && profile.complianceScore < 70 && product.category === "compliance") {
        score += 40;
        reason = "Address compliance gaps identified in your assessment";
        reasonType = "quiz_result";
      }
    }

    // Browse history (recent views indicate interest)
    const recentViews = browseHistory.filter(
      (h) => h.productId === product.id &&
      Date.now() - new Date(h.viewedAt).getTime() < 7 * 24 * 60 * 60 * 1000
    );
    if (recentViews.length > 0) {
      score += recentViews.length * 15;
      reason = "Based on your recent browsing";
      reasonType = "profile_match";
    }

    // Frequently bought together (cart context)
    if (context === "cart" || context === "checkout") {
      for (const cartId of cartProductIds) {
        const together = BOUGHT_TOGETHER[cartId] || [];
        if (together.includes(product.id)) {
          score += 50;
          reason = "Frequently bought together";
          reasonType = "frequently_bought_together";
        }
      }
    }

    // Complementary to purchases
    for (const purchase of purchases) {
      const together = BOUGHT_TOGETHER[purchase.productId] || [];
      if (together.includes(product.id)) {
        score += 35;
        reason = "Complements your previous purchase";
        reasonType = "complementary";
      }
    }

    // Popularity boost
    score += product.popularity * 0.2;

    // Rating boost
    score += product.averageRating * 5;

    // Default reason if none set
    if (!reason) {
      if (product.popularity > 90) {
        reason = `Popular with ${product.purchaseCount.toLocaleString()}+ practitioners`;
        reasonType = "trending";
      } else {
        reason = "Recommended for your practice type";
        reasonType = "similar_users";
      }
    }

    // Calculate XP bonus
    let xpBonus: number = RECOMMENDATION_XP.purchaseRecommended;
    if (purchases.length === 0) {
      xpBonus = RECOMMENDATION_XP.firstRecommendedPurchase;
    }

    // Confidence based on score
    const confidence = score > 80 ? "high" : score > 50 ? "medium" : "low";

    recommendations.push({
      product,
      score,
      reason,
      reasonType,
      xpBonus,
      confidence,
    });
  }

  // Sort by score and return top N
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get recommendations for product page
 */
export async function getProductPageRecommendations(
  userId: string,
  currentProductId: string,
  userEmail?: string | null
): Promise<Recommendation[]> {
  const together = BOUGHT_TOGETHER[currentProductId] || [];

  // First get frequently bought together
  const frequentlyBought = together
    .map((id) => PRODUCT_CATALOG.find((p) => p.id === id))
    .filter(Boolean)
    .map((product) => ({
      product: product!,
      score: 100,
      reason: "Frequently bought together",
      reasonType: "frequently_bought_together" as RecommendationReason,
      xpBonus: RECOMMENDATION_XP.purchaseRecommended,
      confidence: "high" as const,
    }));

  // Fill remaining with personalized recs
  const personalized = await getRecommendations(userId, {
    limit: 4 - frequentlyBought.length,
    excludeOwned: true,
    cartProductIds: [currentProductId],
    context: "product_page",
    userEmail,
  });

  return [...frequentlyBought, ...personalized];
}

/**
 * Get cart upsell recommendations
 */
export async function getCartRecommendations(
  userId: string,
  cartProductIds: string[],
  userEmail?: string | null
): Promise<Recommendation[]> {
  return getRecommendations(userId, {
    limit: 3,
    excludeOwned: true,
    cartProductIds,
    context: "cart",
    userEmail,
  });
}

/**
 * Calculate XP bonus for purchasing recommendations
 */
export function calculateRecommendationPurchaseXP(
  userId: string,
  purchasedProductIds: string[],
  recommendedProductIds: string[]
): {
  baseXp: number;
  bonusXp: number;
  message: string;
  recommendedPurchaseCount: number;
} {
  const purchases = purchaseHistories.get(userId) || [];
  const isFirstRecommendedPurchase = !purchases.some((p) =>
    recommendedProductIds.includes(p.productId)
  );

  const recommendedPurchased = purchasedProductIds.filter((id) =>
    recommendedProductIds.includes(id)
  );

  if (recommendedPurchased.length === 0) {
    return { baseXp: 0, bonusXp: 0, message: "", recommendedPurchaseCount: 0 };
  }

  const baseXp = recommendedPurchased.length * RECOMMENDATION_XP.purchaseRecommended;
  const bonusXp = isFirstRecommendedPurchase ? RECOMMENDATION_XP.firstRecommendedPurchase : 0;

  return {
    baseXp,
    bonusXp,
    message: isFirstRecommendedPurchase
      ? "First recommended product purchase bonus!"
      : `Purchased ${recommendedPurchased.length} recommended product(s)!`,
    recommendedPurchaseCount: recommendedPurchased.length,
  };
}

/**
 * Get trending products
 */
export function getTrendingProducts(limit = 5): Product[] {
  return [...PRODUCT_CATALOG]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

/**
 * Get products by category
 */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCT_CATALOG.filter((p) => p.category === category);
}
