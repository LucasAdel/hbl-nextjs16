import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/admin-auth";

/**
 * POST /api/admin/analytics/sessions/[sessionId]/generate-summary
 *
 * Generate an AI summary of a session using Gemini Flash (free tier).
 * Falls back to a rule-based summary if AI is unavailable.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Verify admin permissions
    const auth = await requirePermission(PERMISSIONS.VIEW_ANALYTICS);
    if (!auth.authorized) {
      return auth.response;
    }

    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch all events for this session
    // Note: Using any to bypass type checking until types are regenerated
    const { data: events, error: eventsError } = await (supabase as any)
      .from("analytics_events")
      .select("timestamp, event_name, event_category, page_url, page_title, properties")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: true });

    if (eventsError) {
      throw eventsError;
    }

    if (!events || events.length === 0) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Generate the summary
    let summary: GeneratedSummary;

    const googleApiKey = process.env.GOOGLE_AI_API_KEY;
    if (googleApiKey) {
      summary = await generateAISummary(events, googleApiKey);
    } else {
      summary = generateRuleBasedSummary(events);
    }

    // Store the summary
    // Note: Table type will be available after running migration and regenerating types
    const { error: insertError } = await (supabase as any)
      .from("analytics_session_summaries")
      .upsert({
        session_id: sessionId,
        summary: summary.text,
        key_actions: summary.keyActions,
        pages_visited: summary.pagesVisited,
        total_events: events.length,
        duration_seconds: summary.durationSeconds,
        conversion_intent: summary.conversionIntent,
        model_used: summary.modelUsed,
        generated_at: new Date().toISOString(),
      }, {
        onConflict: "session_id",
      });

    if (insertError) {
      console.error("Failed to store summary:", insertError);
      // Continue - we can still return the summary even if storage fails
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: summary.text,
        key_actions: summary.keyActions,
        conversion_intent: summary.conversionIntent,
        model_used: summary.modelUsed,
      },
    });
  } catch (error) {
    console.error("Generate summary API error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}

// Types
interface SessionEvent {
  timestamp: string;
  event_name: string;
  event_category: string;
  page_url: string | null;
  page_title: string | null;
  properties: Record<string, unknown> | null;
}

interface GeneratedSummary {
  text: string;
  keyActions: string[];
  pagesVisited: number;
  durationSeconds: number;
  conversionIntent: "high" | "medium" | "low" | "none";
  modelUsed: string;
}

/**
 * Generate AI-powered summary using Gemini Flash
 */
