/**
 * Product Reviews Database Operations
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDb(supabase: SupabaseClient): any {
  return supabase;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id?: string;
  user_email?: string;
  display_name: string;
  rating: number;
  title?: string;
  content: string;
  is_verified_purchase: boolean;
  would_recommend: boolean;
  helpful_count: number;
  status: "pending" | "approved" | "rejected";
  photos?: string[];
  created_at: string;
}

export interface CreateReviewInput {
  productId: string;
  productName?: string;
  userEmail?: string;
  userId?: string;
  displayName: string;
  rating: number;
  title?: string;
  content: string;
  isVerifiedPurchase?: boolean;
  wouldRecommend?: boolean;
  photos?: string[];
}

/**
 * Create a new product review
 */
export async function createReview(input: CreateReviewInput): Promise<ProductReview | null> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("product_reviews")
    .insert({
      product_id: input.productId,
      product_name: input.productName,
      user_id: input.userId,
      user_email: input.userEmail,
      display_name: input.displayName,
      rating: input.rating,
      title: input.title,
      content: input.content,
      is_verified_purchase: input.isVerifiedPurchase || false,
      would_recommend: input.wouldRecommend ?? true,
      photos: input.photos,
      status: "pending",
      helpful_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating review:", error);
    return null;
  }

  return data;
}

/**
 * Get reviews for a product
 */
export async function getProductReviews(
  productId: string,
  options: {
    limit?: number;
    offset?: number;
    status?: "pending" | "approved" | "rejected" | "all";
  } = {}
): Promise<{ reviews: ProductReview[]; total: number }> {
  const { limit = 10, offset = 0, status = "approved" } = options;

  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  let query = db
    .from("product_reviews")
    .select("*", { count: "exact" })
    .eq("product_id", productId);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching reviews:", error);
    return { reviews: [], total: 0 };
  }

  return { reviews: data || [], total: count || 0 };
}

/**
 * Get all reviews (for API endpoint)
 */
export async function getAllReviews(
  options: {
    productId?: string;
    serviceType?: string;
    limit?: number;
    offset?: number;
    status?: "pending" | "approved" | "rejected" | "all";
  } = {}
): Promise<{ reviews: ProductReview[]; total: number }> {
  const { productId, limit = 10, offset = 0, status = "approved" } = options;

  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  let query = db.from("product_reviews").select("*", { count: "exact" });

  if (productId) {
    query = query.eq("product_id", productId);
  }

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching reviews:", error);
    return { reviews: [], total: 0 };
  }

  return { reviews: data || [], total: count || 0 };
}

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(
  reviewId: string,
  userEmail?: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  // Check if user already voted
  if (userEmail) {
    const { data: existingVote } = await db
      .from("review_helpful_votes")
      .select("id")
      .eq("review_id", reviewId)
      .eq("user_email", userEmail)
      .single();

    if (existingVote) {
      return false; // Already voted
    }

    // Record vote
    await db.from("review_helpful_votes").insert({
      review_id: reviewId,
      user_email: userEmail,
    });
  }

  // Increment helpful count
  const { error } = await db.rpc("increment_review_helpful_count", {
    review_id: reviewId,
  });

  // If RPC doesn't exist, do it manually
  if (error) {
    await db
      .from("product_reviews")
      .update({ helpful_count: db.raw("helpful_count + 1") })
      .eq("id", reviewId);
  }

  return true;
}

/**
 * Approve or reject a review (admin)
 */
export async function updateReviewStatus(
  reviewId: string,
  status: "approved" | "rejected"
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { error } = await db
    .from("product_reviews")
    .update({ status })
    .eq("id", reviewId);

  if (error) {
    console.error("Error updating review status:", error);
    return false;
  }

  return true;
}

/**
 * Get review stats for a product
 */
export async function getProductReviewStats(productId: string): Promise<{
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("status", "approved");

  if (error || !data || data.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const review of data as any[]) {
    sum += review.rating;
    distribution[review.rating] = (distribution[review.rating] || 0) + 1;
  }

  return {
    averageRating: Math.round((sum / data.length) * 10) / 10,
    totalReviews: data.length,
    ratingDistribution: distribution,
  };
}

/**
 * Check if user has reviewed a product
 */
export async function hasUserReviewedProduct(
  userEmail: string,
  productId: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("product_reviews")
    .select("id")
    .eq("user_email", userEmail)
    .eq("product_id", productId)
    .single();

  return !error && !!data;
}
