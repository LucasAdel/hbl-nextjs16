"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  MousePointer,
  ScrollText,
  Send,
  Clock,
  FileText,
  ShoppingCart,
  UserPlus,
  Target,
  Bookmark,
} from "lucide-react";

// Types
interface TimelineEvent {
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
}

interface PageGroup {
  page_url: string;
  page_title: string | null;
  events: TimelineEvent[];
  duration_seconds: number;
}

interface SessionTimelineProps {
  pageGroups: PageGroup[];
}

export function SessionTimeline({ pageGroups }: SessionTimelineProps) {
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set([0])); // First page expanded by default

  const togglePage = (index: number) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Get icon for event type
  const getEventIcon = (eventName: string) => {
    switch (eventName) {
      case "page_view":
        return <Eye className="h-3.5 w-3.5 text-blue-500" />;
      case "click":
        return <MousePointer className="h-3.5 w-3.5 text-purple-500" />;
      case "scroll":
        return <ScrollText className="h-3.5 w-3.5 text-gray-500" />;
      case "form_submit":
      case "contact_submitted":
        return <Send className="h-3.5 w-3.5 text-green-500" />;
      case "form_focus":
        return <Target className="h-3.5 w-3.5 text-yellow-500" />;
      case "checkout_start":
      case "checkout_complete":
      case "purchase_complete":
        return <ShoppingCart className="h-3.5 w-3.5 text-emerald-500" />;
      case "signup_complete":
        return <UserPlus className="h-3.5 w-3.5 text-indigo-500" />;
      case "booking_confirmed":
        return <Bookmark className="h-3.5 w-3.5 text-tiffany" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-gray-400" />;
    }
  };

  // Format time
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Get event description
  const getEventDescription = (event: TimelineEvent): string => {
    switch (event.event_name) {
      case "page_view":
        return `Viewed page`;
      case "click":
        if (event.element_text) {
          return `Clicked "${event.element_text.slice(0, 50)}${
            event.element_text.length > 50 ? "..." : ""
          }"`;
        }
        return `Clicked ${event.element_selector || "element"}`;
      case "scroll":
        const depth = event.properties?.scroll_depth;
        return `Scrolled to ${depth}%`;
      case "form_submit":
        return `Submitted form`;
      case "form_focus":
        const field = event.properties?.field_name;
        return `Focused on ${field || "form field"}`;
      case "contact_submitted":
        return "Submitted contact form";
      case "booking_confirmed":
        return "Confirmed booking";
      case "checkout_start":
        return "Started checkout";
      case "checkout_complete":
      case "purchase_complete":
        return "Completed purchase";
      default:
        return event.event_name.replace(/_/g, " ");
    }
  };

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "page_view":
        return "border-blue-200 bg-blue-50";
      case "interaction":
        return "border-purple-200 bg-purple-50";
      case "conversion":
        return "border-green-200 bg-green-50";
      case "engagement":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  if (pageGroups.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 bg-white rounded-lg border">
        No timeline data available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h4 className="font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-600" />
          Session Timeline
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          {pageGroups.length} page(s) visited
        </p>
      </div>

      <div className="divide-y">
        {pageGroups.map((group, pageIndex) => (
          <div key={pageIndex}>
            {/* Page Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
              onClick={() => togglePage(pageIndex)}
            >
              <div className="flex-shrink-0">
                {expandedPages.has(pageIndex) ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {group.page_title || group.page_url}
                </div>
                <div className="text-xs text-gray-500 truncate">{group.page_url}</div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(group.duration_seconds)}
                </span>
                <span>{group.events.length} events</span>
              </div>
            </div>

            {/* Events List */}
            {expandedPages.has(pageIndex) && (
              <div className="px-4 pb-3 space-y-2 ml-7">
                {group.events.map((event, eventIndex) => (
                  <div
                    key={event.id || eventIndex}
                    className={`flex items-start gap-3 p-2 rounded-md border ${getCategoryColor(
                      event.event_category
                    )}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getEventIcon(event.event_name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize">
                          {event.event_name.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 mt-0.5">
                        {getEventDescription(event)}
                      </div>

                      {/* Click position indicator */}
                      {event.click_x !== null && event.click_y !== null && (
                        <div className="text-xs text-gray-400 mt-1">
                          Click position: ({event.click_x}, {event.click_y})
                        </div>
                      )}

                      {/* Show relevant properties */}
                      {event.properties && Object.keys(event.properties).length > 0 && (
                        <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                          <details className="cursor-pointer">
                            <summary className="text-gray-500 hover:text-gray-700">
                              View properties
                            </summary>
                            <pre className="mt-1 text-gray-600 overflow-x-auto">
                              {JSON.stringify(event.properties, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
