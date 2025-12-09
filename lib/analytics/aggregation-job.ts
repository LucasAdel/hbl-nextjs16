/**
 * Analytics Aggregation Job
 * Computes daily rollup data from raw tables for fast dashboard queries
 * Designed to be idempotent - safe to run multiple times
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  recordDailyEvent,
  recordXPEconomyDaily,
  recordConversionFunnelStage,
  recordFeatureEngagement,
  recordCohortRetention,
} from "@/lib/db/analytics-rollups";

// Helper to get untyped Supabase client for tables not in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUntypedClient(): any {
  return createServiceRoleClient();
}

// ============================================
// MAIN AGGREGATION FUNCTIONS
// ============================================

/**
 * Run all daily aggregations for a specific date
 * @param dateStr - Date in YYYY-MM-DD format (defaults to yesterday)
 */
export async function runDailyAggregation(dateStr?: string): Promise<{
  success: boolean;
  date: string;
  results: Record<string, boolean>;
  errors: string[];
}> {
  const date = dateStr || getYesterdayDate();
  const results: Record<string, boolean> = {};
  const errors: string[] = [];

  console.log(`[Aggregation] Starting daily aggregation for ${date}`);

  // Run all aggregations in parallel where possible
  const [eventsResult, xpResult, funnelResult, featureResult, cohortResult] = await Promise.allSettled([
    aggregateEvents(date).then((r) => { results.events = r; return r; }),
    aggregateXPEconomy(date).then((r) => { results.xpEconomy = r; return r; }),
    aggregateConversionFunnel(date).then((r) => { results.funnel = r; return r; }),
    aggregateFeatureEngagement(date).then((r) => { results.features = r; return r; }),
    aggregateCohortRetention(date).then((r) => { results.cohorts = r; return r; }),
  ]);

  // Collect errors from failed aggregations
  if (eventsResult.status === "rejected") {
    errors.push(`Events: ${eventsResult.reason}`);
    results.events = false;
  }
  if (xpResult.status === "rejected") {
    errors.push(`XP Economy: ${xpResult.reason}`);
    results.xpEconomy = false;
  }
  if (funnelResult.status === "rejected") {
    errors.push(`Funnel: ${funnelResult.reason}`);
    results.funnel = false;
  }
  if (featureResult.status === "rejected") {
    errors.push(`Features: ${featureResult.reason}`);
    results.features = false;
  }
  if (cohortResult.status === "rejected") {
    errors.push(`Cohorts: ${cohortResult.reason}`);
    results.cohorts = false;
  }

  const success = errors.length === 0;
  console.log(`[Aggregation] Completed for ${date}: ${success ? "SUCCESS" : "PARTIAL"}`);

  return { success, date, results, errors };
}

/**
 * Backfill aggregations for a date range
 */
export async function backfillAggregations(
  startDate: string,
  endDate: string
): Promise<{ processed: number; failed: number }> {
  let processed = 0;
  let failed = 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    console.log(`[Backfill] Processing ${dateStr}`);

    const result = await runDailyAggregation(dateStr);
    if (result.success) {
      processed++;
    } else {
      failed++;
      console.error(`[Backfill] Failed for ${dateStr}:`, result.errors);
    }
  }

  return { processed, failed };
}

// ============================================
// INDIVIDUAL AGGREGATION FUNCTIONS
// ============================================

/**
 * Aggregate events from tracking data
 */
async function aggregateEvents(date: string): Promise<boolean> {
  const supabase = getUntypedClient();

  // Get event counts from user_activity_log (if it exists)
  const { data: activityData, error: activityError } = await supabase
    .from("user_activity_log")
    .select("event_type, user_email")
    .gte("created_at", `${date}T00:00:00`)
    .lt("created_at", `${date}T23:59:59.999`);

  if (activityError) {
    // Table might not exist yet, that's okay
    console.log(`[Aggregation] No user_activity_log data for ${date}`);
  }

  // Aggregate events by type
  const eventCounts = new Map<string, { count: number; users: Set<string> }>();

  if (activityData) {
    for (const row of activityData) {
      const eventType = row.event_type || "unknown";
      if (!eventCounts.has(eventType)) {
        eventCounts.set(eventType, { count: 0, users: new Set() });
      }
      const entry = eventCounts.get(eventType)!;
      entry.count++;
      if (row.user_email) {
        entry.users.add(row.user_email);
      }
    }
  }

  // Also count purchases
  const { data: purchaseData } = await supabase
    .from("document_purchases")
    .select("user_email, status")
    .gte("created_at", `${date}T00:00:00`)
    .lt("created_at", `${date}T23:59:59.999`);

  if (purchaseData) {
    const purchaseEntry = { count: 0, users: new Set<string>() };
    for (const row of purchaseData) {
      if (row.status === "completed") {
        purchaseEntry.count++;
        purchaseEntry.users.add(row.user_email);
      }
    }
    if (purchaseEntry.count > 0) {
      eventCounts.set("purchase_complete", purchaseEntry);
    }
  }

  // Also count bookings
  const { data: bookingData } = await supabase
    .from("advanced_bookings")
    .select("client_email, status")
    .gte("created_at", `${date}T00:00:00`)
    .lt("created_at", `${date}T23:59:59.999`);

  if (bookingData) {
    const bookingEntry = { count: 0, users: new Set<string>() };
    for (const row of bookingData) {
      if (row.status === "confirmed") {
        bookingEntry.count++;
        bookingEntry.users.add(row.client_email);
      }
    }
    if (bookingEntry.count > 0) {
      eventCounts.set("booking_confirmed", bookingEntry);
    }
  }

  // Record all events
  let success = true;
  for (const [eventName, data] of eventCounts) {
    const category = categorizeEvent(eventName);
    const result = await recordDailyEvent(
      date,
      eventName,
      category,
      data.count,
      data.users.size
    );
    if (!result) success = false;
  }

  return success;
}

