/**
 * Analytics Event Tracking Library
 *
 * Tracks user behavior for BMAD optimization and conversion analysis.
 * Events are sent to the analytics API and can be forwarded to external services.
 */

// ============================================================================
// EVENT TYPES
// ============================================================================

export type EventCategory =
  | "page_view"
  | "xp"
  | "purchase"
  | "engagement"
  | "gamification"
  | "conversion"
  | "experiment";

export type EventName =
  // XP Events
  | "xp_earned"
  | "xp_redeemed"
  | "xp_bonus_triggered"
  | "xp_milestone_reached"
  // Purchase Events
  | "cart_view"
  | "cart_add"
  | "cart_remove"
  | "checkout_start"
  | "checkout_complete"
  | "purchase_complete"
  | "cart_abandon"
  // Engagement Events
  | "page_view"
  | "session_start"
  | "session_end"
  | "content_view"
  | "search"
  | "filter_apply"
  // Gamification Events
  | "streak_updated"
  | "streak_broken"
  | "streak_frozen"
  | "achievement_unlocked"
  | "level_up"
  | "challenge_started"
  | "challenge_completed"
  | "leaderboard_view"
  // Conversion Events
  | "signup_start"
  | "signup_complete"
  | "newsletter_subscribe"
  | "quiz_start"
  | "quiz_complete"
  | "calculator_use"
  | "document_configure"
  | "review_submit"
  | "referral_sent"
  | "referral_converted"
  // Experiment Events
  | "experiment_assigned"
  | "experiment_conversion";

export interface AnalyticsEvent {
  name: EventName;
  category: EventCategory;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
}

// ============================================================================
// CLIENT-SIDE TRACKING
// ============================================================================

let sessionId: string | null = null;
let userId: string | null = null;
const eventQueue: AnalyticsEvent[] = [];
let isProcessing = false;

/**
 * Initialize analytics with user/session info
 */
export function initAnalytics(options: { userId?: string } = {}) {
  if (typeof window === "undefined") return;

  // Get or create session ID
  sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);

    // Track session start
    trackEvent({
      name: "session_start",
      category: "engagement",
      properties: {
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
      },
    });
  }

  if (options.userId) {
    userId = options.userId;
  }

  // Process queue on page unload
  window.addEventListener("beforeunload", () => {
    if (eventQueue.length > 0) {
      flushEvents(true);
    }
  });

  // Start queue processor
  setInterval(processQueue, 5000);
}

/**
 * Track an analytics event
 */
export function trackEvent(event: AnalyticsEvent) {
  const enrichedEvent: AnalyticsEvent = {
    ...event,
    userId: userId || undefined,
    sessionId: sessionId || undefined,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  eventQueue.push(enrichedEvent);

  // For high-priority events, flush immediately
  const highPriority = [
    "purchase_complete",
    "checkout_complete",
    "signup_complete",
    "experiment_conversion",
  ];

  if (highPriority.includes(event.name)) {
    processQueue();
  }
}

/**
 * Process event queue
 */
async function processQueue() {
  if (isProcessing || eventQueue.length === 0) return;

  isProcessing = true;

  const eventsToSend = eventQueue.splice(0, 10); // Batch of 10

  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: eventsToSend }),
    });
  } catch {
    // Re-queue failed events
    eventQueue.unshift(...eventsToSend);
  } finally {
    isProcessing = false;
  }
}

/**
 * Flush all events immediately
 */
function flushEvents(useBeacon = false) {
  if (eventQueue.length === 0) return;

  const events = eventQueue.splice(0, eventQueue.length);

  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/analytics/track",
      JSON.stringify({ events })
    );
  } else {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
      keepalive: true,
    }).catch(() => {});
  }
}

// ============================================================================
// CONVENIENCE TRACKING FUNCTIONS
// ============================================================================

/**
 * Track XP earned event
 */
