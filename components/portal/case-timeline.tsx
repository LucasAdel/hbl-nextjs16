"use client";

import { useState, useEffect, useCallback } from "react";

interface EventMetadata {
  documentName?: string;
  meetingDate?: string;
  amount?: number;
  newStatus?: string;
  [key: string]: unknown;
}

interface TimelineEvent {
  id: string;
  event_type: "status_change" | "document_added" | "meeting_scheduled" | "payment_received" | "milestone" | "note";
  title: string;
  description?: string;
  metadata?: EventMetadata;
  created_at: string;
  created_by: string;
}

interface CaseTimelineProps {
  matterId: string;
  matterName?: string;
  clientEmail: string;
}

const EVENT_ICONS: Record<string, { icon: string; color: string }> = {
  status_change: { icon: "🔄", color: "bg-blue-100 border-blue-500" },
  document_added: { icon: "📄", color: "bg-green-100 border-green-500" },
  meeting_scheduled: { icon: "📅", color: "bg-purple-100 border-purple-500" },
  payment_received: { icon: "💰", color: "bg-amber-100 border-amber-500" },
  milestone: { icon: "🎯", color: "bg-pink-100 border-pink-500" },
  note: { icon: "📝", color: "bg-gray-100 border-gray-500" },
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-gray-500",
  active: "bg-blue-500",
  in_review: "bg-yellow-500",
  pending_client: "bg-orange-500",
  pending_external: "bg-purple-500",
  completed: "bg-green-500",
  on_hold: "bg-red-500",
};

export function CaseTimeline({ matterId, matterName, clientEmail }: CaseTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<string>("active");
  const [filter, setFilter] = useState<string>("all");

  const fetchTimeline = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/portal/timeline?matterId=${matterId}&email=${encodeURIComponent(clientEmail)}`
      );
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        setCurrentStatus(data.currentStatus || "active");
      }
    } catch (error) {
      console.error("Failed to fetch timeline:", error);
    } finally {
      setIsLoading(false);
    }
  }, [matterId, clientEmail]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    return event.event_type === filter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AU", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupEventsByDate = (events: TimelineEvent[]) => {
    const groups: Record<string, TimelineEvent[]> = {};
    events.forEach((event) => {
      const date = formatDate(event.created_at);
      if (!groups[date]) groups[date] = [];
      groups[date].push(event);
    });
    return groups;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const groupedEvents = groupEventsByDate(filteredEvents);

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Case Timeline</h3>
            {matterName && (
              <p className="text-sm text-gray-500 mt-0.5">{matterName}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                STATUS_COLORS[currentStatus] || "bg-gray-500"
              }`}
            >
              {currentStatus.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </div>

        {/* Status Progress Bar */}
        <div className="relative">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>New</span>
            <span>In Progress</span>
            <span>Review</span>
            <span>Complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{
                width:
                  currentStatus === "new"
                    ? "5%"
                    : currentStatus === "active"
                      ? "35%"
                      : currentStatus === "in_review"
                        ? "65%"
                        : currentStatus === "completed"
                          ? "100%"
                          : "50%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b bg-gray-50">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { value: "all", label: "All" },
            { value: "status_change", label: "Status" },
            { value: "document_added", label: "Documents" },
            { value: "meeting_scheduled", label: "Meetings" },
            { value: "payment_received", label: "Payments" },
            { value: "milestone", label: "Milestones" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === f.value
                  ? "bg-blue-500 text-white"
                  : "bg-white border text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6 max-h-[500px] overflow-y-auto">
        {Object.keys(groupedEvents).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>No timeline events yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([date, dateEvents]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs text-gray-500 font-medium px-2">
                    {date}
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                {/* Events for this date */}
                <div className="relative pl-8">
                  {/* Timeline line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200" />

                  <div className="space-y-4">
                    {dateEvents.map((event, index) => {
                      const eventStyle = EVENT_ICONS[event.event_type] || EVENT_ICONS.note;
                      return (
                        <div key={event.id} className="relative">
                          {/* Timeline dot */}
                          <div
                            className={`absolute -left-8 w-8 h-8 rounded-full flex items-center justify-center border-2 ${eventStyle.color}`}
                          >
                            <span className="text-sm">{eventStyle.icon}</span>
                          </div>

                          {/* Event card */}
                          <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {event.title}
                                </h4>
                                {event.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {event.description}
                                  </p>
                                )}

                                {/* Metadata display */}
                                {event.metadata && Object.keys(event.metadata).length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {event.metadata.documentName && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                        📄 {String(event.metadata.documentName)}
                                      </span>
                                    )}
                                    {event.metadata.meetingDate && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                        📅 {String(event.metadata.meetingDate)}
                                      </span>
                                    )}
                                    {event.metadata.amount && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                                        💰 ${String(event.metadata.amount)}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">
                                {formatTime(event.created_at)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                              by {event.created_by}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50 text-center">
        <p className="text-xs text-gray-500">
          Updates are shown as they happen. Refresh page for latest status.
        </p>
      </div>
    </div>
  );
}
