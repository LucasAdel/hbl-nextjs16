"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { X, Users, ShoppingCart, Star, TrendingUp, Clock, FileText, Calendar } from "lucide-react";

// ============================================================================
// SOPHISTICATED SOCIAL PROOF NOTIFICATION SYSTEM
// Pre-generates 3+ hours of unique, realistic notifications
// ============================================================================

interface NotificationData {
  id: string;
  type: "purchase" | "signup" | "review" | "viewing" | "limited" | "download";
  message: string;
  rating?: number; // 4.5 or 5
  iconType: "cart" | "users" | "star" | "clock" | "file" | "calendar";
}

interface Notification extends NotificationData {
  time: string;
  icon: React.ReactNode;
}

// Comprehensive location data with population weighting
const LOCATIONS = [
  { city: "Sydney", weight: 25 },
  { city: "Melbourne", weight: 23 },
  { city: "Brisbane", weight: 12 },
  { city: "Perth", weight: 10 },
  { city: "Adelaide", weight: 7 },
  { city: "Gold Coast", weight: 5 },
  { city: "Newcastle", weight: 4 },
  { city: "Canberra", weight: 4 },
  { city: "Wollongong", weight: 3 },
  { city: "Hobart", weight: 2 },
  { city: "Geelong", weight: 2 },
  { city: "Townsville", weight: 1 },
  { city: "Cairns", weight: 1 },
  { city: "Darwin", weight: 1 },
];

// Expanded document/service catalog
const DOCUMENTS = [
  "Medical Practice Setup Guide",
  "AHPRA Compliance Checklist",
  "Employment Contract Template",
  "Tenant Doctor Agreement",
  "Privacy Policy Template",
  "Partnership Agreement",
  "Service Agreement Template",
  "Medicare Compliance Guide",
  "Practice Sale Agreement",
  "Locum Agreement Template",
  "Associate Agreement",
  "Non-Compete Agreement",
  "Patient Consent Forms Pack",
  "Telehealth Policy Template",
  "Staff Handbook Template",
  "Independent Contractor Agreement",
  "Practice Lease Review Guide",
  "Medical Records Policy",
  "Incident Reporting Template",
  "Practice Valuation Guide",
];

// Realistic review snippets (varied length and style) - 75+ unique reviews
const REVIEW_SNIPPETS = [
  // Short and punchy
  "Saved me hours of work",
  "Worth every dollar",
  "Exactly what I needed",
  "Highly recommend",
  "Outstanding quality",
  "Absolutely essential",
  "Best investment ever",
  "Incredibly thorough",
  "Very impressed",
  "Exceeded expectations",
  "Game changer",
  "So professional",
  "Brilliant resource",
  "Top quality",
  "Spot on",

  // Practice-specific
  "Perfect for my new practice",
  "Exactly what I needed for my practice",
  "Made setting up my clinic so easy",
  "Essential for any medical practice",
  "Every practice owner needs this",
  "Wish I had this when I started",
  "Made my practice setup seamless",
  "Perfect for solo practitioners",
  "Great for group practices too",
  "Tailored perfectly for healthcare",

  // Value-focused
  "Great value for money",
  "Saved us significant legal fees",
  "Worth ten times the price",
  "Paid for itself immediately",
  "Much cheaper than a lawyer",
  "Incredible value",
  "Money well spent",
  "Best money I've spent on my practice",
  "Saved thousands in legal costs",
  "Affordable and professional",

  // Quality-focused
  "Professional and thorough",
  "Comprehensive and well-structured",
  "Exceptional quality documents",
  "Professional grade templates",
  "Meticulous attention to detail",
  "Clearly written by experts",
  "Legal quality without the fees",
  "Proper legal standard documents",
  "Well-researched and current",
  "Up to date with regulations",

  // Ease of use
  "Clear and easy to customise",
  "Made the whole process so much easier",
  "Streamlined our entire setup",
  "So straightforward to use",
  "Easy to modify for our needs",
  "Simple and intuitive",
  "Took minutes to complete",
  "No legal expertise needed",
  "Step by step guidance helped",
  "User friendly templates",

  // Compliance-focused
  "Excellent for compliance",
  "Made compliance straightforward",
  "Comprehensive coverage of requirements",
  "Covers all AHPRA requirements",
  "Medicare compliant out of the box",
  "Privacy Act requirements covered",
  "All the compliance boxes ticked",
  "Audit ready documentation",
  "Helped us pass our review",
  "Regulator approved standard",

  // Emotional/relief
  "Finally found what I was looking for",
  "Wish I found this sooner",
  "Such a relief to find this",
  "Took so much stress away",
  "Peace of mind knowing it's right",
  "Can sleep easy now",
  "Weight off my shoulders",
  "No more worrying about paperwork",
  "Finally feel properly protected",
  "Confidence in our documentation",

  // Recommendation
  "Highly recommend for any medical practice",
  "Already recommended to colleagues",
  "Told all my GP friends about this",
  "Sharing with my study group",
  "Must have for new graduates",
  "Recommending to everyone",
  "Five colleagues have bought it since",
  "Our whole network uses these now",

  // Support-focused
  "Fantastic support team too",
  "Quick response when I had questions",
  "Support was incredibly helpful",
  "They customised it for my needs",
  "Great follow up service",
  "Felt supported throughout",

  // Time-saving
  "Saved me so much time",
  "Would have taken weeks otherwise",
  "Done in an afternoon",
  "Quick turnaround on everything",
  "Efficient and fast",
  "No time wasted",
];

