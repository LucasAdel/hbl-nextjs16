"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Trophy,
  Target,
  Zap,
  Crown,
  Medal,
  Star,
  Flame,
  Gift,
  ChevronRight,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import {
  getTeamChallengesWithProgress,
  getTeamLeaderboard,
  getTeamStats,
  getTeamMembers,
  calculateTeamReward,
  getTeamDiscount,
  getTeamNearMissMessage,
  TEAM_CHALLENGES,
} from "@/lib/teams/team-logic";
import type {
  Team,
  TeamChallenge,
  TeamChallengeProgress,
  TeamLeaderboardEntry,
  TeamRewardResult,
  ChallengeRarity,
} from "@/lib/teams/team-types";

interface TeamChallengesProps {
  team: Team;
  userId: string;
  onJoinTeam?: () => void;
  onCreateTeam?: () => void;
}

const rarityColors: Record<ChallengeRarity, { bg: string; text: string; border: string }> = {
  common: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
  rare: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
  epic: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
  legendary: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
};

const rarityIcons: Record<ChallengeRarity, React.ElementType> = {
  common: Star,
  rare: Medal,
  epic: Crown,
  legendary: Trophy,
};

export function TeamChallenges({
  team,
  userId,
  onJoinTeam,
  onCreateTeam,
}: TeamChallengesProps) {
  const [challenges, setChallenges] = useState<
    (TeamChallenge & { progress: TeamChallengeProgress })[]
  >([]);
  const [leaderboard, setLeaderboard] = useState<TeamLeaderboardEntry[]>([]);
  const [showReward, setShowReward] = useState<TeamRewardResult | null>(null);
  const [activeTab, setActiveTab] = useState<"challenges" | "leaderboard" | "members">("challenges");

  const members = getTeamMembers(team.id);
  const stats = getTeamStats(team.id);
  const discount = getTeamDiscount(members.length);

  useEffect(() => {
    // Load challenges and leaderboard
    setChallenges(getTeamChallengesWithProgress(team.id));
    setLeaderboard(getTeamLeaderboard(10, team.id));
  }, [team.id]);

  const triggerCelebration = (reward: TeamRewardResult) => {
    setShowReward(reward);

    // Trigger confetti based on rarity
    if (reward.rarity === "jackpot") {
      // Gold shower
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#FFD700", "#FFA500", "#FFFF00"],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#FFD700", "#FFA500", "#FFFF00"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else if (reward.rarity === "rare") {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#3B82F6", "#1D4ED8", "#60A5FA"],
      });
    } else if (reward.rarity === "bonus") {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    setTimeout(() => setShowReward(null), 4000);
  };

  // Demo: Simulate completing a challenge
  const handleCompleteChallenge = (challenge: TeamChallenge) => {
    const reward = calculateTeamReward(
      challenge.xpReward,
      challenge.rarity,
      members.length
    );
    triggerCelebration(reward);
  };

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{team.name}</h2>
                <p className="text-indigo-200">
                  {members.length} members • Rank #{stats?.rank || "-"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold">
                {stats?.totalXp.toLocaleString() || 0} XP
              </div>
              <div className="flex items-center gap-2 text-indigo-200">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>{stats?.currentStreak || 0} day streak</span>
              </div>
            </div>
          </div>

          {/* Team Discount Banner */}
          {discount.discount > 0 && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-300" />
                <span>{discount.tier}: {Math.round(discount.discount * 100)}% off all purchases!</span>
              </div>
              {discount.nextTier && (
                <Badge variant="secondary" className="bg-white/20">
                  {discount.nextTier.membersNeeded} more for {Math.round(discount.nextTier.discount * 100)}% off
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(["challenges", "leaderboard", "members"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Challenges Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "challenges" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Active Challenges */}
            <div className="grid gap-4 md:grid-cols-2">
              {challenges.slice(0, 6).map((challenge) => {
                const RarityIcon = rarityIcons[challenge.rarity];
                const colors = rarityColors[challenge.rarity];
                const nearMissMessage = getTeamNearMissMessage(
                  challenge.progress,
                  challenge
                );
                const isComplete = challenge.progress.percentComplete >= 100;

                return (
                  <motion.div
                    key={challenge.id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card
                      className={`overflow-hidden ${
                        isComplete ? "ring-2 ring-green-500" : ""
                      }`}
                    >
                      <CardHeader className={`pb-2 ${colors.bg}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <RarityIcon className={`w-5 h-5 ${colors.text}`} />
                            <CardTitle className="text-base">
                              {challenge.name}
                            </CardTitle>
                          </div>
                          <Badge className={`${colors.bg} ${colors.text} ${colors.border}`}>
                            {challenge.rarity}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-600 mb-3">
                          {challenge.description}
                        </p>

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium">
                              {Math.round(challenge.progress.percentComplete)}%
                            </span>
                          </div>
                          <Progress
                            value={challenge.progress.percentComplete}
                            className="h-2"
                          />
                        </div>

                        {/* Near-miss message */}
                        {nearMissMessage && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700 flex items-start gap-2"
                          >
                            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{nearMissMessage}</span>
                          </motion.div>
                        )}

                        {/* Reward */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span>{challenge.xpReward.toLocaleString()} XP</span>
                            {challenge.bonusXpReward > 0 && (
                              <span className="text-purple-600">
                                (+{challenge.bonusXpReward} bonus chance)
                              </span>
                            )}
                          </div>

                          {isComplete ? (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleCompleteChallenge(challenge)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Claim
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled>
                              <Target className="w-4 h-4 mr-1" />
                              In Progress
                            </Button>
                          )}
                        </div>

                        {/* Top Contributors */}
                        {challenge.progress.contributors.length > 0 && (
                          <div className="mt-4 pt-3 border-t">
                            <p className="text-xs text-gray-500 mb-2">
                              Top Contributors
                            </p>
                            <div className="flex -space-x-2">
                              {challenge.progress.contributors
                                .slice(0, 5)
                                .map((contributor, i) => (
                                  <div
                                    key={contributor.userId}
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                                    title={`${contributor.userName}: ${Math.round(contributor.percentage)}%`}
                                  >
                                    {contributor.userName.charAt(0).toUpperCase()}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Team Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.teamId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        entry.isCurrentTeam
                          ? "bg-indigo-50 border border-indigo-200"
                          : "bg-gray-50"
                      }`}
                    >
                      {/* Rank */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          entry.rank === 1
                            ? "bg-amber-400 text-white"
                            : entry.rank === 2
                            ? "bg-gray-400 text-white"
                            : entry.rank === 3
                            ? "bg-orange-400 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {entry.rank}
                      </div>

                      {/* Team Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.teamName}</span>
                          {entry.isCurrentTeam && (
                            <Badge variant="secondary" className="text-xs">
                              Your Team
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {entry.memberCount} members • {entry.challengesCompleted} challenges
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="font-bold text-indigo-600">
                          {entry.totalXp.toLocaleString()} XP
                        </div>
                        <div className="text-sm text-gray-500 flex items-center justify-end gap-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          +{entry.weeklyXp.toLocaleString()} this week
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {leaderboard.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No teams on the leaderboard yet. Be the first!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members ({members.length})
                </CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Invite
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-gray-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {member.user?.name?.charAt(0) || "U"}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {member.user?.name || `Member ${member.userId.substring(0, 8)}`}
                          </span>
                          {member.role === "owner" && (
                            <Crown className="w-4 h-4 text-amber-500" />
                          )}
                          {member.role === "admin" && (
                            <Medal className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.xpContributed.toLocaleString()} XP contributed
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge
                          variant="secondary"
                          className={
                            member.role === "owner"
                              ? "bg-amber-100 text-amber-700"
                              : member.role === "admin"
                              ? "bg-blue-100 text-blue-700"
                              : ""
                          }
                        >
                          {member.role}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {member.challengesCompleted} challenges
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Celebration Modal */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowReward(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 0.5, repeat: 2 }}
                className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  showReward.rarity === "jackpot"
                    ? "bg-gradient-to-br from-amber-400 to-orange-500"
                    : showReward.rarity === "rare"
                    ? "bg-gradient-to-br from-purple-400 to-indigo-500"
                    : showReward.rarity === "bonus"
                    ? "bg-gradient-to-br from-blue-400 to-cyan-500"
                    : "bg-gradient-to-br from-green-400 to-emerald-500"
                }`}
              >
                {showReward.rarity === "jackpot" ? (
                  <Trophy className="w-12 h-12 text-white" />
                ) : (
                  <Zap className="w-12 h-12 text-white" />
                )}
              </motion.div>

              <h2 className="text-2xl font-bold mb-2">{showReward.message}</h2>

              <div className="space-y-2 mb-6">
                <p className="text-gray-600">Base XP: +{showReward.baseXp}</p>
                {showReward.bonusXp > 0 && (
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xl font-bold text-purple-600"
                  >
                    Bonus XP: +{showReward.bonusXp}!
                  </motion.p>
                )}
                <p className="text-3xl font-bold text-indigo-600">
                  Total: +{showReward.totalXp} XP
                </p>
              </div>

              <Button onClick={() => setShowReward(null)}>Awesome!</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
