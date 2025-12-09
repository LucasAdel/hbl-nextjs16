"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, RefreshCw, Bell, BellOff } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function ServiceWorkerRegistration() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Register service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        setRegistration(reg);
        console.log("Service Worker registered:", reg.scope);

        // Check for updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      // Show install prompt after delay if not dismissed before
      const dismissed = localStorage.getItem("hbl-pwa-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowInstallPrompt(true), 5000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstallable(false);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("PWA installed");
    } else {
      console.log("PWA installation declined");
      localStorage.setItem("hbl-pwa-dismissed", "true");
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem("hbl-pwa-dismissed", "true");
  };

  const handleUpdate = () => {
    if (!registration || !registration.waiting) return;

    setIsUpdating(true);
    registration.waiting.postMessage({ type: "SKIP_WAITING" });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  };

  return (
    <>
      {/* Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && isInstallable && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Download className="h-6 w-6 text-tiffany" />
                </div>
                <div className="flex-1">
                  <h3 className="font-blair text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Install Our App
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Add Hamilton Bailey Law to your home screen for quick access to legal services.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleInstall}
                      className="px-4 py-2 bg-tiffany text-white rounded-lg font-medium text-sm hover:bg-tiffany-dark transition-colors"
                    >
                      Install App
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Not Now
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Available Banner */}
      <AnimatePresence>
        {updateAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-50"
          >
            <div className="bg-tiffany text-white rounded-xl shadow-lg px-6 py-3 flex items-center gap-4">
              <RefreshCw className={`h-5 w-5 ${isUpdating ? "animate-spin" : ""}`} />
              <span className="text-sm font-medium">
                A new version is available!
              </span>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="px-4 py-1.5 bg-white text-tiffany-dark rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Update Now"}
              </button>
              <button
                onClick={() => setUpdateAvailable(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Hook to request notification permission
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return false;

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission !== "granted") return;

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      });
    } else {
      new Notification(title, options);
    }
  };

  return { permission, isSupported, requestPermission, showNotification };
}

// Notification permission button component
export function NotificationPermissionButton({ className = "" }: { className?: string }) {
  const { permission, isSupported, requestPermission } = useNotifications();
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isSupported) return null;

  const handleRequest = async () => {
    setIsRequesting(true);
    await requestPermission();
    setIsRequesting(false);
  };

  if (permission === "granted") {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-600 ${className}`}>
        <Bell className="h-4 w-4" />
        Notifications enabled
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
        <BellOff className="h-4 w-4" />
        Notifications blocked
      </div>
    );
  }

  return (
    <button
      onClick={handleRequest}
      disabled={isRequesting}
      className={`flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 ${className}`}
    >
      <Bell className="h-4 w-4" />
      {isRequesting ? "Requesting..." : "Enable Notifications"}
    </button>
  );
}
