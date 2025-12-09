"use client";

import { useState, useEffect, useCallback } from "react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  earned_at?: string;
}

interface XPTransaction {
  id: string;
  amount: number;
  source: string;
  description: string;
  created_at: string;
}

interface UserProfile {
  email: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  progressToNextLevel: number;
  xpToNextLevel: number;
  streakMultiplier: number;
  achievements: Array<{ earned_at: string; achievements: Achievement }>;
  recentXP: XPTransaction[];
}

interface XPRewardPopup {
  id: string;
  amount: number;
  type: "base" | "bonus" | "rare" | "jackpot";
  message: string;
}

export function GamificationWidget({ email }: { email: string | null }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [xpPopups, setXpPopups] = useState<XPRewardPopup[]>([]);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!email) return;

    try {
      const response = await fetch(`/api/gamification?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch gamification profile:", error);
    }
  }, [email]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Show XP reward popup with variable reinforcement animation
  const showXPReward = useCallback((amount: number, type: string, message: string) => {
    const popup: XPRewardPopup = {
      id: Date.now().toString(),
      amount,
      type: type as XPRewardPopup["type"],
      message,
    };
    setXpPopups((prev) => [...prev, popup]);

    // Remove popup after animation
    setTimeout(() => {
      setXpPopups((prev) => prev.filter((p) => p.id !== popup.id));
    }, 3000);
  }, []);

  // Expose method to trigger XP rewards from other components
  useEffect(() => {
    const handler = (event: CustomEvent<{ amount: number; type: string; message: string }>) => {
      showXPReward(event.detail.amount, event.detail.type, event.detail.message);
      fetchProfile(); // Refresh profile after XP gain
    };

    window.addEventListener("xp-reward" as keyof WindowEventMap, handler as EventListener);
    return () => window.removeEventListener("xp-reward" as keyof WindowEventMap, handler as EventListener);
  }, [showXPReward, fetchProfile]);

  // Expose achievement unlocked handler
  useEffect(() => {
    const handler = (event: CustomEvent<Achievement>) => {
      setShowAchievement(event.detail);
      setTimeout(() => setShowAchievement(null), 5000);
    };

    window.addEventListener("achievement-unlocked" as keyof WindowEventMap, handler as EventListener);
    return () => window.removeEventListener("achievement-unlocked" as keyof WindowEventMap, handler as EventListener);
  }, []);

  if (!email || !profile) return null;

  const getStreakEmoji = (streak: number) => {
    if (streak >= 90) return "🔥💎";
    if (streak >= 60) return "🔥🏆";
    if (streak >= 30) return "🔥⭐";
    if (streak >= 14) return "🔥";
    if (streak >= 7) return "✨";
    if (streak >= 3) return "⚡";
    return "💫";
  };

  const getLevelTitle = (level: number) => {
    if (level >= 20) return "Legal Legend";
    if (level >= 15) return "Document Master";
    if (level >= 10) return "Legal Expert";
    if (level >= 7) return "Senior Practitioner";
    if (level >= 5) return "Practitioner";
    if (level >= 3) return "Associate";
    return "Newcomer";
  };

  return (
    <>
      {/* XP Reward Popups */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {xpPopups.map((popup) => (
          <div
            key={popup.id}
            className={`
              transform transition-all duration-500 animate-bounce
              px-4 py-3 rounded-lg shadow-lg text-white font-bold
              ${popup.type === "jackpot" ? "bg-gradient-to-r from-yellow-500 to-amber-500 scale-125" : ""}
              ${popup.type === "rare" ? "bg-gradient-to-r from-purple-500 to-pink-500 scale-110" : ""}
              ${popup.type === "bonus" ? "bg-gradient-to-r from-blue-500 to-cyan-500" : ""}
              ${popup.type === "base" ? "bg-gradient-to-r from-green-500 to-emerald-500" : ""}
            `}
          >
            <div className="flex items-center gap-2">
              {popup.type === "jackpot" && "🎰 "}
              {popup.type === "rare" && "💎 "}
              {popup.type === "bonus" && "🌟 "}
              {popup.type === "base" && "✓ "}
              <span>{popup.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Achievement Unlocked Modal */}
      {showAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 animate-scaleIn">
            <div className="text-center">
              <div className="text-6xl mb-4">{showAchievement.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Achievement Unlocked!</h2>
              <h3 className="text-xl font-semibold text-amber-600 mb-2">{showAchievement.name}</h3>
              <p className="text-gray-600 mb-4">{showAchievement.description}</p>
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-semibold">
                +{showAchievement.xp_reward} XP
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Widget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <div className="relative">
          <span className="text-2xl">🏆</span>
          {profile.current_streak >= 3 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {profile.current_streak}
            </span>
          )}
        </div>
      </button>

      {/* Expanded Panel */}
      {isOpen && (
        <div className="fixed bottom-40 right-4 z-40 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm opacity-80">Level {profile.current_level}</div>
                <div className="font-bold">{getLevelTitle(profile.current_level)}</div>
              </div>
              <div className="text-3xl">🏆</div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>{profile.total_xp.toLocaleString()} XP</span>
                <span>{profile.xpToNextLevel.toLocaleString()} to next level</span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${profile.progressToNextLevel}%` }}
                />
              </div>
            </div>
          </div>

          {/* Streak Section */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Current Streak</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {getStreakEmoji(profile.current_streak)} {profile.current_streak} days
                </div>
              </div>
              {profile.streakMultiplier > 1 && (
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {profile.streakMultiplier}x bonus
                </div>
              )}
            </div>
            {profile.current_streak > 0 && profile.current_streak < profile.longest_streak && (
              <div className="text-xs text-gray-400 mt-1">
                Best: {profile.longest_streak} days
              </div>
            )}
            {profile.current_streak > 0 && (
              <div className="mt-2 text-xs text-amber-600 font-medium">
                🔒 Don&apos;t break your streak! Come back tomorrow.
              </div>
            )}
          </div>

          {/* Achievements Section */}
          <div className="p-4 border-b">
            <div className="text-sm font-semibold text-gray-700 mb-2">Achievements</div>
            <div className="flex flex-wrap gap-2">
              {profile.achievements.slice(0, 6).map((ua, i) => (
                <div
                  key={i}
                  className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform"
                  title={ua.achievements.name}
                >
                  {ua.achievements.icon}
                </div>
              ))}
              {profile.achievements.length > 6 && (
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm text-gray-500">
                  +{profile.achievements.length - 6}
                </div>
              )}
              {profile.achievements.length === 0 && (
                <div className="text-sm text-gray-400">Complete activities to earn achievements!</div>
              )}
            </div>
          </div>

          {/* Recent XP */}
          <div className="p-4 max-h-40 overflow-y-auto">
            <div className="text-sm font-semibold text-gray-700 mb-2">Recent Activity</div>
            <div className="space-y-2">
              {profile.recentXP.slice(0, 5).map((xp) => (
                <div key={xp.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1">{xp.description}</span>
                  <span className="text-green-600 font-semibold ml-2">+{xp.amount}</span>
                </div>
              ))}
              {profile.recentXP.length === 0 && (
                <div className="text-sm text-gray-400">No recent activity</div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </>
  );
}

// Helper function to trigger XP rewards from anywhere in the app
export function triggerXPReward(amount: number, type: string, message: string) {
  window.dispatchEvent(new CustomEvent("xp-reward", {
    detail: { amount, type, message },
  }));
}

// Helper function to show achievement unlocked
export function triggerAchievementUnlocked(achievement: Achievement) {
  window.dispatchEvent(new CustomEvent("achievement-unlocked", {
    detail: achievement,
  }));
}
