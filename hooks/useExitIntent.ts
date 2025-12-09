"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseExitIntentOptions {
  /** Delay in ms before exit intent can trigger (prevents false positives) */
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
}

/**
 * Hook to detect exit intent (mouse leaving viewport / scroll up on mobile)
 * Used to show cart abandonment prevention modals
 */
export function useExitIntent(options: UseExitIntentOptions = {}): UseExitIntentReturn {
  const {
    delay = 1000,
    threshold = 20,
    oncePerSession = true,
    cookieKey = "exit_intent_shown",
    cooldown = 24 * 60 * 60 * 1000, // 24 hours
    enableMobile = true,
    onExitIntent,
  } = options;

  const [triggered, setTriggered] = useState(false);
  const canTriggerRef = useRef(false);
  const lastScrollRef = useRef(0);
  const touchStartYRef = useRef(0);

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
    if (triggered || hasShownThisSession()) return;

    setTriggered(true);
    markAsShown();
    onExitIntent?.();
  }, [triggered, hasShownThisSession, markAsShown, onExitIntent]);

  // Reset trigger state
  const reset = useCallback(() => {
    setTriggered(false);
  }, []);

  // Dismiss and prevent future triggers this session
  const dismiss = useCallback(() => {
    setTriggered(false);
    markAsShown();
  }, [markAsShown]);

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

  return {
    triggered,
    reset,
    trigger,
    dismiss,
  };
}

export default useExitIntent;
