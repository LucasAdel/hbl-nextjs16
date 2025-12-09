"use client";

import { useState, useEffect } from "react";
import {
  Mail, Gift, Zap, Star, Trophy, Sparkles, ChevronRight,
  Check, Lock, Crown, Target, Flame, Users, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface GamifiedNewsletterSignupProps {
  source?: string;
  variant?: "full" | "compact" | "inline" | "modal";
  className?: string;
  onSuccess?: (email: string) => void;
}

// Signup rewards - variable reinforcement
const SIGNUP_REWARDS = {
  base: 100,
  bonus: { chance: 0.25, amount: 50 }, // 25% chance
  rare: { chance: 0.08, amount: 150 }, // 8% chance
  legendary: { chance: 0.02, amount: 500 }, // 2% chance!
};

// Unlock tiers for gamification
const NEWSLETTER_PERKS = [
  {
    id: "instant",
    name: "Instant Access",
    description: "Weekly legal insights & updates",
    icon: Mail,
    unlocked: true,
  },
  {
    id: "xp_boost",
    name: "XP Boost",
    description: "+100 XP welcome bonus",
    icon: Zap,
    unlocked: true,
  },
  {
    id: "exclusive",
    name: "Exclusive Content",
    description: "Subscriber-only articles & guides",
    icon: Lock,
    unlocked: true,
  },
  {
    id: "early_access",
    name: "Early Access",
    description: "First look at new templates",
    icon: Star,
    unlocked: true,
  },
  {
    id: "vip",
    name: "VIP Discounts",
    description: "15% off all purchases",
    icon: Crown,
    unlocked: true,
  },
];

// Social proof stats
const SOCIAL_STATS = {
  subscribers: 4847,
  averageOpen: 68,
  satisfaction: 96,
};

function triggerSignupConfetti() {
  // Burst from multiple positions
  const positions = [0.25, 0.5, 0.75];
  positions.forEach((x, i) => {
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x, y: 0.7 },
        colors: ["#00CED1", "#40E0D0", "#FFD700", "#FF69B4"],
      });
    }, i * 150);
  });
}

