/**
 * Heatmap Tracking Module
 *
 * Provides configurable click tracking for specific pages to generate heatmap data.
 * Only tracks clicks on pages that have been enabled in the admin config.
 */

import { trackClick, trackScroll } from './events';

// ============================================================================
// TYPES
// ============================================================================

export interface HeatmapConfig {
  enabledPages: string[];
  trackScrollDepth?: boolean;
  debounceMs?: number;
}

// ============================================================================
// STATE
// ============================================================================

let isInitialized = false;
let config: HeatmapConfig = {
  enabledPages: [],
  trackScrollDepth: true,
  debounceMs: 100,
};

// Scroll tracking state
let maxScrollDepth = 0;
let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
const scrollMilestones = [25, 50, 75, 90, 100];
const trackedMilestones = new Set<number>();

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Check if the current page matches any enabled pattern
 */
function isPageEnabled(pathname: string): boolean {
  return config.enabledPages.some((pattern) => {
    // Support wildcard patterns like /services/*
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return pathname.startsWith(prefix);
    }
    // Exact match or with trailing slash
    return pathname === pattern || pathname === `${pattern}/`;
  });
}

/**
 * Debounce function for scroll tracking
 */
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle click events
 */
function handleClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target) return;

  // Skip clicks on non-interactive elements that are likely not intentional
  const tagName = target.tagName.toLowerCase();
  const isInteractive = ['a', 'button', 'input', 'select', 'textarea', 'label'].includes(tagName);
  const hasClickHandler = target.onclick !== null || target.closest('[onclick]');
  const isInLink = target.closest('a');
  const isInButton = target.closest('button');

  // Track all clicks, but mark interactive ones
  trackClick(target, event, {
    is_interactive: isInteractive || hasClickHandler || isInLink || isInButton,
  });
}

/**
 * Handle scroll events
 */
function handleScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  if (docHeight <= 0) return;

  const scrollPercent = Math.round((scrollTop / docHeight) * 100);
  maxScrollDepth = Math.max(maxScrollDepth, scrollPercent);

  // Track milestone depths
  for (const milestone of scrollMilestones) {
    if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
      trackedMilestones.add(milestone);
      trackScroll(milestone, maxScrollDepth);
    }
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize heatmap tracking for the current page
 */
export function initHeatmapTracking(options: HeatmapConfig) {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;

  config = { ...config, ...options };

  const currentPath = window.location.pathname;

  // Only initialize if current page is enabled
  if (!isPageEnabled(currentPath)) {
    return;
  }

  isInitialized = true;

  // Add click listener
  document.addEventListener('click', handleClick, { passive: true, capture: true });

  // Add scroll listener if enabled
  if (config.trackScrollDepth) {
    const debouncedScroll = debounce(handleScroll, config.debounceMs || 100);
    window.addEventListener('scroll', debouncedScroll, { passive: true });
  }

  // Track final scroll depth on page unload
  window.addEventListener('beforeunload', () => {
    if (maxScrollDepth > 0 && !trackedMilestones.has(100)) {
      trackScroll(maxScrollDepth, maxScrollDepth);
    }
  });
}

/**
 * Update enabled pages (for dynamic config updates)
 */
export function updateHeatmapConfig(newConfig: Partial<HeatmapConfig>) {
  config = { ...config, ...newConfig };

  // Re-check if current page should now be tracked
  const currentPath = window.location.pathname;
  const shouldTrack = isPageEnabled(currentPath);

  if (shouldTrack && !isInitialized) {
    isInitialized = false; // Reset to allow re-initialization
    initHeatmapTracking(config);
  }
}

/**
 * Clean up tracking (for SPA route changes)
 */
export function cleanupHeatmapTracking() {
  if (!isInitialized) return;

  document.removeEventListener('click', handleClick, { capture: true });
  isInitialized = false;
  maxScrollDepth = 0;
  trackedMilestones.clear();
}

/**
 * Reinitialize tracking for a new page (SPA navigation)
 */
export function reinitializeForPage(pathname: string) {
  cleanupHeatmapTracking();

  if (isPageEnabled(pathname)) {
    isInitialized = false;
    initHeatmapTracking(config);
  }
}

// ============================================================================
// DEFAULT CONFIG LOADER
// ============================================================================

/**
 * Fetch heatmap config from the API
 */
export async function loadHeatmapConfig(): Promise<string[]> {
  try {
    const response = await fetch('/api/admin/analytics/heatmap/config');
    if (!response.ok) {
      console.warn('Failed to load heatmap config, using defaults');
      return getDefaultEnabledPages();
    }

    const data = await response.json();
    return data.enabledPages || getDefaultEnabledPages();
  } catch {
    console.warn('Error loading heatmap config, using defaults');
    return getDefaultEnabledPages();
  }
}

/**
 * Get default enabled pages (high-value pages)
 */
function getDefaultEnabledPages(): string[] {
  return [
    '/',
    '/services',
    '/contact',
    '/book-appointment',
    '/about',
    '/codex',
  ];
}

export default {
  initHeatmapTracking,
  updateHeatmapConfig,
  cleanupHeatmapTracking,
  reinitializeForPage,
  loadHeatmapConfig,
};
