"use client";

import { useEffect, createContext, useContext, ReactNode, Suspense, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/analytics/comprehensive-tracker";
import { initHeatmapTracking, cleanupHeatmapTracking, updateHeatmapConfig } from "@/lib/analytics/heatmap-tracker";

// ============================================================================
// Analytics Context
// ============================================================================

interface AnalyticsContextValue {
  trackEvent: (name: string, properties?: Record<string, unknown>) => void;
  trackDocumentView: (id: string, name: string, category?: string) => void;
  trackAddToCart: (productId: string, name: string, price: number, qty?: number) => void;
  trackCheckoutStart: (cartValue: number, itemCount: number) => void;
  trackPurchase: (orderId: string, total: number, items: { id: string; name: string; price: number; quantity: number }[]) => void;
  trackConsultationBooked: (type: string, dateTime: string) => void;
  trackSearch: (query: string, resultsCount: number) => void;
  trackNewsletterSignup: (email: string, source: string) => void;
  trackXPEarned: (amount: number, source: string, multiplier?: number) => void;
  trackExitIntent: (shown: boolean, action?: 'dismissed' | 'converted' | 'closed', offerType?: string) => void;
  identify: (userId: string) => void;
  sessionId: string;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

// ============================================================================
// Inner component that uses searchParams (needs Suspense)
// ============================================================================

function AnalyticsTracker({ userId }: { userId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      // Small delay to ensure page title is updated
      setTimeout(() => {
        analytics.trackPageView({
          query_params: searchParams?.toString() || undefined,
        });
      }, 100);
    }
  }, [pathname, searchParams]);

  return null;
}

// ============================================================================
// Analytics Provider Component
// ============================================================================

interface AnalyticsProviderProps {
  children: ReactNode;
  userId?: string;
}

export function AnalyticsProvider({ children, userId }: AnalyticsProviderProps) {
  const heatmapInitialized = useRef(false);

  // Initialize analytics on mount
  useEffect(() => {
    analytics.init(userId);

    return () => {
      analytics.destroy();
    };
  }, [userId]);

  // Initialize heatmap tracking on mount
  useEffect(() => {
    if (heatmapInitialized.current) return;

    // Fetch enabled pages for heatmap tracking
    async function initHeatmap() {
      try {
        // Use public endpoint to get enabled pages (no auth required for client)
        const response = await fetch("/api/analytics/heatmap-config");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.enabledPages?.length > 0) {
            initHeatmapTracking({
              enabledPages: data.enabledPages,
              trackScrollDepth: true,
              debounceMs: 100,
            });
            heatmapInitialized.current = true;
          }
        }
      } catch (error) {
        // Silently fail - heatmap tracking is optional
        console.debug("Heatmap config not available:", error);
      }
    }

    initHeatmap();

    return () => {
      if (heatmapInitialized.current) {
        cleanupHeatmapTracking();
        heatmapInitialized.current = false;
      }
    };
  }, []);

  // Identify user when userId changes
  useEffect(() => {
    if (userId) {
      analytics.identify(userId);
    }
  }, [userId]);

  // Context value with all tracking methods
  const value: AnalyticsContextValue = {
    trackEvent: (name, properties) => analytics.trackEvent(name, 'custom', properties || {}),
    trackDocumentView: (id, name, category) => analytics.trackDocumentView(id, name, category),
    trackAddToCart: (productId, name, price, qty) => analytics.trackAddToCart(productId, name, price, qty),
    trackCheckoutStart: (cartValue, itemCount) => analytics.trackCheckoutStart(cartValue, itemCount),
    trackPurchase: (orderId, total, items) => analytics.trackPurchase(orderId, total, items),
    trackConsultationBooked: (type, dateTime) => analytics.trackConsultationBooked(type, dateTime),
    trackSearch: (query, resultsCount) => analytics.trackSearch(query, resultsCount),
    trackNewsletterSignup: (email, source) => analytics.trackNewsletterSignup(email, source),
    trackXPEarned: (amount, source, multiplier) => analytics.trackXPEarned(amount, source, multiplier),
    trackExitIntent: (shown, action, offerType) => analytics.trackExitIntent(shown, action, offerType),
    identify: (id) => analytics.identify(id),
    sessionId: analytics.getSessionId(),
  };

  return (
    <AnalyticsContext.Provider value={value}>
      <Suspense fallback={null}>
        <AnalyticsTracker userId={userId} />
      </Suspense>
      {children}
    </AnalyticsContext.Provider>
  );
}

// ============================================================================
// Hook to use analytics context
// ============================================================================

export function useAnalytics() {
  const context = useContext(AnalyticsContext);

  if (!context) {
    // Return a no-op implementation if used outside provider
    return {
      trackEvent: () => {},
      trackDocumentView: () => {},
      trackAddToCart: () => {},
      trackCheckoutStart: () => {},
      trackPurchase: () => {},
      trackConsultationBooked: () => {},
      trackSearch: () => {},
      trackNewsletterSignup: () => {},
      trackXPEarned: () => {},
      trackExitIntent: () => {},
      identify: () => {},
      sessionId: '',
    };
  }

  return context;
}

export default AnalyticsProvider;
