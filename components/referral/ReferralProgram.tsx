"use client";

import { useState, useEffect } from "react";
import {
  Users, Gift, Copy, Share2, Check, Trophy, Star,
  ChevronRight, Zap, Target, Crown, Award, Sparkles,
  Mail, MessageCircle, Twitter, Linkedin, Facebook
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface ReferralProgramProps {
  email: string | null;
  className?: string;
}

interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  pendingReferrals: number;
  successfulReferrals: number;
  totalXPEarned: number;
  currentTier: number;
  nextTierProgress: number;
  rank: number;
}

// Referral tier rewards - escalating with near-miss psychology
const REFERRAL_TIERS = [
  { tier: 1, referrals: 1, reward: 100, bonus: "First referral badge", icon: Star },
  { tier: 2, referrals: 3, reward: 150, bonus: "10% off next purchase", icon: Gift },
  { tier: 3, referrals: 5, reward: 250, bonus: "Exclusive template access", icon: Award },
  { tier: 4, referrals: 10, reward: 500, bonus: "VIP status + 20% off", icon: Crown },
  { tier: 5, referrals: 25, reward: 1500, bonus: "Free consultation session", icon: Trophy },
];

// Variable reinforcement for referrals
const REFERRAL_REWARDS = {
  base: 75, // Per successful referral
  bonus: { chance: 0.25, amount: 50 },
  rare: { chance: 0.1, amount: 150 },
  jackpot: { chance: 0.02, amount: 500 },
};

// Social share templates
const SHARE_TEMPLATES = {
  twitter: "I've been using @HamiltonBaileyLaw for my medical practice legal needs - highly recommend! Use my referral link for exclusive benefits:",
  linkedin: "For fellow medical professionals: Hamilton Bailey Law offers excellent legal resources for healthcare practices. Happy to share my referral link:",
  email: {
    subject: "Legal Resources for Medical Professionals - Exclusive Referral",
    body: "Hi,\n\nI wanted to share a resource I've found valuable for my practice - Hamilton Bailey Law. They specialize in healthcare legal compliance.\n\nUse my referral link for exclusive benefits:\n\n{link}\n\nBest regards",
  },
  sms: "Check out Hamilton Bailey Law for medical practice legal resources. Use my link for exclusive benefits:",
};

function triggerReferralConfetti(intensity: "low" | "high" = "low") {
  const count = intensity === "high" ? 150 : 60;
  confetti({
    particleCount: count,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#00CED1", "#FFD700", "#FF69B4", "#40E0D0"],
  });
}

