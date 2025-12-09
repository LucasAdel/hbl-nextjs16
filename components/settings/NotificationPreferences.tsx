"use client";

import { useState, useEffect } from "react";
import {
  Bell, Mail, MessageSquare, Smartphone, Volume2, VolumeX,
  Zap, Trophy, Gift, Calendar, FileText, AlertCircle,
  ChevronDown, Check, Save, Loader2, Shield, Clock
} from "lucide-react";
import { toast } from "sonner";

interface NotificationPreferencesProps {
  email: string | null;
  className?: string;
}

interface NotificationSettings {
  // Email notifications
  email: {
    newsletter: boolean;
    promotions: boolean;
    productUpdates: boolean;
    orderConfirmations: boolean;
    documentExpiry: boolean;
    weeklyDigest: boolean;
  };
  // Push notifications
  push: {
    enabled: boolean;
    achievements: boolean;
    streakReminders: boolean;
    challenges: boolean;
    leaderboardUpdates: boolean;
    newContent: boolean;
  };
  // Gamification
  gamification: {
    xpNotifications: boolean;
    levelUpCelebrations: boolean;
    achievementPopups: boolean;
    leaderboardAlerts: boolean;
    streakAtRisk: boolean;
    dailyChallengeReminders: boolean;
  };
  // Timing
  timing: {
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    timezone: string;
  };
}

const defaultSettings: NotificationSettings = {
  email: {
    newsletter: true,
    promotions: true,
    productUpdates: true,
    orderConfirmations: true,
    documentExpiry: true,
    weeklyDigest: false,
  },
  push: {
    enabled: true,
    achievements: true,
    streakReminders: true,
    challenges: true,
    leaderboardUpdates: false,
    newContent: true,
  },
  gamification: {
    xpNotifications: true,
    levelUpCelebrations: true,
    achievementPopups: true,
    leaderboardAlerts: true,
    streakAtRisk: true,
    dailyChallengeReminders: true,
  },
  timing: {
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
    timezone: "Australia/Brisbane",
  },
};