export function GamifiedNewsletterSignup({
  source = "website",
  variant = "full",
  className = "",
  onSuccess,
}: GamifiedNewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [bonusType, setBonusType] = useState<string | null>(null);
  const [revealedPerks, setRevealedPerks] = useState(0);

  // Progressive perk reveal animation
  useEffect(() => {
    if (email.includes("@")) {
      const interval = setInterval(() => {
        setRevealedPerks((prev) => Math.min(prev + 1, NEWSLETTER_PERKS.length));
      }, 200);
      return () => clearInterval(interval);
    } else {
      setRevealedPerks(0);
    }
  }, [email.includes("@")]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate XP with variable reinforcement
      let totalXP = SIGNUP_REWARDS.base;
      let bonus: string | null = null;

      const roll = Math.random();
      if (roll < SIGNUP_REWARDS.legendary.chance) {
        totalXP += SIGNUP_REWARDS.legendary.amount;
        bonus = "LEGENDARY";
      } else if (roll < SIGNUP_REWARDS.rare.chance) {
        totalXP += SIGNUP_REWARDS.rare.amount;
        bonus = "RARE";
      } else if (roll < SIGNUP_REWARDS.bonus.chance) {
        totalXP += SIGNUP_REWARDS.bonus.amount;
        bonus = "BONUS";
      }

      // Submit to newsletter API
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          xpEarned: totalXP,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error?.includes("already subscribed")) {
          toast.info("You're already subscribed! Check your inbox for updates.");
          return;
        }
        throw new Error("Subscription failed");
      }

      // Track with gamification
      await fetch("/api/gamification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "newsletter_signup",
          email,
          xpEarned: totalXP,
          metadata: { source, bonus },
        }),
      }).catch(() => {});

      setEarnedXP(totalXP);
      setBonusType(bonus);
      setIsSuccess(true);

      // Celebration!
      triggerSignupConfetti();

      if (bonus) {
        toast.success(`${bonus} REWARD! +${totalXP} XP!`, {
          duration: 5000,
          icon: bonus === "LEGENDARY" ? "👑" : bonus === "RARE" ? "✨" : "🎁",
        });
      } else {
        toast.success(`Welcome aboard! +${totalXP} XP earned!`);
      }

      onSuccess?.(email);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className={`bg-gradient-to-br from-tiffany via-tiffany-dark to-blue-600 rounded-2xl p-8 text-white text-center ${className}`}>
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <Check className="h-10 w-10" />
        </div>

        <h3 className="text-2xl font-bold mb-2">You're In! 🎉</h3>
        <p className="opacity-80 mb-6">
          Check your inbox for a confirmation email with exclusive content.
        </p>

        {/* XP Earned */}
        <div className="bg-white/20 rounded-xl p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-8 w-8 text-yellow-300" />
            <span className="text-4xl font-bold">+{earnedXP}</span>
            <span className="text-xl">XP</span>
          </div>
          {bonusType && (
            <div className="bg-white/20 rounded-lg px-4 py-2 inline-block mt-2">
              <span className="font-semibold">
                {bonusType === "LEGENDARY" && "👑 LEGENDARY BONUS!"}
                {bonusType === "RARE" && "✨ RARE BONUS!"}
                {bonusType === "BONUS" && "🎁 BONUS REWARD!"}
              </span>
            </div>
          )}
        </div>

        {/* Unlocked perks */}
        <div className="text-left space-y-2 mb-6">
          <p className="font-semibold mb-3">You've unlocked:</p>
          {NEWSLETTER_PERKS.map((perk) => (
            <div key={perk.id} className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
              <perk.icon className="h-5 w-5 text-yellow-300" />
              <div>
                <span className="font-medium">{perk.name}</span>
                <span className="text-sm opacity-70 ml-2">- {perk.description}</span>
              </div>
            </div>
          ))}
        </div>

        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-tiffany-dark font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    );
  }

  // Full variant
  if (variant === "full") {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-tiffany to-tiffany-dark p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Join Our Newsletter</h3>
                <p className="text-sm opacity-80">Weekly legal insights for medical professionals</p>
              </div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
              <Gift className="h-5 w-5 text-yellow-300" />
              <span className="font-bold">+100 XP</span>
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{SOCIAL_STATS.subscribers.toLocaleString()} subscribers</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-300" />
              <span>{SOCIAL_STATS.satisfaction}% satisfaction</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Perks reveal */}
          <div className="mb-6 space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              What you'll unlock:
            </p>
            {NEWSLETTER_PERKS.map((perk, index) => (
              <div
                key={perk.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  index < revealedPerks
                    ? "bg-tiffany/10 dark:bg-tiffany/20 border border-tiffany/30"
                    : "bg-gray-100 dark:bg-gray-700/50 opacity-50"
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  index < revealedPerks
                    ? "bg-tiffany text-white"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-400"
                }`}>
                  <perk.icon className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {perk.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {perk.description}
                  </span>
                </div>
                {index < revealedPerks && (
                  <Check className="h-4 w-4 text-tiffany ml-auto" />
                )}
              </div>
            ))}
          </div>

          {/* Signup form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent text-lg"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-tiffany to-tiffany-dark text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Subscribe & Earn 100+ XP
                </>
              )}
            </button>
          </form>

          {/* Chance indicator */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🎰 2% chance for LEGENDARY bonus (+500 XP)
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <div className={`bg-gradient-to-r from-tiffany to-tiffany-dark rounded-xl p-4 text-white ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <Mail className="h-5 w-5" />
          <span className="font-semibold">Get Weekly Insights</span>
          <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">+100 XP</span>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="flex-1 px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-white text-tiffany-dark font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "..." : "Join"}
          </button>
        </form>
      </div>
    );
  }

  // Inline variant
  return (
    <form onSubmit={handleSubmit} className={`flex gap-3 ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany"
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-2 bg-tiffany text-white font-semibold rounded-lg hover:bg-tiffany-dark transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {isSubmitting ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Gift className="h-4 w-4" />
            +100 XP
          </>
        )}
      </button>
    </form>
  );
}

// Floating CTA for newsletter
export function NewsletterFloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed in session
    if (sessionStorage.getItem("newsletter_cta_dismissed")) {
      return;
    }

    // Show after 30 seconds or 50% scroll
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50) {
        setIsVisible(true);
      }
    };

    const timer = setTimeout(() => setIsVisible(true), 30000);

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("newsletter_cta_dismissed", "true");
  };

  if (isDismissed || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            <span className="font-semibold">Unlock +100 XP!</span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Join 4,800+ medical professionals getting weekly legal insights
          </p>
          <GamifiedNewsletterSignup
            variant="inline"
            source="floating_cta"
            onSuccess={handleDismiss}
          />
        </div>
      </div>
    </div>
  );
}

export default GamifiedNewsletterSignup;