// Consultation types
const CONSULTATION_TYPES = [
  "a free consultation",
  "a practice setup consultation",
  "a compliance review",
  "a partnership consultation",
  "a contract review",
  "a practice sale consultation",
  "a lease negotiation consultation",
];

// Seeded random for reproducible shuffling
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Fisher-Yates shuffle with seed
function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  const random = seededRandom(seed);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Weighted random selection
function weightedRandomLocation(random: () => number): string {
  const totalWeight = LOCATIONS.reduce((sum, loc) => sum + loc.weight, 0);
  let r = random() * totalWeight;
  for (const loc of LOCATIONS) {
    r -= loc.weight;
    if (r <= 0) return loc.city;
  }
  return LOCATIONS[0].city;
}

// Generate rating (80% chance of 5 stars, 20% chance of 4.5)
function generateRating(random: () => number): number {
  return random() > 0.2 ? 5 : 4.5;
}

// Generate all notifications for a 3-hour session
function generateNotificationPool(): NotificationData[] {
  // Use current hour as seed for daily variation, but consistent within the hour
  const seed = Math.floor(Date.now() / (1000 * 60 * 60));
  const random = seededRandom(seed);

  const notifications: NotificationData[] = [];
  let idCounter = 0;

  // Shuffle all arrays for variety
  const shuffledDocs = shuffleArray(DOCUMENTS, seed);
  const shuffledReviews = shuffleArray(REVIEW_SNIPPETS, seed);
  const shuffledConsultations = shuffleArray(CONSULTATION_TYPES, seed);

  // Generate ~220 notifications (enough for 3+ hours at 45-60 sec intervals)
  // Distribution: 30% purchases, 25% signups, 25% reviews, 10% viewing, 10% limited/download

  // Generate purchases (66 notifications)
  for (let i = 0; i < 66; i++) {
    const doc = shuffledDocs[i % shuffledDocs.length];
    const location = weightedRandomLocation(random);
    notifications.push({
      id: `notif-${idCounter++}`,
      type: "purchase",
      message: `Someone from ${location} just purchased "${doc}"`,
      iconType: "cart",
    });
  }

  // Generate signups (55 notifications)
  for (let i = 0; i < 55; i++) {
    const location = weightedRandomLocation(random);
    const consultationType = shuffledConsultations[i % shuffledConsultations.length];
    notifications.push({
      id: `notif-${idCounter++}`,
      type: "signup",
      message: `Someone from ${location} just booked ${consultationType}`,
      iconType: "calendar",
    });
  }

  // Generate reviews (55 notifications)
  for (let i = 0; i < 55; i++) {
    const rating = generateRating(random);
    const review = shuffledReviews[i % shuffledReviews.length];
    notifications.push({
      id: `notif-${idCounter++}`,
      type: "review",
      message: `New ${rating}-star review: "${review}"`,
      rating,
      iconType: "star",
    });
  }

  // Generate viewing notifications (22 notifications)
  for (let i = 0; i < 22; i++) {
    const doc = shuffledDocs[i % shuffledDocs.length];
    const viewers = Math.floor(random() * 15) + 8; // 8-22 viewers
    notifications.push({
      id: `notif-${idCounter++}`,
      type: "viewing",
      message: `${viewers} people are viewing "${doc}"`,
      iconType: "users",
    });
  }

  // Generate limited availability (11 notifications)
  for (let i = 0; i < 11; i++) {
    const slots = Math.floor(random() * 4) + 1; // 1-4 slots
    const timeframe = random() > 0.5 ? "this week" : "today";
    notifications.push({
      id: `notif-${idCounter++}`,
      type: "limited",
      message: `Only ${slots} consultation slot${slots > 1 ? 's' : ''} left ${timeframe}!`,
      iconType: "clock",
    });
  }

  // Generate downloads (11 notifications)
  for (let i = 0; i < 11; i++) {
    const doc = shuffledDocs[i % shuffledDocs.length];
    const location = weightedRandomLocation(random);
    notifications.push({
      id: `notif-${idCounter++}`,
      type: "download",
      message: `Someone from ${location} just downloaded "${doc}"`,
      iconType: "file",
    });
  }

  // Shuffle the entire pool for random distribution
  return shuffleArray(notifications, seed + 1);
}

