/**
 * Wishlist with Alerts - BMAD Phase 3
 *
 * Deferred purchase capture with:
 * - Price drop alerts
 * - Stock notifications
 * - XP bonuses for wishlist purchases
 */

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productPrice: number;
  addedAt: string;
  priceWhenAdded: number;
  alertOnPriceDrop: boolean;
  alertOnRestock: boolean;
  notifiedAt?: string;
  priority: "high" | "medium" | "low";
}

export interface WishlistAlert {
  id: string;
  userId: string;
  wishlistItemId: string;
  type: "price_drop" | "back_in_stock" | "expiring_discount";
  message: string;
  discount?: number;
  expiresAt?: string;
  createdAt: string;
  readAt?: string;
  actionedAt?: string;
}

export interface WishlistStats {
  totalItems: number;
  totalValue: number;
  potentialSavings: number;
  itemsOnSale: number;
  averageTimeInWishlist: number; // days
}

// In-memory storage
const wishlists = new Map<string, WishlistItem[]>();
const alerts = new Map<string, WishlistAlert[]>();

// XP bonuses for wishlist actions
export const WISHLIST_XP_REWARDS = {
  addToWishlist: 10,
  purchaseFromWishlist: 100, // 2x normal XP
  shareWishlist: 25,
  completeWishlist: 500, // Buy all items
} as const;

/**
 * Add item to wishlist
 */
export function addToWishlist(
  userId: string,
  product: {
    productId: string;
    productName: string;
    productPrice: number;
  },
  options: {
    alertOnPriceDrop?: boolean;
    alertOnRestock?: boolean;
    priority?: WishlistItem["priority"];
  } = {}
): WishlistItem {
  const userWishlist = wishlists.get(userId) || [];

  // Check if already in wishlist
  const existing = userWishlist.find((item) => item.productId === product.productId);
  if (existing) {
    return existing;
  }

  const item: WishlistItem = {
    id: `wish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    productId: product.productId,
    productName: product.productName,
    productPrice: product.productPrice,
    addedAt: new Date().toISOString(),
    priceWhenAdded: product.productPrice,
    alertOnPriceDrop: options.alertOnPriceDrop ?? true,
    alertOnRestock: options.alertOnRestock ?? true,
    priority: options.priority ?? "medium",
  };

  userWishlist.push(item);
  wishlists.set(userId, userWishlist);

  return item;
}

/**
 * Remove item from wishlist
 */
export function removeFromWishlist(userId: string, itemId: string): boolean {
  const userWishlist = wishlists.get(userId) || [];
  const index = userWishlist.findIndex((item) => item.id === itemId);

  if (index === -1) return false;

  userWishlist.splice(index, 1);
  wishlists.set(userId, userWishlist);

  return true;
}

/**
 * Get user's wishlist
 */
export function getWishlist(userId: string): WishlistItem[] {
  return wishlists.get(userId) || [];
}

/**
 * Get wishlist stats
 */
export function getWishlistStats(userId: string): WishlistStats {
  const items = wishlists.get(userId) || [];

  const totalValue = items.reduce((sum, item) => sum + item.productPrice, 0);
  const potentialSavings = items.reduce((sum, item) => {
    const savings = item.priceWhenAdded - item.productPrice;
    return sum + Math.max(0, savings);
  }, 0);

  const itemsOnSale = items.filter(
    (item) => item.productPrice < item.priceWhenAdded
  ).length;

  const avgTime = items.length > 0
    ? items.reduce((sum, item) => {
        const days = (Date.now() - new Date(item.addedAt).getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / items.length
    : 0;

  return {
    totalItems: items.length,
    totalValue,
    potentialSavings,
    itemsOnSale,
    averageTimeInWishlist: Math.round(avgTime),
  };
}

/**
 * Create price drop alert
 */
export function createPriceDropAlert(
  userId: string,
  wishlistItemId: string,
  newPrice: number,
  oldPrice: number
): WishlistAlert {
  const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

  const alert: WishlistAlert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    wishlistItemId,
    type: "price_drop",
    message: `Price dropped ${discount}%! Save $${(oldPrice - newPrice).toFixed(2)}`,
    discount,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    createdAt: new Date().toISOString(),
  };

  const userAlerts = alerts.get(userId) || [];
  userAlerts.push(alert);
  alerts.set(userId, userAlerts);

  return alert;
}

/**
 * Get user's wishlist alerts
 */
export function getWishlistAlerts(
  userId: string,
  unreadOnly = false
): WishlistAlert[] {
  const userAlerts = alerts.get(userId) || [];

  if (unreadOnly) {
    return userAlerts.filter((a) => !a.readAt);
  }

  return userAlerts;
}

/**
 * Mark alert as read
 */
export function markAlertRead(userId: string, alertId: string): void {
  const userAlerts = alerts.get(userId) || [];
  const alert = userAlerts.find((a) => a.id === alertId);
  if (alert) {
    alert.readAt = new Date().toISOString();
  }
}

/**
 * Check for price changes and create alerts
 */
export function checkPriceChanges(
  priceUpdates: Array<{ productId: string; oldPrice: number; newPrice: number }>
): number {
  let alertsCreated = 0;

  wishlists.forEach((items, userId) => {
    items.forEach((item) => {
      if (!item.alertOnPriceDrop) return;

      const update = priceUpdates.find((u) => u.productId === item.productId);
      if (update && update.newPrice < update.oldPrice) {
        createPriceDropAlert(userId, item.id, update.newPrice, update.oldPrice);
        alertsCreated++;

        // Update item price
        item.productPrice = update.newPrice;
      }
    });
  });

  return alertsCreated;
}

/**
 * Generate shareable wishlist link
 */
export function generateWishlistShareLink(userId: string): string {
  const code = Buffer.from(userId).toString("base64").substring(0, 12);
  return `https://hamiltonbaileylaw.com.au/wishlist/${code}`;
}

/**
 * Calculate XP for purchasing wishlist items
 */
export function calculateWishlistPurchaseXP(
  userId: string,
  purchasedProductIds: string[]
): {
  baseXp: number;
  bonusXp: number;
  message: string;
  completedWishlist: boolean;
} {
  const items = wishlists.get(userId) || [];
  const wishlistProductIds = items.map((i) => i.productId);

  const purchasedFromWishlist = purchasedProductIds.filter((id) =>
    wishlistProductIds.includes(id)
  );

  if (purchasedFromWishlist.length === 0) {
    return { baseXp: 0, bonusXp: 0, message: "", completedWishlist: false };
  }

  const baseXp = purchasedFromWishlist.length * WISHLIST_XP_REWARDS.purchaseFromWishlist;

  // Check if completed wishlist
  const remainingItems = items.filter(
    (item) => !purchasedProductIds.includes(item.productId)
  );
  const completedWishlist = items.length > 0 && remainingItems.length === 0;

  const bonusXp = completedWishlist ? WISHLIST_XP_REWARDS.completeWishlist : 0;

  // Remove purchased items from wishlist
  purchasedFromWishlist.forEach((productId) => {
    const item = items.find((i) => i.productId === productId);
    if (item) {
      removeFromWishlist(userId, item.id);
    }
  });

  return {
    baseXp,
    bonusXp,
    message: completedWishlist
      ? "Wishlist completed! Massive XP bonus!"
      : `Purchased ${purchasedFromWishlist.length} wishlist item(s)!`,
    completedWishlist,
  };
}
