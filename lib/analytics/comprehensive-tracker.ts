"use client";

/**
 * Comprehensive Analytics Tracking System
 * Captures all user behavior for conversion optimization
 * Stores everything in Supabase - no external analytics services
 *
 * Based on BMAD methodology: track everything, analyze deeply, act precisely
 */

// ============================================================================
// Types
// ============================================================================

export interface AnalyticsEvent {
  event_name: string;
  event_category: 'pageview' | 'click' | 'scroll' | 'form' | 'engagement' | 'conversion' | 'error' | 'performance' | 'custom';
  properties: Record<string, unknown>;
  user_id?: string;
  session_id: string;
  page_url: string;
  page_title: string;
  referrer?: string;
  user_agent: string;
  device_type: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  os: string;
  screen_width: number;
  screen_height: number;
  viewport_width: number;
  viewport_height: number;
  timestamp: string;
}

interface SessionData {
  session_id: string;
  user_id?: string;
  start_time: number;
  page_views: number;
  events_count: number;
  total_time: number;
  max_scroll_depth: number;
  is_bounce: boolean;
  entry_page: string;
  exit_page: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface ScrollMilestone {
  depth: number;
  timestamp: number;
}

// ============================================================================
// Singleton Analytics Class
// ============================================================================

class ComprehensiveAnalytics {
  private sessionId: string;
  private userId: string | null = null;
  private sessionStartTime: number;
  private lastActivityTime: number;
  private pageViews: number = 0;
  private eventsCount: number = 0;
  private maxScrollDepth: number = 0;
  private scrollMilestones: Set<number> = new Set();
  private entryPage: string = '';
  private isInitialized: boolean = false;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private sessionUpdateInterval: ReturnType<typeof setInterval> | null = null;
  private utmParams: { source?: string; medium?: string; campaign?: string; term?: string; content?: string } = {};

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  async init(userId?: string): Promise<void> {
    if (typeof window === 'undefined') return;
    if (this.isInitialized) return;

    this.userId = userId || null;
    this.entryPage = window.location.pathname;
    this.parseUtmParams();

    // Setup automatic tracking
    this.setupPageViewTracking();
    this.setupClickTracking();
    this.setupScrollTracking();
    this.setupFormTracking();
    this.setupVisibilityTracking();
    this.setupErrorTracking();
    this.setupPerformanceTracking();
    this.setupExitTracking();

    // Track initial page view
    this.trackPageView();

    // Setup event batching (send every 5 seconds)
    this.flushInterval = setInterval(() => this.flushEvents(), 5000);

    // Update session every 30 seconds
    this.sessionUpdateInterval = setInterval(() => this.updateSession(), 30000);

    this.isInitialized = true;
    console.log('[Analytics] Comprehensive tracking initialized');
  }

  destroy(): void {
    if (this.flushInterval) clearInterval(this.flushInterval);
    if (this.sessionUpdateInterval) clearInterval(this.sessionUpdateInterval);
    this.flushEvents(); // Send any remaining events
  }

  // ============================================================================
  // Session Management
  // ============================================================================

  private generateSessionId(): string {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('hbl_session_id') : null;
    if (stored) return stored;

    const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hbl_session_id', newId);
    }
    return newId;
  }

  private parseUtmParams(): void {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    this.utmParams = {
      source: params.get('utm_source') || undefined,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
      term: params.get('utm_term') || undefined,
      content: params.get('utm_content') || undefined,
    };
  }

  identify(userId: string): void {
    this.userId = userId;
    this.trackEvent('user_identified', 'engagement', { user_id: userId });
  }

  // ============================================================================
  // Device & Browser Detection
  // ============================================================================

