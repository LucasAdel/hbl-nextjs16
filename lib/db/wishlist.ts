/**
 * Wishlist Database Operations
 * Persists wishlist items to Supabase
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDb(supabase: SupabaseClient): any {
  return supabase;
}

export interface WishlistItem {
  id: string;
  user_email: string;
  product_id: string;
  product_name?: string;
  price_at_add?: number;
  alert_price?: number;
  priority: number;
  notes?: string;
  created_at: string;
}

/**
 * Add item to wishlist
 */
export async function addToWishlist(
  email: string,
  productId: string,
  productName?: string,
  price?: number,
  alertPrice?: number
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { error } = await db
    .from("wishlist_items")
    .upsert(
      {
        user_email: email,
        product_id: productId,
        product_name: productName,
        price_at_add: price ? Math.round(price * 100) : null, // Store in cents
        alert_price: alertPrice ? Math.round(alertPrice * 100) : null,
        priority: 0,
      },
      {
        onConflict: "user_email,product_id",
      }
    );

  if (error) {
    console.error("Error adding to wishlist:", error);
    return false;
  }

  return true;
}

/**
 * Remove item from wishlist
 */
export async function removeFromWishlist(email: string, productId: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { error } = await db
    .from("wishlist_items")
    .delete()
    .eq("user_email", email)
    .eq("product_id", productId);

  if (error) {
    console.error("Error removing from wishlist:", error);
    return false;
  }

  return true;
}

/**
 * Get user's wishlist
 */
export async function getUserWishlist(email: string): Promise<WishlistItem[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("wishlist_items")
    .select("*")
    .eq("user_email", email)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }

  return data || [];
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(email: string, productId: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("wishlist_items")
    .select("id")
    .eq("user_email", email)
    .eq("product_id", productId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}

/**
 * Update wishlist item priority
 */
export async function updateWishlistPriority(
  email: string,
  productId: string,
  priority: number
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { error } = await db
    .from("wishlist_items")
    .update({ priority })
    .eq("user_email", email)
    .eq("product_id", productId);

  if (error) {
    console.error("Error updating priority:", error);
    return false;
  }

  return true;
}

/**
 * Set price alert for wishlist item
 */
export async function setWishlistPriceAlert(
  email: string,
  productId: string,
  alertPrice: number
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { error } = await db
    .from("wishlist_items")
    .update({ alert_price: Math.round(alertPrice * 100) })
    .eq("user_email", email)
    .eq("product_id", productId);

  if (error) {
    console.error("Error setting price alert:", error);
    return false;
  }

  return true;
}

/**
 * Get wishlist items with price alerts that should trigger
 * (when current price is below alert price)
 */
export async function getTriggeredPriceAlerts(
  currentPrices: Record<string, number>
): Promise<WishlistItem[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("wishlist_items")
    .select("*")
    .not("alert_price", "is", null);

  if (error || !data) {
    return [];
  }

  // Filter items where current price is at or below alert price
  return data.filter((item: WishlistItem) => {
    const currentPrice = currentPrices[item.product_id];
    if (!currentPrice || !item.alert_price) return false;
    return currentPrice * 100 <= item.alert_price;
  });
}

/**
 * Get wishlist count for user
 */
export async function getWishlistCount(email: string): Promise<number> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { count, error } = await db
    .from("wishlist_items")
    .select("*", { count: "exact", head: true })
    .eq("user_email", email);

  if (error) {
    return 0;
  }

  return count || 0;
}

/**
 * Get product IDs in wishlist
 */
export async function getWishlistProductIds(email: string): Promise<string[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("wishlist_items")
    .select("product_id")
    .eq("user_email", email);

  if (error || !data) {
    return [];
  }

  return data.map((item: { product_id: string }) => item.product_id);
}
