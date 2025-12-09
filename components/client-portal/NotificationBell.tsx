"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Calendar, FileText, CreditCard, MessageSquare, X, Check, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export interface Notification {
  id: string;
  type: "booking" | "document" | "payment" | "message" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationBellProps {
  userId: string;
  userEmail: string;
}

export function NotificationBell({ userId, userEmail }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch(`/api/client-portal/notifications?email=${encodeURIComponent(userEmail)}`);
        const result = await response.json();
        if (result.success) {
          setNotifications(result.notifications);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userEmail]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (notificationId: string) => {
    setMarkingRead(notificationId);
    try {
      const response = await fetch("/api/client-portal/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, read: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    } finally {
      setMarkingRead(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/client-portal/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true, userEmail }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4 text-tiffany" />;
      case "document":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getIconBackground = (type: Notification["type"]) => {
    switch (type) {
      case "booking":
        return "bg-tiffany/10";
      case "document":
        return "bg-blue-50";
      case "payment":
        return "bg-green-50";
      case "message":
        return "bg-purple-50";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-tiffany hover:text-tiffany-dark font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="py-8 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                        !notification.read ? "bg-tiffany/5" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconBackground(
                            notification.type
                          )}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm ${
                                !notification.read ? "font-semibold text-gray-900" : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                disabled={markingRead === notification.id}
                                className="p-1 text-gray-400 hover:text-tiffany rounded transition-colors flex-shrink-0"
                                title="Mark as read"
                              >
                                {markingRead === notification.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t bg-gray-50">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
