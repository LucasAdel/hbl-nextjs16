import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  createCalendarEvent,
  appointmentToCalendarEvent,
  tokensNeedRefresh,
  refreshAccessToken,
} from "@/lib/integrations/google-calendar";

// GET /api/integrations/google-calendar - Get auth URL or sync status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");

    if (action === "auth") {
      // Generate OAuth URL
      const state = user.id; // Use user ID as state for verification
      const authUrl = getGoogleAuthUrl(state);
      return NextResponse.json({ authUrl });
    }

    // Check if user has calendar connected
    // In production, you'd check a database table for stored tokens
    return NextResponse.json({
      connected: false,
      message: "Google Calendar integration ready",
    });
  } catch (error) {
    console.error("Google Calendar API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/integrations/google-calendar - Handle callback or sync event
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await request.json();
    const { action, code, appointment } = body;

    if (action === "callback" && code) {
      // Exchange authorization code for tokens
      try {
        const tokens = await exchangeCodeForTokens(code);

        // In production, store tokens in database securely
        // await supabase.from('user_integrations').upsert({
        //   user_id: user.id,
        //   provider: 'google_calendar',
        //   tokens: encrypt(tokens),
        // });

        return NextResponse.json({
          success: true,
          message: "Google Calendar connected successfully",
        });
      } catch (error) {
        console.error("Google Calendar connect error:", error instanceof Error ? error.message : error);
        return NextResponse.json(
          { error: "Failed to connect Google Calendar" },
          { status: 400 }
        );
      }
    }

    if (action === "sync" && appointment) {
      // In production, retrieve tokens from database
      // const { data: integration } = await supabase
      //   .from('user_integrations')
      //   .select('tokens')
      //   .eq('user_id', user.id)
      //   .eq('provider', 'google_calendar')
      //   .single();

      // For now, return mock success
      const event = appointmentToCalendarEvent(appointment);

      return NextResponse.json({
        success: true,
        message: "Event sync simulated (connect Google Calendar to enable)",
        event: {
          summary: event.summary,
          start: event.start,
          end: event.end,
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Google Calendar sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
