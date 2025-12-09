/**
 * Offline XP Banking - BMAD Phase 3
 *
 * Maintains engagement during disconnection by:
 * - Queueing XP-earning actions in localStorage
 * - Syncing when connection restored
 * - Showing pending XP indicator
 * - Protecting streaks during offline periods
 */

export interface OfflineXPAction {
  id: string;
  action: string;
  xpAmount: number;
  metadata: Record<string, unknown>;
  timestamp: string;
  synced: boolean;
}

export interface OfflineState {
  pendingXP: number;
  actions: OfflineXPAction[];
  lastSyncAttempt: string | null;
  streakProtected: boolean;
  offlineSince: string | null;
}

const STORAGE_KEY = "hbl_offline_xp";
const MAX_OFFLINE_ACTIONS = 100;
const SYNC_RETRY_INTERVAL = 30000; // 30 seconds

/**
 * Get current offline state from localStorage
 */
export function getOfflineState(): OfflineState {
  if (typeof window === "undefined") {
    return {
      pendingXP: 0,
      actions: [],
      lastSyncAttempt: null,
      streakProtected: false,
      offlineSince: null,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading offline state:", error);
  }

  return {
    pendingXP: 0,
    actions: [],
    lastSyncAttempt: null,
    streakProtected: false,
    offlineSince: null,
  };
}

/**
 * Save offline state to localStorage
 */
export function saveOfflineState(state: OfflineState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving offline state:", error);
  }
}

/**
 * Queue an XP action for later sync
 */
export function queueOfflineXPAction(
  action: string,
  xpAmount: number,
  metadata: Record<string, unknown> = {}
): OfflineXPAction {
  const state = getOfflineState();

  const offlineAction: OfflineXPAction = {
    id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    action,
    xpAmount,
    metadata,
    timestamp: new Date().toISOString(),
    synced: false,
  };

  // Add to queue, limiting size
  state.actions = [offlineAction, ...state.actions].slice(0, MAX_OFFLINE_ACTIONS);
  state.pendingXP = state.actions
    .filter((a) => !a.synced)
    .reduce((sum, a) => sum + a.xpAmount, 0);

  // Track when offline started
  if (!state.offlineSince && !navigator.onLine) {
    state.offlineSince = new Date().toISOString();
  }

  saveOfflineState(state);
  return offlineAction;
}

/**
 * Attempt to sync all pending offline actions
 */
export async function syncOfflineActions(): Promise<{
  success: boolean;
  syncedCount: number;
  totalXP: number;
  errors: string[];
}> {
  const state = getOfflineState();
  const pendingActions = state.actions.filter((a) => !a.synced);

  if (pendingActions.length === 0) {
    return { success: true, syncedCount: 0, totalXP: 0, errors: [] };
  }

  const errors: string[] = [];
  let syncedCount = 0;
  let totalXP = 0;

  for (const action of pendingActions) {
    try {
      const response = await fetch("/api/xp/earn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action.action,
          metadata: {
            ...action.metadata,
            offlineAction: true,
            originalTimestamp: action.timestamp,
          },
        }),
      });

      if (response.ok) {
        // Mark as synced
        const actionIndex = state.actions.findIndex((a) => a.id === action.id);
        if (actionIndex !== -1) {
          state.actions[actionIndex].synced = true;
        }
        syncedCount++;
        totalXP += action.xpAmount;
      } else {
        errors.push(`Failed to sync ${action.action}: ${response.statusText}`);
      }
    } catch (error) {
      errors.push(`Error syncing ${action.action}: ${(error as Error).message}`);
    }
  }

  // Update state
  state.pendingXP = state.actions
    .filter((a) => !a.synced)
    .reduce((sum, a) => sum + a.xpAmount, 0);
  state.lastSyncAttempt = new Date().toISOString();

  if (syncedCount === pendingActions.length) {
    state.offlineSince = null;
  }

  saveOfflineState(state);

  return {
    success: errors.length === 0,
    syncedCount,
    totalXP,
    errors,
  };
}

/**
 * Protect streak during offline period
 */
