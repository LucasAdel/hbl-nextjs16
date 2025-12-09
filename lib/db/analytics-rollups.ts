/**
 * Analytics Rollup Database Operations
 * Pre-aggregated data for fast dashboard queries
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDb(supabase: SupabaseClient): any {
  return supabase;
}

// ============================================
// INTERFACES
// ============================================

export interface DailyEventRecord {
  date: string;
  event_name: string;
  event_category: string;
  count: number;
  unique_users: number;
  properties_summary?: Record<string, unknown>;
}

export interface XPEconomyDaily {
  date: string;
  total_earned: number;
  total_redeemed: number;
  unique_earners: number;
  active_streaks: number;
  avg_xp_per_user: number;
  new_users?: number;
  returning_users?: number;
}

export interface ConversionFunnelDaily {
  date: string;
  stage_name: string;
  user_count: number;
  conversion_rate: number;
  drop_off_rate?: number;
}

export interface FeatureEngagementDaily {
  date: string;
  feature_name: string;
  feature_category: string;
  unique_users: number;
  total_sessions: number;
  total_time_seconds?: number;
  conversions?: number;
  conversion_rate?: number;
}

export interface CohortMetrics {
  cohort_week: string;
  week_offset: number;
  cohort_size: number;
  retained_count: number;
  retention_rate: number;
  revenue_in_period?: number;
}

// ============================================
// DAILY EVENTS
// ============================================

/**
 * Record or update daily event aggregation
 */
export async function recordDailyEvent(
  date: string,
  eventName: string,
  category: string,
  count: number,
  uniqueUsers: number = 0,
  propertiesSummary?: Record<string, unknown>
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { error } = await db
    .from("analytics_events_daily")
    .upsert({
      date,
      event_name: eventName,
      event_category: category,
      count,
      unique_users: uniqueUsers,
      properties_summary: propertiesSummary || {},
    }, { onConflict: "date,event_name" });

  if (error) {
    console.error("Error recording daily event:", error);
    return false;
  }

  return true;
}

/**
 * Get events by date range
 */
export async function getEventsByDateRange(
  startDate: string,
  endDate: string,
  category?: string
): Promise<DailyEventRecord[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  let query = db
    .from("analytics_events_daily")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (category) {
    query = query.eq("event_category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching daily events:", error);
    return [];
  }

  return data || [];
}

/**
 * Get event totals for a date range
 */
export async function getEventTotals(
  startDate: string,
  endDate: string
): Promise<Record<string, number>> {
  const events = await getEventsByDateRange(startDate, endDate);

  const totals: Record<string, number> = {};
  for (const event of events) {
    totals[event.event_name] = (totals[event.event_name] || 0) + event.count;
  }

  return totals;
}

// ============================================
// XP ECONOMY
// ============================================

/**
 * Record daily XP economy stats
 */
export async function recordXPEconomyDaily(stats: XPEconomyDaily): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { error } = await db
    .from("xp_economy_daily")
    .upsert({
      date: stats.date,
      total_earned: stats.total_earned,
      total_redeemed: stats.total_redeemed,
      unique_earners: stats.unique_earners,
      active_streaks: stats.active_streaks,
      avg_xp_per_user: stats.avg_xp_per_user,
      new_users: stats.new_users || 0,
      returning_users: stats.returning_users || 0,
    }, { onConflict: "date" });

  if (error) {
    console.error("Error recording XP economy daily:", error);
    return false;
  }

  return true;
}

/**
 * Get XP economy trend for last N days
 */
export async function getXPEconomyTrend(days: number = 30): Promise<XPEconomyDaily[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await db
    .from("xp_economy_daily")
    .select("*")
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching XP economy trend:", error);
    return [];
  }

  return data || [];
}

/**
 * Get XP economy summary (totals for date range)
 */
