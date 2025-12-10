"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { analytics } from "@/lib/analytics/comprehensive-tracker";

interface UseExitIntentOptions {
  /** Delay in ms before exit intent can trigger (prevents false positives) - default 45s */
  delay?: number;
  /** Sensitivity of mouse detection (pixels from top of viewport) */
  threshold?: number;
  /** Session-based cooldown - only trigger once per session */
  oncePerSession?: boolean;
  /** Cookie name for tracking shown state */
  cookieKey?: string;
  /** Time in ms before showing again (if not oncePerSession) */
  cooldown?: number;
  /** Enable mobile scroll-up detection */
  enableMobile?: boolean;
  /** Callback when exit intent is detected */
  onExitIntent?: () => void;
  /** Pages to exclude from exit intent */
  excludePaths?: string[];
  /** Track analytics events */
  trackAnalytics?: boolean;
  /** Offer type for analytics */
  offerType?: string;
}

interface UseExitIntentReturn {
  /** Whether exit intent has been triggered */
  triggered: boolean;
  /** Reset the trigger state */
  reset: () => void;
  /** Manually trigger exit intent */
  trigger: () => void;
  /** Dismiss and set cooldown */
  dismiss: () => void;
  /** Mark as converted (user took action) */
  markConverted: () => void;
  /** Time remaining before can trigger (ms) */
  timeUntilActive: number;
}

/**
 * Hook to detect exit intent (mouse leaving viewport / scroll up on mobile)
 * Used to show cart abandonment prevention modals
 *
 * IMPORTANT: Designed to NOT be annoying:
 * - Default 45-second delay before it can trigger
 * - Only shows once per session by default
 * - Excludes checkout/admin pages
 */
export function useExitIntent(options: UseExitIntentOptions = {}): UseExitIntentReturn {
  const {
    delay = 45000, // 45 seconds - not too aggressive!
    threshold = 20,
    oncePerSession = true,
    cookieKey = "exit_intent_shown",
    cooldown = 24 * 60 * 60 * 1000, // 24 hours
    enableMobile = true,
    onExitIntent,
    excludePaths = ["/admin", "/checkout", "/cart", "/thank-you", "/success", "/login", "/register"],
    trackAnalytics = true,
    offerType = "default",
  } = options;

  const [triggered, setTriggered] = useState(false);
  const [timeUntilActive, setTimeUntilActive] = useState(delay);
  const canTriggerRef = useRef(false);
  const lastScrollRef = useRef(0);
  const touchStartYRef = useRef(0);
  const pageLoadTimeRef = useRef(Date.now());

  // Check if on excluded path
  const isExcludedPath = useCallback(() => {
    if (typeof window === "undefined") return true;
    const currentPath = window.location.pathname;
    return excludePaths.some((path) => currentPath.startsWith(path));
  }, [excludePaths]);

  // Check if already shown this session
  const hasShownThisSession = useCallback(() => {
    if (typeof window === "undefined") return true;

    if (oncePerSession) {
      return sessionStorage.getItem(cookieKey) === "true";
    }

    // Check cooldown cookie
    const lastShown = localStorage.getItem(`${cookieKey}_timestamp`);
    if (lastShown) {
      const timeSince = Date.now() - parseInt(lastShown, 10);
      return timeSince < cooldown;
    }

    return false;
  }, [cookieKey, oncePerSession, cooldown]);

  // Mark as shown
  const markAsShown = useCallback(() => {
    if (typeof window === "undefined") return;

    if (oncePerSession) {
      sessionStorage.setItem(cookieKey, "true");
    }
    localStorage.setItem(`${cookieKey}_timestamp`, Date.now().toString());
  }, [cookieKey, oncePerSession]);

  // Trigger exit intent
  const trigger = useCallback(() => {
    if (triggered || hasShownThisSession() || isExcludedPath()) return;

    setTriggered(true);
    markAsShown();
    onExitIntent?.();

    // Track analytics
    if (trackAnalytics) {
      analytics.trackExitIntent(true, undefined, offerType);
    }
  }, [triggered, hasShownThisSession, isExcludedPath, markAsShown, onExitIntent, trackAnalytics, offerType]);

  // Reset trigger state
  const reset = useCallback(() => {
    setTriggered(false);
  }, []);

  // Dismiss and prevent future triggers this session
  const dismiss = useCallback(() => {
    setTriggered(false);
    markAsShown();

    // Track analytics
    if (trackAnalytics) {
      analytics.trackExitIntent(false, "dismissed", offerType);
    }
  }, [markAsShown, trackAnalytics, offerType]);

  // Mark as converted (user took action)
  const markConverted = useCallback(() => {
    setTriggered(false);
    markAsShown();

    // Track analytics
    if (trackAnalytics) {
      analytics.trackExitIntent(false, "converted", offerType);
    }
  }, [markAsShown, trackAnalytics, offerType]);

  // Desktop: Mouse leave detection
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Enable triggering after delay
    const delayTimeout = setTimeout(() => {
      canTriggerRef.current = true;
    }, delay);

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves through top of viewport
      if (
        canTriggerRef.current &&
        e.clientY <= threshold &&
        !triggered &&
        !hasShownThisSession()
      ) {
        trigger();
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(delayTimeout);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [delay, threshold, triggered, hasShownThisSession, trigger]);

  // Mobile: Scroll up / swipe up detection
  useEffect(() => {
    if (typeof window === "undefined" || !enableMobile) return;

    // Enable triggering after delay
    const delayTimeout = setTimeout(() => {
      canTriggerRef.current = true;
    }, delay);

    // Track scroll position
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      // Detect fast scroll up at top of page
      if (
        canTriggerRef.current &&
        lastScrollRef.current > currentScroll &&
        currentScroll < 100 &&
        lastScrollRef.current - currentScroll > 50 &&
        !triggered &&
        !hasShownThisSession()
      ) {
        trigger();
      }

      lastScrollRef.current = currentScroll;
    };

    // Track touch for swipe detection
    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchEndY - touchStartYRef.current;

      // Detect swipe down at top of page (indicating intent to leave)
      if (
        canTriggerRef.current &&
        deltaY > 100 && // Significant swipe down
        window.scrollY < 50 && // Near top of page
        !triggered &&
        !hasShownThisSession()
      ) {
        trigger();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      clearTimeout(delayTimeout);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [delay, enableMobile, triggered, hasShownThisSession, trigger]);

  // Track time until active (for UI display)
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - pageLoadTimeRef.current;
      const remaining = Math.max(0, delay - elapsed);
      setTimeUntilActive(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [delay]);

  return {
    triggered,
    reset,
    trigger,
    dismiss,
    markConverted,
    timeUntilActive,
  };
}

/**
 * Pre-configured hook for cart pages (more aggressive timing)
 */
export function useCartExitIntent(options: Omit<UseExitIntentOptions, "delay" | "excludePaths"> = {}) {
  return useExitIntent({
    ...options,
    delay: 15000, // 15 seconds on cart page
    excludePaths: ["/checkout", "/thank-you", "/success"],
    offerType: "cart_recovery",
  });
}

/**
 * Pre-configured hook for general pages (less aggressive)
 */
export function useGeneralExitIntent(options: Omit<UseExitIntentOptions, "delay"> = {}) {
  return useExitIntent({
    ...options,
    delay: 60000, // 60 seconds - very non-aggressive
    offerType: "newsletter",
  });
}

export default useExitIntent;
