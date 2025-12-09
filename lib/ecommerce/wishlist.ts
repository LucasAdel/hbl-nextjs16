/**
 * Wishlist Feature
 * Handles saving, managing, and syncing wishlists
 */

export interface WishlistItem {
  productId: string;
  productType: "document" | "service" | "bundle";
  name: string;
  price: number; // In cents
  image?: string;
  addedAt: string;
  notes?: string;
  notifyOnSale?: boolean;
  priority?: "high" | "medium" | "low";
}

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  items: WishlistItem[];
  isPublic: boolean;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

// Storage key for local wishlist (guest users)
const LOCAL_STORAGE_KEY = "hbl_wishlist";

/**
 * Get wishlist from local storage (guest users)
 */
export function getLocalWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save wishlist to local storage (guest users)
 */
export function saveLocalWishlist(items: WishlistItem[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Handle quota exceeded or other storage errors
    console.error("Failed to save wishlist to local storage");
  }
}

/**
 * Add item to wishlist
 */
export function addToWishlist(
  items: WishlistItem[],
  newItem: Omit<WishlistItem, "addedAt">
): WishlistItem[] {
  // Check if already in wishlist
  if (items.some((item) => item.productId === newItem.productId)) {
    return items;
  }

  const itemWithDate: WishlistItem = {
    ...newItem,
    addedAt: new Date().toISOString(),
  };

  return [...items, itemWithDate];
}

/**
 * Remove item from wishlist
 */
export function removeFromWishlist(
  items: WishlistItem[],
  productId: string
): WishlistItem[] {
  return items.filter((item) => item.productId !== productId);
}

/**
 * Check if product is in wishlist
 */
export function isInWishlist(items: WishlistItem[], productId: string): boolean {
  return items.some((item) => item.productId === productId);
}

/**
 * Toggle item in wishlist
 */
export function toggleWishlistItem(
  items: WishlistItem[],
  item: Omit<WishlistItem, "addedAt">
): WishlistItem[] {
  if (isInWishlist(items, item.productId)) {
    return removeFromWishlist(items, item.productId);
  }
  return addToWishlist(items, item);
}

/**
 * Update item notes
 */
export function updateWishlistItemNotes(
  items: WishlistItem[],
  productId: string,
  notes: string
): WishlistItem[] {
  return items.map((item) =>
    item.productId === productId ? { ...item, notes } : item
  );
}

/**
 * Update item priority
 */
export function updateWishlistItemPriority(
  items: WishlistItem[],
  productId: string,
  priority: WishlistItem["priority"]
): WishlistItem[] {
  return items.map((item) =>
    item.productId === productId ? { ...item, priority } : item
  );
}

/**
 * Sort wishlist items
 */
export function sortWishlistItems(
  items: WishlistItem[],
  sortBy: "added" | "price-asc" | "price-desc" | "priority" | "name"
): WishlistItem[] {
  const sorted = [...items];

  switch (sortBy) {
    case "added":
      sorted.sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      );
      break;
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "priority":
      const priorityOrder = { high: 0, medium: 1, low: 2, undefined: 3 };
      sorted.sort(
        (a, b) =>
          (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3) -
          (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3)
      );
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return sorted;
}

/**
 * Filter wishlist items
 */
export function filterWishlistItems(
  items: WishlistItem[],
  filter: {
    productType?: WishlistItem["productType"];
    priority?: WishlistItem["priority"];
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }
): WishlistItem[] {
  return items.filter((item) => {
    if (filter.productType && item.productType !== filter.productType) {
      return false;
    }
    if (filter.priority && item.priority !== filter.priority) {
      return false;
    }
    if (filter.minPrice !== undefined && item.price < filter.minPrice) {
      return false;
    }
    if (filter.maxPrice !== undefined && item.price > filter.maxPrice) {
      return false;
    }
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      if (
        !item.name.toLowerCase().includes(searchLower) &&
        !item.notes?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Get wishlist total
 */
export function getWishlistTotal(items: WishlistItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

/**
 * Get wishlist count by type
 */
export function getWishlistCountByType(
  items: WishlistItem[]
): Record<WishlistItem["productType"], number> {
  return {
    document: items.filter((i) => i.productType === "document").length,
    service: items.filter((i) => i.productType === "service").length,
    bundle: items.filter((i) => i.productType === "bundle").length,
  };
}

/**
 * Generate share token for public wishlist
 */
export function generateShareToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Move item from wishlist to cart
 */
export function moveToCart(
  wishlistItems: WishlistItem[],
  productId: string
): {
  wishlist: WishlistItem[];
  cartItem: WishlistItem | null;
} {
  const item = wishlistItems.find((i) => i.productId === productId);

  if (!item) {
    return { wishlist: wishlistItems, cartItem: null };
  }

  return {
    wishlist: removeFromWishlist(wishlistItems, productId),
    cartItem: item,
  };
}

/**
 * Merge guest wishlist with user wishlist (after login)
 */
export function mergeWishlists(
  userItems: WishlistItem[],
  guestItems: WishlistItem[]
): WishlistItem[] {
  const merged = [...userItems];

  for (const guestItem of guestItems) {
    if (!isInWishlist(merged, guestItem.productId)) {
      merged.push(guestItem);
    }
  }

  return merged;
}

/**
 * Export wishlist to JSON
 */
export function exportWishlist(items: WishlistItem[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      items: items.map((item) => ({
        name: item.name,
        price: item.price / 100, // Convert to dollars
        type: item.productType,
        addedAt: item.addedAt,
        notes: item.notes,
      })),
    },
    null,
    2
  );
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
 * Get relative time since added
 */
export function getTimeSinceAdded(addedAt: string): string {
  const now = new Date();
  const added = new Date(addedAt);
  const diffMs = now.getTime() - added.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
