/**
 * Public Heatmap Config API
 *
 * Returns the list of enabled pages for heatmap tracking.
 * This is a public endpoint (no auth required) because it's used
 * by the client-side AnalyticsProvider to initialize tracking.
 *
 * Only returns the page patterns - no sensitive configuration data.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch only enabled page patterns
    // Note: Table type will be available after running migration and regenerating types
    const { data, error } = await (supabase as any)
      .from("analytics_heatmap_config")
      .select("page_pattern")
      .eq("enabled", true);

    const configs = data as Array<{ page_pattern: string }> | null;

    if (error) {
      // Table might not exist yet - return empty array
      console.debug("Heatmap config query error:", error.message);
      return NextResponse.json({
        success: true,
        enabledPages: [],
      });
    }

    const enabledPages = configs?.map((c) => c.page_pattern) || [];

    return NextResponse.json({
      success: true,
      enabledPages,
    });
  } catch (error) {
    console.error("Failed to fetch heatmap config:", error);
    return NextResponse.json({
      success: true,
      enabledPages: [],
    });
  }
}
