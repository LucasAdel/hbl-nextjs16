"use client";

import { useState, useEffect } from "react";
import {
  Target, CheckCircle2, Clock, Gift, Zap, BookOpen,
  FileText, MessageSquare, Star, TrendingUp, Lock,
  ChevronRight, Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  xpReward: number;
  bonusReward?: number; // Variable reinforcement bonus
  progress: number;
  target: number;
  type: "daily" | "weekly" | "special";
  completed: boolean;
  expiresAt?: string;
  difficulty: "easy" | "medium" | "hard";
}

interface DailyChallengesProps {
  email: string | null;
  className?: string;
}

// Challenge templates
const DAILY_CHALLENGES: Omit<Challenge, "id" | "progress" | "completed">[] = [
  {
    title: "Knowledge Seeker",
    description: "Read 3 articles or resources",
    icon: <BookOpen className="h-5 w-5" />,
    xpReward: 30,
    bonusReward: 50,
    target: 3,
    type: "daily",
    difficulty: "easy",
  },
  {
    title: "Document Explorer",
    description: "View 5 legal documents",
    icon: <FileText className="h-5 w-5" />,
    xpReward: 40,
    bonusReward: 75,
    target: 5,
    type: "daily",
    difficulty: "easy",
  },
  {
    title: "Active Participant",
    description: "Complete any form or signup",
    icon: <MessageSquare className="h-5 w-5" />,
    xpReward: 50,
    bonusReward: 100,
    target: 1,
    type: "daily",
    difficulty: "medium",
  },
  {
    title: "Streak Master",
    description: "Maintain your daily streak",
    icon: <Zap className="h-5 w-5" />,
    xpReward: 25,
    bonusReward: 50,
    target: 1,
    type: "daily",
    difficulty: "easy",
  },
];

const WEEKLY_CHALLENGES: Omit<Challenge, "id" | "progress" | "completed">[] = [
  {
    title: "Weekly Scholar",
    description: "Read 10 articles this week",
    icon: <Star className="h-5 w-5" />,
    xpReward: 150,
    bonusReward: 250,
    target: 10,
    type: "weekly",
    difficulty: "medium",
  },
  {
    title: "Document Collector",
    description: "Add 3 items to your wishlist",
    icon: <Target className="h-5 w-5" />,
    xpReward: 100,
    bonusReward: 200,
    target: 3,
    type: "weekly",
    difficulty: "medium",
  },
  {
    title: "Engagement Champion",
    description: "Visit the site 5 days this week",
    icon: <TrendingUp className="h-5 w-5" />,
    xpReward: 200,
    bonusReward: 400,
    target: 5,
    type: "weekly",
    difficulty: "hard",
  },
];

const difficultyColors = {
  easy: "text-green-600 bg-green-100 dark:bg-green-900/30",
  medium: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
  hard: "text-red-600 bg-red-100 dark:bg-red-900/30",
};

