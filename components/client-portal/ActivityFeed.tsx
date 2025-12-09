"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  FileText,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Activity,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface ActivityItem {
  id: string;
  type: "booking" | "document" | "payment" | "profile" | "system";
  action: string;
  description: string;
  timestamp: string;
  status?: "success" | "pending" | "failed";
  metadata?: Record<string, unknown>;
}

interface ActivityFeedProps {
  userEmail: string;
  limit?: number;
}

export function ActivityFeed({ userEmail, limit = 10 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const response = await fetch(
          `/api/client-portal/activity?email=${encodeURIComponent(userEmail)}&limit=${expanded ? 20 : limit}`
        );
        const result = await response.json();
        if (result.success) {
          setActivities(result.activities);
        }
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [userEmail, limit, expanded]);

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      case "payment":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getIconStyles = (type: ActivityItem["type"], status?: string) => {
    if (status === "failed") {
      return { bg: "bg-red-100", text: "text-red-600" };
    }
    if (status === "pending") {
      return { bg: "bg-yellow-100", text: "text-yellow-600" };
    }

    switch (type) {
      case "booking":
        return { bg: "bg-tiffany/10", text: "text-tiffany" };
      case "document":
        return { bg: "bg-blue-100", text: "text-blue-600" };
      case "payment":
        return { bg: "bg-green-100", text: "text-green-600" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600" };
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case "pending":
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case "failed":
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-tiffany" />
          Recent Activity
        </h3>
        <div className="text-center py-8">
          <Activity className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-tiffany" />
        Recent Activity
      </h3>

      <div className="space-y-1">
        {activities.map((activity, index) => {
          const iconStyles = getIconStyles(activity.type, activity.status);
          const isLast = index === activities.length - 1;

          return (
            <div key={activity.id} className="relative">
              {/* Timeline connector */}
              {!isLast && (
                <div className="absolute left-[18px] top-10 bottom-0 w-0.5 bg-gray-100" />
              )}

              <div className="flex gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconStyles.bg} ${iconStyles.text}`}
                >
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                        {activity.action}
                        {getStatusIcon(activity.status)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activities.length >= limit && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full mt-4 pt-4 border-t flex items-center justify-center gap-2 text-sm text-tiffany hover:text-tiffany-dark font-medium transition-colors"
        >
          View more activity
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
