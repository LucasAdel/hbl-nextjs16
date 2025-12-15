"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  MousePointer,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { SessionTimeline } from "./SessionTimeline";

// Types
interface SessionListItem {
  session_id: string;
  first_event: string;
  last_event: string;
  duration_seconds: number;
  page_count: number;
  event_count: number;
  device_type: string;
  country_code: string;
  has_conversion: boolean;
  has_summary: boolean;
}

interface SessionDetail {
  session_id: string;
  stats: {
    duration_seconds: number;
    pages_visited: number;
    event_count: number;
    device_type: string;
    browser: string;
    os: string;
    country_code: string;
    city: string;
    referrer: string | null;
    has_conversion: boolean;
    conversion_types: string[];
  };
  summary: {
    text: string;
    key_actions: string[];
    conversion_intent: string;
    generated_at: string;
  } | null;
  timeline: Array<{
    id: string;
    timestamp: string;
    event_name: string;
    event_category: string;
    page_url: string;
    page_title: string | null;
    properties: Record<string, unknown>;
    click_x: number | null;
    click_y: number | null;
    element_selector: string | null;
    element_text: string | null;
  }>;
  page_groups: Array<{
    page_url: string;
    page_title: string | null;
    events: SessionDetail["timeline"];
    duration_seconds: number;
  }>;
}

interface SessionBrowserProps {
  initialDays?: number;
}