// Generate realistic variable intervals based on user preference
// Normal pages: 4-11 minutes, Codex pages: 5-12 minutes
function generateIntervals(count: number, seed: number, isCodexPage: boolean = false): number[] {
  const random = seededRandom(seed);
  const intervals: number[] = [];

  for (let i = 0; i < count; i++) {
    let minSeconds: number;
    let maxSeconds: number;

    if (isCodexPage) {
      // Codex pages: 5-12 minutes (300-720 seconds)
      minSeconds = 300;
      maxSeconds = 720;
    } else {
      // Normal pages: 4-11 minutes (240-660 seconds)
      minSeconds = 240;
      maxSeconds = 660;
    }

    // Random interval within the range
    const randomInterval = minSeconds + random() * (maxSeconds - minSeconds);
    intervals.push(randomInterval * 1000); // Convert to milliseconds
  }

  return intervals;
}

// Icon component helper
function getIcon(iconType: NotificationData["iconType"], rating?: number): React.ReactNode {
  switch (iconType) {
    case "cart":
      return <ShoppingCart className="h-4 w-4 text-green-500" />;
    case "users":
      return <Users className="h-4 w-4 text-purple-500" />;
    case "star":
      return (
        <div className="flex items-center gap-0.5">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          {rating === 4.5 && (
            <span className="text-xs text-yellow-600 font-medium">4.5</span>
          )}
        </div>
      );
    case "clock":
      return <Clock className="h-4 w-4 text-red-500" />;
    case "file":
      return <FileText className="h-4 w-4 text-blue-500" />;
    case "calendar":
      return <Calendar className="h-4 w-4 text-tiffany" />;
    default:
      return <Users className="h-4 w-4 text-gray-500" />;
  }
}

