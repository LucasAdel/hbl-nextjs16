"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Mail,
  Eye,
  MousePointer,
  AlertTriangle,
  Users,
  TrendingUp,
  Pause,
  Play,
  X,
  RefreshCw,
  Calendar,
} from "lucide-react";

interface SequenceStats {
  sequenceType: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  cancelledEnrollments: number;
  pausedEnrollments: number;
}

interface EventStats {
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

interface DailyStats {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
}

interface Enrollment {
  id: string;
  email: string;
  sequence_type: string;
  current_step: number;
  status: string;
  started_at: string;
  next_email_at: string | null;
}

interface AnalyticsData {
  sequenceStats: SequenceStats[];
  eventStats: EventStats;
  dailyStats: DailyStats[];
  recentEnrollments: Enrollment[];
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

const SEQUENCE_COLORS: Record<string, string> = {
  welcome_series: "#2AAFA2",
  post_consultation: "#6366f1",
  post_purchase: "#f59e0b",
  booking_reminder: "#ec4899",
  re_engagement: "#8b5cf6",
  cart_abandonment: "#ef4444",
};

const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e",
  completed: "#2AAFA2",
  paused: "#f59e0b",
  cancelled: "#ef4444",
};

const PIE_COLORS = ["#22c55e", "#2AAFA2", "#f59e0b", "#ef4444"];

export default function EmailAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [selectedSequence, setSelectedSequence] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ days: days.toString() });
      if (selectedSequence) params.append("sequenceType", selectedSequence);

      const response = await fetch(`/api/admin/email-analytics?${params}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days, selectedSequence]);

  const handleEnrollmentAction = async (
    enrollmentId: string,
    action: "pause" | "resume" | "cancel"
  ) => {
    setActionLoading(enrollmentId);
    try {
      const response = await fetch("/api/admin/email-analytics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId, action }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatSequenceName = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-AU", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Email Analytics
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Monitor email sequence performance and engagement
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>

            {/* Sequence Filter */}
            <select
              value={selectedSequence}
              onChange={(e) => setSelectedSequence(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Sequences</option>
              <option value="welcome_series">Welcome Series</option>
              <option value="post_consultation">Post Consultation</option>
              <option value="post_purchase">Post Purchase</option>
              <option value="booking_reminder">Booking Reminder</option>
              <option value="re_engagement">Re-engagement</option>
              <option value="cart_abandonment">Cart Abandonment</option>
            </select>

            <button
              onClick={fetchData}
              className="flex items-center gap-2 rounded-lg bg-teal-primary px-4 py-2 text-sm font-medium text-white hover:bg-teal-hover"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Emails Sent"
            value={data?.eventStats.sent || 0}
            icon={Mail}
            color="bg-blue-500"
          />
          <StatCard
            title="Open Rate"
            value={`${data?.eventStats.openRate || 0}%`}
            icon={Eye}
            color="bg-green-500"
            subtitle={`${data?.eventStats.opened || 0} opened`}
          />
          <StatCard
            title="Click Rate"
            value={`${data?.eventStats.clickRate || 0}%`}
            icon={MousePointer}
            color="bg-purple-500"
            subtitle={`${data?.eventStats.clicked || 0} clicked`}
          />
          <StatCard
            title="Bounce Rate"
            value={`${data?.eventStats.bounceRate || 0}%`}
            icon={AlertTriangle}
            color={data?.eventStats.bounceRate && data.eventStats.bounceRate > 5 ? "bg-red-500" : "bg-yellow-500"}
            subtitle={`${data?.eventStats.bounced || 0} bounced`}
          />
        </div>

        {/* Charts Row */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Line Chart - Daily Trends */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Email Activity Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.dailyStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  labelFormatter={formatDate}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sent"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Sent"
                />
                <Line
                  type="monotone"
                  dataKey="opened"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  name="Opened"
                />
                <Line
                  type="monotone"
                  dataKey="clicked"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  name="Clicked"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sequence Distribution */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Enrollments by Sequence
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.sequenceStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="sequenceType"
                  tickFormatter={(v) => formatSequenceName(v).slice(0, 10)}
                  stroke="#9ca3af"
                  fontSize={11}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  labelFormatter={formatSequenceName}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="activeEnrollments" fill="#22c55e" name="Active" />
                <Bar dataKey="completedEnrollments" fill="#2AAFA2" name="Completed" />
                <Bar dataKey="pausedEnrollments" fill="#f59e0b" name="Paused" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sequence Stats Table */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Sequence Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Sequence</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Total</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Active</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Completed</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Paused</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Cancelled</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data?.sequenceStats.map((seq) => (
                  <tr key={seq.sequenceType}>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: SEQUENCE_COLORS[seq.sequenceType] || "#6b7280" }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatSequenceName(seq.sequenceType)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">{seq.totalEnrollments}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        {seq.activeEnrollments}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-teal-100 px-2 py-1 text-xs font-medium text-teal-700">
                        {seq.completedEnrollments}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                        {seq.pausedEnrollments}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                        {seq.cancelledEnrollments}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">
                      {seq.totalEnrollments > 0
                        ? `${Math.round((seq.completedEnrollments / seq.totalEnrollments) * 100)}%`
                        : "0%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Enrollments Table with Actions */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Recent Enrollments
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Sequence</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Step</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Next Email</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data?.recentEnrollments.slice(0, 20).map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td className="py-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {enrollment.email}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">
                      {formatSequenceName(enrollment.sequence_type)}
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">
                      Step {enrollment.current_step}
                    </td>
                    <td className="py-3">
                      <span
                        className="rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: `${STATUS_COLORS[enrollment.status]}20`,
                          color: STATUS_COLORS[enrollment.status],
                        }}
                      >
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">
                      {enrollment.next_email_at
                        ? new Date(enrollment.next_email_at).toLocaleString("en-AU", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {enrollment.status === "active" && (
                          <button
                            onClick={() => handleEnrollmentAction(enrollment.id, "pause")}
                            disabled={actionLoading === enrollment.id}
                            className="rounded p-1 text-yellow-600 hover:bg-yellow-50"
                            title="Pause"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        )}
                        {enrollment.status === "paused" && (
                          <button
                            onClick={() => handleEnrollmentAction(enrollment.id, "resume")}
                            disabled={actionLoading === enrollment.id}
                            className="rounded p-1 text-green-600 hover:bg-green-50"
                            title="Resume"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        {["active", "paused"].includes(enrollment.status) && (
                          <button
                            onClick={() => handleEnrollmentAction(enrollment.id, "cancel")}
                            disabled={actionLoading === enrollment.id}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-lg ${color} p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}
