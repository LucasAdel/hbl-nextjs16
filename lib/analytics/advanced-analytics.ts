/**
 * Advanced Analytics - BMAD Phase 3
 *
 * Comprehensive analytics for:
 * - Conversion funnel tracking
 * - XP economy health monitoring
 * - Feature engagement metrics
 * - Cohort analysis
 * - Revenue attribution
 */

export interface AnalyticsDashboard {
  overview: OverviewMetrics;
  xpEconomy: XPEconomyMetrics;
  conversionFunnel: ConversionFunnel;
  featureEngagement: FeatureEngagement[];
  cohortAnalysis: CohortData[];
  revenueAttribution: RevenueAttribution[];
}

export interface OverviewMetrics {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  repeatPurchaseRate: number;
  customerLifetimeValue: number;
  trends: {
    users: TrendData;
    revenue: TrendData;
    conversion: TrendData;
  };
}

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  direction: "up" | "down" | "stable";
}

export interface XPEconomyMetrics {
  totalXPEarned: number;
  totalXPRedeemed: number;
  xpRedemptionRate: number;
  averageXPPerUser: number;
  earnRate: {
    daily: number;
    weekly: number;
  };
  redemptionValue: {
    totalDiscounts: number;
    averageDiscount: number;
    roi: number; // Revenue per $1 of discount
  };
  streakMetrics: {
    activeStreaks: number;
    averageStreakLength: number;
    streakRetention7Day: number;
    streakRetention30Day: number;
  };
  healthScore: number; // 0-100
  alerts: HealthAlert[];
}

export interface HealthAlert {
  type: "warning" | "critical" | "info";
  message: string;
  metric: string;
  value: number;
  threshold: number;
}

export interface ConversionFunnel {
  stages: FunnelStage[];
  overallConversion: number;
  dropOffPoints: DropOffPoint[];
}

export interface FunnelStage {
  name: string;
  users: number;
  percentage: number;
  conversionToNext: number;
}

export interface DropOffPoint {
  from: string;
  to: string;
  dropOffRate: number;
  suggestions: string[];
}

export interface FeatureEngagement {
  feature: string;
  category: "tool" | "gamification" | "social" | "purchase";
  users: number;
  sessions: number;
  averageTimeSpent: number;
  conversionRate: number;
  revenueAttributed: number;
  xpAwarded: number;
  trend: TrendData;
}

export interface CohortData {
  cohort: string; // e.g., "2024-W48"
  size: number;
  retention: {
    week1: number;
    week2: number;
    week4: number;
    week8: number;
    week12: number;
  };
  ltv: number;
  averagePurchases: number;
}

export interface RevenueAttribution {
  source: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  conversionRate: number;
  contribution: number; // Percentage of total
}

// In-memory analytics data (replace with real DB queries)
const analyticsCache = new Map<string, AnalyticsDashboard>();

/**
 * Calculate XP economy health score
 */
function calculateXPHealthScore(metrics: Partial<XPEconomyMetrics>): {
  score: number;
  alerts: HealthAlert[];
} {
  const alerts: HealthAlert[] = [];
  let score = 100;

  // Check redemption rate (ideal: 50-70%)
  const redemptionRate = metrics.xpRedemptionRate || 0;
  if (redemptionRate < 30) {
    score -= 15;
    alerts.push({
      type: "warning",
      message: "Low XP redemption rate - users may not see value in XP",
      metric: "redemptionRate",
      value: redemptionRate,
      threshold: 30,
    });
  } else if (redemptionRate > 85) {
    score -= 10;
    alerts.push({
      type: "info",
      message: "Very high redemption rate - consider adjusting XP-to-discount ratio",
      metric: "redemptionRate",
      value: redemptionRate,
      threshold: 85,
    });
  }

  // Check streak retention
  const streakRetention = metrics.streakMetrics?.streakRetention7Day || 0;
  if (streakRetention < 30) {
    score -= 20;
    alerts.push({
      type: "critical",
      message: "Low 7-day streak retention - engagement system needs attention",
      metric: "streakRetention7Day",
      value: streakRetention,
      threshold: 30,
    });
  }

  // Check daily earn rate
  const dailyEarnRate = metrics.earnRate?.daily || 0;
  if (dailyEarnRate < 50) {
    score -= 10;
    alerts.push({
      type: "warning",
      message: "Low daily XP earn rate - users not engaging with XP system",
      metric: "dailyEarnRate",
      value: dailyEarnRate,
      threshold: 50,
    });
  }

  // Check ROI
  const roi = metrics.redemptionValue?.roi || 0;
  if (roi < 3) {
    score -= 15;
    alerts.push({
      type: "critical",
      message: "Low XP ROI - discounts not driving enough revenue",
      metric: "xpROI",
      value: roi,
      threshold: 3,
    });
  }

  return { score: Math.max(0, score), alerts };
}

