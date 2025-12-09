/**
 * Purchase Database Operations
 * Handles document purchases stored in Supabase
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDb(supabase: SupabaseClient): any {
  return supabase;
}

export interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isBundle?: boolean;
}

export interface Purchase {
  id: string;
  user_email: string;
  stripe_session_id: string;
  stripe_payment_intent?: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  coupon_code?: string;
  status: "pending" | "completed" | "refunded" | "failed";
  created_at: string;
}

/**
 * Get purchases for a user
 */
export async function getUserPurchases(email: string): Promise<Purchase[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("document_purchases")
    .select("*")
    .eq("user_email", email)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching purchases:", error);
    return [];
  }

  return data || [];
}

/**
 * Get purchase by session ID
 */
export async function getPurchaseBySessionId(sessionId: string): Promise<Purchase | null> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("document_purchases")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .single();

  if (error) {
    console.error("Error fetching purchase:", error);
    return null;
  }

  return data;
}

/**
 * Check if user has purchased a specific product
 */
export async function hasUserPurchasedProduct(email: string, productId: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("document_purchases")
    .select("items")
    .eq("user_email", email)
    .eq("status", "completed");

  if (error || !data) {
    return false;
  }

  // Check if any purchase contains the product
  return data.some((purchase: { items: PurchaseItem[] }) =>
    purchase.items.some((item) => item.id === productId)
  );
}

/**
 * Get all purchased product IDs for a user
 */
export async function getUserPurchasedProductIds(email: string): Promise<string[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("document_purchases")
    .select("items")
    .eq("user_email", email)
    .eq("status", "completed");

  if (error || !data) {
    return [];
  }

  // Extract unique product IDs
  const productIds = new Set<string>();
  data.forEach((purchase: { items: PurchaseItem[] }) => {
    purchase.items.forEach((item) => productIds.add(item.id));
  });

  return Array.from(productIds);
}

/**
 * Get purchase count for a user
 */
export async function getUserPurchaseCount(email: string): Promise<number> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { count, error } = await db
    .from("document_purchases")
    .select("*", { count: "exact", head: true })
    .eq("user_email", email)
    .eq("status", "completed");

  if (error) {
    console.error("Error counting purchases:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Get total spent by user
 */
export async function getUserTotalSpent(email: string): Promise<number> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("document_purchases")
    .select("total")
    .eq("user_email", email)
    .eq("status", "completed");

  if (error || !data) {
    return 0;
  }

  // Sum all totals (stored in cents)
  const totalCents = data.reduce((sum: number, p: { total: number }) => sum + p.total, 0);
  return totalCents / 100; // Return in dollars
}
