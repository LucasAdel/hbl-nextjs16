/**
 * Session Timeout Management
 *
 * Implements idle session timeout for security.
 * Sessions expire after 4 hours of inactivity.
 */

const SESSION_TIMEOUT_MS = 4 * 60 * 60 * 1000; // 4 hours
const ACTIVITY_KEY = "last_activity_timestamp";
const WARNING_BEFORE_MS = 5 * 60 * 1000; // Show warning 5 minutes before timeout

/**
 * Update the last activity timestamp
 */
export function updateActivity(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
}

/**
 * Get time since last activity in milliseconds
 */
export function getIdleTime(): number {
  if (typeof window === "undefined") return 0;
  const lastActivity = localStorage.getItem(ACTIVITY_KEY);
  if (!lastActivity) {
    updateActivity();
    return 0;
  }
  return Date.now() - parseInt(lastActivity, 10);
}

/**
 * Check if session has timed out due to inactivity
 */
export function isSessionTimedOut(): boolean {
  return getIdleTime() > SESSION_TIMEOUT_MS;
}

/**
 * Check if session is about to timeout (within warning period)
 */
export function isSessionAboutToTimeout(): boolean {
  const idleTime = getIdleTime();
  return idleTime > SESSION_TIMEOUT_MS - WARNING_BEFORE_MS && idleTime < SESSION_TIMEOUT_MS;
}

/**
 * Get remaining session time in milliseconds
 */
export function getRemainingSessionTime(): number {
  const remaining = SESSION_TIMEOUT_MS - getIdleTime();
  return Math.max(0, remaining);
}

/**
 * Clear activity tracking (on logout)
 */
export function clearActivity(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACTIVITY_KEY);
}

/**
 * Initialize activity tracking with event listeners
 * Call this once when the app loads
 */
export function initActivityTracking(): () => void {
  if (typeof window === "undefined") return () => {};

  const events = ["mousedown", "keydown", "scroll", "touchstart"];

  // Throttle updates to once per minute
  let lastUpdate = 0;
  const throttledUpdate = () => {
    const now = Date.now();
    if (now - lastUpdate > 60000) {
      lastUpdate = now;
      updateActivity();
    }
  };

  events.forEach((event) => {
    window.addEventListener(event, throttledUpdate, { passive: true });
  });

  // Initial activity
  updateActivity();

  // Return cleanup function
  return () => {
    events.forEach((event) => {
      window.removeEventListener(event, throttledUpdate);
    });
  };
}

/**
 * Session timeout checker that can trigger logout
 */
export function createSessionTimeoutChecker(
  onTimeout: () => void,
  onWarning?: () => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const checkInterval = setInterval(() => {
    if (isSessionTimedOut()) {
      clearInterval(checkInterval);
      clearActivity();
      onTimeout();
    } else if (onWarning && isSessionAboutToTimeout()) {
      onWarning();
    }
  }, 30000); // Check every 30 seconds

  return () => clearInterval(checkInterval);
}