// Generate realistic "time ago" strings
function generateTimeAgo(index: number): string {
  // Earlier notifications appear more recent
  const baseMinutes = Math.floor(index * 0.5) + 1; // Spread across time
  const variance = Math.floor(Math.random() * 3);
  const minutes = Math.max(1, baseMinutes + variance);

  if (minutes < 2) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

interface SocialProofNotificationsProps {
  enabled?: boolean;
  maxNotifications?: number;
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  displayDuration?: number; // How long each notification shows (ms)
}

export function SocialProofNotifications({
  enabled = true,
  maxNotifications = 1,
  position = "bottom-left",
  displayDuration = 7000,
}: SocialProofNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [isCodexPage, setIsCodexPage] = useState(false);
  const notificationIndexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we're on a /codex/ page and adjust settings accordingly
  useEffect(() => {
    const onCodexPage = typeof window !== 'undefined' && window.location.pathname.includes('/codex/');
    setIsCodexPage(onCodexPage);
  }, []);

  // Reduce display duration by 60% on codex pages (7000ms -> 2800ms)
  // Also change position to bottom-right on codex pages
  const effectiveDisplayDuration = isCodexPage ? Math.round(displayDuration * 0.4) : displayDuration;
  const effectivePosition = isCodexPage ? 'bottom-right' : position;

  // Pre-generate notification pool and intervals (memoized per session)
  const { pool, intervals } = useMemo(() => {
    const seed = Math.floor(Date.now() / (1000 * 60 * 60));
    return {
      pool: generateNotificationPool(),
      intervals: generateIntervals(250, seed, isCodexPage),
    };
  }, [isCodexPage]);

  const showNextNotification = useCallback(() => {
    if (dismissed) return;

    const index = notificationIndexRef.current;
    if (index >= pool.length) {
      // Wrap around after exhausting pool (after ~3 hours)
      notificationIndexRef.current = 0;
      return;
    }

    const data = pool[index];
    const notification: Notification = {
      ...data,
      id: `${data.id}-${Date.now()}`, // Unique ID for React key
      time: generateTimeAgo(index),
      icon: getIcon(data.iconType, data.rating),
    };

    setNotifications((prev) => [...prev.slice(-(maxNotifications - 1)), notification]);
    notificationIndexRef.current++;

    // Auto-remove after display duration (use effective duration for codex pages)
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, effectiveDisplayDuration);

    // Schedule next notification with variable interval
    // On codex pages, increase interval by 2.5x to reduce frequency by 60%
    let nextInterval = intervals[index % intervals.length];
    if (isCodexPage) {
      nextInterval = nextInterval * 2.5; // Reduce frequency by 60% (appear 40% as often)
    }
    timeoutRef.current = setTimeout(showNextNotification, nextInterval);
  }, [pool, intervals, maxNotifications, effectiveDisplayDuration, isCodexPage, dismissed]);

  useEffect(() => {
    if (!enabled) return;

    // Initial delay before first notification (8-15 seconds)
    const initialDelay = 8000 + Math.random() * 7000;
    const initialTimeout = setTimeout(showNextNotification, initialDelay);

    return () => {
      clearTimeout(initialTimeout);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, showNextNotification]);

  const positionClasses = {
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
  };

  if (!enabled || notifications.length === 0) return null;

  return (
    <div className={`fixed ${positionClasses[effectivePosition as keyof typeof positionClasses]} z-40 flex flex-col gap-2`}>
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
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Dismiss notification"
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
  // Initialize with null to avoid hydration mismatch, then set on client
  const [viewers, setViewers] = useState<number | null>(null);
  const [recentPurchases, setRecentPurchases] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize random values only on client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    setViewers(Math.floor(Math.random() * 8) + 2);
    setRecentPurchases(Math.floor(Math.random() * 20) + 5);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const interval = setInterval(() => {
      // Simulate fluctuating viewers
      setViewers((prev) => {
        if (prev === null) return 5;
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(1, Math.min(15, prev + change));
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [isClient]);

  // Don't render until client-side hydration is complete
  if (!isClient || viewers === null || recentPurchases === null) {
    return null;
  }

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
