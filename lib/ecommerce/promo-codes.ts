/**
 * Promo Codes System
 * Handles promotional discounts, coupon validation, and application
 */

export type PromoCodeType =
  | "percentage"
  | "fixed"
  | "free_shipping"
  | "buy_x_get_y"
  | "bundle";

export interface PromoCode {
  id: string;
  code: string;
  type: PromoCodeType;
  value: number; // Percentage (0-100) or fixed amount in cents
  minPurchase?: number; // Minimum purchase amount in cents
  maxDiscount?: number; // Maximum discount amount in cents
  usageLimit?: number; // Total number of uses allowed
  usageCount: number; // Current number of uses
  perUserLimit?: number; // Max uses per user
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  applicableProducts?: string[]; // Product IDs or "all"
  applicableCategories?: string[]; // Category slugs
  excludedProducts?: string[];
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number; // Price in cents
  quantity: number;
  category?: string;
}

export interface PromoValidationResult {
  valid: boolean;
  discount: number; // Discount amount in cents
  message: string;
  code?: PromoCode;
}

// Promo codes - empty by default, add codes via database or admin panel
// WARNING: Do not add sample/placeholder codes here - they will be active in production!
export const SAMPLE_PROMO_CODES: PromoCode[] = [];

/**
 * Find promo code by code string
 */
export function findPromoCode(code: string): PromoCode | undefined {
  const normalised = code.toUpperCase().trim();
  return SAMPLE_PROMO_CODES.find((p) => p.code === normalised);
}

/**
 * Check if promo code is currently valid (dates and status)
 */
export function isPromoCodeActive(promo: PromoCode): boolean {
  if (!promo.isActive) return false;

  const now = new Date();
  const startsAt = new Date(promo.startsAt);
  const expiresAt = new Date(promo.expiresAt);

  return now >= startsAt && now <= expiresAt;
}

/**
 * Check if promo code has remaining uses
 */
export function hasRemainingUses(
  promo: PromoCode,
  userUsageCount?: number
): boolean {
  // Check global limit
  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
    return false;
  }

  // Check per-user limit
  if (promo.perUserLimit && userUsageCount !== undefined) {
    if (userUsageCount >= promo.perUserLimit) {
      return false;
    }
  }

  return true;
}

/**
 * Check if cart meets minimum purchase requirement
 */
export function meetsMinPurchase(promo: PromoCode, subtotal: number): boolean {
  if (!promo.minPurchase) return true;
  return subtotal >= promo.minPurchase;
}

/**
 * Check if cart items are applicable for promo code
 */
export function getApplicableItems(
  promo: PromoCode,
  items: CartItem[]
): CartItem[] {
  return items.filter((item) => {
    // Check if product is excluded
    if (promo.excludedProducts?.includes(item.productId)) {
      return false;
    }

    // If specific products are defined, check membership
    if (promo.applicableProducts && promo.applicableProducts.length > 0) {
      if (!promo.applicableProducts.includes(item.productId)) {
        return false;
      }
    }

    // If specific categories are defined, check membership
    if (promo.applicableCategories && promo.applicableCategories.length > 0) {
      if (!item.category || !promo.applicableCategories.includes(item.category)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Calculate discount amount for cart
 */
export function calculateDiscount(
  promo: PromoCode,
  items: CartItem[],
  subtotal: number
): number {
  const applicableItems = getApplicableItems(promo, items);

  if (applicableItems.length === 0) return 0;

  const applicableSubtotal = applicableItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  let discount = 0;

  switch (promo.type) {
    case "percentage":
      discount = Math.round(applicableSubtotal * (promo.value / 100));
      break;

    case "fixed":
      discount = promo.value;
      break;

    case "bundle":
      // Bundle discount: require multiple categories
      if (promo.applicableCategories && promo.applicableCategories.length >= 2) {
        const categoriesInCart = new Set(
          applicableItems.map((item) => item.category).filter(Boolean)
        );

        const matchedCategories = promo.applicableCategories.filter((cat) =>
          categoriesInCart.has(cat)
        );

        if (matchedCategories.length >= 2) {
          discount = Math.round(applicableSubtotal * (promo.value / 100));
        }
      }
      break;

    case "free_shipping":
      // Return shipping cost as discount (would be set elsewhere)
      discount = 0; // Handled separately in checkout
      break;

    case "buy_x_get_y":
      // Would need additional logic for buy X get Y promotions
      break;
  }

  // Apply max discount cap if set
  if (promo.maxDiscount && discount > promo.maxDiscount) {
    discount = promo.maxDiscount;
  }

  // Discount cannot exceed subtotal
  if (discount > subtotal) {
    discount = subtotal;
  }

  return discount;
}

/**
 * Validate promo code for cart
 */
export function validatePromoCode(
  code: string,
  items: CartItem[],
  userUsageCount?: number
): PromoValidationResult {
  // Find promo code
  const promo = findPromoCode(code);

  if (!promo) {
    return {
      valid: false,
      discount: 0,
      message: "Invalid promo code",
    };
  }

  // Check if active
  if (!isPromoCodeActive(promo)) {
    return {
      valid: false,
      discount: 0,
      message: "This promo code has expired or is not yet active",
    };
  }

  // Check usage limits
  if (!hasRemainingUses(promo, userUsageCount)) {
    return {
      valid: false,
      discount: 0,
      message:
        promo.perUserLimit && userUsageCount !== undefined
          ? "You have already used this promo code"
          : "This promo code has reached its usage limit",
    };
  }

  // Calculate subtotal
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Check minimum purchase
  if (!meetsMinPurchase(promo, subtotal)) {
    const minPurchase = promo.minPurchase! / 100;
    return {
      valid: false,
      discount: 0,
      message: `Minimum purchase of $${minPurchase.toFixed(2)} required`,
    };
  }

  // Check applicable items
  const applicableItems = getApplicableItems(promo, items);

  if (applicableItems.length === 0) {
    return {
      valid: false,
      discount: 0,
      message: "This promo code doesn't apply to items in your cart",
    };
  }

  // Calculate discount
  const discount = calculateDiscount(promo, items, subtotal);

  if (discount === 0) {
    return {
      valid: false,
      discount: 0,
      message: "This promo code doesn't apply to your current cart",
    };
  }

  return {
    valid: true,
    discount,
    message: `Promo code applied: ${promo.description || `Save $${(discount / 100).toFixed(2)}`}`,
    code: promo,
  };
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
 * Generate promo code display string
 */
export function getPromoCodeDescription(promo: PromoCode): string {
  switch (promo.type) {
    case "percentage":
      return `${promo.value}% off${promo.maxDiscount ? ` (up to ${formatCurrency(promo.maxDiscount)})` : ""}`;
    case "fixed":
      return `${formatCurrency(promo.value)} off`;
    case "free_shipping":
      return "Free shipping";
    case "bundle":
      return `${promo.value}% off bundles`;
    default:
      return promo.description || "Special offer";
  }
}
