"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Trophy,
  Sparkles,
  ArrowRight,
  Shield,
  Target,
  Gift,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeamChallenges } from "@/components/teams/TeamChallenges";
import { createTeam, getTeamLeaderboard } from "@/lib/teams/team-logic";
import type { Team, TeamLeaderboardEntry } from "@/lib/teams/team-types";

export default function TeamsPage() {
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [leaderboard, setLeaderboard] = useState<TeamLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load leaderboard on mount
    const data = getTeamLeaderboard(5);
    setLeaderboard(data);
    setIsLoading(false);
  }, []);

  const handleCreateTeam = () => {
    if (teamName.trim().length < 3) return;

    const team = createTeam(teamName, "demo-user", teamDescription);
    setUserTeam(team);
    setShowCreateModal(false);
    setTeamName("");
    setTeamDescription("");
  };

  // If user has a team, show team dashboard
  if (userTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <TeamChallenges
            team={userTeam}
            userId="demo-user"
            onJoinTeam={() => {}}
            onCreateTeam={() => setUserTeam(null)}
          />
        </div>
      </div>
    );
  }

  // Show team landing page
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6"
          >
            <Sparkles className="w-4 h-4" />
            B2B Team Discounts Up to 25% Off
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Team Challenges
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8"
          >
            Join forces with your practice. Complete challenges together,
            earn bonus XP, and unlock exclusive team discounts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-indigo-50"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create a Team
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Search className="w-5 h-5 mr-2" />
              Join a Team
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          Why Join a Team?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                  <Gift className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Team Discounts</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Teams of 3+ get 10% off. Teams of 10+ get 20% off.
                  Enterprise teams get 25% off everything.
                </p>
                <div className="text-2xl font-bold text-amber-600">
                  Up to 25% Off
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Team Challenges</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Complete challenges together for massive XP bonuses.
                  Variable rewards mean unpredictable jackpots!
                </p>
                <div className="text-2xl font-bold text-purple-600">
                  10,000+ Bonus XP
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Compete & Win</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Climb the team leaderboard. Top teams get featured
                  and earn exclusive recognition.
                </p>
                <div className="text-2xl font-bold text-blue-600">
                  Global Leaderboard
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Top Teams
                </span>
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading leaderboard...
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.teamId}
                      className="flex items-center gap-4 p-3 rounded-lg bg-gray-50"
                    >
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
                      <div className="flex-1">
                        <span className="font-medium">{entry.teamName}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {entry.memberCount} members
                        </span>
                      </div>
                      <div className="font-bold text-indigo-600">
                        {entry.totalXp.toLocaleString()} XP
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No teams yet. Be the first to create one!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: 1,
              title: "Create or Join",
              description: "Start your own team or join an existing one",
            },
            {
              step: 2,
              title: "Invite Members",
              description: "Grow your team with colleagues and friends",
            },
            {
              step: 3,
              title: "Complete Challenges",
              description: "Work together on weekly and monthly challenges",
            },
            {
              step: 4,
              title: "Earn Rewards",
              description: "Get bonus XP, discounts, and climb the leaderboard",
            },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                {item.step}
              </div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to team up?
          </h2>
          <p className="text-indigo-100 mb-6 max-w-xl mx-auto">
            Create your team now and start earning bonus XP together.
            The more members, the bigger the discounts!
          </p>
          <Button
            size="lg"
            className="bg-white text-indigo-600 hover:bg-indigo-50"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your Team
          </Button>
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md mx-4 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Create a Team
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name *
                </label>
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Melbourne Medical Practice"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <Input
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Brief description of your team"
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleCreateTeam}
                  disabled={teamName.trim().length < 3}
                >
                  Create Team
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