export function trackXPEarned(amount: number, source: string, bonusType?: string) {
  trackEvent({
    name: "xp_earned",
    category: "xp",
    properties: {
      amount,
      source,
      bonusType,
      hasBonus: !!bonusType,
    },
  });
}

/**
 * Track XP redeemed event
 */
export function trackXPRedeemed(amount: number, discountValue: number, orderId: string) {
  trackEvent({
    name: "xp_redeemed",
    category: "xp",
    properties: {
      amount,
      discountValue,
      orderId,
    },
  });
}

/**
 * Track purchase complete event
 */
export function trackPurchase(
  orderId: string,
  total: number,
  itemCount: number,
  xpEarned: number,
  xpRedeemed: number = 0
) {
  trackEvent({
    name: "purchase_complete",
    category: "purchase",
    properties: {
      orderId,
      total,
      itemCount,
      xpEarned,
      xpRedeemed,
      discountApplied: xpRedeemed > 0,
    },
  });
}

/**
 * Track cart abandonment
 */
export function trackCartAbandon(cartTotal: number, itemCount: number, potentialXP: number) {
  trackEvent({
    name: "cart_abandon",
    category: "purchase",
    properties: {
      cartTotal,
      itemCount,
      potentialXP,
      potentialDiscount: Math.floor(potentialXP / 100),
    },
  });
}

/**
 * Track streak update
 */
export function trackStreakUpdate(currentStreak: number, isNew: boolean, bonusXP: number) {
  trackEvent({
    name: "streak_updated",
    category: "gamification",
    properties: {
      currentStreak,
      isNew,
      bonusXP,
    },
  });
}

/**
 * Track achievement unlock
 */
export function trackAchievement(achievementId: string, name: string, xpReward: number, rarity: string) {
  trackEvent({
    name: "achievement_unlocked",
    category: "gamification",
    properties: {
      achievementId,
      name,
      xpReward,
      rarity,
    },
  });
}

/**
 * Track quiz completion
 */
export function trackQuizComplete(quizType: string, score: number, xpEarned: number) {
  trackEvent({
    name: "quiz_complete",
    category: "conversion",
    properties: {
      quizType,
      score,
      xpEarned,
    },
  });
}

/**
 * Track calculator usage
 */
export function trackCalculatorUse(
  calculatorType: string,
  inputs: Record<string, unknown>,
  result: Record<string, unknown>
) {
  trackEvent({
    name: "calculator_use",
    category: "conversion",
    properties: {
      calculatorType,
      inputs,
      result,
    },
  });
}

/**
 * Track experiment assignment
 */
export function trackExperimentAssigned(
  experimentId: string,
  variant: string,
  metadata?: Record<string, unknown>
) {
  trackEvent({
    name: "experiment_assigned",
    category: "experiment",
    properties: {
      experimentId,
      variant,
      ...metadata,
    },
  });
}

/**
 * Track experiment conversion
 */
export function trackExperimentConversion(
  experimentId: string,
  variant: string,
  conversionType: string,
  value?: number
) {
  trackEvent({
    name: "experiment_conversion",
    category: "experiment",
    properties: {
      experimentId,
      variant,
      conversionType,
      value,
    },
  });
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  trackEvent({
    name: "page_view",
    category: "page_view",
    properties: {
      path,
      title: title || document.title,
      referrer: document.referrer,
    },
  });
}

// ============================================================================
// REACT HOOKS
// ============================================================================

/**
 * Hook for automatic page view tracking
 */
export function usePageTracking(path: string) {
  if (typeof window !== "undefined") {
    // Track on mount
    trackPageView(path);
  }
}

export default {
  initAnalytics,
  trackEvent,
  trackXPEarned,
  trackXPRedeemed,
  trackPurchase,
  trackCartAbandon,
  trackStreakUpdate,
  trackAchievement,
  trackQuizComplete,
  trackCalculatorUse,
  trackExperimentAssigned,
  trackExperimentConversion,
  trackPageView,
};