export async function getXPEconomySummary(
  startDate: string,
  endDate: string
): Promise<{
  totalEarned: number;
  totalRedeemed: number;
  avgDailyEarners: number;
  peakStreaks: number;
}> {
  const trend = await getXPEconomyTrend(
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
  );

  const filtered = trend.filter(d => d.date >= startDate && d.date <= endDate);

  return {
    totalEarned: filtered.reduce((sum, d) => sum + d.total_earned, 0),
    totalRedeemed: filtered.reduce((sum, d) => sum + d.total_redeemed, 0),
    avgDailyEarners: filtered.length > 0
      ? Math.round(filtered.reduce((sum, d) => sum + d.unique_earners, 0) / filtered.length)
      : 0,
    peakStreaks: Math.max(...filtered.map(d => d.active_streaks), 0),
  };
}

// ============================================
// CONVERSION FUNNEL
// ============================================

/**
 * Record conversion funnel stage for a date
 */
export async function recordConversionFunnelStage(
  date: string,
  stageName: string,
  userCount: number,
  conversionRate: number,
  dropOffRate?: number
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { error } = await db
    .from("conversion_funnel_daily")
    .upsert({
      date,
      stage_name: stageName,
      user_count: userCount,
      conversion_rate: conversionRate,
      drop_off_rate: dropOffRate || 0,
    }, { onConflict: "date,stage_name" });

  if (error) {
    console.error("Error recording funnel stage:", error);
    return false;
  }

  return true;
}

/**
 * Get conversion funnel trend
 */
export async function getConversionFunnelTrend(days: number = 30): Promise<ConversionFunnelDaily[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await db
    .from("conversion_funnel_daily")
    .select("*")
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching funnel trend:", error);
    return [];
  }

  return data || [];
}

/**
 * Get latest funnel snapshot (most recent day)
 */
export async function getLatestFunnel(): Promise<ConversionFunnelDaily[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  // Get the most recent date
  const { data: latest } = await db
    .from("conversion_funnel_daily")
    .select("date")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (!latest) return [];

  const { data, error } = await db
    .from("conversion_funnel_daily")
    .select("*")
    .eq("date", latest.date)
    .order("user_count", { ascending: false });

  if (error) {
    console.error("Error fetching latest funnel:", error);
    return [];
  }

  return data || [];
}

// ============================================
// FEATURE ENGAGEMENT
// ============================================

/**
 * Record feature engagement for a date
 */
export async function recordFeatureEngagement(
  date: string,
  featureName: string,
  featureCategory: string,
  stats: {
    uniqueUsers: number;
    totalSessions: number;
    totalTimeSeconds?: number;
    conversions?: number;
  }
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const conversionRate = stats.uniqueUsers > 0
    ? ((stats.conversions || 0) / stats.uniqueUsers) * 100
    : 0;

  const { error } = await db
    .from("feature_engagement_daily")
    .upsert({
      date,
      feature_name: featureName,
      feature_category: featureCategory,
      unique_users: stats.uniqueUsers,
      total_sessions: stats.totalSessions,
      total_time_seconds: stats.totalTimeSeconds || 0,
      conversions: stats.conversions || 0,
      conversion_rate: conversionRate,
    }, { onConflict: "date,feature_name" });

  if (error) {
    console.error("Error recording feature engagement:", error);
    return false;
  }

  return true;
}

/**
 * Get feature engagement by category
 */
export async function getFeatureEngagementByCategory(
  category: string,
  days: number = 30
): Promise<FeatureEngagementDaily[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await db
    .from("feature_engagement_daily")
    .select("*")
    .eq("feature_category", category)
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching feature engagement:", error);
    return [];
  }

  return data || [];
}

/**
 * Get top features by usage
 */
