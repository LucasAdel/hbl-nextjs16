/**
 * Bundle Discounts System
 * Handles product bundles, combination discounts, and tiered pricing
 */

export interface BundleProduct {
  productId: string;
  name: string;
  originalPrice: number; // Price in cents
  category: string;
  required?: boolean; // Whether this product is required in the bundle
}

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  products: BundleProduct[];
  discountType: "percentage" | "fixed" | "price";
  discountValue: number; // Percentage, fixed discount, or final price in cents
  minProducts?: number; // Minimum products to qualify
  maxProducts?: number; // Maximum products in bundle
  isActive: boolean;
  startsAt?: string;
  expiresAt?: string;
  featured?: boolean;
  image?: string;
  savings?: number; // Calculated savings for display
}

export interface BundleCalculation {
  bundle: Bundle;
  originalTotal: number;
  discountedTotal: number;
  savings: number;
  savingsPercentage: number;
  qualifies: boolean;
  missingProducts?: string[];
}

// Sample bundles (in production, from database)
export const SAMPLE_BUNDLES: Bundle[] = [
  {
    id: "bundle_1",
    name: "Medical Practice Starter Pack",
    slug: "medical-practice-starter",
    description:
      "Everything you need to set up your medical practice - save 25%!",
    products: [
      {
        productId: "doc_1",
        name: "Practice Setup Guide",
        originalPrice: 29900,
        category: "practice-setup",
        required: true,
      },
      {
        productId: "doc_2",
        name: "AHPRA Compliance Checklist",
        originalPrice: 14900,
        category: "compliance",
        required: true,
      },
      {
        productId: "doc_3",
        name: "Employment Contract Template",
        originalPrice: 19900,
        category: "employment",
        required: false,
      },
      {
        productId: "doc_4",
        name: "Privacy Policy Template",
        originalPrice: 9900,
        category: "compliance",
        required: false,
      },
    ],
    discountType: "percentage",
    discountValue: 25,
    minProducts: 3,
    isActive: true,
    featured: true,
  },
  {
    id: "bundle_2",
    name: "Employment Essentials Bundle",
    slug: "employment-essentials",
    description: "Complete employment documentation suite for medical practices",
    products: [
      {
        productId: "doc_3",
        name: "Employment Contract Template",
        originalPrice: 19900,
        category: "employment",
        required: true,
      },
      {
        productId: "doc_5",
        name: "Contractor Agreement",
        originalPrice: 17900,
        category: "employment",
        required: true,
      },
      {
        productId: "doc_6",
        name: "Staff Handbook Template",
        originalPrice: 24900,
        category: "employment",
        required: true,
      },
    ],
    discountType: "price",
    discountValue: 49900, // Bundle price $499 instead of $627
    isActive: true,
    featured: true,
  },
  {
    id: "bundle_3",
    name: "Compliance Complete",
    slug: "compliance-complete",
    description: "All compliance documents in one comprehensive package",
    products: [
      {
        productId: "doc_2",
        name: "AHPRA Compliance Checklist",
        originalPrice: 14900,
        category: "compliance",
        required: true,
      },
      {
        productId: "doc_4",
        name: "Privacy Policy Template",
        originalPrice: 9900,
        category: "compliance",
        required: true,
      },
      {
        productId: "doc_7",
        name: "Medicare Compliance Guide",
        originalPrice: 19900,
        category: "compliance",
        required: true,
      },
      {
        productId: "doc_8",
        name: "Risk Management Policy",
        originalPrice: 14900,
        category: "compliance",
        required: true,
      },
    ],
    discountType: "fixed",
    discountValue: 15000, // $150 off
    isActive: true,
    featured: false,
  },
];

/**
 * Get all active bundles
 */
export function getActiveBundles(): Bundle[] {
  const now = new Date();

  return SAMPLE_BUNDLES.filter((bundle) => {
    if (!bundle.isActive) return false;

    if (bundle.startsAt && new Date(bundle.startsAt) > now) return false;
    if (bundle.expiresAt && new Date(bundle.expiresAt) < now) return false;

    return true;
  });
}

/**
 * Get featured bundles for homepage display
 */
export function getFeaturedBundles(): Bundle[] {
  return getActiveBundles().filter((bundle) => bundle.featured);
}

/**
 * Find bundle by ID or slug
 */
export function findBundle(idOrSlug: string): Bundle | undefined {
  return SAMPLE_BUNDLES.find(
    (bundle) => bundle.id === idOrSlug || bundle.slug === idOrSlug
  );
}

/**
 * Calculate bundle total and savings
 */
