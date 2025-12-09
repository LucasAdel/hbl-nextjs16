"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  BarChart3,
  ArrowRight,
  Loader2,
  RefreshCw,
  MessageSquare,
} from "lucide-react";

interface DashboardStats {
  todayBookings: number;
  pendingBookings: number;
  documentSales: number;
  monthlyRevenue: number;
  revenueChange: number;
  activeClients: number;
  emailsQueued: number;
}

interface RecentActivity {
  id: string;
  type: "booking" | "purchase" | "consultation" | "email" | "contact";
  description: string;
  time: string;
  status: "success" | "pending" | "warning";
}

interface UpcomingBooking {
  id: string;
  client: string;
  email: string;
  type: string;
  time: string;
  status: "confirmed" | "pending" | "pending_payment" | "cancelled";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    pendingBookings: 0,
    documentSales: 0,
    monthlyRevenue: 0,
    revenueChange: 0,
    activeClients: 0,
    emailsQueued: 0,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const response = await fetch("/api/admin/dashboard");
      const result = await response.json();

      if (result.success) {
        setStats(result.data.stats);
        setRecentActivity(result.data.recentActivity);
        setUpcomingBookings(result.data.upcomingBookings);
      } else {
        setError(result.error || "Failed to load dashboard data");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4" />;
      case "purchase":
        return <FileText className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "consultation":
        return <CheckCircle className="h-4 w-4" />;
      case "contact":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-10 w-10 text-teal-600 animate-spin mx-auto" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
            <p className="mt-4 text-gray-900 dark:text-white font-medium">{error}</p>
            <button
              onClick={() => fetchDashboardData(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "warning":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <button
          onClick={() => fetchDashboardData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Bookings"
          value={stats.todayBookings}
          icon={Calendar}
          color="bg-blue-500"
          subtitle={`${stats.pendingBookings} pending`}
        />
        <StatCard
          title="Document Sales"
          value={stats.documentSales}
          icon={FileText}
          color="bg-green-500"
          subtitle="This month"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={DollarSign}
          color="bg-teal-500"
          change={stats.revenueChange}
        />
        <StatCard
          title="Active Clients"
          value={stats.activeClients}
          icon={Users}
          color="bg-purple-500"
          subtitle={`${stats.emailsQueued} emails queued`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Bookings */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Consultations
              </h2>
              <Link
                href="/admin/analytics"
                className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcomingBookings.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto" />
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  No upcoming consultations
                </p>
              </div>
            ) : (
              upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.client}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {booking.time}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {recentActivity.length === 0 ? (
              <div className="py-8 text-center">
                <Clock className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto" />
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  No recent activity
                </p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(
                      activity.status
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/analytics"
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-teal-300 transition-colors group"
        >
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center group-hover:bg-teal-200 dark:group-hover:bg-teal-900/50 transition-colors">
            <BarChart3 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              View Analytics
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Business performance
            </p>
          </div>
        </Link>

        <Link
          href="/admin/email-analytics"
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-teal-300 transition-colors group"
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Email Analytics
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sequence performance
            </p>
          </div>
        </Link>

        <Link
          href="/admin/settings"
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-teal-300 transition-colors group"
        >
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
            <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Settings
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure system
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  change,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  change?: number;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {change >= 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">
                    +{change}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-500">
                    {change}%
                  </span>
                </>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                vs last month
              </span>
            </div>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}
