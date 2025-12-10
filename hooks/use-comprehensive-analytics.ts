"use client";

import { useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/analytics/comprehensive-tracker";

/**
 * Comprehensive Analytics Hook
 * Automatically tracks page views on route changes
 * Provides methods for manual event tracking
 */
export function useComprehensiveAnalytics(userId?: string) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize analytics on mount
  useEffect(() => {
    analytics.init(userId);

    return () => {
      analytics.destroy();
    };
  }, [userId]);

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      analytics.trackPageView({
        query_params: searchParams?.toString() || undefined,
      });
    }
  }, [pathname, searchParams]);

  // Identify user when userId changes
  useEffect(() => {
    if (userId) {
      analytics.identify(userId);
    }
  }, [userId]);

  // Memoized tracking methods
  const trackClick = useCallback((element: HTMLElement, context?: Record<string, unknown>) => {
    analytics.trackEvent('manual_click', 'click', {
      element_id: element.id,
      element_text: element.textContent?.substring(0, 100),
      ...context,
    });
  }, []);

  const trackDocumentView = useCallback((documentId: string, documentName: string, category?: string) => {
    analytics.trackDocumentView(documentId, documentName, category);
  }, []);

  const trackAddToCart = useCallback((productId: string, productName: string, price: number, quantity?: number) => {
    analytics.trackAddToCart(productId, productName, price, quantity);
  }, []);

  const trackCheckoutStart = useCallback((cartValue: number, itemCount: number) => {
    analytics.trackCheckoutStart(cartValue, itemCount);
  }, []);

  const trackPurchase = useCallback((
    orderId: string,
    total: number,
    items: { id: string; name: string; price: number; quantity: number }[]
  ) => {
    analytics.trackPurchase(orderId, total, items);
  }, []);

  const trackConsultationBooked = useCallback((consultationType: string, dateTime: string) => {
    analytics.trackConsultationBooked(consultationType, dateTime);
  }, []);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    analytics.trackSearch(query, resultsCount);
  }, []);

  const trackNewsletterSignup = useCallback((email: string, source: string) => {
    analytics.trackNewsletterSignup(email, source);
  }, []);

  const trackXPEarned = useCallback((amount: number, source: string, multiplier?: number) => {
    analytics.trackXPEarned(amount, source, multiplier);
  }, []);

  const trackExitIntent = useCallback((shown: boolean, action?: 'dismissed' | 'converted' | 'closed', offerType?: string) => {
    analytics.trackExitIntent(shown, action, offerType);
  }, []);

  const trackCustomEvent = useCallback((eventName: string, properties?: Record<string, unknown>) => {
    analytics.trackEvent(eventName, 'custom', properties || {});
  }, []);

  const trackFormStart = useCallback((formName: string) => {
    analytics.trackEvent('form_interaction_start', 'form', { form_name: formName });
  }, []);

  const trackFormComplete = useCallback((formName: string, success: boolean) => {
    analytics.trackEvent('form_interaction_complete', 'form', {
      form_name: formName,
      success,
    });
  }, []);

  return {
    // Session info
    sessionId: analytics.getSessionId(),
    userId: analytics.getUserId(),
    getSessionData: analytics.getSessionData.bind(analytics),

    // Tracking methods
    trackClick,
    trackDocumentView,
    trackAddToCart,
    trackCheckoutStart,
    trackPurchase,
    trackConsultationBooked,
    trackSearch,
    trackNewsletterSignup,
    trackXPEarned,
    trackExitIntent,
    trackCustomEvent,
    trackFormStart,
    trackFormComplete,

    // Direct access for advanced use
    analytics,
  };
}

/**
 * Simple hook for tracking specific events
 * Use when you don't need full analytics initialization
 */
export function useTrackEvent() {
  const trackEvent = useCallback((eventName: string, category: string, properties?: Record<string, unknown>) => {
    analytics.trackEvent(eventName, category as 'custom', properties || {});
  }, []);

  return { trackEvent, analytics };
}

export default useComprehensiveAnalytics;
