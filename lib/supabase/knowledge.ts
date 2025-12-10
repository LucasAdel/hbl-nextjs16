/**
 * Supabase Knowledge Base Service
 *
 * Provides persistence layer for the AI Agent knowledge management system.
 * Handles all database operations for knowledge items, usage tracking, feedback, and gaps.
 */

import { createServiceRoleClient } from "./server";

// Note: These tables are defined in supabase/migrations/20241210_knowledge_base.sql
// Run the migration to add them to your Supabase project
// The types below are manually defined since they're not yet in the generated types

// Helper to get untyped table access (for tables not in generated types yet)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTable(supabase: ReturnType<typeof createServiceRoleClient>, name: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(name);
}

// Helper for RPC calls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function callRpc(supabase: ReturnType<typeof createServiceRoleClient>, name: string, params: any): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc(name, params);
}

// ============================================
// TYPES
// ============================================

export interface DbKnowledgeItem {
  id: string;
  category: string;
  subcategory: string;
  topic: string;
  title: string;
  content: string;
  summary: string;
  keywords: string[];
  intent_patterns: string[];
  response_template: string | null;
  requires_disclaimer: boolean;
  legal_disclaimer: string | null;
  advice_level: "general" | "educational" | "specific";
  confidence_level: number;
  related_products: string[];
  xp_reward: number;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  version: number;
}

export interface DbKnowledgeUsageStats {
  id: string;
  item_id: string;
  hit_count: number;
  last_used: string | null;
  average_confidence: number;
  user_satisfaction_score: number;
  feedback_count: number;
  created_at: string;
  updated_at: string;
}

export interface DbKnowledgeFeedback {
  id: string;
  item_id: string;
  message_id: string;
  session_id: string | null;
  rating: "helpful" | "not_helpful" | "needs_improvement";
  comment: string | null;
  suggested_improvement: string | null;
  user_id: string | null;
  created_at: string;
}

export interface DbKnowledgeGap {
  id: string;
  query: string;
  detected_intent: string | null;
  suggested_category: string | null;
  frequency: number;
  priority: "high" | "medium" | "low";
  status: "open" | "addressed" | "dismissed";
  addressed_by_item_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbQueryLog {
  id: string;
  query: string;
  matched: boolean;
  matched_items: string[];
  detected_intent: string | null;
  session_id: string | null;
  user_id: string | null;
  response_time_ms: number | null;
  created_at: string;
}

export interface KnowledgeAnalytics {
  totalQueries: number;
  matchedQueries: number;
  unmatchedQueries: number;
  matchRate: number;
  topCategories: { category: string; count: number }[];
  topItems: { itemId: string; title: string; count: number }[];
  recentGaps: DbKnowledgeGap[];
  improvementSuggestions: string[];
}

// ============================================
// KNOWLEDGE ITEMS
// ============================================

/**
 * Get all active knowledge items from database
 */
export async function getKnowledgeItems(): Promise<DbKnowledgeItem[]> {
  const supabase = createServiceRoleClient();

  const { data, error } = await getTable(supabase, "knowledge_items")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true });

  if (error) {
    console.error("Error fetching knowledge items:", error);
    return [];
  }

  return data as DbKnowledgeItem[];
}

/**
 * Get a single knowledge item by ID
 */
export async function getKnowledgeItem(
  id: string
): Promise<DbKnowledgeItem | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await getTable(supabase, "knowledge_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching knowledge item:", error);
    return null;
  }

  return data as DbKnowledgeItem;
}

/**
 * Create a new knowledge item
 */
export async function createKnowledgeItem(
  item: Omit<
    DbKnowledgeItem,
    "id" | "created_at" | "updated_at" | "version" | "is_active"
  >
): Promise<DbKnowledgeItem | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await getTable(supabase, "knowledge_items")
    .insert({
      ...item,
      is_active: true,
      version: 1,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating knowledge item:", error);
    return null;
  }

  return data as DbKnowledgeItem;
}

/**
 * Update an existing knowledge item
 */
export async function updateKnowledgeItem(
  id: string,
  updates: Partial<DbKnowledgeItem>
): Promise<DbKnowledgeItem | null> {
  const supabase = createServiceRoleClient();

  // Increment version on update
  const { data: current } = await getTable(supabase, "knowledge_items")
    .select("version")
    .eq("id", id)
    .single();

  const { data, error } = await getTable(supabase, "knowledge_items")
    .update({
      ...updates,
      version: (current?.version || 0) + 1,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating knowledge item:", error);
    return null;
  }

  return data as DbKnowledgeItem;
}

/**
 * Soft delete a knowledge item (set is_active to false)
 */
export async function deleteKnowledgeItem(id: string): Promise<boolean> {
  const supabase = createServiceRoleClient();

  const { error } = await getTable(supabase, "knowledge_items")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    console.error("Error deleting knowledge item:", error);
    return false;
  }

  return true;
}

// ============================================
// USAGE TRACKING
// ============================================

/**
 * Track a knowledge item usage (increment hit count)
 */