async function generateAISummary(
  events: SessionEvent[],
  apiKey: string
): Promise<GeneratedSummary> {
  const firstEvent = events[0];
  const lastEvent = events[events.length - 1];
  const durationSeconds = Math.round(
    (new Date(lastEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime()) / 1000
  );
  const uniquePages = new Set(events.map((e) => e.page_url).filter(Boolean));

  // Build event timeline for prompt
  const eventSummary = events
    .slice(0, 50) // Limit to first 50 events to avoid token limits
    .map((e) => {
      const time = new Date(e.timestamp).toLocaleTimeString();
      const page = e.page_url || "unknown page";
      return `- ${time}: ${e.event_name} on ${page}`;
    })
    .join("\n");

  const prompt = `You are analysing a user session on a law firm website (Hamilton Bailey Legal - specialising in medical practice law).

SESSION DATA:
Duration: ${Math.round(durationSeconds / 60)} minutes
Pages visited: ${uniquePages.size}
Total events: ${events.length}

EVENT TIMELINE:
${eventSummary}

TASK: Provide a concise analysis in JSON format with these exact fields:
{
  "summary": "A 2-3 sentence narrative summary of the user's journey and behaviour",
  "keyActions": ["Array of 3-5 key actions taken"],
  "conversionIntent": "high|medium|low|none based on engagement signals"
}

ANALYSIS GUIDELINES:
- High intent: viewed booking page, submitted contact form, spent >5 mins, viewed multiple service pages
- Medium intent: viewed services, spent 2-5 mins, viewed pricing/about
- Low intent: quick visit, bounced, only viewed 1-2 pages
- None: bot-like behaviour, immediate bounce

Respond with ONLY the JSON object, no markdown or explanation.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.status, await response.text());
      return generateRuleBasedSummary(events);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      return generateRuleBasedSummary(events);
    }

    // Parse JSON response
    const cleanedJson = textContent.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      text: parsed.summary || "Session analysis unavailable.",
      keyActions: Array.isArray(parsed.keyActions) ? parsed.keyActions : [],
      pagesVisited: uniquePages.size,
      durationSeconds,
      conversionIntent: validateIntent(parsed.conversionIntent),
      modelUsed: "gemini-1.5-flash",
    };
  } catch (error) {
    console.error("AI summary generation failed:", error);
    return generateRuleBasedSummary(events);
  }
}

/**
 * Generate rule-based summary when AI is unavailable
 */
function generateRuleBasedSummary(events: SessionEvent[]): GeneratedSummary {
  const firstEvent = events[0];
  const lastEvent = events[events.length - 1];
  const durationSeconds = Math.round(
    (new Date(lastEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime()) / 1000
  );
  const uniquePages = new Set(events.map((e) => e.page_url).filter(Boolean));
  const durationMinutes = Math.round(durationSeconds / 60);

  // Detect key actions
  const keyActions: string[] = [];
  const eventNames = events.map((e) => e.event_name);

  if (eventNames.includes("page_view")) {
    keyActions.push(`Viewed ${uniquePages.size} page(s)`);
  }
  if (eventNames.includes("contact_submitted") || eventNames.includes("form_submit")) {
    keyActions.push("Submitted a contact form");
  }
  if (eventNames.includes("booking_confirmed") || eventNames.includes("checkout_complete")) {
    keyActions.push("Completed a booking");
  }
  if (events.some((e) => e.page_url?.includes("/services"))) {
    keyActions.push("Explored services");
  }
  if (events.some((e) => e.page_url?.includes("/codex"))) {
    keyActions.push("Read legal articles");
  }
  if (events.some((e) => e.page_url?.includes("/book-appointment"))) {
    keyActions.push("Viewed booking page");
  }

  // Determine conversion intent
  let conversionIntent: "high" | "medium" | "low" | "none" = "none";
  const hasConversion = eventNames.some((e) =>
    ["booking_confirmed", "contact_submitted", "purchase_complete"].includes(e)
  );
  const viewedBooking = events.some((e) => e.page_url?.includes("/book-appointment"));
  const viewedContact = events.some((e) => e.page_url?.includes("/contact"));
  const viewedServices = events.some((e) => e.page_url?.includes("/services"));

  if (hasConversion) {
    conversionIntent = "high";
  } else if (viewedBooking || (viewedContact && durationMinutes >= 2)) {
    conversionIntent = "high";
  } else if (viewedServices && durationMinutes >= 2) {
    conversionIntent = "medium";
  } else if (uniquePages.size >= 3 || durationMinutes >= 1) {
    conversionIntent = "low";
  }

  // Generate summary text
  let summaryText = `User visited ${uniquePages.size} page(s) over ${durationMinutes} minute(s). `;

  if (hasConversion) {
    summaryText += "Successfully completed a conversion action. ";
  } else if (viewedBooking) {
    summaryText += "Showed strong interest by viewing the booking page but did not complete. ";
  } else if (viewedServices) {
    summaryText += "Explored service offerings. ";
  } else if (uniquePages.size === 1) {
    summaryText += "Brief visit with limited engagement. ";
  }

  return {
    text: summaryText.trim(),
    keyActions: keyActions.length > 0 ? keyActions : ["Browsed website"],
    pagesVisited: uniquePages.size,
    durationSeconds,
    conversionIntent,
    modelUsed: "rule-based",
  };
}

/**
 * Validate and normalize conversion intent value
 */
function validateIntent(intent: string): "high" | "medium" | "low" | "none" {
  const valid = ["high", "medium", "low", "none"];
  const normalized = intent?.toLowerCase?.();
  return valid.includes(normalized) ? (normalized as "high" | "medium" | "low" | "none") : "none";
}
