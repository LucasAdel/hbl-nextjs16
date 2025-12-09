"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Trophy, Star, Sparkles, Gift, Zap } from "lucide-react";
import confetti from "canvas-confetti";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  rarity?: "common" | "rare" | "epic" | "legendary";
}

interface AchievementCelebrationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

// Confetti burst for achievements
function triggerConfetti(intensity: "low" | "medium" | "high" = "medium") {
  const count = {
    low: 50,
    medium: 100,
    high: 200,
  }[intensity];

  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

// Trigger special effects for legendary achievements
function triggerLegendaryEffect() {
  // Gold confetti rain
  const duration = 3000;
  const animationEnd = Date.now() + duration;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#FFD700", "#FFA500", "#FF8C00"],
      zIndex: 9999,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#FFD700", "#FFA500", "#FF8C00"],
      zIndex: 9999,
    });
  }, 50);
}

export function AchievementCelebration({
  achievement,
  onClose,
}: AchievementCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);

      // Delay content reveal for animation
      setTimeout(() => setShowContent(true), 100);

      // Trigger confetti based on rarity
      switch (achievement.rarity) {
        case "legendary":
          triggerConfetti("high");
          triggerLegendaryEffect();
          break;
        case "epic":
          triggerConfetti("high");
          break;
        case "rare":
          triggerConfetti("medium");
          break;
        default:
          triggerConfetti("low");
      }

      // Auto-close after delay
      const timer = setTimeout(() => {
        handleClose();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [achievement]);

  const handleClose = useCallback(() => {
    setShowContent(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  }, [onClose]);

  if (!achievement || !isVisible) return null;

  const rarityStyles = {
    common: {
      gradient: "from-gray-500 to-gray-600",
      glow: "shadow-gray-500/50",
      icon: <Star className="h-8 w-8" />,
    },
    rare: {
      gradient: "from-blue-500 to-cyan-500",
      glow: "shadow-blue-500/50",
      icon: <Sparkles className="h-8 w-8" />,
    },
    epic: {
      gradient: "from-purple-500 to-pink-500",
      glow: "shadow-purple-500/50",
      icon: <Zap className="h-8 w-8" />,
    },
    legendary: {
      gradient: "from-amber-400 via-yellow-500 to-orange-500",
      glow: "shadow-amber-500/50",
      icon: <Trophy className="h-8 w-8" />,
    },
  };

  const rarity = achievement.rarity || "common";
  const styles = rarityStyles[rarity];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transform transition-all duration-500 ${
          showContent ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
        style={{ maxWidth: "400px", width: "100%" }}
      >
        {/* Animated background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-10`}
        />

        {/* Glowing border effect for legendary */}
        {rarity === "legendary" && (
          <div className="absolute inset-0 rounded-2xl animate-pulse bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20" />
        )}

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="relative p-8 text-center">
          {/* Achievement Icon */}
          <div
            className={`
              inline-flex items-center justify-center w-24 h-24 rounded-full mb-6
              bg-gradient-to-br ${styles.gradient} shadow-lg ${styles.glow}
              animate-bounce
            `}
          >
            <span className="text-5xl">{achievement.icon}</span>
          </div>

          {/* Title */}
          <div className="mb-2">
            <span
              className={`
                inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                bg-gradient-to-r ${styles.gradient} text-white
              `}
            >
              {rarity} Achievement
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 animate-in fade-in duration-500 delay-150">
            🎉 Achievement Unlocked!
          </h2>

          <h3
            className={`
              text-xl font-bold bg-gradient-to-r ${styles.gradient} bg-clip-text text-transparent
              animate-in fade-in duration-500 delay-200
            `}
          >
            {achievement.name}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6 animate-in fade-in duration-500 delay-300">
            {achievement.description}
          </p>

          {/* XP Reward */}
          <div
            className={`
              inline-flex items-center gap-2 px-6 py-3 rounded-full
              bg-gradient-to-r ${styles.gradient} text-white font-bold
              shadow-lg ${styles.glow}
              animate-in zoom-in duration-500 delay-400
            `}
          >
            <Gift className="h-5 w-5" />
            +{achievement.xp_reward} XP
          </div>

          {/* Motivational message based on rarity */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 animate-in fade-in duration-500 delay-500">
            {rarity === "legendary" && "You're a legend! This is an extremely rare achievement!"}
            {rarity === "epic" && "Amazing work! Only 5% of users earn this!"}
            {rarity === "rare" && "Great job! Keep up the momentum!"}
            {rarity === "common" && "Nice! You're making progress!"}
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-white/10 to-transparent rounded-full translate-x-1/4 translate-y-1/4" />
      </div>
    </div>
  );
}

// Global achievement celebration trigger
export function triggerAchievementCelebration(achievement: Achievement) {
  window.dispatchEvent(
    new CustomEvent("achievement-celebration", { detail: achievement })
  );
}

// Hook to listen for achievement celebrations
export function useAchievementCelebration() {
  const [achievement, setAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    const handler = (event: CustomEvent<Achievement>) => {
      setAchievement(event.detail);
    };

    window.addEventListener(
      "achievement-celebration" as keyof WindowEventMap,
      handler as EventListener
    );

    return () => {
      window.removeEventListener(
        "achievement-celebration" as keyof WindowEventMap,
        handler as EventListener
      );
    };
  }, []);

  const closeModal = useCallback(() => {
    setAchievement(null);
  }, []);

  return { achievement, closeModal };
}

export default AchievementCelebration;
