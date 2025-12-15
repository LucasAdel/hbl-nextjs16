"use client";

import { useState, useEffect } from "react";
import { X, Cookie, Settings, Shield, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const COOKIE_CONSENT_KEY = "hbl-cookie-consent";
const COOKIE_PREFERENCES_KEY = "hbl-cookie-preferences";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    }
  }, []);

  // Auto-dismiss after 5 seconds of inactivity
  useEffect(() => {
    if (!showBanner) return;

    const autoDismissTimer = setTimeout(() => {
      // Auto-accept necessary only after 5 seconds
      handleAcceptNecessary();
    }, 5000);

    return () => clearTimeout(autoDismissTimer);
  }, [showBanner]);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsent(allAccepted);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveConsent(necessaryOnly);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);

    // Dispatch event for analytics to listen to
    window.dispatchEvent(
      new CustomEvent("cookieConsentUpdated", { detail: prefs })
    );
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Compact Main Banner */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Cookie className="h-5 w-5 text-tiffany flex-shrink-0" />
              <p className="text-sm text-gray-600 flex-1">
                We use first-party cookies to improve your experience. No data is shared with third parties.{" "}
                <Link href="/privacy-policy" className="text-tiffany hover:underline">
                  Privacy Policy
                </Link>
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleAcceptAll}
                  className="px-3 py-1.5 bg-tiffany text-white rounded-md text-sm font-medium hover:bg-tiffany-dark transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={handleAcceptNecessary}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Customise preferences"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={handleAcceptNecessary}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Compact Preferences Panel */}
          {showPreferences && (
            <div className="border-t bg-gray-50 px-4 py-3">
              <div className="space-y-2">
                {/* Necessary Cookies */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Essential</span>
                    <span className="text-xs text-gray-500">(Required)</span>
                  </div>
                  <div className="w-9 h-5 bg-tiffany rounded-full cursor-not-allowed">
                    <div className="w-4 h-4 bg-white rounded-full shadow transform translate-x-4 translate-y-0.5" />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Analytics</span>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                    className="relative inline-flex items-center"
                  >
                    <div className={`w-9 h-5 rounded-full transition-colors ${preferences.analytics ? 'bg-tiffany' : 'bg-gray-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform translate-y-0.5 ${preferences.analytics ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Marketing</span>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                    className="relative inline-flex items-center"
                  >
                    <div className={`w-9 h-5 rounded-full transition-colors ${preferences.marketing ? 'bg-tiffany' : 'bg-gray-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform translate-y-0.5 ${preferences.marketing ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSavePreferences}
                    className="px-4 py-1.5 bg-tiffany text-white rounded-md text-sm font-medium hover:bg-tiffany-dark transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook to check cookie preferences
export function useCookiePreferences(): CookiePreferences | null {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }

    const handleUpdate = (e: CustomEvent<CookiePreferences>) => {
      setPreferences(e.detail);
    };

    window.addEventListener("cookieConsentUpdated", handleUpdate as EventListener);
    return () => window.removeEventListener("cookieConsentUpdated", handleUpdate as EventListener);
  }, []);

  return preferences;
}
