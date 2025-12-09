import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createTeam,
  getTeam,
  getTeamMembers,
  getTeamStats,
  getTeamLeaderboard,
  addTeamMember,
  getTeamDiscount,
} from "@/lib/teams/team-logic";

/**
 * POST /api/teams
 * Create a new team
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
    const { name, description, isPrivate } = body;

    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Team name must be at least 3 characters" },
        { status: 400 }
      );
    }

    const team = createTeam(name, user.id, description, isPrivate);

    // Award XP for creating a team
    try {
      await fetch(`${request.nextUrl.origin}/api/xp/earn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_team",
          metadata: { teamId: team.id, teamName: team.name },
        }),
      });
    } catch (xpError) {
      console.error("Failed to award team creation XP:", xpError);
    }

    return NextResponse.json({
      success: true,
      team,
      message: "Team created successfully!",
    });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/teams
 * Get team list or specific team details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("id");
    const leaderboard = searchParams.get("leaderboard");

    // Get leaderboard
    if (leaderboard === "true") {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Get user's team for highlighting
      const currentTeamId = searchParams.get("currentTeamId") || undefined;

      const leaderboardData = getTeamLeaderboard(20, currentTeamId);

      return NextResponse.json({
        success: true,
        leaderboard: leaderboardData,
      });
    }

    // Get specific team
    if (teamId) {
      const team = getTeam(teamId);
      if (!team) {
        return NextResponse.json(
          { error: "Team not found" },
          { status: 404 }
        );
      }

      const members = getTeamMembers(teamId);
      const stats = getTeamStats(teamId);
      const discount = getTeamDiscount(members.length);

      return NextResponse.json({
        success: true,
        team,
        members,
        stats,
        discount,
      });
    }

    // Return empty list for now (in production, would list user's teams)
    return NextResponse.json({
      success: true,
      teams: [],
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