export function ReferralProgram({ email, className = "" }: ReferralProgramProps) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const fetchReferralStats = async () => {
      // Simulate API fetch
      await new Promise((r) => setTimeout(r, 500));

      // Generate referral code from email
      const code = email
        ? `HBL${email.split("@")[0].toUpperCase().slice(0, 4)}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
        : `HBLGUEST${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      setStats({
        referralCode: code,
        referralLink: `https://hamiltonbaileylaw.com.au/ref/${code}`,
        totalReferrals: 7,
        pendingReferrals: 2,
        successfulReferrals: 5,
        totalXPEarned: 625,
        currentTier: 3,
        nextTierProgress: 50, // 5 of 10 needed for tier 4
        rank: 23,
      });

      setLoading(false);
    };

    fetchReferralStats();
  }, [email]);

  const handleCopyLink = async () => {
    if (!stats) return;

    try {
      await navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = (platform: string) => {
    if (!stats) return;

    let url = "";
    const encodedLink = encodeURIComponent(stats.referralLink);

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEMPLATES.twitter)}&url=${encodedLink}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
        break;
      case "email":
        url = `mailto:?subject=${encodeURIComponent(SHARE_TEMPLATES.email.subject)}&body=${encodeURIComponent(SHARE_TEMPLATES.email.body.replace("{link}", stats.referralLink))}`;
        break;
      case "sms":
        url = `sms:?body=${encodeURIComponent(SHARE_TEMPLATES.sms + " " + stats.referralLink)}`;
        break;
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400");
      toast.success(`Sharing via ${platform}...`);
      setShowShareMenu(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const currentTierData = REFERRAL_TIERS.find((t) => t.tier === stats.currentTier);
  const nextTierData = REFERRAL_TIERS.find((t) => t.tier === stats.currentTier + 1);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Referral Program</h3>
              <p className="text-sm opacity-80">Earn rewards for every friend who joins</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">Your Rank</div>
            <div className="text-2xl font-bold">#{stats.rank}</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 bg-white/10 rounded-xl p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.successfulReferrals}</div>
            <div className="text-xs opacity-80">Successful</div>
          </div>
          <div className="text-center border-x border-white/20">
            <div className="text-2xl font-bold">{stats.pendingReferrals}</div>
            <div className="text-xs opacity-80">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalXPEarned}</div>
            <div className="text-xs opacity-80">XP Earned</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Referral Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Referral Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={stats.referralLink}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-3 bg-tiffany text-white rounded-lg hover:bg-tiffany-dark transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Share Your Link
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleShare("email")}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button
              onClick={() => handleShare("sms")}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-green-700 dark:text-green-400"
            >
              <MessageCircle className="h-4 w-4" />
              SMS
            </button>
            <button
              onClick={() => handleShare("twitter")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-blue-700 dark:text-blue-400"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </button>
            <button
              onClick={() => handleShare("linkedin")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-blue-700 dark:text-blue-400"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </button>
            <button
              onClick={() => handleShare("facebook")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors text-indigo-700 dark:text-indigo-400"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </button>
          </div>
        </div>

        {/* Current Tier Progress - Near-miss psychology */}
        {nextTierData && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Next Tier: {nextTierData.tier}
                </span>
              </div>
              <span className="text-sm text-amber-700 dark:text-amber-400">
                {nextTierData.referrals - stats.successfulReferrals} more to unlock!
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-amber-200 dark:bg-amber-900/50 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.nextTierProgress}%` }}
              />
            </div>

            {/* Reward preview */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <nextTierData.icon className="h-4 w-4 text-amber-600" />
                <span>{nextTierData.bonus}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-600 font-semibold">
                <Zap className="h-4 w-4" />
                +{nextTierData.reward} XP
              </div>
            </div>
          </div>
        )}

        {/* Tier Ladder */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Reward Tiers
          </h4>
          <div className="space-y-2">
            {REFERRAL_TIERS.map((tier) => {
              const isUnlocked = stats.successfulReferrals >= tier.referrals;
              const isCurrent = stats.currentTier === tier.tier;

              return (
                <div
                  key={tier.tier}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                    isUnlocked
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      : isCurrent
                      ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                      : "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 opacity-60"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    isUnlocked
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-500"
                  }`}>
                    <tier.icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Tier {tier.tier}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({tier.referrals} referrals)
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {tier.bonus}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-purple-600 font-semibold">
                    <Zap className="h-4 w-4" />
                    +{tier.reward}
                  </div>

                  {isUnlocked && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            How It Works
          </h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-tiffany text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                1
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share your unique referral link with friends and colleagues
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-tiffany text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                2
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                They sign up and make their first purchase using your link
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-tiffany text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                3
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You both earn XP rewards and unlock exclusive perks!
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            🎰 Each referral has a chance for bonus rewards up to +500 XP!
          </p>
        </div>
      </div>
    </div>
  );
}

// Compact referral widget for sidebar
export function ReferralWidgetCompact({ email }: { email: string | null }) {
  const [copied, setCopied] = useState(false);
  const code = email
    ? `HBL${email.split("@")[0].toUpperCase().slice(0, 4)}`
    : "HBLREF";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`https://hamiltonbaileylaw.com.au/ref/${code}`);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 text-white">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-5 w-5" />
        <span className="font-semibold">Refer & Earn</span>
      </div>
      <p className="text-sm opacity-80 mb-3">
        Get +75 XP for each friend who joins
      </p>
      <button
        onClick={handleCopy}
        className="w-full py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied!" : "Copy Referral Link"}
      </button>
    </div>
  );
}

export default ReferralProgram;
