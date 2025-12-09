"use client";

import posthog from "posthog-js";

// Initialize PostHog
export function initPostHog() {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false, // We handle this manually for Next.js App Router
      capture_pageleave: true,
      autocapture: {
        url_allowlist: [
          // Only autocapture on key pages
          "/documents",
          "/book-appointment",
          "/contact",
          "/knowledge-base",
        ],
      },
    });
  }
}

// Track page views
export function trackPageView(url: string) {
  posthog.capture("$pageview", {
    $current_url: url,
  });
}

// Track custom events
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  posthog.capture(eventName, properties);
}

// Identify user
export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
) {
  posthog.identify(userId, properties);
}

// Reset user (on logout)
export function resetUser() {
  posthog.reset();
}

// Feature flags
export function isFeatureEnabled(flagKey: string): boolean {
  return posthog.isFeatureEnabled(flagKey) ?? false;
}

export function getFeatureFlag(flagKey: string): string | boolean | undefined {
  return posthog.getFeatureFlag(flagKey);
}

// Analytics events for Hamilton Bailey Legal
export const analytics = {
  // Document events
  documentViewed: (documentId: string, documentName: string) => {
    trackEvent("document_viewed", {
      document_id: documentId,
      document_name: documentName,
    });
  },

  documentAddedToCart: (documentId: string, documentName: string, price: number) => {
    trackEvent("document_added_to_cart", {
      document_id: documentId,
      document_name: documentName,
      price,
    });
  },

  documentPurchased: (documentId: string, documentName: string, price: number) => {
    trackEvent("document_purchased", {
      document_id: documentId,
      document_name: documentName,
      price,
    });
  },

  // Booking events
  bookingStarted: (consultationType: string) => {
    trackEvent("booking_started", {
      consultation_type: consultationType,
    });
  },

  bookingCompleted: (consultationType: string, price: number) => {
    trackEvent("booking_completed", {
      consultation_type: consultationType,
      price,
    });
  },

  bookingAbandoned: (consultationType: string, step: string) => {
    trackEvent("booking_abandoned", {
      consultation_type: consultationType,
      abandoned_at_step: step,
    });
  },

  // Knowledge Base events
  articleViewed: (articleSlug: string, articleTitle: string, category: string) => {
    trackEvent("article_viewed", {
      article_slug: articleSlug,
      article_title: articleTitle,
      category,
    });
  },

  searchPerformed: (query: string, resultsCount: number) => {
    trackEvent("search_performed", {
      search_query: query,
      results_count: resultsCount,
    });
  },

  // Contact/Lead events
  contactFormSubmitted: (formType: string) => {
    trackEvent("contact_form_submitted", {
      form_type: formType,
    });
  },

  newsletterSubscribed: (source: string) => {
    trackEvent("newsletter_subscribed", {
      source,
    });
  },

  // Cart events
  cartViewed: (itemCount: number, cartValue: number) => {
    trackEvent("cart_viewed", {
      item_count: itemCount,
      cart_value: cartValue,
    });
  },

  checkoutStarted: (itemCount: number, cartValue: number) => {
    trackEvent("checkout_started", {
      item_count: itemCount,
      cart_value: cartValue,
    });
  },

  checkoutCompleted: (itemCount: number, orderValue: number) => {
    trackEvent("checkout_completed", {
      item_count: itemCount,
      order_value: orderValue,
    });
  },

  cartAbandoned: (itemCount: number, cartValue: number) => {
    trackEvent("cart_abandoned", {
      item_count: itemCount,
      cart_value: cartValue,
    });
  },

  // Client Portal events
  portalAccessed: (section: string) => {
    trackEvent("portal_accessed", {
      section,
    });
  },

  documentDownloaded: (documentId: string) => {
    trackEvent("document_downloaded", {
      document_id: documentId,
    });
  },
};

export default posthog;