export function SessionBrowser({ initialDays = 7 }: SessionBrowserProps) {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [days, setDays] = useState(initialDays);
  const [deviceFilter, setDeviceFilter] = useState<string>("");
  const [conversionFilter, setConversionFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Expanded session
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        days: days.toString(),
        page: page.toString(),
        limit: "20",
      });

      if (deviceFilter) params.set("device", deviceFilter);
      if (conversionFilter) params.set("hasConversion", conversionFilter);

      const response = await fetch(`/api/admin/analytics/sessions?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch sessions");
      }

      setSessions(data.data.sessions);
      setTotalPages(data.data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [days, page, deviceFilter, conversionFilter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Fetch session detail
  const fetchSessionDetail = async (sessionId: string) => {
    setLoadingDetail(true);
    try {
      const response = await fetch(`/api/admin/analytics/sessions/${sessionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch session detail");
      }

      setSessionDetail(data.data);
    } catch (err) {
      console.error("Failed to fetch session detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Toggle session expansion
  const toggleSession = (sessionId: string) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
      setSessionDetail(null);
    } else {
      setExpandedSessionId(sessionId);
      fetchSessionDetail(sessionId);
    }
  };

  // Generate AI summary
  const generateSummary = async (sessionId: string) => {
    setGeneratingSummary(true);
    try {
      const response = await fetch(
        `/api/admin/analytics/sessions/${sessionId}/generate-summary`,
        { method: "POST" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary");
      }

      // Update the session detail with the new summary
      if (sessionDetail && sessionDetail.session_id === sessionId) {
        setSessionDetail({
          ...sessionDetail,
          summary: {
            text: data.data.summary,
            key_actions: data.data.key_actions,
            conversion_intent: data.data.conversion_intent,
            generated_at: new Date().toISOString(),
          },
        });
      }

      // Update the session list item
      setSessions((prev) =>
        prev.map((s) =>
          s.session_id === sessionId ? { ...s, has_summary: true } : s
        )
      );
    } catch (err) {
      console.error("Failed to generate summary:", err);
    } finally {
      setGeneratingSummary(false);
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

  // Get intent badge color
  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Session Browser</h3>
          <button
            onClick={fetchSessions}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border rounded-md"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md ${
              showFilters ? "bg-gray-100" : ""
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg border">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Device
            </label>
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border rounded-md"
            >
              <option value="">All devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Conversion
            </label>
            <select
              value={conversionFilter}
              onChange={(e) => setConversionFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border rounded-md"
            >
              <option value="">All sessions</option>
              <option value="true">With conversion</option>
              <option value="false">Without conversion</option>
            </select>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Sessions List */}
      <div className="border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-600 uppercase tracking-wider">
          <div className="col-span-3">Session</div>
          <div className="col-span-2">Time</div>
          <div className="col-span-1">Duration</div>
          <div className="col-span-1">Pages</div>
          <div className="col-span-1">Events</div>
          <div className="col-span-1">Device</div>
          <div className="col-span-1">Location</div>
          <div className="col-span-2">Status</div>
        </div>

        {/* Loading State */}
        {loading && sessions.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-500">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading sessions...
          </div>
        )}

        {/* Empty State */}
        {!loading && sessions.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-500">
            No sessions found for the selected filters.
          </div>
        )}

        {/* Session Rows */}
        {sessions.map((session) => (
          <div key={session.session_id}>
            {/* Session Row */}
            <div
              className={`grid grid-cols-12 gap-2 px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 border-t ${
                expandedSessionId === session.session_id ? "bg-tiffany/5" : ""
              }`}
              onClick={() => toggleSession(session.session_id)}
            >
              <div className="col-span-3 flex items-center gap-2">
                {expandedSessionId === session.session_id ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
                <span className="font-mono text-xs text-gray-600 truncate">
                  {session.session_id.slice(0, 20)}...
                </span>
              </div>

              <div className="col-span-2 text-gray-600">
                {new Date(session.first_event).toLocaleDateString()}
                <br />
                <span className="text-xs text-gray-400">
                  {new Date(session.first_event).toLocaleTimeString()}
                </span>
              </div>

              <div className="col-span-1 flex items-center gap-1 text-gray-600">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(session.duration_seconds)}
              </div>

              <div className="col-span-1 flex items-center gap-1 text-gray-600">
                <FileText className="h-3.5 w-3.5" />
                {session.page_count}
              </div>

              <div className="col-span-1 flex items-center gap-1 text-gray-600">
                <MousePointer className="h-3.5 w-3.5" />
                {session.event_count}
              </div>

              <div className="col-span-1 text-gray-600">
                {getDeviceIcon(session.device_type)}
              </div>

              <div className="col-span-1 flex items-center gap-1 text-gray-600">
                <Globe className="h-3.5 w-3.5" />
                <span className="uppercase text-xs">{session.country_code}</span>
              </div>

              <div className="col-span-2 flex items-center gap-2">
                {session.has_conversion ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3" />
                    Converted
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                    <XCircle className="h-3 w-3" />
                    No conversion
                  </span>
                )}

                {session.has_summary && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">
                    <Sparkles className="h-3 w-3" />
                    Summary
                  </span>
                )}
              </div>
            </div>

            {/* Expanded Session Detail */}
            {expandedSessionId === session.session_id && (
              <div className="px-4 py-4 bg-gray-50 border-t">
                {loadingDetail ? (
                  <div className="py-8 text-center text-gray-500">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading session details...
                  </div>
                ) : sessionDetail ? (
                  <div className="space-y-4">
                    {/* Session Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">Browser</div>
                        <div className="font-medium">
                          {sessionDetail.stats.browser} / {sessionDetail.stats.os}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">Location</div>
                        <div className="font-medium">
                          {sessionDetail.stats.city}, {sessionDetail.stats.country_code}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">Referrer</div>
                        <div className="font-medium truncate">
                          {sessionDetail.stats.referrer || "Direct"}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">Conversions</div>
                        <div className="font-medium">
                          {sessionDetail.stats.conversion_types.length > 0
                            ? sessionDetail.stats.conversion_types.join(", ")
                            : "None"}
                        </div>
                      </div>
                    </div>

                    {/* AI Summary Section */}
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          AI Summary
                        </h4>
                        {!sessionDetail.summary && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              generateSummary(session.session_id);
                            }}
                            disabled={generatingSummary}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                          >
                            {generatingSummary ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3.5 w-3.5" />
                                Generate Summary
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {sessionDetail.summary ? (
                        <div className="space-y-3">
                          <p className="text-gray-700">{sessionDetail.summary.text}</p>

                          {sessionDetail.summary.key_actions.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-gray-500 mb-1">
                                Key Actions
                              </div>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {sessionDetail.summary.key_actions.map((action, i) => (
                                  <li key={i}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex items-center gap-4 pt-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getIntentColor(
                                sessionDetail.summary.conversion_intent
                              )}`}
                            >
                              {sessionDetail.summary.conversion_intent.toUpperCase()} Intent
                            </span>
                            <span className="text-xs text-gray-400">
                              Generated{" "}
                              {new Date(sessionDetail.summary.generated_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No summary generated yet. Click &quot;Generate Summary&quot; to create an
                          AI-powered analysis of this session.
                        </p>
                      )}
                    </div>

                    {/* Timeline */}
                    <SessionTimeline pageGroups={sessionDetail.page_groups} />
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
