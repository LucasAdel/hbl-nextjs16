"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Crown, TrendingUp, ChevronUp, ChevronDown, Flame, Target, Users } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
  isCurrentUser?: boolean;
  change?: number; // Position change from last period
}

interface LeaderboardProps {
  currentUserEmail?: string;
  period?: "daily" | "weekly" | "monthly" | "all-time";
  limit?: number;
  className?: string;
}

// Simulated leaderboard data (in production, fetch from API)
const SAMPLE_LEADERS: Omit<LeaderboardEntry, "rank">[] = [
  { name: "Dr. Sarah M.", xp: 12450, level: 15, streak: 45, change: 0 },
  { name: "James T.", xp: 11200, level: 14, streak: 32, change: 2 },
  { name: "Dr. Chen", xp: 10800, level: 13, streak: 28, change: -1 },
  { name: "Emily W.", xp: 9500, level: 12, streak: 21, change: 1 },
  { name: "Michael S.", xp: 8900, level: 11, streak: 18, change: -2 },
  { name: "Dr. Patel", xp: 8200, level: 11, streak: 15, change: 3 },
  { name: "Jessica L.", xp: 7800, level: 10, streak: 14, change: 0 },
  { name: "Robert K.", xp: 7200, level: 10, streak: 12, change: -1 },
  { name: "Amanda B.", xp: 6800, level: 9, streak: 10, change: 2 },
  { name: "David H.", xp: 6500, level: 9, streak: 9, change: 0 },
  { name: "Dr. Thompson", xp: 6200, level: 8, streak: 8, change: -3 },
  { name: "Lisa R.", xp: 5900, level: 8, streak: 7, change: 1 },
  { name: "Andrew G.", xp: 5600, level: 7, streak: 6, change: 0 },
  { name: "Rachel C.", xp: 5300, level: 7, streak: 5, change: 2 },
  { name: "Mark D.", xp: 5000, level: 6, streak: 4, change: -1 },
];

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
  }
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800";
    case 2:
      return "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-200 dark:border-gray-700";
    case 3:
      return "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800";
    default:
      return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
  }
}

export function Leaderboard({
  currentUserEmail,
  period = "weekly",
  limit = 10,
  className = "",
}: LeaderboardProps) {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const fetchLeaderboard = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 500));

      // Add ranks to leaders
      const rankedLeaders = SAMPLE_LEADERS.slice(0, limit).map((leader, i) => ({
        ...leader,
        rank: i + 1,
      }));

      // Simulate current user position (for near-miss psychology)
      if (currentUserEmail) {
        const userPosition = Math.floor(Math.random() * 5) + 8; // Position 8-12
        const mockUser: LeaderboardEntry = {
          rank: userPosition,
          name: "You",
          xp: 6000 + Math.floor(Math.random() * 500),
          level: 8,
          streak: 7,
          isCurrentUser: true,
          change: Math.floor(Math.random() * 5) - 2,
        };
        setUserRank(mockUser);

        // Insert user if they're in the visible range
        if (userPosition <= limit) {
          rankedLeaders.splice(userPosition - 1, 0, mockUser);
          // Re-rank
          rankedLeaders.forEach((l, i) => (l.rank = i + 1));
        }
      }

      setLeaders(rankedLeaders.slice(0, limit));
      setLoading(false);
    };

    fetchLeaderboard();
  }, [currentUserEmail, selectedPeriod, limit]);

  // Calculate near-miss message
  const getNearMissMessage = () => {
    if (!userRank) return null;
    if (userRank.rank <= 3) return "🏆 You're in the top 3! Keep it up!";
    if (userRank.rank <= 5) return `Just ${leaders[2]?.xp - userRank.xp} XP to reach the podium!`;
    if (userRank.rank <= 10) return `Only ${leaders[4]?.xp - userRank.xp} XP to break into top 5!`;
    return `Complete 2 more activities to climb the ranks!`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            <h3 className="font-bold text-lg">Leaderboard</h3>
          </div>
          <div className="flex items-center gap-1 text-sm bg-white/20 rounded-full px-3 py-1">
            <Users className="h-4 w-4" />
            <span>{SAMPLE_LEADERS.length} competitors</span>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {(["daily", "weekly", "monthly", "all-time"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedPeriod === p
                  ? "bg-white text-amber-600"
                  : "bg-white/20 hover:bg-white/30"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Near-miss motivation banner */}
      {userRank && userRank.rank > 3 && (
        <div className="bg-gradient-to-r from-tiffany/10 to-blue-500/10 dark:from-tiffany/20 dark:to-blue-500/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-tiffany" />
            <span className="font-medium text-gray-900 dark:text-white">
              {getNearMissMessage()}
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {loading ? (
          // Skeleton loader
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          leaders.map((entry) => (
            <div
              key={entry.rank}
              className={`p-4 transition-colors ${getRankStyle(entry.rank)} ${
                entry.isCurrentUser ? "ring-2 ring-tiffany ring-inset" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="w-8 h-8 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tiffany to-tiffany-dark flex items-center justify-center text-white font-bold">
                  {entry.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold truncate ${entry.isCurrentUser ? "text-tiffany" : "text-gray-900 dark:text-white"}`}>
                      {entry.name}
                    </span>
                    {entry.streak >= 7 && (
                      <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                        <Flame className="h-3 w-3" />
                        {entry.streak}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Level {entry.level} • {entry.xp.toLocaleString()} XP
                  </div>
                </div>

                {/* Position Change */}
                {entry.change !== undefined && entry.change !== 0 && (
                  <div className={`flex items-center gap-0.5 text-sm font-medium ${
                    entry.change > 0 ? "text-green-600" : "text-red-500"
                  }`}>
                    {entry.change > 0 ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {Math.abs(entry.change)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* User's position if not in visible range */}
      {userRank && userRank.rank > limit && (
        <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-tiffany/5 dark:bg-tiffany/10">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <span className="text-sm font-bold text-tiffany">#{userRank.rank}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tiffany to-tiffany-dark flex items-center justify-center text-white font-bold">
                Y
              </div>
              <div className="flex-1">
                <div className="font-semibold text-tiffany">You</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Level {userRank.level} • {userRank.xp.toLocaleString()} XP
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {leaders[limit - 1]?.xp - userRank.xp} XP to top {limit}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Climb the Ranks
        </button>
      </div>
    </div>
  );
}

// Compact leaderboard for sidebar/widget use
export function LeaderboardCompact({ limit = 5 }: { limit?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          Top {limit}
        </h4>
        <span className="text-xs text-gray-500 dark:text-gray-400">This Week</span>
      </div>

      <div className="space-y-3">
        {SAMPLE_LEADERS.slice(0, limit).map((leader, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 text-center">
              {i === 0 && <Crown className="h-4 w-4 text-yellow-500 mx-auto" />}
              {i === 1 && <Medal className="h-4 w-4 text-gray-400 mx-auto" />}
              {i === 2 && <Medal className="h-4 w-4 text-amber-600 mx-auto" />}
              {i > 2 && <span className="text-xs font-medium text-gray-400">{i + 1}</span>}
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tiffany/80 to-tiffany-dark/80 flex items-center justify-center text-white text-sm font-medium">
              {leader.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {leader.name}
              </div>
            </div>
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              {(leader.xp / 1000).toFixed(1)}k
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
