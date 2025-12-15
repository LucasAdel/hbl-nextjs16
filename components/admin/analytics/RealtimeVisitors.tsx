"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  RefreshCw,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  FileText,
  Activity,
} from "lucide-react";

// Types
interface RealtimeVisitor {
  session_id: string;
  current_page: string;
  current_page_title: string | null;
  device_type: string;
  country_code: string;
  pages_viewed: number;
  started_at: string;
  last_activity: string;
  duration_seconds: number;
}

interface RealtimeData {
  active_visitors: number;
  visitors: RealtimeVisitor[];
  breakdown: {
    by_device: Record<string, number>;
    by_country: Record<string, number>;
    by_page: Record<string, number>;
  };
  minutes: number;
  timestamp: string;
}

interface RealtimeVisitorsProps {
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
  minutes?: number;
}

export function RealtimeVisitors({
  autoRefresh = true,
  refreshInterval = 10,
  minutes = 5,
}: RealtimeVisitorsProps) {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch realtime data
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics/realtime?minutes=${minutes}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch realtime data");
      }

      setData(result.data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [minutes]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh, refreshInterval]);

  // Get device icon
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Format time ago
  const formatTimeAgo = (timestamp: string): string => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  // Get country flag emoji (simple version)
  const getCountryFlag = (code: string): string => {
    if (!code || code === "unknown") return "🌍";
    // Convert country code to flag emoji
    const codePoints = code
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    try {
      return String.fromCodePoint(...codePoints);
    } catch {
      return "🌍";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Real-time Visitors</h3>
          </div>

          {data && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-bold text-lg">{data.active_visitors}</span>
              <span className="text-sm">online</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          {lastUpdate && (
            <span>Updated {formatTimeAgo(lastUpdate.toISOString())}</span>
          )}
          <button
            onClick={fetchData}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && !data && (
        <div className="py-8 text-center text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
          Loading realtime data...
        </div>
      )}

      {/* Main Content */}
      {data && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Breakdown Cards */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              By Device
            </h4>
            <div className="space-y-2">
              {Object.entries(data.breakdown.by_device).map(([device, count]) => (
                <div key={device} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    {getDeviceIcon(device)}
                    <span className="capitalize">{device}</span>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(data.breakdown.by_device).length === 0 && (
                <p className="text-sm text-gray-400">No data</p>
              )}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              By Country
            </h4>
            <div className="space-y-2">
              {Object.entries(data.breakdown.by_country)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{getCountryFlag(country)}</span>
                      <span className="uppercase">{country}</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              {Object.keys(data.breakdown.by_country).length === 0 && (
                <p className="text-sm text-gray-400">No data</p>
              )}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Top Pages
            </h4>
            <div className="space-y-2">
              {Object.entries(data.breakdown.by_page)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([page, count]) => (
                  <div key={page} className="flex items-center justify-between gap-2">
                    <span className="text-sm truncate" title={page}>
                      {page}
                    </span>
                    <span className="font-medium flex-shrink-0">{count}</span>
                  </div>
                ))}
              {Object.keys(data.breakdown.by_page).length === 0 && (
                <p className="text-sm text-gray-400">No data</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visitors List */}
      {data && data.visitors.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Sessions ({data.visitors.length})
            </h4>
          </div>

          <div className="divide-y max-h-96 overflow-y-auto">
            {data.visitors.map((visitor) => (
              <div
                key={visitor.session_id}
                className="px-4 py-3 hover:bg-gray-50 flex items-center gap-4"
              >
                {/* Status indicator */}
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />

                {/* Device & Location */}
                <div className="flex items-center gap-2 w-24 flex-shrink-0">
                  {getDeviceIcon(visitor.device_type)}
                  <span className="text-lg" title={visitor.country_code}>
                    {getCountryFlag(visitor.country_code)}
                  </span>
                </div>

                {/* Current Page */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {visitor.current_page_title || visitor.current_page}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {visitor.current_page}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
                  <span className="flex items-center gap-1" title="Pages viewed">
                    <FileText className="h-3 w-3" />
                    {visitor.pages_viewed}
                  </span>
                  <span className="flex items-center gap-1" title="Session duration">
                    <Clock className="h-3 w-3" />
                    {formatDuration(visitor.duration_seconds)}
                  </span>
                  <span className="text-gray-400" title="Last activity">
                    {formatTimeAgo(visitor.last_activity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {data && data.visitors.length === 0 && (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border">
          <Users className="h-8 w-8 mx-auto mb-3 text-gray-400" />
          <p className="font-medium">No active visitors</p>
          <p className="text-sm mt-1">
            Visitors will appear here when they&apos;re browsing your site.
          </p>
        </div>
      )}

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Activity className="h-3 w-3" />
          Auto-refreshing every {refreshInterval} seconds
        </div>
      )}
    </div>
  );
}
