"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Users, ShoppingCart, Star, TrendingUp, Clock } from "lucide-react";

interface Notification {
  id: string;
  type: "purchase" | "signup" | "review" | "viewing" | "limited";
  message: string;
  time: string;
  icon: React.ReactNode;
}

// Simulated social proof data (in production, pull from real analytics)
const SAMPLE_NAMES = [
  "Sarah M.", "James T.", "Dr. Patel", "Emily W.", "Michael S.",
  "Dr. Chen", "Jessica L.", "Robert K.", "Amanda B.", "David H.",
  "Dr. Thompson", "Lisa R.", "Andrew G.", "Rachel C.", "Mark D.",
];

const SAMPLE_LOCATIONS = [
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
  "Gold Coast", "Newcastle", "Canberra", "Hobart", "Darwin",
];

const SAMPLE_DOCUMENTS = [
  "Medical Practice Setup Guide",
  "AHPRA Compliance Checklist",
  "Employment Contract Template",
  "Tenant Doctor Agreement",
  "Privacy Policy Template",
  "Partnership Agreement",
  "Service Agreement Template",
  "Medicare Compliance Guide",
];

function generateRandomNotification(): Notification {
  const types: Notification["type"][] = ["purchase", "signup", "review", "viewing", "limited"];
  const type = types[Math.floor(Math.random() * types.length)];
  const name = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
  const location = SAMPLE_LOCATIONS[Math.floor(Math.random() * SAMPLE_LOCATIONS.length)];
  const document = SAMPLE_DOCUMENTS[Math.floor(Math.random() * SAMPLE_DOCUMENTS.length)];
  const minutes = Math.floor(Math.random() * 30) + 1;

  let message = "";
  let icon: React.ReactNode;

  switch (type) {
    case "purchase":
      message = `${name} from ${location} just purchased "${document}"`;
      icon = <ShoppingCart className="h-4 w-4 text-green-500" />;
      break;
    case "signup":
      message = `${name} from ${location} just signed up for a consultation`;
      icon = <Users className="h-4 w-4 text-blue-500" />;
      break;
    case "review":
      message = `${name} left a 5-star review: "Excellent legal documents!"`;
      icon = <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />;
      break;
    case "viewing":
      message = `${Math.floor(Math.random() * 20) + 5} people are viewing ${document}`;
      icon = <Users className="h-4 w-4 text-purple-500" />;
      break;
    case "limited":
      message = `Only ${Math.floor(Math.random() * 5) + 1} consultation slots left this week!`;
      icon = <Clock className="h-4 w-4 text-red-500" />;
      break;
  }

  return {
    id: Date.now().toString(),
    type,
    message,
    time: `${minutes} min ago`,
    icon,
  };
}

interface SocialProofNotificationsProps {
  enabled?: boolean;
  interval?: number; // Milliseconds between notifications
  maxNotifications?: number;
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
}

export function SocialProofNotifications({
  enabled = true,
  interval = 30000, // Default 30 seconds
  maxNotifications = 1,
  position = "bottom-left",
}: SocialProofNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState(false);

  const addNotification = useCallback(() => {
    if (dismissed) return;

    const notification = generateRandomNotification();
    setNotifications((prev) => [...prev.slice(-(maxNotifications - 1)), notification]);

    // Auto-remove after 6 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 6000);
  }, [maxNotifications, dismissed]);

  useEffect(() => {
    if (!enabled) return;

    // Show first notification after a short delay
    const initialTimeout = setTimeout(() => {
      addNotification();
    }, 5000);

    // Continue showing notifications at interval
    const notificationInterval = setInterval(addNotification, interval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(notificationInterval);
    };
  }, [enabled, interval, addNotification]);

  const positionClasses = {
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
  };

  if (!enabled || notifications.length === 0) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-40 flex flex-col gap-2`}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm animate-in slide-in-from-bottom-5 duration-300 flex items-start gap-3"
        >
          <div className="flex-shrink-0 mt-0.5">{notification.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 dark:text-white">
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {notification.time}
            </p>
          </div>
          <button
            onClick={() => {
              setNotifications((prev) =>
                prev.filter((n) => n.id !== notification.id)
              );
              setDismissed(true);
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Compact notification for inline use
export function SocialProofBanner({ className = "" }: { className?: string }) {
  const [stats, setStats] = useState({
    totalClients: 2847,
    documentsDelivered: 12543,
    consultationsThisMonth: 156,
  });

  // Simulate live counter updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        totalClients: prev.totalClients + (Math.random() > 0.7 ? 1 : 0),
        documentsDelivered: prev.documentsDelivered + (Math.random() > 0.5 ? 1 : 0),
        consultationsThisMonth: prev.consultationsThisMonth + (Math.random() > 0.9 ? 1 : 0),
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`bg-gradient-to-r from-tiffany/10 to-blue-500/10 dark:from-tiffany/20 dark:to-blue-500/20 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-5 w-5 text-tiffany" />
        <span className="font-semibold text-gray-900 dark:text-white">
          Trusted by Medical Professionals
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-tiffany">
            {stats.totalClients.toLocaleString()}+
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Happy Clients
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-tiffany">
            {stats.documentsDelivered.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Documents Delivered
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-tiffany">
            {stats.consultationsThisMonth}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Consultations This Month
          </div>
        </div>
      </div>
    </div>
  );
}

// Live activity indicator for product pages
export function LiveActivityIndicator({ documentId }: { documentId?: string }) {
  const [viewers, setViewers] = useState(Math.floor(Math.random() * 8) + 2);
  const [recentPurchases, setRecentPurchases] = useState(
    Math.floor(Math.random() * 20) + 5
  );

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate fluctuating viewers
      setViewers((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(1, Math.min(15, prev + change));
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span>{viewers} viewing now</span>
      </div>
      <div className="flex items-center gap-1">
        <ShoppingCart className="h-4 w-4" />
        <span>{recentPurchases} purchased this week</span>
      </div>
    </div>
  );
}

export default SocialProofNotifications;