export async function requestStreakProtection(): Promise<{
  success: boolean;
  message: string;
}> {
  const state = getOfflineState();

  if (state.streakProtected) {
    return { success: true, message: "Streak already protected for this offline period" };
  }

  // Calculate offline duration
  if (!state.offlineSince) {
    return { success: false, message: "Not currently offline" };
  }

  const offlineDuration = Date.now() - new Date(state.offlineSince).getTime();
  const hoursOffline = offlineDuration / (1000 * 60 * 60);

  // Allow protection if offline for less than 48 hours
  if (hoursOffline > 48) {
    return {
      success: false,
      message: "Offline too long for automatic streak protection",
    };
  }

  try {
    const response = await fetch("/api/gamification/streak/freeze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: "offline_protection",
        offlineSince: state.offlineSince,
        offlineDuration: Math.round(hoursOffline),
      }),
    });

    if (response.ok) {
      state.streakProtected = true;
      saveOfflineState(state);
      return { success: true, message: "Streak protected during offline period!" };
    }

    return { success: false, message: "Failed to protect streak" };
  } catch (error) {
    return { success: false, message: "Network error protecting streak" };
  }
}

/**
 * Clear synced actions from storage (keep only pending)
 */
export function cleanupSyncedActions(): void {
  const state = getOfflineState();
  state.actions = state.actions.filter((a) => !a.synced);
  saveOfflineState(state);
}

/**
 * XP actions that can be tracked offline
 */
export const OFFLINE_TRACKABLE_ACTIONS = [
  { action: "page_view", xp: 5, description: "Viewed a page" },
  { action: "product_view", xp: 10, description: "Viewed a product" },
  { action: "resource_download", xp: 25, description: "Downloaded a resource" },
  { action: "video_watch", xp: 50, description: "Watched a video" },
  { action: "article_read", xp: 30, description: "Read an article" },
  { action: "checklist_complete", xp: 20, description: "Completed a checklist" },
] as const;

export type OfflineTrackableAction = typeof OFFLINE_TRACKABLE_ACTIONS[number]["action"];

/**
 * Track an action (works both online and offline)
 */
export async function trackAction(
  action: OfflineTrackableAction,
  metadata: Record<string, unknown> = {}
): Promise<{ queued: boolean; xp: number }> {
  const actionDef = OFFLINE_TRACKABLE_ACTIONS.find((a) => a.action === action);
  if (!actionDef) {
    return { queued: false, xp: 0 };
  }

  // If online, try to sync immediately
  if (navigator.onLine) {
    try {
      const response = await fetch("/api/xp/earn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, metadata }),
      });

      if (response.ok) {
        return { queued: false, xp: actionDef.xp };
      }
    } catch (error) {
      // Fall through to queue
    }
  }

  // Queue for later
  queueOfflineXPAction(action, actionDef.xp, metadata);
  return { queued: true, xp: actionDef.xp };
}

/**
 * Initialize offline monitoring
 */
export function initOfflineMonitoring(): () => void {
  if (typeof window === "undefined") return () => {};

  let syncInterval: NodeJS.Timeout | null = null;

  const handleOnline = async () => {
    // Sync pending actions when coming back online
    const result = await syncOfflineActions();

    if (result.syncedCount > 0) {
      // Dispatch event for UI updates
      window.dispatchEvent(
        new CustomEvent("offline-xp-synced", {
          detail: {
            syncedCount: result.syncedCount,
            totalXP: result.totalXP,
          },
        })
      );
    }

    // Request streak protection if needed
    const state = getOfflineState();
    if (state.offlineSince && !state.streakProtected) {
      await requestStreakProtection();
    }
  };

  const handleOffline = () => {
    const state = getOfflineState();
    if (!state.offlineSince) {
      state.offlineSince = new Date().toISOString();
      saveOfflineState(state);
    }

    // Dispatch event for UI
    window.dispatchEvent(new CustomEvent("offline-mode-entered"));
  };

  // Set up listeners
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Periodic sync attempt when online
  syncInterval = setInterval(() => {
    if (navigator.onLine) {
      const state = getOfflineState();
      if (state.pendingXP > 0) {
        syncOfflineActions();
      }
    }
  }, SYNC_RETRY_INTERVAL);

  // Initial check
  if (navigator.onLine && getOfflineState().pendingXP > 0) {
    syncOfflineActions();
  }

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
    if (syncInterval) {
      clearInterval(syncInterval);
    }
  };
}
