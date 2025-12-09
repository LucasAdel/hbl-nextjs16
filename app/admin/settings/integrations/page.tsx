"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MessageSquare,
  DollarSign,
  Settings,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Zap,
  Shield,
  Clock,
} from "lucide-react";

type IntegrationStatus = "connected" | "disconnected" | "error";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: IntegrationStatus;
  lastSync?: string;
  features: string[];
  configRequired: string[];
}

const integrations: Integration[] = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    description:
      "Sync appointments with Google Calendar for automatic scheduling and reminders",
    icon: <Calendar className="h-6 w-6" />,
    status: "disconnected",
    features: [
      "Two-way appointment sync",
      "Automatic event creation",
      "Google Meet integration",
      "Calendar availability check",
    ],
    configRequired: [
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "GOOGLE_REDIRECT_URI",
    ],
  },
  {
    id: "twilio",
    name: "Twilio SMS",
    description:
      "Send SMS notifications for appointment confirmations, reminders, and updates",
    icon: <MessageSquare className="h-6 w-6" />,
    status: "disconnected",
    features: [
      "Appointment confirmations",
      "24-hour reminders",
      "Two-way messaging",
      "Delivery tracking",
    ],
    configRequired: [
      "TWILIO_ACCOUNT_SID",
      "TWILIO_AUTH_TOKEN",
      "TWILIO_PHONE_NUMBER",
    ],
  },
  {
    id: "xero",
    name: "Xero Accounting",
    description:
      "Automatically create invoices and sync payments with Xero",
    icon: <DollarSign className="h-6 w-6" />,
    status: "disconnected",
    features: [
      "Automatic invoice creation",
      "Payment reconciliation",
      "Contact sync",
      "Financial reporting",
    ],
    configRequired: [
      "XERO_CLIENT_ID",
      "XERO_CLIENT_SECRET",
      "XERO_REDIRECT_URI",
    ],
  },
];

const statusColors = {
  connected: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  disconnected: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400",
  error: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

const statusIcons = {
  connected: <Check className="h-4 w-4" />,
  disconnected: <X className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
};

export default function IntegrationsPage() {
  const [integrationStates, setIntegrationStates] = useState(integrations);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState<string | null>(null);

  const handleConnect = async (integrationId: string) => {
    setConnecting(integrationId);

    try {
      // Request auth URL from API
      const response = await fetch(
        `/api/integrations/${integrationId === "twilio" ? "sms" : integrationId}?action=auth`
      );
      const data = await response.json();

      if (data.authUrl) {
        // Redirect to OAuth flow
        window.location.href = data.authUrl;
      } else {
        // For non-OAuth integrations (like Twilio), show config modal
        setShowConfig(integrationId);
      }
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = (integrationId: string) => {
    if (confirm("Are you sure you want to disconnect this integration?")) {
      setIntegrationStates((prev) =>
        prev.map((i) =>
          i.id === integrationId
            ? { ...i, status: "disconnected" as IntegrationStatus, lastSync: undefined }
            : i
        )
      );
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Link
              href="/admin/settings"
              className="hover:text-teal-600 dark:hover:text-teal-400"
            >
              Settings
            </Link>
            <span>/</span>
            <span>Integrations</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Integrations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect third-party services to enhance your workflow
          </p>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrationStates.map((integration) => (
          <div
            key={integration.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400">
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {integration.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[integration.status]}`}
                    >
                      {statusIcons[integration.status]}
                      {integration.status.charAt(0).toUpperCase() +
                        integration.status.slice(1)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setShowConfig(
                      showConfig === integration.id ? null : integration.id
                    )
                  }
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Settings className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {integration.description}
              </p>

              {/* Features */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Features
                </h4>
                <ul className="grid grid-cols-2 gap-2">
                  {integration.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <Check className="h-4 w-4 text-teal-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Last Sync */}
              {integration.lastSync && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <Clock className="h-4 w-4" />
                  Last synced: {integration.lastSync}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {integration.status === "connected" ? (
                  <>
                    <button className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Now
                    </button>
                    <button
                      onClick={() => handleDisconnect(integration.id)}
                      className="px-4 py-2 border border-red-200 dark:border-red-900 text-red-600 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(integration.id)}
                    disabled={connecting === integration.id}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    {connecting === integration.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Configuration Panel */}
            {showConfig === integration.id && (
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-400" />
                  Configuration Required
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Add these environment variables to your deployment:
                </p>
                <div className="space-y-2">
                  {integration.configRequired.map((config) => (
                    <div
                      key={config}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <code className="text-sm font-mono text-teal-600 dark:text-teal-400">
                        {config}
                      </code>
                      <span className="text-xs text-gray-400">Required</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <a
                    href={
                      integration.id === "google-calendar"
                        ? "https://console.cloud.google.com/apis/credentials"
                        : integration.id === "twilio"
                          ? "https://console.twilio.com"
                          : "https://developer.xero.com/app/manage"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 inline-flex items-center gap-1"
                  >
                    Get credentials
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Webhook Endpoints */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Webhook Endpoints
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Configure these endpoints in your integration dashboards to receive
          real-time updates.
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Google Calendar Webhook
              </p>
              <code className="text-sm text-gray-500 dark:text-gray-400">
                /api/integrations/google-calendar/webhook
              </code>
            </div>
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  `${window.location.origin}/api/integrations/google-calendar/webhook`
                )
              }
              className="text-sm text-teal-600 hover:text-teal-700"
            >
              Copy URL
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Twilio SMS Webhook
              </p>
              <code className="text-sm text-gray-500 dark:text-gray-400">
                /api/integrations/sms/webhook
              </code>
            </div>
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  `${window.location.origin}/api/integrations/sms/webhook`
                )
              }
              className="text-sm text-teal-600 hover:text-teal-700"
            >
              Copy URL
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Xero Webhook
              </p>
              <code className="text-sm text-gray-500 dark:text-gray-400">
                /api/integrations/xero/webhook
              </code>
            </div>
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  `${window.location.origin}/api/integrations/xero/webhook`
                )
              }
              className="text-sm text-teal-600 hover:text-teal-700"
            >
              Copy URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
