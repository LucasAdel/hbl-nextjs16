import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getTeamChallengesWithProgress,
  updateChallengeProgress,
  calculateTeamReward,
  getTeamMembers,
  addTeamXp,
  TEAM_CHALLENGES,
} from "@/lib/teams/team-logic";

/**
 * GET /api/teams/challenges?teamId=xxx
 * Get team challenges with progress
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    const challenges = getTeamChallengesWithProgress(teamId);

    return NextResponse.json({
      success: true,
      challenges,
    });
  } catch (error) {
    console.error("Error fetching team challenges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teams/challenges
 * Update challenge progress or claim reward
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { teamId, challengeId, action, contribution } = body;

    if (!teamId || !challengeId) {
      return NextResponse.json(
        { error: "Team ID and Challenge ID are required" },
        { status: 400 }
      );
    }

    // Claim reward action
    if (action === "claim") {
      const challenge = TEAM_CHALLENGES.find((c) => c.id === challengeId);
      if (!challenge) {
        return NextResponse.json(
          { error: "Challenge not found" },
          { status: 404 }
        );
      }

      const members = getTeamMembers(teamId);
      const reward = calculateTeamReward(
        challenge.xpReward,
        challenge.rarity,
        members.length
      );

      // Distribute XP to team
      addTeamXp(teamId, user.id, reward.totalXp, `challenge:${challengeId}`);

      // Award individual XP
      try {
        await fetch(`${request.nextUrl.origin}/api/xp/earn`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "complete_team_challenge",
            metadata: {
              teamId,
              challengeId,
              challengeName: challenge.name,
              teamReward: reward.totalXp,
            },
          }),
        });
      } catch (xpError) {
        console.error("Failed to award individual XP:", xpError);
      }

      return NextResponse.json({
        success: true,
        reward,
        message: reward.message,
      });
    }

    // Update progress action
    if (action === "progress" && contribution) {
      const progress = updateChallengeProgress(
        teamId,
        challengeId,
        user.id,
        contribution
      );

      if (!progress) {
        return NextResponse.json(
          { error: "Failed to update progress" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        progress,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing challenge action:", error);
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    );
  }
}
