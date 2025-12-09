"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  WifiOff,
  Wifi,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getOfflineState,
  syncOfflineActions,
  initOfflineMonitoring,
  type OfflineState,
} from "@/lib/offline/offline-xp";
import confetti from "canvas-confetti";

export function OfflineXPIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineState, setOfflineState] = useState<OfflineState>({
    pendingXP: 0,
    actions: [],
    lastSyncAttempt: null,
    streakProtected: false,
    offlineSince: null,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [syncedXP, setSyncedXP] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Initialize state
    setIsOnline(navigator.onLine);
    setOfflineState(getOfflineState());

    // Initialize offline monitoring
    const cleanup = initOfflineMonitoring();

    // Listen for online/offline changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleSynced = (e: CustomEvent) => {
      setOfflineState(getOfflineState());
      setSyncedXP(e.detail.totalXP);
      setShowSyncSuccess(true);

      // Celebration confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#10B981", "#34D399", "#6EE7B7"],
      });

      setTimeout(() => setShowSyncSuccess(false), 3000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("offline-xp-synced", handleSynced as EventListener);

    // Periodic refresh of state
    const refreshInterval = setInterval(() => {
      setOfflineState(getOfflineState());
    }, 5000);

    return () => {
      cleanup();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offline-xp-synced", handleSynced as EventListener);
      clearInterval(refreshInterval);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncOfflineActions();
      setOfflineState(getOfflineState());

      if (result.syncedCount > 0) {
        setSyncedXP(result.totalXP);
        setShowSyncSuccess(true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
        setTimeout(() => setShowSyncSuccess(false), 3000);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Don't show if online and no pending XP
  if (isOnline && offlineState.pendingXP === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-20 left-4 z-40"
      >
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg ${
            isOnline
              ? "bg-amber-500 text-white"
              : "bg-red-500 text-white animate-pulse"
          }`}
        >
          {isOnline ? (
            <Clock className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span className="font-medium">
            {offlineState.pendingXP} XP pending
          </span>
        </motion.button>
      </motion.div>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-32 left-4 z-40 w-80 bg-white rounded-xl shadow-xl border overflow-hidden"
          >
            {/* Header */}
            <div
              className={`p-4 ${
                isOnline ? "bg-amber-50" : "bg-red-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <Wifi className="w-5 h-5 text-green-600" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-semibold">
                    {isOnline ? "Online" : "Offline Mode"}
                  </span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              {!isOnline && (
                <p className="text-sm text-gray-600 mt-2">
                  Your XP is being saved locally. It will sync when you&apos;re back online.
                </p>
              )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Pending XP */}
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-medium">Pending XP</span>
                </div>
                <span className="text-lg font-bold text-amber-600">
                  +{offlineState.pendingXP}
                </span>
              </div>

              {/* Pending Actions */}
              {offlineState.actions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Pending Actions ({offlineState.actions.filter((a) => !a.synced).length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {offlineState.actions
                      .filter((a) => !a.synced)
                      .slice(0, 5)
                      .map((action) => (
                        <div
                          key={action.id}
                          className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                        >
                          <span className="text-gray-600">{action.action}</span>
                          <span className="font-medium text-amber-600">
                            +{action.xpAmount} XP
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Streak Protection Status */}
              {offlineState.offlineSince && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    offlineState.streakProtected
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {offlineState.streakProtected ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span className="text-sm">
                    {offlineState.streakProtected
                      ? "Streak protected"
                      : "Streak will be protected on sync"}
                  </span>
                </div>
              )}

              {/* Sync Button */}
              {isOnline && offlineState.pendingXP > 0 && (
                <Button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="w-full bg-amber-500 hover:bg-amber-600"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Now
                    </>
                  )}
                </Button>
              )}

              {/* Last Sync */}
              {offlineState.lastSyncAttempt && (
                <p className="text-xs text-gray-400 text-center">
                  Last sync: {new Date(offlineState.lastSyncAttempt).toLocaleTimeString()}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync Success Toast */}
      <AnimatePresence>
        {showSyncSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-4 left-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              Synced! +{syncedXP} XP added to your account
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