  private getDeviceInfo(): {
    device_type: 'desktop' | 'tablet' | 'mobile';
    browser: string;
    os: string;
    screen_width: number;
    screen_height: number;
    viewport_width: number;
    viewport_height: number;
    user_agent: string;
  } {
    if (typeof window === 'undefined') {
      return {
        device_type: 'desktop',
        browser: 'Unknown',
        os: 'Unknown',
        screen_width: 0,
        screen_height: 0,
        viewport_width: 0,
        viewport_height: 0,
        user_agent: '',
      };
    }

    const width = window.innerWidth;
    const ua = navigator.userAgent;

    // Device type
    let device_type: 'desktop' | 'tablet' | 'mobile' = 'desktop';
    if (width < 768 || /Mobile|Android|iPhone/i.test(ua)) device_type = 'mobile';
    else if (width < 1024 || /iPad|Tablet/i.test(ua)) device_type = 'tablet';

    // Browser detection
    let browser = 'Unknown';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

    // OS detection
    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux') && !ua.includes('Android')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return {
      device_type,
      browser,
      os,
      screen_width: screen.width,
      screen_height: screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      user_agent: ua,
    };
  }

  // ============================================================================
  // Core Event Tracking
  // ============================================================================

  trackEvent(
    eventName: string,
    category: AnalyticsEvent['event_category'],
    properties: Record<string, unknown> = {}
  ): void {
    if (typeof window === 'undefined') return;

    this.eventsCount++;
    this.lastActivityTime = Date.now();

    const deviceInfo = this.getDeviceInfo();

    const event: AnalyticsEvent = {
      event_name: eventName,
      event_category: category,
      properties: {
        ...properties,
        utm_source: this.utmParams.source,
        utm_medium: this.utmParams.medium,
        utm_campaign: this.utmParams.campaign,
      },
      user_id: this.userId || undefined,
      session_id: this.sessionId,
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer || undefined,
      ...deviceInfo,
      timestamp: new Date().toISOString(),
    };

    this.eventQueue.push(event);

    // Flush immediately for high-priority events
    if (['purchase_complete', 'consultation_booked', 'checkout_start', 'error'].includes(eventName)) {
      this.flushEvents();
    }
  }

  // ============================================================================
  // Page View Tracking
  // ============================================================================

  private setupPageViewTracking(): void {
    if (typeof window === 'undefined') return;

    // Track SPA navigation
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args) => {
      originalPushState(...args);
      this.trackPageView();
    };

    history.replaceState = (...args) => {
      originalReplaceState(...args);
      this.trackPageView();
    };

    window.addEventListener('popstate', () => this.trackPageView());
  }

  trackPageView(properties: Record<string, unknown> = {}): void {
    this.pageViews++;
    this.maxScrollDepth = 0;
    this.scrollMilestones.clear();

    this.trackEvent('page_view', 'pageview', {
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
      page_number: this.pageViews,
      is_entry: this.pageViews === 1,
      ...properties,
    });
  }

  // ============================================================================
  // Click Tracking
  // ============================================================================

  private setupClickTracking(): void {
    if (typeof window === 'undefined') return;

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const clickData = this.getClickData(target, e);
      this.trackEvent('click', 'click', clickData);

      // Track specific element types
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        this.trackEvent('button_click', 'click', clickData);
      }
      if (target.tagName === 'A' || target.closest('a')) {
        const anchor = (target.tagName === 'A' ? target : target.closest('a')) as HTMLAnchorElement;
        if (anchor?.href) {
          this.trackEvent('link_click', 'click', {
            ...clickData,
            href: anchor.href,
            is_external: !anchor.href.includes(window.location.hostname),
          });
        }
      }
    }, { capture: true, passive: true });

    // Rage click detection
    let clickTimes: number[] = [];
    document.addEventListener('click', () => {
      const now = Date.now();
      clickTimes.push(now);
      clickTimes = clickTimes.filter(t => now - t < 2000);

      if (clickTimes.length >= 3) {
        this.trackEvent('rage_click', 'engagement', {
          click_count: clickTimes.length,
          frustration_detected: true,
        });
        clickTimes = [];
      }
    });
  }

  private getClickData(target: HTMLElement, e: MouseEvent): Record<string, unknown> {
    const rect = target.getBoundingClientRect();
    return {
      element_tag: target.tagName.toLowerCase(),
      element_id: target.id || undefined,
      element_class: target.className || undefined,
      element_text: target.textContent?.substring(0, 100) || undefined,
      element_href: (target as HTMLAnchorElement).href || undefined,
      click_x: e.clientX,
      click_y: e.clientY,
      element_x: rect.left,
      element_y: rect.top,
      element_width: rect.width,
      element_height: rect.height,
    };
  }

  // ============================================================================
  // Scroll Tracking
  // ============================================================================

  private setupScrollTracking(): void {
    if (typeof window === 'undefined') return;

    let scrollTimeout: ReturnType<typeof setTimeout>;
    let lastScrollY = 0;
    let totalScrollDistance = 0;
    const scrollStartTime = Date.now();

    const handleScroll = () => {
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const currentScrollY = window.scrollY;
        const scrollDelta = Math.abs(currentScrollY - lastScrollY);
        totalScrollDistance += scrollDelta;

        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = scrollHeight > 0 ? Math.round((currentScrollY / scrollHeight) * 100) : 0;

        if (scrollPercentage > this.maxScrollDepth) {
          this.maxScrollDepth = scrollPercentage;
        }

        // Track scroll milestones (25%, 50%, 75%, 90%, 100%)
        [25, 50, 75, 90, 100].forEach(milestone => {
          if (scrollPercentage >= milestone && !this.scrollMilestones.has(milestone)) {
            this.scrollMilestones.add(milestone);
            this.trackEvent('scroll_depth', 'scroll', {
              depth_percentage: milestone,
              time_to_depth: Date.now() - scrollStartTime,
              total_scroll_distance: totalScrollDistance,
            });
          }
        });

        lastScrollY = currentScrollY;
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // ============================================================================
  // Form Tracking
  // ============================================================================

  private setupFormTracking(): void {
    if (typeof window === 'undefined') return;

    // Track form field focus
    document.addEventListener('focus', (e) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        this.trackEvent('form_field_focus', 'form', {
          field_name: (target as HTMLInputElement).name || target.id,
          field_type: (target as HTMLInputElement).type || target.tagName.toLowerCase(),
          form_id: target.closest('form')?.id,
          form_name: target.closest('form')?.getAttribute('name'),
        });
      }
    }, true);

    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement;
      if (!form) return;

      const fields = Array.from(form.elements)
        .filter(el => (el as HTMLInputElement).name)
        .map(el => ({
          name: (el as HTMLInputElement).name,
          type: (el as HTMLInputElement).type,
          filled: !!(el as HTMLInputElement).value,
        }));

      this.trackEvent('form_submit', 'form', {
        form_id: form.id,
        form_name: form.getAttribute('name'),
        form_action: form.action,
        fields_count: fields.length,
        fields_filled: fields.filter(f => f.filled).length,
      });
    }, true);

    // Track form abandonment
    let formInteractionStarted = false;
    let formInteractionTime = 0;

    document.addEventListener('input', () => {
      if (!formInteractionStarted) {
        formInteractionStarted = true;
        formInteractionTime = Date.now();
        this.trackEvent('form_start', 'form', {});
      }
    });

    window.addEventListener('beforeunload', () => {
      if (formInteractionStarted) {
        this.trackEvent('form_abandonment', 'form', {
          time_spent: Date.now() - formInteractionTime,
        });
      }
    });
  }

  // ============================================================================
  // Visibility & Engagement Tracking
  // ============================================================================

  private setupVisibilityTracking(): void {
    if (typeof window === 'undefined') return;

    let hiddenTime = 0;
    let visibleTime = Date.now();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        hiddenTime = Date.now();
        this.trackEvent('tab_hidden', 'engagement', {
          time_visible: Date.now() - visibleTime,
        });
      } else {
        visibleTime = Date.now();
        this.trackEvent('tab_visible', 'engagement', {
          time_hidden: Date.now() - hiddenTime,
        });
      }
    });
  }

  // ============================================================================
  // Error Tracking
  // ============================================================================

  private setupErrorTracking(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (e) => {
      this.trackEvent('javascript_error', 'error', {
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        column: e.colno,
        stack: e.error?.stack?.substring(0, 1000),
      });
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.trackEvent('promise_rejection', 'error', {
        reason: String(e.reason).substring(0, 500),
      });
    });
  }

  // ============================================================================
  // Performance Tracking
  // ============================================================================

  private setupPerformanceTracking(): void {
    if (typeof window === 'undefined') return;

    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (!navEntry) return;

        this.trackEvent('page_performance', 'performance', {
          dom_content_loaded: Math.round(navEntry.domContentLoadedEventEnd - navEntry.startTime),
          load_complete: Math.round(navEntry.loadEventEnd - navEntry.startTime),
          dom_interactive: Math.round(navEntry.domInteractive),
          first_paint: Math.round(performance.getEntriesByName('first-paint')[0]?.startTime || 0),
          first_contentful_paint: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0),
          ttfb: Math.round(navEntry.responseStart - navEntry.requestStart),
        });
      }, 0);
    });

    // Track Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.trackEvent('web_vital_lcp', 'performance', {
            value: Math.round(lastEntry.startTime),
            rating: lastEntry.startTime <= 2500 ? 'good' : lastEntry.startTime <= 4000 ? 'needs_improvement' : 'poor',
          });
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fidEntry = entry as PerformanceEventTiming;
            const fid = fidEntry.processingStart - fidEntry.startTime;
            this.trackEvent('web_vital_fid', 'performance', {
              value: Math.round(fid),
              rating: fid <= 100 ? 'good' : fid <= 300 ? 'needs_improvement' : 'poor',
            });
          });
        }).observe({ type: 'first-input', buffered: true });

        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const layoutEntry = entry as LayoutShift;
            if (!layoutEntry.hadRecentInput) {
              clsValue += layoutEntry.value;
            }
          });
          this.trackEvent('web_vital_cls', 'performance', {
            value: clsValue,
            rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs_improvement' : 'poor',
          });
        }).observe({ type: 'layout-shift', buffered: true });
      } catch {
        // PerformanceObserver may not be supported
      }
    }
  }

  // ============================================================================
  // Exit Tracking
  // ============================================================================

  private setupExitTracking(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - this.sessionStartTime;

      // Use sendBeacon for reliable exit tracking
      const exitData = {
        events: [{
          event_name: 'session_end',
          event_category: 'engagement',
          properties: {
            session_duration: sessionDuration,
            page_views: this.pageViews,
            events_count: this.eventsCount,
            max_scroll_depth: this.maxScrollDepth,
            is_bounce: this.pageViews === 1,
            exit_page: window.location.pathname,
            entry_page: this.entryPage,
          },
          session_id: this.sessionId,
          user_id: this.userId,
          timestamp: new Date().toISOString(),
        }],
      };

      navigator.sendBeacon('/api/analytics/track', JSON.stringify(exitData));
    });
  }

  // ============================================================================
  // Event Queue & Flushing
  // ============================================================================

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend }),
      });

      if (!response.ok) {
        // Re-queue events on failure
        this.eventQueue.unshift(...eventsToSend);
        console.error('[Analytics] Failed to send events, re-queued');
      }
    } catch (error) {
      // Re-queue events on network error
      this.eventQueue.unshift(...eventsToSend);
      console.error('[Analytics] Network error, events re-queued:', error);
    }
  }

  private updateSession(): void {
    this.trackEvent('session_heartbeat', 'engagement', {
      session_duration: Date.now() - this.sessionStartTime,
      page_views: this.pageViews,
      events_count: this.eventsCount,
      max_scroll_depth: this.maxScrollDepth,
    });
  }

  // ============================================================================
  // Public Tracking Methods
  // ============================================================================

  trackDocumentView(documentId: string, documentName: string, category?: string): void {
    this.trackEvent('document_view', 'engagement', {
      document_id: documentId,
      document_name: documentName,
      document_category: category,
    });
  }

  trackAddToCart(productId: string, productName: string, price: number, quantity: number = 1): void {
    this.trackEvent('add_to_cart', 'conversion', {
      product_id: productId,
      product_name: productName,
      price,
      quantity,
      cart_value: price * quantity,
    });
  }

  trackCheckoutStart(cartValue: number, itemCount: number): void {
    this.trackEvent('checkout_start', 'conversion', {
      cart_value: cartValue,
      item_count: itemCount,
    });
  }

  trackPurchase(orderId: string, total: number, items: { id: string; name: string; price: number; quantity: number }[]): void {
    this.trackEvent('purchase_complete', 'conversion', {
      order_id: orderId,
      total,
      items,
      item_count: items.length,
    });
  }

  trackConsultationBooked(consultationType: string, dateTime: string): void {
    this.trackEvent('consultation_booked', 'conversion', {
      consultation_type: consultationType,
      scheduled_datetime: dateTime,
    });
  }

  trackSearch(query: string, resultsCount: number): void {
    this.trackEvent('search', 'engagement', {
      search_query: query,
      results_count: resultsCount,
    });
  }

  trackNewsletterSignup(email: string, source: string): void {
    this.trackEvent('newsletter_signup', 'conversion', {
      email_domain: email.split('@')[1],
      signup_source: source,
    });
  }

  trackXPEarned(amount: number, source: string, multiplier: number = 1): void {
    this.trackEvent('xp_earned', 'engagement', {
      xp_amount: amount,
      xp_source: source,
      multiplier,
    });
  }

  trackExitIntent(shown: boolean, action?: 'dismissed' | 'converted' | 'closed', offerType?: string): void {
    this.trackEvent('exit_intent', 'engagement', {
      popup_shown: shown,
      action,
      offer_type: offerType,
    });
  }

  // ============================================================================
  // Getters
  // ============================================================================

  getSessionId(): string {
    return this.sessionId;
  }

  getUserId(): string | null {
    return this.userId;
  }

  getSessionData(): SessionData {
    return {
      session_id: this.sessionId,
      user_id: this.userId || undefined,
      start_time: this.sessionStartTime,
      page_views: this.pageViews,
      events_count: this.eventsCount,
      total_time: Date.now() - this.sessionStartTime,
      max_scroll_depth: this.maxScrollDepth,
      is_bounce: this.pageViews === 1,
      entry_page: this.entryPage,
      exit_page: typeof window !== 'undefined' ? window.location.pathname : '',
      ...this.utmParams,
    };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const analytics = new ComprehensiveAnalytics();
export default analytics;

// ============================================================================
// Type Augmentations
// ============================================================================

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}