export function NotificationPreferences({ email, className = "" }: NotificationPreferencesProps) {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["email", "gamification"]);

  useEffect(() => {
    const loadSettings = async () => {
      // Simulate API fetch
      await new Promise((r) => setTimeout(r, 500));

      // Load from localStorage or API
      const saved = localStorage.getItem("notification_preferences");
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch {
          // Use defaults
        }
      }
      setLoading(false);
    };

    loadSettings();
  }, [email]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const updateSetting = <K extends keyof NotificationSettings>(
    category: K,
    key: keyof NotificationSettings[K],
    value: NotificationSettings[K][keyof NotificationSettings[K]]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Save to localStorage
      localStorage.setItem("notification_preferences", JSON.stringify(settings));

      // Save to API
      await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          preferences: settings,
        }),
      }).catch(() => {});

      toast.success("Preferences saved successfully!");
      setHasChanges(false);
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const requestPushPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Push notifications are not supported in this browser");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      updateSetting("push", "enabled", true);
      toast.success("Push notifications enabled!");
    } else {
      toast.error("Push notification permission denied");
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-tiffany to-tiffany-dark p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Notification Preferences</h3>
              <p className="text-sm opacity-80">Control how and when we contact you</p>
            </div>
          </div>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-white text-tiffany-dark font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Email Notifications */}
        <div>
          <button
            onClick={() => toggleSection("email")}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 dark:text-white">Email Notifications</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Newsletters, updates & promotions</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.includes("email") ? "rotate-180" : ""}`} />
          </button>

          {expandedSections.includes("email") && (
            <div className="px-4 pb-4 space-y-3">
              <ToggleRow
                label="Weekly Newsletter"
                description="Industry insights and legal updates"
                checked={settings.email.newsletter}
                onChange={(v) => updateSetting("email", "newsletter", v)}
              />
              <ToggleRow
                label="Promotional Emails"
                description="Special offers and discounts"
                checked={settings.email.promotions}
                onChange={(v) => updateSetting("email", "promotions", v)}
              />
              <ToggleRow
                label="Product Updates"
                description="New templates and features"
                checked={settings.email.productUpdates}
                onChange={(v) => updateSetting("email", "productUpdates", v)}
              />
              <ToggleRow
                label="Order Confirmations"
                description="Purchase receipts and downloads"
                checked={settings.email.orderConfirmations}
                onChange={(v) => updateSetting("email", "orderConfirmations", v)}
                required
              />
              <ToggleRow
                label="Document Expiry Alerts"
                description="Reminders when documents need updating"
                checked={settings.email.documentExpiry}
                onChange={(v) => updateSetting("email", "documentExpiry", v)}
              />
              <ToggleRow
                label="Weekly Digest"
                description="Summary of your activity and achievements"
                checked={settings.email.weeklyDigest}
                onChange={(v) => updateSetting("email", "weeklyDigest", v)}
              />
            </div>
          )}
        </div>

        {/* Gamification Notifications */}
        <div>
          <button
            onClick={() => toggleSection("gamification")}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-amber-500" />
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 dark:text-white">Gamification & Rewards</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">XP, achievements & challenges</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.includes("gamification") ? "rotate-180" : ""}`} />
          </button>

          {expandedSections.includes("gamification") && (
            <div className="px-4 pb-4 space-y-3">
              <ToggleRow
                label="XP Notifications"
                description="Real-time XP earned alerts"
                checked={settings.gamification.xpNotifications}
                onChange={(v) => updateSetting("gamification", "xpNotifications", v)}
                icon={<Zap className="h-4 w-4 text-yellow-500" />}
              />
              <ToggleRow
                label="Level Up Celebrations"
                description="Full-screen celebrations when you level up"
                checked={settings.gamification.levelUpCelebrations}
                onChange={(v) => updateSetting("gamification", "levelUpCelebrations", v)}
                icon={<Trophy className="h-4 w-4 text-purple-500" />}
              />
              <ToggleRow
                label="Achievement Popups"
                description="Confetti and badges when you earn achievements"
                checked={settings.gamification.achievementPopups}
                onChange={(v) => updateSetting("gamification", "achievementPopups", v)}
                icon={<Gift className="h-4 w-4 text-pink-500" />}
              />
              <ToggleRow
                label="Leaderboard Alerts"
                description="Updates when you climb or fall in rankings"
                checked={settings.gamification.leaderboardAlerts}
                onChange={(v) => updateSetting("gamification", "leaderboardAlerts", v)}
                icon={<Trophy className="h-4 w-4 text-amber-500" />}
              />
              <ToggleRow
                label="Streak At-Risk Warnings"
                description="Urgent alerts when your streak is about to break"
                checked={settings.gamification.streakAtRisk}
                onChange={(v) => updateSetting("gamification", "streakAtRisk", v)}
                icon={<AlertCircle className="h-4 w-4 text-red-500" />}
                recommended
              />
              <ToggleRow
                label="Daily Challenge Reminders"
                description="Notifications about available challenges"
                checked={settings.gamification.dailyChallengeReminders}
                onChange={(v) => updateSetting("gamification", "dailyChallengeReminders", v)}
                icon={<Calendar className="h-4 w-4 text-tiffany" />}
              />
            </div>
          )}
        </div>

        {/* Push Notifications */}
        <div>
          <button
            onClick={() => toggleSection("push")}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-green-500" />
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 dark:text-white">Push Notifications</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Browser and mobile alerts</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.includes("push") ? "rotate-180" : ""}`} />
          </button>

          {expandedSections.includes("push") && (
            <div className="px-4 pb-4 space-y-3">
              {!settings.push.enabled ? (
                <button
                  onClick={requestPushPermission}
                  className="w-full py-3 px-4 bg-tiffany/10 text-tiffany font-medium rounded-lg hover:bg-tiffany/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Bell className="h-5 w-5" />
                  Enable Push Notifications
                </button>
              ) : (
                <>
                  <ToggleRow
                    label="Achievement Alerts"
                    description="Instant notifications for new achievements"
                    checked={settings.push.achievements}
                    onChange={(v) => updateSetting("push", "achievements", v)}
                  />
                  <ToggleRow
                    label="Streak Reminders"
                    description="Don't lose your streak!"
                    checked={settings.push.streakReminders}
                    onChange={(v) => updateSetting("push", "streakReminders", v)}
                  />
                  <ToggleRow
                    label="Challenge Updates"
                    description="New challenges and completions"
                    checked={settings.push.challenges}
                    onChange={(v) => updateSetting("push", "challenges", v)}
                  />
                  <ToggleRow
                    label="Leaderboard Updates"
                    description="Rank changes in real-time"
                    checked={settings.push.leaderboardUpdates}
                    onChange={(v) => updateSetting("push", "leaderboardUpdates", v)}
                  />
                  <ToggleRow
                    label="New Content"
                    description="When new templates are available"
                    checked={settings.push.newContent}
                    onChange={(v) => updateSetting("push", "newContent", v)}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* Timing / Quiet Hours */}
        <div>
          <button
            onClick={() => toggleSection("timing")}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-purple-500" />
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 dark:text-white">Quiet Hours</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Schedule notification-free time</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.includes("timing") ? "rotate-180" : ""}`} />
          </button>

          {expandedSections.includes("timing") && (
            <div className="px-4 pb-4 space-y-4">
              <ToggleRow
                label="Enable Quiet Hours"
                description="Pause non-urgent notifications during set times"
                checked={settings.timing.quietHoursEnabled}
                onChange={(v) => updateSetting("timing", "quietHoursEnabled", v)}
              />

              {settings.timing.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-purple-200 dark:border-purple-800">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={settings.timing.quietHoursStart}
                      onChange={(e) => {
                        updateSetting("timing", "quietHoursStart", e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={settings.timing.quietHoursEnd}
                      onChange={(e) => {
                        updateSetting("timing", "quietHoursEnd", e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer with save */}
      {hasChanges && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-tiffany text-white font-semibold rounded-lg hover:bg-tiffany-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Save Preferences
          </button>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  icon,
  required,
  recommended,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon?: React.ReactNode;
  required?: boolean;
  recommended?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5">{icon}</div>}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white text-sm">{label}</span>
            {required && (
              <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                Required
              </span>
            )}
            {recommended && (
              <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">
                Recommended
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{description}</span>
        </div>
      </div>

      <button
        onClick={() => !required && onChange(!checked)}
        disabled={required}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked
            ? "bg-tiffany"
            : "bg-gray-300 dark:bg-gray-600"
        } ${required ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default NotificationPreferences;