/**
 * Aggregate XP economy metrics
 */
async function aggregateXPEconomy(date: string): Promise<boolean> {
  const supabase = getUntypedClient();

  // Get XP transactions for the day
  const { data: xpData, error: xpError } = await supabase
    .from("xp_transactions")
    .select("user_email, amount, transaction_type")
    .gte("created_at", `${date}T00:00:00`)
    .lt("created_at", `${date}T23:59:59.999`);

  if (xpError) {
    console.log(`[Aggregation] No xp_transactions data for ${date}`);
    // Record zero values for the day
    return recordXPEconomyDaily({
      date,
      total_earned: 0,
      total_redeemed: 0,
      unique_earners: 0,
      active_streaks: 0,
      avg_xp_per_user: 0,
    });
  }

  // Calculate metrics
  let totalEarned = 0;
  let totalRedeemed = 0;
  const earners = new Set<string>();

  if (xpData) {
    for (const row of xpData) {
      if (row.amount > 0) {
        totalEarned += row.amount;
        earners.add(row.user_email);
      } else {
        totalRedeemed += Math.abs(row.amount);
      }
    }
  }

  // Count active streaks from user_profiles
  const { data: profileData } = await supabase
    .from("user_profiles")
    .select("current_streak")
    .gt("current_streak", 0);

  const activeStreaks = profileData?.length || 0;
  const avgXpPerUser = earners.size > 0 ? totalEarned / earners.size : 0;

  return recordXPEconomyDaily({
    date,
    total_earned: totalEarned,
    total_redeemed: totalRedeemed,
    unique_earners: earners.size,
    active_streaks: activeStreaks,
    avg_xp_per_user: avgXpPerUser,
  });
}

/**
 * Aggregate conversion funnel stages
 */
async function aggregateConversionFunnel(date: string): Promise<boolean> {
  const supabase = getUntypedClient();

  // Define funnel stages based on available data
  const funnelStages = [
    { name: "page_view", table: "user_activity_log", filter: { event_type: "page_view" } },
    { name: "product_view", table: "user_activity_log", filter: { event_type: "product_view" } },
    { name: "add_to_cart", table: "user_activity_log", filter: { event_type: "add_to_cart" } },
    { name: "checkout_start", table: "document_purchases", filter: { status: "pending" } },
    { name: "checkout_complete", table: "document_purchases", filter: { status: "completed" } },
  ];

  let success = true;
  let previousCount = 0;

  for (let i = 0; i < funnelStages.length; i++) {
    const stage = funnelStages[i];
    let userCount = 0;

    // Query based on stage
    if (stage.table === "user_activity_log") {
      const { data } = await supabase
        .from(stage.table)
        .select("user_email")
        .eq("event_type", stage.filter.event_type)
        .gte("created_at", `${date}T00:00:00`)
        .lt("created_at", `${date}T23:59:59.999`);

      const uniqueUsers = new Set(data?.map((r: { user_email: string }) => r.user_email) || []);
      userCount = uniqueUsers.size;
    } else if (stage.table === "document_purchases") {
      const { data } = await supabase
        .from(stage.table)
        .select("user_email")
        .eq("status", stage.filter.status as string)
        .gte("created_at", `${date}T00:00:00`)
        .lt("created_at", `${date}T23:59:59.999`);

      const uniqueUsers = new Set(data?.map((r: { user_email: string }) => r.user_email) || []);
      userCount = uniqueUsers.size;
    }

    // Calculate conversion rate from previous stage
    const conversionRate = i === 0 || previousCount === 0
      ? 100
      : (userCount / previousCount) * 100;

    const dropOffRate = i === 0 ? 0 : 100 - conversionRate;

    const result = await recordConversionFunnelStage(
      date,
      stage.name,
      userCount,
      conversionRate,
      dropOffRate
    );

    if (!result) success = false;
    previousCount = userCount;
  }

  return success;
}

/**
 * Aggregate feature engagement metrics
 */