export async function getTopFeatures(days: number = 30, limit: number = 10): Promise<{
  feature_name: string;
  feature_category: string;
  total_users: number;
  total_sessions: number;
}[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get aggregated feature stats
  const { data, error } = await db
    .from("feature_engagement_daily")
    .select("feature_name, feature_category, unique_users, total_sessions")
    .gte("date", startDate.toISOString().split("T")[0]);

  if (error || !data) {
    console.error("Error fetching top features:", error);
    return [];
  }

  // Aggregate by feature
  const featureMap = new Map<string, {
    feature_name: string;
    feature_category: string;
    total_users: number;
    total_sessions: number;
  }>();

  for (const row of data) {
    const existing = featureMap.get(row.feature_name);
    if (existing) {
      existing.total_users += row.unique_users;
      existing.total_sessions += row.total_sessions;
    } else {
      featureMap.set(row.feature_name, {
        feature_name: row.feature_name,
        feature_category: row.feature_category,
        total_users: row.unique_users,
        total_sessions: row.total_sessions,
      });
    }
  }

  return Array.from(featureMap.values())
    .sort((a, b) => b.total_sessions - a.total_sessions)
    .slice(0, limit);
}

// ============================================
// COHORT RETENTION
// ============================================

/**
 * Record cohort retention metrics
 */
export async function recordCohortRetention(
  cohortWeek: string,
  weekOffset: number,
  cohortSize: number,
  retainedCount: number,
  revenueInPeriod?: number
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const retentionRate = cohortSize > 0
    ? (retainedCount / cohortSize) * 100
    : 0;

  const { error } = await db
    .from("cohort_metrics_weekly")
    .upsert({
      cohort_week: cohortWeek,
      week_offset: weekOffset,
      cohort_size: cohortSize,
      retained_count: retainedCount,
      retention_rate: retentionRate,
      revenue_in_period: revenueInPeriod || 0,
    }, { onConflict: "cohort_week,week_offset" });

  if (error) {
    console.error("Error recording cohort retention:", error);
    return false;
  }

  return true;
}

/**
 * Get cohort retention matrix
 */
export async function getCohortRetentionMatrix(weeks: number = 12): Promise<CohortMetrics[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeks * 7));

  const { data, error } = await db
    .from("cohort_metrics_weekly")
    .select("*")
    .gte("cohort_week", startDate.toISOString().split("T")[0])
    .order("cohort_week", { ascending: false })
    .order("week_offset", { ascending: true });

  if (error) {
    console.error("Error fetching cohort retention:", error);
    return [];
  }

  return data || [];
}

// ============================================
// DASHBOARD AGGREGATES
// ============================================

/**
 * Get complete dashboard data (all metrics in one call)
 */
export async function getDashboardMetrics(days: number = 30): Promise<{
  events: DailyEventRecord[];
  xpEconomy: XPEconomyDaily[];
  funnel: ConversionFunnelDaily[];
  features: FeatureEngagementDaily[];
  cohorts: CohortMetrics[];
  summary: {
    totalEvents: number;
    totalXPEarned: number;
    activeUsers: number;
    conversionRate: number;
  };
}> {
  const [events, xpEconomy, funnel, features, cohorts] = await Promise.all([
    getEventsByDateRange(
      new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      new Date().toISOString().split("T")[0]
    ),
    getXPEconomyTrend(days),
    getConversionFunnelTrend(days),
    getTopFeatures(days, 20).then(top => top as unknown as FeatureEngagementDaily[]),
    getCohortRetentionMatrix(12),
  ]);

  // Compute summary
  const totalEvents = events.reduce((sum, e) => sum + e.count, 0);
  const totalXPEarned = xpEconomy.reduce((sum, x) => sum + x.total_earned, 0);
  const activeUsers = xpEconomy.length > 0
    ? Math.round(xpEconomy.reduce((sum, x) => sum + x.unique_earners, 0) / xpEconomy.length)
    : 0;

  const latestFunnel = funnel.filter(f => f.date === funnel[funnel.length - 1]?.date);
  const checkoutStage = latestFunnel.find(f => f.stage_name === "checkout_complete");
  const conversionRate = checkoutStage?.conversion_rate || 0;

  return {
    events,
    xpEconomy,
    funnel,
    features: features as FeatureEngagementDaily[],
    cohorts,
    summary: {
      totalEvents,
      totalXPEarned,
      activeUsers,
      conversionRate,
    },
  };
}
