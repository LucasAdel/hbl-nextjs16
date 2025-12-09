"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Settings,
  Mail,
  Bell,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface CalendarStatus {
  connected: boolean;
  message: string;
  authUrl: string | null;
  error?: string;
}

export default function AdminSettingsPage() {
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCalendarStatus = async () => {
    try {
      const response = await fetch("/api/google/status");
      const data = await response.json();
      setCalendarStatus(data);
    } catch (error) {
      console.error("Failed to fetch calendar status:", error);
      setCalendarStatus({
        connected: false,
        message: "Failed to check calendar status",
        authUrl: "/api/google/auth",
        error: "Network error",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCalendarStatus();

    // Check for success/error query params
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");

    if (success === "google_connected") {
      toast.success("Google Calendar connected successfully!");
      // Clean up URL
      window.history.replaceState({}, "", "/admin/settings");
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        google_auth_failed: "Google authentication failed. Please try again.",
        no_code: "No authorization code received from Google.",
        token_exchange_failed: "Failed to exchange tokens. Please try again.",
      };
      toast.error(errorMessages[error] || "An error occurred during connection.");
      window.history.replaceState({}, "", "/admin/settings");
    }
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCalendarStatus();
  };

  const handleConnect = () => {
    if (calendarStatus?.authUrl) {
      window.location.href = calendarStatus.authUrl;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Site</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-tiffany/10 flex items-center justify-center">
              <Settings className="w-6 h-6 text-tiffany" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
              <p className="text-gray-500">Manage integrations and configurations</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Integration Settings */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-tiffany" />
            Calendar Integration
          </h2>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Google Calendar */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Google Calendar</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Automatically create calendar events when clients book appointments
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Status */}
              <div className="mt-4 p-4 rounded-lg bg-gray-50">
                {isLoading ? (
                  <div className="flex items-center gap-3 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Checking connection status...</span>
                  </div>
                ) : calendarStatus?.connected ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Connected</span>
                    </div>
                    <button
                      onClick={handleConnect}
                      className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      Reconnect
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-amber-600">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Not Connected</span>
                    </div>
                    <button
                      onClick={handleConnect}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-tiffany text-white rounded-lg font-medium hover:bg-tiffany-dark transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Connect Google Calendar
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-4 text-sm text-gray-500 space-y-2">
                <p>
                  When connected, booking appointments will automatically:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Create events in your Google Calendar</li>
                  <li>Send calendar invites to clients</li>
                  <li>Include Google Meet links for virtual consultations</li>
                  <li>Set up automatic reminders</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-tiffany" />
            Notification Settings
          </h2>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">
                      Receive email when new bookings are made
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tiffany/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tiffany"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Calendar Reminders</p>
                    <p className="text-sm text-gray-500">
                      Send reminders 24 hours before appointments
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tiffany/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tiffany"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Document Purchase Alerts</p>
                    <p className="text-sm text-gray-500">
                      Receive notifications when documents are purchased
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tiffany/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tiffany"></div>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/book-appointment"
              className="bg-white rounded-xl shadow-sm border p-4 hover:border-tiffany/30 transition-colors group"
            >
              <Calendar className="w-8 h-8 text-tiffany mb-2" />
              <h3 className="font-medium text-gray-900 group-hover:text-tiffany transition-colors">
                Booking Page
              </h3>
              <p className="text-sm text-gray-500">View the client booking page</p>
            </Link>

            <Link
              href="/documents"
              className="bg-white rounded-xl shadow-sm border p-4 hover:border-tiffany/30 transition-colors group"
            >
              <Shield className="w-8 h-8 text-tiffany mb-2" />
              <h3 className="font-medium text-gray-900 group-hover:text-tiffany transition-colors">
                Documents
              </h3>
              <p className="text-sm text-gray-500">View document catalog</p>
            </Link>

            <Link
              href="/contact"
              className="bg-white rounded-xl shadow-sm border p-4 hover:border-tiffany/30 transition-colors group"
            >
              <Mail className="w-8 h-8 text-tiffany mb-2" />
              <h3 className="font-medium text-gray-900 group-hover:text-tiffany transition-colors">
                Contact Form
              </h3>
              <p className="text-sm text-gray-500">View contact form</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