async function aggregateFeatureEngagement(date: string): Promise<boolean> {
  const supabase = getUntypedClient();

  // Define features to track
  const features = [
    { name: "booking_flow", category: "conversion", event: "booking_start" },
    { name: "document_store", category: "conversion", event: "document_view" },
    { name: "xp_dashboard", category: "gamification", event: "xp_view" },
    { name: "recommendations", category: "engagement", event: "recommendation_click" },
    { name: "streak_tracker", category: "gamification", event: "streak_view" },
    { name: "achievements", category: "gamification", event: "achievement_view" },
    { name: "client_portal", category: "core", event: "portal_view" },
  ];

  let success = true;

  for (const feature of features) {
    // Query activity for this feature
    const { data } = await supabase
      .from("user_activity_log")
      .select("user_email, session_id")
      .eq("event_type", feature.event)
      .gte("created_at", `${date}T00:00:00`)
      .lt("created_at", `${date}T23:59:59.999`);

    const uniqueUsers = new Set(data?.map((r: { user_email: string }) => r.user_email) || []);
    const uniqueSessions = new Set(data?.map((r: { session_id?: string }) => r.session_id).filter(Boolean) || []);

    const result = await recordFeatureEngagement(
      date,
      feature.name,
      feature.category,
      {
        uniqueUsers: uniqueUsers.size,
        totalSessions: uniqueSessions.size || data?.length || 0,
      }
    );

    if (!result) success = false;
  }

  return success;
}

/**
 * Aggregate weekly cohort retention
 */
async function aggregateCohortRetention(date: string): Promise<boolean> {
  const supabase = getUntypedClient();

  // Get the Monday of the week containing this date
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  const monday = new Date(dateObj);
  monday.setDate(dateObj.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const cohortWeek = monday.toISOString().split("T")[0];

  // Only run cohort analysis on Sundays (end of week)
  if (dayOfWeek !== 0) {
    return true; // Skip non-Sunday
  }

  let success = true;

  // Analyze cohorts for the past 12 weeks
  for (let weekOffset = 0; weekOffset < 12; weekOffset++) {
    const cohortStart = new Date(monday);
    cohortStart.setDate(monday.getDate() - (weekOffset * 7));
    const cohortStartStr = cohortStart.toISOString().split("T")[0];

    const cohortEnd = new Date(cohortStart);
    cohortEnd.setDate(cohortStart.getDate() + 6);
    const cohortEndStr = cohortEnd.toISOString().split("T")[0];

    // Get users who signed up in that cohort week
    const { data: cohortUsers } = await supabase
      .from("user_profiles")
      .select("email")
      .gte("created_at", `${cohortStartStr}T00:00:00`)
      .lte("created_at", `${cohortEndStr}T23:59:59.999`);

    const cohortSize = cohortUsers?.length || 0;
    if (cohortSize === 0) continue;

    // Check how many were active this week
    const cohortEmails = cohortUsers?.map((u: { email: string }) => u.email) || [];

    // For now, check if they have any activity or XP in the current week
    const { data: activeUsers } = await supabase
      .from("xp_transactions")
      .select("user_email")
      .in("user_email", cohortEmails)
      .gte("created_at", `${cohortWeek}T00:00:00`)
      .lte("created_at", `${date}T23:59:59.999`);

    const retainedEmails = new Set(activeUsers?.map((u: { user_email: string }) => u.user_email) || []);
    const retainedCount = retainedEmails.size;

    const result = await recordCohortRetention(
      cohortStartStr,
      weekOffset,
      cohortSize,
      retainedCount
    );

    if (!result) success = false;
  }

  return success;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

function categorizeEvent(eventName: string): string {
  const categoryMap: Record<string, string> = {
    page_view: "navigation",
    product_view: "engagement",
    add_to_cart: "conversion",
    checkout_start: "conversion",
    checkout_complete: "conversion",
    purchase_complete: "conversion",
    booking_confirmed: "conversion",
    booking_start: "conversion",
    xp_earned: "gamification",
    achievement_unlocked: "gamification",
    streak_maintained: "gamification",
    level_up: "gamification",
    login: "authentication",
    signup: "authentication",
    document_view: "engagement",
    recommendation_click: "engagement",
  };

  return categoryMap[eventName] || "other";
}

// ============================================
// CRON/SCHEDULED EXECUTION
// ============================================

/**
 * Entry point for cron job or scheduled execution
 * Run this at 2am daily to aggregate yesterday's data
 */
export async function scheduledAggregation(): Promise<void> {
  console.log("[Scheduled] Starting daily aggregation job");

  const startTime = Date.now();
  const result = await runDailyAggregation();
  const duration = Date.now() - startTime;

  if (result.success) {
    console.log(`[Scheduled] Completed successfully in ${duration}ms`);
  } else {
    console.error(`[Scheduled] Completed with errors in ${duration}ms:`, result.errors);
  }
}
