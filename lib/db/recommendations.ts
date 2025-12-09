/**
 * Recommendations Database Operations
 * Handles browse history, purchase history, and user profiles for recommendations
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDb(supabase: SupabaseClient): any {
  return supabase;
}

export interface BrowseHistoryRecord {
  productId: string;
  viewedAt: string;
  duration?: number;
}

export interface PurchaseHistoryRecord {
  productId: string;
  purchasedAt: string;
  amount: number;
}

export interface UserRecommendationProfile {
  practiceType?: string;
  practiceSize?: string;
  specialty?: string;
  complianceScore?: number;
  quizResults?: Record<string, unknown>;
  calculatorResults?: Record<string, unknown>;
}

/**
 * Record a document view for recommendation tracking
 */
export async function recordDocumentView(
  userEmail: string | null,
  sessionId: string,
  productId: string,
  duration: number = 0
): Promise<void> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  await db.from("document_views").insert({
    user_email: userEmail,
    session_id: sessionId,
    document_id: productId,
    view_duration: duration,
    viewed_at: new Date().toISOString(),
  });
}

/**
 * Get browse history for a user
 */
export async function getBrowseHistory(
  userEmail: string,
  limit: number = 50
): Promise<BrowseHistoryRecord[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("document_views")
    .select("document_id, viewed_at, view_duration")
    .eq("user_email", userEmail)
    .order("viewed_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((row: any) => ({
    productId: row.document_id,
    viewedAt: row.viewed_at,
    duration: row.view_duration,
  }));
}

/**
 * Get purchase history for a user
 */
export async function getPurchaseHistory(
  userEmail: string
): Promise<PurchaseHistoryRecord[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("document_purchases")
    .select("items, total, created_at")
    .eq("user_email", userEmail)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  // Flatten purchases into individual product records
  const history: PurchaseHistoryRecord[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const purchase of data as any[]) {
    const items = purchase.items || [];
    for (const item of items) {
      history.push({
        productId: item.id || item.productId,
        purchasedAt: purchase.created_at,
        amount: item.price || 0,
      });
    }
  }

  return history;
}

/**
 * Get purchased product IDs for a user
 */
export async function getPurchasedProductIds(
  userEmail: string
): Promise<Set<string>> {
  const history = await getPurchaseHistory(userEmail);
  return new Set(history.map((h) => h.productId));
}

/**
 * Get user profile for recommendations
 */
export async function getUserRecommendationProfile(
  userEmail: string
): Promise<UserRecommendationProfile | null> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("user_profiles")
    .select("practice_type, practice_size, specialty, quiz_results, calculator_results")
    .eq("email", userEmail.toLowerCase())
    .single();

  if (error || !data) {
    return null;
  }

  return {
    practiceType: data.practice_type,
    practiceSize: data.practice_size,
    specialty: data.specialty,
    quizResults: data.quiz_results,
    calculatorResults: data.calculator_results,
  };
}

/**
 * Update user profile with quiz/calculator results
 */
export async function updateUserRecommendationProfile(
  userEmail: string,
  updates: Partial<UserRecommendationProfile>
): Promise<void> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const updateData: Record<string, unknown> = {};

  if (updates.practiceType) updateData.practice_type = updates.practiceType;
  if (updates.practiceSize) updateData.practice_size = updates.practiceSize;
  if (updates.specialty) updateData.specialty = updates.specialty;
  if (updates.quizResults) updateData.quiz_results = updates.quizResults;
  if (updates.calculatorResults) updateData.calculator_results = updates.calculatorResults;

  await db
    .from("user_profiles")
    .update(updateData)
    .eq("email", userEmail.toLowerCase());
}

/**
 * Get frequently bought together products
 */
export async function getFrequentlyBoughtTogether(
  productId: string,
  limit: number = 5
): Promise<string[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  // Get purchases that contain this product
  const { data: purchases, error } = await db
    .from("document_purchases")
    .select("items")
    .contains("items", JSON.stringify([{ id: productId }]));

  if (error || !purchases) {
    return [];
  }

  // Count co-purchased products
  const coPurchaseCounts = new Map<string, number>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const purchase of purchases as any[]) {
    const items = purchase.items || [];
    for (const item of items) {
      const itemId = item.id || item.productId;
      if (itemId && itemId !== productId) {
        coPurchaseCounts.set(itemId, (coPurchaseCounts.get(itemId) || 0) + 1);
      }
    }
  }

  // Sort by count and return top N
  return Array.from(coPurchaseCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}

/**
 * Get trending products based on recent views
 */
export async function getTrendingProducts(
  limit: number = 10
): Promise<Array<{ productId: string; viewCount: number }>> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  // Get views from last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data, error } = await db
    .from("document_views")
    .select("document_id")
    .gte("viewed_at", oneWeekAgo.toISOString());

  if (error || !data) {
    return [];
  }

  // Count views per product
  const viewCounts = new Map<string, number>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of data as any[]) {
    const id = row.document_id;
    viewCounts.set(id, (viewCounts.get(id) || 0) + 1);
  }

  // Sort by count and return top N
  return Array.from(viewCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([productId, viewCount]) => ({ productId, viewCount }));
}