export async function trackUsage(itemId: string): Promise<void> {
  const supabase = createServiceRoleClient();

  // Use RPC to call the database function
  const { error } = await callRpc(supabase, "update_knowledge_usage", {
    p_item_id: itemId,
  });

  if (error) {
    console.error("Error tracking usage:", error);
  }
}

/**
 * Get usage stats for all items
 */
export async function getUsageStats(): Promise<DbKnowledgeUsageStats[]> {
  const supabase = createServiceRoleClient();

  const { data, error } = await getTable(supabase, "knowledge_usage_stats")
    .select("*")
    .order("hit_count", { ascending: false });

  if (error) {
    console.error("Error fetching usage stats:", error);
    return [];
  }

  return data as DbKnowledgeUsageStats[];
}

/**
 * Get usage stats for a specific item
 */
export async function getItemUsageStats(
  itemId: string
): Promise<DbKnowledgeUsageStats | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await getTable(supabase, "knowledge_usage_stats")
    .select("*")
    .eq("item_id", itemId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found
    console.error("Error fetching item usage stats:", error);
    return null;
  }

  return data as DbKnowledgeUsageStats | null;
}

// ============================================
// FEEDBACK
// ============================================

/**
 * Record user feedback on a knowledge response
 */
export async function recordFeedback(feedback: {
  itemId: string;
  messageId: string;
  rating: "helpful" | "not_helpful" | "needs_improvement";
  comment?: string;
  suggestedImprovement?: string;
  sessionId?: string;
  userId?: string;
}): Promise<boolean> {
  const supabase = createServiceRoleClient();

  // Insert feedback record
  const { error: feedbackError } = await getTable(supabase, "knowledge_feedback")
    .insert({
      item_id: feedback.itemId,
      message_id: feedback.messageId,
      rating: feedback.rating,
      comment: feedback.comment || null,
      suggested_improvement: feedback.suggestedImprovement || null,
      session_id: feedback.sessionId || null,
      user_id: feedback.userId || null,
    });

  if (feedbackError) {
    console.error("Error recording feedback:", feedbackError);
    return false;
  }

  // Update satisfaction score using RPC
  const { error: scoreError } = await callRpc(supabase, "update_satisfaction_score", {
    p_item_id: feedback.itemId,
    p_rating: feedback.rating,
  });

  if (scoreError) {
    console.error("Error updating satisfaction score:", scoreError);
  }

  return true;
}

/**
 * Get feedback for improvement (negative ratings)
 */
