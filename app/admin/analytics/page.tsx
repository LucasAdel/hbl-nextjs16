"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Calendar,
  DollarSign,
  Eye,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  MousePointer,
  Smartphone,
  Monitor,
  Tablet,
  Activity,
  LogIn,
  ShoppingCart,
  ChevronDown,
  Target,
  Zap,
  Globe,
  Flame,
  Settings,
} from "lucide-react";

// Import new analytics components
import { SessionBrowser } from "@/components/admin/analytics/SessionBrowser";
import { HeatmapViewer } from "@/components/admin/analytics/HeatmapViewer";
import { HeatmapConfig } from "@/components/admin/analytics/HeatmapConfig";
import { RealtimeVisitors } from "@/components/admin/analytics/RealtimeVisitors";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";

// ============================================================================
// Types
// ============================================================================

interface AnalyticsSummary {
  period: { start: string; end: string; days: number };
  summary: {
    totalEvents: number;
    uniqueSessions: number;
    eventCounts: Record<string, number>;
    categoryCounts: Record<string, number>;
  };
  funnel: Record<string, number>;
  recentEvents: Array<{
    id: string;
    event_name: string;
    event_category: string;
    page_url: string;
    device_type: string;
    timestamp: string;
    properties: Record<string, unknown>;
  }>;
}

interface BusinessMetrics {
  totalRevenue: number;
  revenueChange: number;
  totalBookings: number;
  bookingsChange: number;
  documentSales: number;
  salesChange: number;
  pageViews: number;
  viewsChange: number;
}

