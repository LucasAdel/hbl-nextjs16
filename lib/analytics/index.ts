/**
 * Analytics Module
 *
 * Self-hosted, first-party analytics system.
 * Full GDPR compliance without third-party data sharing.
 *
 * Benefits:
 * - No external costs as traffic grows
 * - Complete data ownership in Supabase
 * - No cookie consent banners required (first-party analytics)
 * - Simpler privacy policy
 */

// Analytics provider component (self-hosted, replaces PostHog)
export { AnalyticsProvider, useAnalytics } from '@/components/analytics/AnalyticsProvider'

// Custom analytics event tracking system
export {
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
  usePageTracking,
} from './events'

export type { EventCategory, EventName, AnalyticsEvent } from './events'