export function DailyChallenges({ email, className = "" }: DailyChallengesProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Simulate fetching challenges with progress
    const loadChallenges = async () => {
      await new Promise((r) => setTimeout(r, 300));

      // Generate today's challenges with random progress
      const dailyChallenges: Challenge[] = DAILY_CHALLENGES.map((c, i) => ({
        ...c,
        id: `daily_${i}`,
        progress: Math.floor(Math.random() * (c.target + 1)),
        completed: false,
      })).map((c) => ({
        ...c,
        completed: c.progress >= c.target,
      }));

      const weeklyChallenges: Challenge[] = WEEKLY_CHALLENGES.map((c, i) => ({
        ...c,
        id: `weekly_${i}`,
        progress: Math.floor(Math.random() * c.target),
        completed: false,
      })).map((c) => ({
        ...c,
        completed: c.progress >= c.target,
      }));

      setChallenges([...dailyChallenges, ...weeklyChallenges]);
      setLoading(false);
    };

    loadChallenges();
  }, [email]);

  const handleClaimReward = async (challenge: Challenge) => {
    if (!challenge.completed) return;

    // Variable reinforcement - 20% chance for bonus
    const gotBonus = Math.random() < 0.2 && challenge.bonusReward;
    const totalXP = gotBonus ? challenge.xpReward + (challenge.bonusReward || 0) : challenge.xpReward;

    // Update challenge as claimed
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === challenge.id ? { ...c, completed: true, progress: c.target } : c
      )
    );

    if (gotBonus) {
      toast.success(
        `🎉 BONUS! You earned ${totalXP} XP! (+${challenge.bonusReward} bonus)`,
        { duration: 5000 }
      );
    } else {
      toast.success(`Challenge complete! +${totalXP} XP`, { duration: 3000 });
    }

    // Track with gamification API
    try {
      await fetch("/api/gamification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "challenge_complete",
          challengeId: challenge.id,
          xpEarned: totalXP,
        }),
      });
    } catch {
      // Silent fail
    }
  };

  const dailyChallenges = challenges.filter((c) => c.type === "daily");
  const weeklyChallenges = challenges.filter((c) => c.type === "weekly");
  const completedCount = challenges.filter((c) => c.completed).length;
  const totalCount = challenges.length;

  // Calculate time remaining until reset
  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
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
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            <h3 className="font-bold text-lg">Daily Challenges</h3>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>Resets in {getTimeUntilReset()}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span>{completedCount}/{totalCount} completed</span>
            <span>{Math.round((completedCount / totalCount) * 100)}%</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Bonus for completing all */}
        {completedCount === totalCount && (
          <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>All challenges complete! +100 Bonus XP</span>
          </div>
        )}
      </div>

      {/* Challenges List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {/* Daily */}
        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Today&apos;s Challenges
          </h4>
          <div className="space-y-3">
            {dailyChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onClaim={handleClaimReward}
              />
            ))}
          </div>
        </div>

        {/* Weekly */}
        {(showAll || weeklyChallenges.some((c) => c.completed)) && (
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-500" />
              Weekly Challenges
            </h4>
            <div className="space-y-3">
              {weeklyChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onClaim={handleClaimReward}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Show more */}
      {!showAll && weeklyChallenges.length > 0 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-tiffany flex items-center justify-center gap-1"
          >
            Show Weekly Challenges
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function ChallengeCard({
  challenge,
  onClaim,
}: {
  challenge: Challenge;
  onClaim: (c: Challenge) => void;
}) {
  const progress = Math.min((challenge.progress / challenge.target) * 100, 100);
  const isClaimable = challenge.progress >= challenge.target;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isClaimable
          ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`p-2 rounded-lg ${
            isClaimable
              ? "bg-green-100 dark:bg-green-900/50 text-green-600"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          }`}
        >
          {isClaimable ? <CheckCircle2 className="h-5 w-5" /> : challenge.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
              {challenge.title}
            </h5>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                difficultyColors[challenge.difficulty]
              }`}
            >
              {challenge.difficulty}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {challenge.description}
          </p>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isClaimable ? "bg-green-500" : "bg-tiffany"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {challenge.progress}/{challenge.target}
            </span>
          </div>
        </div>

        {/* Reward / Claim */}
        <div className="flex flex-col items-end gap-1">
          {isClaimable ? (
            <button
              onClick={() => onClaim(challenge)}
              className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
            >
              <Gift className="h-3 w-3" />
              Claim
            </button>
          ) : (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Gift className="h-4 w-4" />
              <span className="text-sm font-semibold">+{challenge.xpReward}</span>
            </div>
          )}
          {challenge.bonusReward && (
            <span className="text-xs text-purple-600 dark:text-purple-400">
              +{challenge.bonusReward} bonus
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact widget for sidebar
export function DailyChallengesWidget({ email }: { email: string | null }) {
  const completedToday = 2; // Simulated
  const totalToday = 4;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          <span className="font-semibold">Daily Challenges</span>
        </div>
        <span className="text-sm opacity-80">{completedToday}/{totalToday}</span>
      </div>
      <div className="h-2 bg-white/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full"
          style={{ width: `${(completedToday / totalToday) * 100}%` }}
        />
      </div>
      <p className="text-xs mt-2 opacity-80">
        Complete {totalToday - completedToday} more for bonus XP!
      </p>
    </div>
  );
}

export default DailyChallenges;