export async function getFeedbackForImprovement(): Promise<DbKnowledgeFeedback[]> {
  const supabase = createServiceRoleClient();

  const { data, error } = await getTable(supabase, "knowledge_feedback")
    .select("*")
    .in("rating", ["not_helpful", "needs_improvement"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching feedback:", error);
    return [];
  }

  return data as DbKnowledgeFeedback[];
}

/**
 * Get all feedback for a specific item
 */
export async function getItemFeedback(
  itemId: string
): Promise<DbKnowledgeFeedback[]> {
  const supabase = createServiceRoleClient();

  const { data, error } = await getTable(supabase, "knowledge_feedback")
    .select("*")
    .eq("item_id", itemId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching item feedback:", error);
    return [];
  }

  return data as DbKnowledgeFeedback[];
}

// ============================================
// KNOWLEDGE GAPS
// ============================================

/**
 * Record a knowledge gap (unmatched query)
 */
export async function recordGap(gap: {
  query: string;
  intent?: string;
  category?: string;
}): Promise<string | null> {
  const supabase = createServiceRoleClient();

  // Use RPC to call the database function
  const { data, error } = await callRpc(supabase, "record_knowledge_gap", {
    p_query: gap.query,
    p_intent: gap.intent || null,
    p_category: gap.category || "general",
  });

  if (error) {
    console.error("Error recording gap:", error);
    return null;
  }

  return data as string;
}

/**
 * Get all open knowledge gaps
 */
export async function getKnowledgeGaps(): Promise<DbKnowledgeGap[]> {
  const supabase = createServiceRoleClient();

  const { data, error } = await getTable(supabase, "knowledge_gaps")
    .select("*")
    .eq("status", "open")
    .order("priority", { ascending: true }) // high first
    .order("frequency", { ascending: false });

  if (error) {
    console.error("Error fetching gaps:", error);
    return [];
  }

  return data as DbKnowledgeGap[];
}

/**
 * Mark a gap as addressed
 */
export async function addressGap(
  gapId: string,
  newItemId: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();

  const { error } = await getTable(supabase, "knowledge_gaps")
    .update({
      status: "addressed",
      addressed_by_item_id: newItemId,
    })
    .eq("id", gapId);

  if (error) {
    console.error("Error addressing gap:", error);
    return false;
  }

  return true;
}

/**
 * Dismiss a gap (not worth addressing)
 */
export async function dismissGap(gapId: string): Promise<boolean> {
  const supabase = createServiceRoleClient();

  const { error } = await getTable(supabase, "knowledge_gaps")
    .update({ status: "dismissed" })
    .eq("id", gapId);

  if (error) {
    console.error("Error dismissing gap:", error);
    return false;
  }

  return true;
}

// ============================================
// QUERY LOGGING
// ============================================

/**
 * Log a query for analytics
 */
export async function logQuery(log: {
  query: string;
  matched: boolean;
  matchedItems?: string[];
  intent?: string;
  sessionId?: string;
  userId?: string;
  responseTimeMs?: number;
}): Promise<void> {
  const supabase = createServiceRoleClient();

  const { error } = await getTable(supabase, "knowledge_query_log").insert({
    query: log.query,
    matched: log.matched,
    matched_items: log.matchedItems || [],
    detected_intent: log.intent || null,
    session_id: log.sessionId || null,
    user_id: log.userId || null,
    response_time_ms: log.responseTimeMs || null,
  });

  if (error) {
    console.error("Error logging query:", error);
  }
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Get comprehensive knowledge base analytics
 */
export async function getAnalytics(): Promise<KnowledgeAnalytics> {
  const supabase = createServiceRoleClient();

  // Get query stats
  const { count: totalQueries } = await getTable(supabase, "knowledge_query_log")
    .select("*", { count: "exact", head: true });

  const { count: matchedQueries } = await getTable(supabase, "knowledge_query_log")
    .select("*", { count: "exact", head: true })
    .eq("matched", true);

  const total = totalQueries || 0;
  const matched = matchedQueries || 0;
  const unmatched = total - matched;
  const matchRate = total > 0 ? (matched / total) * 100 : 0;

  // Get top categories from usage stats + knowledge items
  const { data: items } = await getTable(supabase, "knowledge_items")
    .select("id, category, title")
    .eq("is_active", true);

  const { data: stats } = await getTable(supabase, "knowledge_usage_stats")
    .select("item_id, hit_count")
    .order("hit_count", { ascending: false });

  // Calculate top categories
  const categoryCount = new Map<string, number>();
  const typedItems = (items || []) as DbKnowledgeItem[];
  const itemMap = new Map(typedItems.map((i) => [i.id, i]));

  const typedStats = (stats || []) as DbKnowledgeUsageStats[];
  typedStats.forEach((stat) => {
    const item = itemMap.get(stat.item_id);
    if (item) {
      categoryCount.set(
        item.category,
        (categoryCount.get(item.category) || 0) + stat.hit_count
      );
    }
  });

  const topCategories = Array.from(categoryCount.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top items
  const topItems = typedStats.slice(0, 10).map((stat) => {
    const item = itemMap.get(stat.item_id);
    return {
      itemId: stat.item_id,
      title: item?.title || stat.item_id,
      count: stat.hit_count,
    };
  });

  // Recent gaps
  const { data: gaps } = await getTable(supabase, "knowledge_gaps")
    .select("*")
    .eq("status", "open")
    .in("priority", ["high", "medium"])
    .order("frequency", { ascending: false })
    .limit(10);

  // Generate improvement suggestions
  const suggestions: string[] = [];

  // Check for low satisfaction items
  const { data: lowPerformers } = await getTable(supabase, "knowledge_usage_stats")
    .select("item_id")
    .gt("feedback_count", 3)
    .lt("user_satisfaction_score", 0.5);

  if (lowPerformers && lowPerformers.length > 0) {
    suggestions.push(
      `${lowPerformers.length} knowledge items have low satisfaction scores and need improvement`
    );
  }

  // Check for high-priority gaps
  const { count: highPriorityGaps } = await getTable(supabase, "knowledge_gaps")
    .select("*", { count: "exact", head: true })
    .eq("status", "open")
    .eq("priority", "high");

  if (highPriorityGaps && highPriorityGaps > 0) {
    suggestions.push(
      `${highPriorityGaps} frequently asked topics are not covered in the knowledge base`
    );
  }

  // Check match rate
  if (matchRate < 70) {
    suggestions.push(
      `Match rate is ${matchRate.toFixed(1)}% - consider adding more knowledge items`
    );
  }

  return {
    totalQueries: total,
    matchedQueries: matched,
    unmatchedQueries: unmatched,
    matchRate,
    topCategories,
    topItems,
    recentGaps: (gaps as DbKnowledgeGap[]) || [],
    improvementSuggestions: suggestions,
  };
}

// ============================================
// EXPORT
// ============================================

/**
 * Export entire knowledge base as JSON
 */
export async function exportKnowledgeBase(): Promise<string> {
  const supabase = createServiceRoleClient();

  const [itemsResult, statsResult, gapsResult, feedbackResult] =
    await Promise.all([
      getTable(supabase, "knowledge_items").select("*").eq("is_active", true),
      getTable(supabase, "knowledge_usage_stats").select("*"),
      getTable(supabase, "knowledge_gaps").select("*"),
      getTable(supabase, "knowledge_feedback").select("*"),
    ]);

  return JSON.stringify(
    {
      items: itemsResult.data || [],
      stats: statsResult.data || [],
      gaps: gapsResult.data || [],
      feedback: feedbackResult.data || [],
      exportDate: new Date().toISOString(),
    },
    null,
    2
  );
}