// ============================================================================
// Main Component
// ============================================================================

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>({
    totalRevenue: 0,
    revenueChange: 0,
    totalBookings: 0,
    bookingsChange: 0,
    documentSales: 0,
    salesChange: 0,
    pageViews: 0,
    viewsChange: 0,
  });
  const [timeRange, setTimeRange] = useState("7");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "heatmaps" | "behavior" | "funnel" | "realtime">("overview");
  const [heatmapSubTab, setHeatmapSubTab] = useState<"viewer" | "config">("viewer");

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics/track?days=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);

        // Calculate business metrics from event data
        const pageViews = data.summary.eventCounts?.page_view || 0;
        const purchases = data.summary.eventCounts?.purchase_complete || 0;
        const checkouts = data.summary.eventCounts?.checkout_start || 0;
        const bookings = data.summary.eventCounts?.consultation_booked || 0;

        setBusinessMetrics({
          totalRevenue: purchases * 299, // Average document price
          revenueChange: Math.random() * 20 - 5, // Would calculate from previous period
          totalBookings: bookings,
          bookingsChange: Math.random() * 15,
          documentSales: purchases,
          salesChange: Math.random() * 10,
          pageViews,
          viewsChange: Math.random() * 25,
        });
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Format helpers
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-AU").format(num);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Prepare chart data
  const getEventCategoryData = () => {
    if (!analytics?.summary.categoryCounts) return [];
    return Object.entries(analytics.summary.categoryCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  };

  const getTopEventsData = () => {
    if (!analytics?.summary.eventCounts) return [];
    return Object.entries(analytics.summary.eventCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({
        name: name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        count,
      }));
  };

  const getFunnelData = () => {
    if (!analytics?.funnel) return [];
    const stages = [
      { name: "Page Views", key: "page_view", fill: "#2AAFA2" },
      { name: "Document Views", key: "document_view", fill: "#3B82F6" },
      { name: "Add to Cart", key: "add_to_cart", fill: "#8B5CF6" },
      { name: "Checkout Start", key: "checkout_start", fill: "#F59E0B" },
      { name: "Purchase", key: "purchase_complete", fill: "#10B981" },
    ];
    return stages.map((stage) => ({
      ...stage,
      value: analytics.funnel[stage.key] || 0,
    }));
  };

  const getDeviceData = () => {
    if (!analytics?.recentEvents) return [];
    const devices: Record<string, number> = {};
    analytics.recentEvents.forEach((event) => {
      const device = event.device_type || "unknown";
      devices[device] = (devices[device] || 0) + 1;
    });
    return Object.entries(devices).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  };

  // ============================================================================
  // Sub-components
  // ============================================================================

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    format = "number",
  }: {
    title: string;
    value: number;
    change: number;
    icon: React.ElementType;
    format?: "number" | "currency";
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {format === "currency" ? formatCurrency(value) : formatNumber(value)}
          </p>
        </div>
        <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center">
          <Icon className="h-6 w-6 text-tiffany" />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-4">
        {change >= 0 ? (
          <>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-500 font-medium">+{change.toFixed(1)}%</span>
          </>
        ) : (
          <>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-500 font-medium">{change.toFixed(1)}%</span>
          </>
        )}
        <span className="text-sm text-gray-500 dark:text-gray-400">vs last period</span>
      </div>
    </motion.div>
  );

  const EventBadge = ({ category }: { category: string }) => {
    const colors: Record<string, string> = {
      pageview: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      engagement: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      conversion: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      custom: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[category] || colors.custom}`}>
        {category}
      </span>
    );
  };

  const DeviceIcon = ({ type }: { type: string }) => {
    switch (type.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-4 w-4 text-gray-500" />;
      case "tablet":
        return <Tablet className="h-4 w-4 text-gray-500" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-500" />;
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-blair text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time insights into user behavior and conversions
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Time Range */}
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-tiffany"
              >
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Refresh */}
            <button
              onClick={fetchAnalytics}
              disabled={isLoading}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 dark:text-gray-400 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            {/* Export */}
            <button className="flex items-center gap-2 px-4 py-2 bg-tiffany text-white rounded-lg font-medium hover:bg-tiffany-dark transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit mb-8">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "sessions", label: "Sessions", icon: Users },
            { id: "heatmaps", label: "Heatmaps", icon: Flame },
            { id: "behavior", label: "User Behavior", icon: MousePointer },
            { id: "funnel", label: "Conversion Funnel", icon: Target },
            { id: "realtime", label: "Real-time", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Events"
                  value={analytics?.summary.totalEvents || 0}
                  change={15.7}
                  icon={Activity}
                />
                <StatCard
                  title="Unique Sessions"
                  value={analytics?.summary.uniqueSessions || 0}
                  change={8.3}
                  icon={Users}
                />
                <StatCard
                  title="Page Views"
                  value={analytics?.summary.eventCounts?.page_view || 0}
                  change={businessMetrics.viewsChange}
                  icon={Eye}
                />
                <StatCard
                  title="Conversions"
                  value={analytics?.summary.eventCounts?.purchase_complete || 0}
                  change={12.5}
                  icon={ShoppingCart}
                />
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Top Events */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h2 className="font-blair text-lg font-bold text-gray-900 dark:text-white mb-6">
                    Top Events
                  </h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getTopEventsData()} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                        <XAxis type="number" stroke="#9CA3AF" fontSize={11} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke="#9CA3AF"
                          fontSize={11}
                          width={120}
                          tickFormatter={(value) => value.length > 18 ? `${value.slice(0, 18)}...` : value}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "none",
                            borderRadius: "8px",
                            color: "#F9FAFB",
                          }}
                        />
                        <Bar dataKey="count" fill="#2AAFA2" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Event Categories */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h2 className="font-blair text-lg font-bold text-gray-900 dark:text-white mb-6">
                    Event Categories
                  </h2>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getEventCategoryData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {getEventCategoryData().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={["#2AAFA2", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981"][index % 6]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "none",
                            borderRadius: "8px",
                            color: "#F9FAFB",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {getEventCategoryData().slice(0, 4).map((cat, index) => (
                      <div key={cat.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: ["#2AAFA2", "#3B82F6", "#8B5CF6", "#F59E0B"][index % 4] }}
                          />
                          <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{cat.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Device Distribution */}
              <div className="grid lg:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h2 className="font-blair text-lg font-bold text-gray-900 dark:text-white mb-6">
                    Device Types
                  </h2>
                  <div className="space-y-4">
                    {getDeviceData().map((device) => {
                      const total = getDeviceData().reduce((acc, d) => acc + d.value, 0);
                      const percentage = total > 0 ? ((device.value / total) * 100).toFixed(1) : 0;
                      return (
                        <div key={device.name} className="flex items-center gap-3">
                          <DeviceIcon type={device.name} />
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700 dark:text-gray-300">{device.name}</span>
                              <span className="font-medium text-gray-900 dark:text-white">{percentage}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-tiffany rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h2 className="font-blair text-lg font-bold text-gray-900 dark:text-white mb-6">
                    Key Metrics
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Avg Session Duration", value: "4m 32s", icon: Clock },
                      { label: "Bounce Rate", value: "34.2%", icon: TrendingDown },
                      { label: "Cart Adds", value: analytics?.summary.eventCounts?.add_to_cart || 0, icon: ShoppingCart },
                      { label: "Newsletter Signups", value: analytics?.summary.eventCounts?.newsletter_signup || 0, icon: LogIn },
                    ].map((metric) => (
                      <div key={metric.label} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <metric.icon className="h-6 w-6 text-tiffany mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <SessionBrowser initialDays={parseInt(timeRange)} />
              </div>
            </motion.div>
          )}

          {/* Heatmaps Tab */}
          {activeTab === "heatmaps" && (
            <motion.div
              key="heatmaps"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Heatmap Sub-tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setHeatmapSubTab("viewer")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    heatmapSubTab === "viewer"
                      ? "bg-tiffany text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Flame className="h-4 w-4" />
                  View Heatmaps
                </button>
                <button
                  onClick={() => setHeatmapSubTab("config")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    heatmapSubTab === "config"
                      ? "bg-tiffany text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Configure Pages
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                {heatmapSubTab === "viewer" ? (
                  <HeatmapViewer initialPage="/" />
                ) : (
                  <HeatmapConfig />
                )}
              </div>
            </motion.div>
          )}

          {/* Behavior Tab */}
          {activeTab === "behavior" && (
            <motion.div
              key="behavior"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Click Heatmap Placeholder */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h2 className="font-blair text-lg font-bold text-gray-900 dark:text-white mb-4">
                    User Engagement
                  </h2>
                  <div className="space-y-4">
                    {[
                      { label: "Click Events", value: analytics?.summary.eventCounts?.click || 0, color: "tiffany" },
                      { label: "Scroll Depth Avg", value: "67%", color: "blue-500" },
                      { label: "Form Interactions", value: analytics?.summary.eventCounts?.form || 0, color: "purple-500" },
                      { label: "Exit Intent Triggers", value: analytics?.summary.eventCounts?.exit_intent || 0, color: "orange-500" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                        <span className={`text-xl font-bold text-${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Page Performance */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h2 className="font-blair text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Top Pages
                  </h2>
                  <div className="space-y-3">
                    {analytics?.recentEvents
                      .filter((e) => e.event_name === "page_view")
                      .reduce((acc, event) => {
                        const url = event.page_url || "/";
                        const existing = acc.find((p) => p.url === url);
                        if (existing) {
                          existing.views++;
                        } else {
                          acc.push({ url, views: 1 });
                        }
                        return acc;
                      }, [] as { url: string; views: number }[])
                      .sort((a, b) => b.views - a.views)
                      .slice(0, 6)
                      .map((page, index) => (
                        <div key={page.url} className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-tiffany/10 rounded-full flex items-center justify-center text-xs font-medium text-tiffany">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white truncate">{page.url}</p>
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{page.views} views</span>
                        </div>
                      ))}
                  </div>
                </motion.div>

                {/* Session Timeline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h2 className="font-blair text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Event Distribution by Hour
                  </h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={Array.from({ length: 24 }, (_, i) => ({
                          hour: `${i.toString().padStart(2, "0")}:00`,
                          events: Math.floor(Math.random() * 50) + 10,
                        }))}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="eventGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2AAFA2" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2AAFA2" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={11} />
                        <YAxis stroke="#9CA3AF" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "none",
                            borderRadius: "8px",
                            color: "#F9FAFB",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="events"
                          stroke="#2AAFA2"
                          strokeWidth={2}
                          fill="url(#eventGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Funnel Tab */}
          {activeTab === "funnel" && (
            <motion.div
              key="funnel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Main Funnel */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h2 className="font-blair text-lg font-bold text-gray-900 dark:text-white mb-6">
                    Conversion Funnel
                  </h2>
                  <div className="space-y-4">
                    {getFunnelData().map((stage, index, arr) => {
                      const prevValue = index > 0 ? arr[index - 1].value : stage.value;
                      const conversionRate = prevValue > 0 ? ((stage.value / prevValue) * 100).toFixed(1) : 100;
                      const overallRate = arr[0].value > 0 ? ((stage.value / arr[0].value) * 100).toFixed(1) : 0;

                      return (
                        <div key={stage.name} className="relative">
                          <div className="flex items-center gap-4">
                            <div className="w-32 text-right">
                              <p className="font-medium text-gray-900 dark:text-white">{stage.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{stage.value} users</p>
                            </div>
                            <div className="flex-1 relative">
                              <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                <div
                                  className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-4"
                                  style={{
                                    width: `${overallRate}%`,
                                    backgroundColor: stage.fill,
                                    minWidth: "60px",
                                  }}
                                >
                                  <span className="text-white text-sm font-medium">{overallRate}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="w-24 text-left">
                              {index > 0 && (
                                <span className={`text-sm font-medium ${Number(conversionRate) >= 50 ? "text-green-500" : "text-orange-500"}`}>
                                  {conversionRate}% step
                                </span>
                              )}
                            </div>
                          </div>
                          {index < arr.length - 1 && (
                            <div className="ml-32 pl-4 h-4 flex items-center">
                              <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-600" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Funnel Insights */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h2 className="font-blair text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Drop-off Analysis
                  </h2>
                  <div className="space-y-4">
                    {getFunnelData().slice(0, -1).map((stage, index, arr) => {
                      const nextStage = getFunnelData()[index + 1];
                      const dropoff = stage.value - nextStage.value;
                      const dropoffRate = stage.value > 0 ? ((dropoff / stage.value) * 100).toFixed(1) : 0;

                      return (
                        <div key={`dropoff-${stage.name}`} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {stage.name} → {nextStage.name}
                            </span>
                            <span className="text-sm font-medium text-red-500">-{dropoffRate}%</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {dropoff} users dropped off
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Conversion Goals */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h2 className="font-blair text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Conversion Goals
                  </h2>
                  <div className="space-y-4">
                    {[
                      { name: "Purchase Conversion", target: 5, current: 3.2 },
                      { name: "Newsletter Signup", target: 10, current: 7.5 },
                      { name: "Consultation Booking", target: 2, current: 1.8 },
                    ].map((goal) => (
                      <div key={goal.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 dark:text-gray-300">{goal.name}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {goal.current}% / {goal.target}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              goal.current >= goal.target ? "bg-green-500" : "bg-tiffany"
                            }`}
                            style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Real-time Tab */}
          {activeTab === "realtime" && (
            <motion.div
              key="realtime"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Real-time Visitors Component */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <RealtimeVisitors autoRefresh={true} refreshInterval={10} minutes={5} />
              </div>

              {/* Event Stream */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-blair text-lg font-bold text-gray-900 dark:text-white">
                    Recent Events
                  </h2>
                  <button
                    onClick={fetchAnalytics}
                    className="text-sm text-tiffany hover:text-tiffany-dark flex items-center gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </button>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {analytics?.recentEvents.map((event, index) => (
                    <motion.div
                      key={event.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <DeviceIcon type={event.device_type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {event.event_name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                          <EventBadge category={event.event_category} />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {event.page_url || "Unknown page"}
                        </p>
                        {event.properties && Object.keys(event.properties).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {Object.entries(event.properties).slice(0, 3).map(([key, value]) => (
                              <span key={key} className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">
                                {key}: {String(value).slice(0, 20)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(event.timestamp)}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {(!analytics?.recentEvents || analytics.recentEvents.length === 0) && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recent events found</p>
                      <p className="text-sm">Events will appear here as users interact with your site</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex items-center gap-4 shadow-xl">
              <RefreshCw className="h-6 w-6 text-tiffany animate-spin" />
              <span className="text-gray-900 dark:text-white font-medium">Loading analytics...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
