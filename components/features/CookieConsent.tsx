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
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Main Banner */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Cookie className="h-6 w-6 text-tiffany" />
              </div>
              <div className="flex-1">
                <h3 className="font-blair text-lg font-bold text-gray-900 mb-2">
                  We Value Your Privacy
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  We use cookies to enhance your browsing experience, serve personalized content,
                  and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                  Read our{" "}
                  <Link href="/privacy-policy" className="text-tiffany hover:underline">
                    Privacy Policy
                  </Link>{" "}
                  for more information.
                </p>

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2.5 bg-tiffany text-white rounded-lg font-medium hover:bg-tiffany-dark transition-colors"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleAcceptNecessary}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Necessary Only
                  </button>
                  <button
                    onClick={() => setShowPreferences(!showPreferences)}
                    className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Customize
                    {showPreferences ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={handleAcceptNecessary}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Preferences Panel */}
          {showPreferences && (
            <div className="border-t bg-gray-50 p-6">
              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between p-4 bg-white rounded-xl border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Necessary Cookies</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Essential for the website to function properly. These cannot be disabled.
                      </p>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="sr-only"
                    />
                    <div className="w-11 h-6 bg-tiffany rounded-full cursor-not-allowed">
                      <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-5 translate-y-0.5" />
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 bg-white rounded-xl border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Help us understand how visitors interact with our website.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                    className="relative inline-flex items-center"
                  >
                    <div className={`w-11 h-6 rounded-full transition-colors ${preferences.analytics ? 'bg-tiffany' : 'bg-gray-300'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-y-0.5 ${preferences.analytics ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-4 bg-white rounded-xl border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Marketing Cookies</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Used to deliver relevant advertisements and track campaign effectiveness.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                    className="relative inline-flex items-center"
                  >
                    <div className={`w-11 h-6 rounded-full transition-colors ${preferences.marketing ? 'bg-tiffany' : 'bg-gray-300'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-y-0.5 ${preferences.marketing ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                </div>

                {/* Preference Cookies */}
                <div className="flex items-start justify-between p-4 bg-white rounded-xl border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Preference Cookies</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Remember your settings and preferences for a better experience.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, preferences: !preferences.preferences })}
                    className="relative inline-flex items-center"
                  >
                    <div className={`w-11 h-6 rounded-full transition-colors ${preferences.preferences ? 'bg-tiffany' : 'bg-gray-300'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-y-0.5 ${preferences.preferences ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSavePreferences}
                    className="px-6 py-2.5 bg-tiffany text-white rounded-lg font-medium hover:bg-tiffany-dark transition-colors"
                  >
                    Save Preferences
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