/**
 * Generate demo analytics data
 */
export function generateDemoAnalytics(): AnalyticsDashboard {
  const xpMetrics: XPEconomyMetrics = {
    totalXPEarned: 2847500,
    totalXPRedeemed: 1425000,
    xpRedemptionRate: 50.1,
    averageXPPerUser: 1847,
    earnRate: {
      daily: 156,
      weekly: 892,
    },
    redemptionValue: {
      totalDiscounts: 14250,
      averageDiscount: 8.5,
      roi: 5.2,
    },
    streakMetrics: {
      activeStreaks: 342,
      averageStreakLength: 8.4,
      streakRetention7Day: 45,
      streakRetention30Day: 22,
    },
    healthScore: 0,
    alerts: [],
  };

  const { score, alerts } = calculateXPHealthScore(xpMetrics);
  xpMetrics.healthScore = score;
  xpMetrics.alerts = alerts;

  return {
    overview: {
      totalUsers: 1542,
      activeUsers: {
        daily: 234,
        weekly: 687,
        monthly: 1089,
      },
      totalRevenue: 287450,
      averageOrderValue: 149,
      conversionRate: 3.8,
      repeatPurchaseRate: 34,
      customerLifetimeValue: 425,
      trends: {
        users: { current: 234, previous: 198, change: 36, changePercent: 18.2, direction: "up" },
        revenue: { current: 45200, previous: 38900, change: 6300, changePercent: 16.2, direction: "up" },
        conversion: { current: 3.8, previous: 3.2, change: 0.6, changePercent: 18.75, direction: "up" },
      },
    },
    xpEconomy: xpMetrics,
    conversionFunnel: {
      stages: [
        { name: "Visitors", users: 15420, percentage: 100, conversionToNext: 32.5 },
        { name: "Signups", users: 5012, percentage: 32.5, conversionToNext: 45.2 },
        { name: "Tool Engaged", users: 2265, percentage: 14.7, conversionToNext: 28.4 },
        { name: "Add to Cart", users: 643, percentage: 4.2, conversionToNext: 58.3 },
        { name: "Purchase", users: 375, percentage: 2.4, conversionToNext: 100 },
      ],
      overallConversion: 2.4,
      dropOffPoints: [
        {
          from: "Signups",
          to: "Tool Engaged",
          dropOffRate: 54.8,
          suggestions: [
            "Send welcome email with tool links",
            "Add onboarding tour highlighting tools",
            "Offer XP bonus for first tool completion",
          ],
        },
        {
          from: "Tool Engaged",
          to: "Add to Cart",
          dropOffRate: 71.6,
          suggestions: [
            "Show personalized recommendations after tool use",
            "Highlight XP savings on recommended products",
            "Add \"Complete your compliance\" bundle prompts",
          ],
        },
      ],
    },
    featureEngagement: [
      {
        feature: "ROI Calculator",
        category: "tool",
        users: 1245,
        sessions: 2890,
        averageTimeSpent: 185,
        conversionRate: 12.4,
        revenueAttributed: 45200,
        xpAwarded: 186750,
        trend: { current: 1245, previous: 980, change: 265, changePercent: 27, direction: "up" },
      },
      {
        feature: "Compliance Quiz",
        category: "tool",
        users: 987,
        sessions: 1456,
        averageTimeSpent: 420,
        conversionRate: 18.7,
        revenueAttributed: 67800,
        xpAwarded: 690900,
        trend: { current: 987, previous: 756, change: 231, changePercent: 30.6, direction: "up" },
      },
      {
        feature: "Document Configurator",
        category: "tool",
        users: 654,
        sessions: 1234,
        averageTimeSpent: 340,
        conversionRate: 24.5,
        revenueAttributed: 89400,
        xpAwarded: 65400,
        trend: { current: 654, previous: 598, change: 56, changePercent: 9.4, direction: "up" },
      },
      {
        feature: "Daily Challenges",
        category: "gamification",
        users: 456,
        sessions: 8970,
        averageTimeSpent: 45,
        conversionRate: 8.2,
        revenueAttributed: 23400,
        xpAwarded: 342000,
        trend: { current: 456, previous: 389, change: 67, changePercent: 17.2, direction: "up" },
      },
      {
        feature: "Streak System",
        category: "gamification",
        users: 342,
        sessions: 12450,
        averageTimeSpent: 15,
        conversionRate: 15.6,
        revenueAttributed: 34500,
        xpAwarded: 285000,
        trend: { current: 342, previous: 298, change: 44, changePercent: 14.8, direction: "up" },
      },
    ],
    cohortAnalysis: [
      {
        cohort: "2024-W48",
        size: 245,
        retention: { week1: 68, week2: 52, week4: 38, week8: 28, week12: 22 },
        ltv: 380,
        averagePurchases: 2.1,
      },
      {
        cohort: "2024-W47",
        size: 198,
        retention: { week1: 65, week2: 48, week4: 35, week8: 25, week12: 19 },
        ltv: 345,
        averagePurchases: 1.9,
      },
      {
        cohort: "2024-W46",
        size: 212,
        retention: { week1: 62, week2: 45, week4: 32, week8: 23, week12: 17 },
        ltv: 310,
        averagePurchases: 1.7,
      },
    ],
    revenueAttribution: [
      { source: "Compliance Quiz", revenue: 67800, orders: 156, averageOrderValue: 435, conversionRate: 18.7, contribution: 23.6 },
      { source: "Document Configurator", revenue: 89400, orders: 234, averageOrderValue: 382, conversionRate: 24.5, contribution: 31.1 },
      { source: "ROI Calculator", revenue: 45200, orders: 145, averageOrderValue: 312, conversionRate: 12.4, contribution: 15.7 },
      { source: "Direct Purchase", revenue: 42350, orders: 187, averageOrderValue: 226, conversionRate: 6.8, contribution: 14.7 },
      { source: "Email Campaign", revenue: 24700, orders: 89, averageOrderValue: 277, conversionRate: 4.2, contribution: 8.6 },
      { source: "Referral", revenue: 18000, orders: 67, averageOrderValue: 269, conversionRate: 22.3, contribution: 6.3 },
    ],
  };
}