export function calculateBundle(bundle: Bundle): BundleCalculation {
  const originalTotal = bundle.products.reduce(
    (sum, product) => sum + product.originalPrice,
    0
  );

  let discountedTotal: number;

  switch (bundle.discountType) {
    case "percentage":
      discountedTotal = Math.round(
        originalTotal * (1 - bundle.discountValue / 100)
      );
      break;
    case "fixed":
      discountedTotal = originalTotal - bundle.discountValue;
      break;
    case "price":
      discountedTotal = bundle.discountValue;
      break;
  }

  // Ensure discounted total is not negative
  discountedTotal = Math.max(0, discountedTotal);

  const savings = originalTotal - discountedTotal;
  const savingsPercentage = Math.round((savings / originalTotal) * 100);

  return {
    bundle,
    originalTotal,
    discountedTotal,
    savings,
    savingsPercentage,
    qualifies: true,
  };
}

/**
 * Check if cart items qualify for a bundle
 */
export function checkBundleQualification(
  bundle: Bundle,
  cartProductIds: string[]
): BundleCalculation {
  const bundleProductIds = bundle.products.map((p) => p.productId);
  const requiredProductIds = bundle.products
    .filter((p) => p.required)
    .map((p) => p.productId);

  // Check if all required products are in cart
  const hasAllRequired = requiredProductIds.every((id) =>
    cartProductIds.includes(id)
  );

  // Count matching products
  const matchingProducts = bundleProductIds.filter((id) =>
    cartProductIds.includes(id)
  );

  // Check minimum products requirement
  const meetsMinimum =
    !bundle.minProducts || matchingProducts.length >= bundle.minProducts;

  const qualifies = hasAllRequired && meetsMinimum;

  const calculation = calculateBundle(bundle);

  if (!qualifies) {
    const missingRequired = requiredProductIds.filter(
      (id) => !cartProductIds.includes(id)
    );
    const missingProducts = bundle.products
      .filter((p) => missingRequired.includes(p.productId))
      .map((p) => p.name);

    return {
      ...calculation,
      qualifies: false,
      missingProducts,
    };
  }

  return calculation;
}

/**
 * Find best applicable bundle for cart items
 */
export function findBestBundle(
  cartProductIds: string[]
): BundleCalculation | null {
  const activeBundles = getActiveBundles();

  let bestBundle: BundleCalculation | null = null;

  for (const bundle of activeBundles) {
    const calculation = checkBundleQualification(bundle, cartProductIds);

    if (calculation.qualifies) {
      if (!bestBundle || calculation.savings > bestBundle.savings) {
        bestBundle = calculation;
      }
    }
  }

  return bestBundle;
}

/**
 * Get bundle suggestions based on cart items
 */
export function getBundleSuggestions(
  cartProductIds: string[],
  limit: number = 3
): BundleCalculation[] {
  const activeBundles = getActiveBundles();
  const suggestions: BundleCalculation[] = [];

  for (const bundle of activeBundles) {
    const calculation = checkBundleQualification(bundle, cartProductIds);

    // Only suggest bundles where user is partially qualified
    if (
      !calculation.qualifies &&
      calculation.missingProducts &&
      calculation.missingProducts.length <= 2
    ) {
      suggestions.push(calculation);
    }
  }

  // Sort by potential savings (highest first)
  suggestions.sort((a, b) => b.savings - a.savings);

  return suggestions.slice(0, limit);
}

/**
 * Format currency for display
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(cents / 100);
}

/**
 * Get bundle savings display text
 */
export function getBundleSavingsText(calculation: BundleCalculation): string {
  if (calculation.bundle.discountType === "percentage") {
    return `Save ${calculation.bundle.discountValue}%`;
  }

  return `Save ${formatCurrency(calculation.savings)}`;
}

/**
 * Tiered pricing based on quantity
 */
export interface TieredPrice {
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number; // In cents
  discountPercentage?: number;
}

export interface TieredPricing {
  productId: string;
  basePrice: number;
  tiers: TieredPrice[];
}

export function calculateTieredPrice(
  pricing: TieredPricing,
  quantity: number
): { total: number; pricePerUnit: number; savings: number } {
  // Find applicable tier
  const tier = pricing.tiers.find(
    (t) =>
      quantity >= t.minQuantity &&
      (t.maxQuantity === undefined || quantity <= t.maxQuantity)
  );

  const pricePerUnit = tier?.pricePerUnit || pricing.basePrice;
  const total = pricePerUnit * quantity;
  const savings = pricing.basePrice * quantity - total;

  return { total, pricePerUnit, savings };
}
