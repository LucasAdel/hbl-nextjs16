"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Filter,
  ChevronDown,
} from "lucide-react";
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
} from "recharts";

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    revenueChange: number;
    totalBookings: number;
    bookingsChange: number;
    documentSales: number;
    salesChange: number;
    pageViews: number;
    viewsChange: number;
  };
  revenueByMonth: { month: string; revenue: number; bookings: number; documents: number }[];
  topDocuments: { name: string; sales: number; revenue: number }[];
  bookingsByType: { type: string; count: number; percentage: number }[];
  trafficSources: { source: string; visits: number; percentage: number }[];
  recentActivity: { action: string; description: string; time: string }[];
}

// Mock analytics data
const mockAnalytics: AnalyticsData = {
  overview: {
    totalRevenue: 45750,
    revenueChange: 12.5,
    totalBookings: 89,
    bookingsChange: 8.3,
    documentSales: 156,
    salesChange: -2.1,
    pageViews: 12450,
    viewsChange: 15.7,
  },
  revenueByMonth: [
    { month: "Jan", revenue: 3200, bookings: 12, documents: 18 },
    { month: "Feb", revenue: 4100, bookings: 15, documents: 22 },
    { month: "Mar", revenue: 3800, bookings: 14, documents: 20 },
    { month: "Apr", revenue: 5200, bookings: 18, documents: 28 },
    { month: "May", revenue: 4800, bookings: 17, documents: 25 },
    { month: "Jun", revenue: 5500, bookings: 20, documents: 30 },
  ],
  topDocuments: [
    { name: "Tenant Doctor Agreement", sales: 45, revenue: 13500 },
    { name: "Employment Contract", sales: 38, revenue: 9500 },
    { name: "Practice Sale Agreement", sales: 28, revenue: 14000 },
    { name: "Commercial Lease Review", sales: 25, revenue: 7500 },
    { name: "AHPRA Response Template", sales: 20, revenue: 4000 },
  ],
  bookingsByType: [
    { type: "Initial Consultation", count: 45, percentage: 50.6 },
    { type: "Contract Review", count: 22, percentage: 24.7 },
    { type: "Follow-up Meeting", count: 15, percentage: 16.9 },
    { type: "Emergency Consultation", count: 7, percentage: 7.8 },
  ],
  trafficSources: [
    { source: "Organic Search", visits: 5200, percentage: 41.8 },
    { source: "Direct", visits: 3100, percentage: 24.9 },
    { source: "Referral", visits: 2400, percentage: 19.3 },
    { source: "Social Media", visits: 1200, percentage: 9.6 },
    { source: "Email", visits: 550, percentage: 4.4 },
  ],
  recentActivity: [
    { action: "booking", description: "New consultation booked by Dr. Smith", time: "5 min ago" },
    { action: "purchase", description: "Tenant Doctor Agreement purchased", time: "12 min ago" },
    { action: "booking", description: "Consultation rescheduled", time: "25 min ago" },
    { action: "purchase", description: "Employment Contract Bundle purchased", time: "1 hour ago" },
    { action: "booking", description: "New consultation booked by Dr. Chen", time: "2 hours ago" },
  ],
};

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>(mockAnalytics);
  const [timeRange, setTimeRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-AU").format(num);
  };

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
            <span className="text-sm text-green-500 font-medium">+{change}%</span>
          </>
        ) : (
          <>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-500 font-medium">{change}%</span>
          </>
        )}
        <span className="text-sm text-gray-500 dark:text-gray-400">vs last period</span>
      </div>
    </motion.div>
  );

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
              Monitor your business performance and insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-tiffany"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="12m">Last 12 months</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 dark:text-gray-400 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-tiffany text-white rounded-lg font-medium hover:bg-tiffany-dark transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={analytics.overview.totalRevenue}
            change={analytics.overview.revenueChange}
            icon={DollarSign}
            format="currency"
          />
          <StatCard
            title="Bookings"
            value={analytics.overview.totalBookings}
            change={analytics.overview.bookingsChange}
            icon={Calendar}
          />
          <StatCard
            title="Document Sales"
            value={analytics.overview.documentSales}
            change={analytics.overview.salesChange}
            icon={FileText}
          />
          <StatCard
            title="Page Views"
            value={analytics.overview.pageViews}
            change={analytics.overview.viewsChange}
            icon={Eye}
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart - Interactive Line/Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-blair text-lg font-bold text-gray-900 dark:text-white">
                Revenue Overview
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-tiffany rounded-full" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Bookings</span>
                </div>
              </div>
            </div>

            {/* Interactive Recharts Area Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueByMonth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2AAFA2" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2AAFA2" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value}`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                    formatter={(value: number, name: string) => [
                      name === "revenue" ? `$${value.toLocaleString()}` : value,
                      name === "revenue" ? "Revenue" : "Bookings",
                    ]}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2AAFA2"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bookings"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: "#3B82F6", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Traffic Sources - Interactive Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="font-blair text-lg font-bold text-gray-900 dark:text-white mb-6">
              Traffic Sources
            </h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.trafficSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="percentage"
                    nameKey="source"
                  >
                    {analytics.trafficSources.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={["#2AAFA2", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"][index % 5]}
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
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {analytics.trafficSources.slice(0, 3).map((source, index) => (
                <div key={source.source} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ["#2AAFA2", "#3B82F6", "#8B5CF6"][index] }}
                    />
                    <span className="text-gray-700 dark:text-gray-300">{source.source}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{source.percentage}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="font-blair text-lg font-bold text-gray-900 dark:text-white mb-6">
              Top Selling Documents
            </h2>
            <div className="space-y-4">
              {analytics.topDocuments.map((doc, index) => (
                <div key={doc.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {doc.sales} sales
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-tiffany">
                    {formatCurrency(doc.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Booking Types - Interactive Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="font-blair text-lg font-bold text-gray-900 dark:text-white mb-6">
              Bookings by Type
            </h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.bookingsByType} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={11} />
                  <YAxis
                    type="category"
                    dataKey="type"
                    stroke="#9CA3AF"
                    fontSize={11}
                    width={90}
                    tickFormatter={(value) => value.length > 12 ? `${value.slice(0, 12)}...` : value}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                    formatter={(value: number) => [`${value} bookings`, "Count"]}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="font-blair text-lg font-bold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.action === "booking"
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-green-100 dark:bg-green-900/30"
                    }`}
                  >
                    {activity.action === "booking" ? (
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