/**
 * Get analytics dashboard data
 */
export function getAnalyticsDashboard(
  timeRange: "day" | "week" | "month" | "quarter" = "week"
): AnalyticsDashboard {
  const cacheKey = `analytics-${timeRange}`;

  // Check cache
  if (analyticsCache.has(cacheKey)) {
    return analyticsCache.get(cacheKey)!;
  }

  // Generate demo data (in production, query real data)
  const dashboard = generateDemoAnalytics();

  // Cache for 5 minutes
  analyticsCache.set(cacheKey, dashboard);
  setTimeout(() => analyticsCache.delete(cacheKey), 5 * 60 * 1000);

  return dashboard;
}

/**
 * Export analytics data
 */
export function exportAnalyticsData(
  dashboard: AnalyticsDashboard,
  format: "csv" | "json"
): string {
  if (format === "json") {
    return JSON.stringify(dashboard, null, 2);
  }

  // CSV format for overview metrics
  const rows = [
    ["Metric", "Value"],
    ["Total Users", dashboard.overview.totalUsers],
    ["Daily Active Users", dashboard.overview.activeUsers.daily],
    ["Weekly Active Users", dashboard.overview.activeUsers.weekly],
    ["Monthly Active Users", dashboard.overview.activeUsers.monthly],
    ["Total Revenue", `$${dashboard.overview.totalRevenue}`],
    ["Average Order Value", `$${dashboard.overview.averageOrderValue}`],
    ["Conversion Rate", `${dashboard.overview.conversionRate}%`],
    ["Repeat Purchase Rate", `${dashboard.overview.repeatPurchaseRate}%`],
    ["Customer LTV", `$${dashboard.overview.customerLifetimeValue}`],
    ["XP Health Score", dashboard.xpEconomy.healthScore],
    ["Total XP Earned", dashboard.xpEconomy.totalXPEarned],
    ["Total XP Redeemed", dashboard.xpEconomy.totalXPRedeemed],
    ["XP Redemption Rate", `${dashboard.xpEconomy.xpRedemptionRate}%`],
  ];

  return rows.map((row) => row.join(",")).join("\n");
}
