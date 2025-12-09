"use client";

import { useState, useEffect } from "react";
import {
  Trophy, Flame, Target, TrendingUp, Calendar, Gift, Star,
  ChevronRight, Award, Zap, BookOpen, FileText, Clock,
  CheckCircle2, Circle, ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { LeaderboardCompact } from "@/components/gamification/Leaderboard";
import { DailyChallengesWidget } from "@/components/gamification/DailyChallenges";

interface UserStats {
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  documentsViewed: number;
  documentsPurchased: number;
  articlesRead: number;
  consultationsBooked: number;
  progressToNextLevel: number;
  xpToNextLevel: number;
  streakMultiplier: number;
  rank: number;
  totalUsers: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  xpReward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  xpEarned: number;
  timestamp: string;
}

interface UserProgressDashboardProps {
  email: string;
  className?: string;
}

const LEVEL_TITLES: Record<number, string> = {
  1: "Newcomer",
  2: "Learner",
  3: "Associate",
  4: "Practitioner",
  5: "Senior",
  6: "Expert",
  7: "Master",
  8: "Authority",
  9: "Luminary",
  10: "Legend",
};

export function UserProgressDashboard({ email, className = "" }: UserProgressDashboardProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Simulate API fetch
      await new Promise((r) => setTimeout(r, 500));

      // Mock data
      setStats({
        totalXP: 4850,
        currentLevel: 7,
        currentStreak: 12,
        longestStreak: 18,
        documentsViewed: 45,
        documentsPurchased: 3,
        articlesRead: 28,
        consultationsBooked: 1,
        progressToNextLevel: 68,
        xpToNextLevel: 850,
        streakMultiplier: 1.25,
        rank: 11,
        totalUsers: 2847,
      });

      setAchievements([
        {
          id: "1",
          name: "Early Bird",
          description: "Signed up in the first month",
          icon: "🌅",
          earnedAt: "2025-01-15",
          xpReward: 100,
          rarity: "rare",
        },
        {
          id: "2",
          name: "Document Explorer",
          description: "Viewed 25+ documents",
          icon: "📄",
          earnedAt: "2025-02-01",
          xpReward: 50,
          rarity: "common",
        },
        {
          id: "3",
          name: "Streak Warrior",
          description: "Maintained a 7-day streak",
          icon: "🔥",
          earnedAt: "2025-02-10",
          xpReward: 75,
          rarity: "common",
        },
        {
          id: "4",
          name: "First Purchase",
          description: "Made your first document purchase",
          icon: "🛒",
          earnedAt: "2025-02-15",
          xpReward: 150,
          rarity: "epic",
        },
      ]);

      setRecentActivity([
        { id: "1", type: "document_view", description: "Viewed Medical Practice Setup Guide", xpEarned: 5, timestamp: "2025-12-07T10:30:00" },
        { id: "2", type: "article_read", description: "Read AHPRA Compliance Guide", xpEarned: 10, timestamp: "2025-12-07T09:15:00" },
        { id: "3", type: "streak", description: "12-day streak maintained!", xpEarned: 25, timestamp: "2025-12-07T00:01:00" },
        { id: "4", type: "challenge", description: "Completed Daily Challenge", xpEarned: 40, timestamp: "2025-12-06T16:45:00" },
        { id: "5", type: "document_view", description: "Viewed Employment Contract Template", xpEarned: 5, timestamp: "2025-12-06T14:20:00" },
      ]);

      setLoading(false);
    };

    fetchData();
  }, [email]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const levelTitle = LEVEL_TITLES[Math.min(stats.currentLevel, 10)] || "Legend";

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats Card */}
      <div className="bg-gradient-to-br from-tiffany via-tiffany-dark to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Level & XP */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
              {stats.currentLevel}
            </div>
            <div>
              <div className="text-sm opacity-80">Level {stats.currentLevel}</div>
              <div className="text-2xl font-bold">{levelTitle}</div>
              <div className="text-sm opacity-80 mt-1">
                {stats.totalXP.toLocaleString()} XP total
              </div>
            </div>
          </div>

          {/* Progress to next level */}
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress to Level {stats.currentLevel + 1}</span>
              <span>{stats.xpToNextLevel} XP needed</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${stats.progressToNextLevel}%` }}
              />
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
            <Flame className="h-8 w-8 text-orange-400" />
            <div>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <div className="text-sm opacity-80">Day Streak</div>
            </div>
            {stats.streakMultiplier > 1 && (
              <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {stats.streakMultiplier}x
              </div>
            )}
          </div>
        </div>

        {/* Rank */}
        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span>Rank #{stats.rank} of {stats.totalUsers.toLocaleString()} users</span>
          </div>
          <Link
            href="/leaderboard"
            className="flex items-center gap-1 text-sm hover:underline"
          >
            View Leaderboard
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="h-5 w-5 text-blue-500" />}
          label="Documents Viewed"
          value={stats.documentsViewed}
          trend={+5}
        />
        <StatCard
          icon={<BookOpen className="h-5 w-5 text-purple-500" />}
          label="Articles Read"
          value={stats.articlesRead}
          trend={+3}
        />
        <StatCard
          icon={<Gift className="h-5 w-5 text-green-500" />}
          label="Purchases"
          value={stats.documentsPurchased}
        />
        <StatCard
          icon={<Calendar className="h-5 w-5 text-amber-500" />}
          label="Consultations"
          value={stats.consultationsBooked}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activity & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                Recent Activity
              </h3>
              <Link
                href="/activity"
                className="text-sm text-tiffany hover:underline flex items-center gap-1"
              >
                View All
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-tiffany/10 dark:bg-tiffany/20 flex items-center justify-center">
                    {activity.type === "document_view" && <FileText className="h-5 w-5 text-tiffany" />}
                    {activity.type === "article_read" && <BookOpen className="h-5 w-5 text-purple-500" />}
                    {activity.type === "streak" && <Flame className="h-5 w-5 text-orange-500" />}
                    {activity.type === "challenge" && <Target className="h-5 w-5 text-pink-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.description}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    +{activity.xpEarned} XP
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Achievements ({achievements.length})
              </h3>
              <Link
                href="/achievements"
                className="text-sm text-tiffany hover:underline flex items-center gap-1"
              >
                View All
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                >
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                    {achievement.icon}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {achievement.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    +{achievement.xpReward} XP
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-6">
          {/* Daily Challenges */}
          <DailyChallengesWidget email={email} />

          {/* Leaderboard */}
          <LeaderboardCompact limit={5} />

          {/* Next Milestone */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-tiffany" />
              Next Milestones
            </h4>
            <div className="space-y-3">
              <MilestoneItem
                label="50 Documents Viewed"
                current={stats.documentsViewed}
                target={50}
                reward={75}
              />
              <MilestoneItem
                label="14-Day Streak"
                current={stats.currentStreak}
                target={14}
                reward={100}
              />
              <MilestoneItem
                label="Level 8"
                current={stats.progressToNextLevel}
                target={100}
                reward={200}
                isPercentage
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  trend?: number;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        {icon}
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend > 0 ? "text-green-600" : "text-red-500"}`}>
            {trend > 0 ? "+" : ""}{trend} this week
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}

function MilestoneItem({
  label,
  current,
  target,
  reward,
  isPercentage = false,
}: {
  label: string;
  current: number;
  target: number;
  reward: number;
  isPercentage?: boolean;
}) {
  const progress = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-amber-600 font-medium">+{reward} XP</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isComplete ? "bg-green-500" : "bg-tiffany"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
          {isPercentage ? `${current}%` : `${current}/${target}`}
        </span>
      </div>
    </div>
  );
}

export default UserProgressDashboard;
