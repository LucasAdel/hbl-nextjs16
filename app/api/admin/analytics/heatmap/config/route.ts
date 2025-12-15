import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/admin-auth";

/**
 * GET /api/admin/analytics/heatmap/config
 *
 * Get list of pages configured for heatmap tracking.
 */
export async function GET() {
  try {
    // Verify admin permissions
    const auth = await requirePermission(PERMISSIONS.VIEW_ANALYTICS);
    if (!auth.authorized) {
      return auth.response;
    }

    const supabase = await createClient();

    // Note: Table type will be available after running migration and regenerating types
    // Using explicit any type to bypass type checking until migration is run
    const { data, error } = await (supabase as any)
      .from("analytics_heatmap_config")
      .select("*")
      .order("page_pattern", { ascending: true });

    const configs = data as Array<{
      id: string;
      page_pattern: string;
      enabled: boolean;
      description: string | null;
      click_count?: number;
      created_at: string;
      updated_at: string;
    }> | null;

    if (error) {
      // Table might not exist yet - return default config
      if (error.code === "42P01") {
        return NextResponse.json({
          success: true,
          data: {
            pages: getDefaultConfig(),
            enabledPages: getDefaultConfig().filter((p) => p.enabled).map((p) => p.page_pattern),
          },
        });
      }
      throw error;
    }

    const enabledPages = (configs || [])
      .filter((c) => c.enabled)
      .map((c) => c.page_pattern);

    return NextResponse.json({
      success: true,
      data: {
        pages: configs || [],
        enabledPages,
      },
    });
  } catch (error) {
    console.error("Heatmap config GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch heatmap config" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/analytics/heatmap/config
 *
 * Add or update a page in heatmap tracking config.
 * Body: { page_pattern: string, enabled: boolean, description?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin permissions
    const auth = await requirePermission(PERMISSIONS.VIEW_ANALYTICS);
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const { page_pattern, enabled, description } = body;

    if (!page_pattern || typeof page_pattern !== "string") {
      return NextResponse.json(
        { error: "page_pattern is required" },
        { status: 400 }
      );
    }

    // Validate page pattern
    if (!page_pattern.startsWith("/")) {
      return NextResponse.json(
        { error: "page_pattern must start with /" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from("analytics_heatmap_config")
      .upsert({
        page_pattern: page_pattern.trim(),
        enabled: enabled !== false, // Default to true
        description: description || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "page_pattern",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Heatmap config POST error:", error);
    return NextResponse.json(
      { error: "Failed to update heatmap config" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/analytics/heatmap/config
 *
 * Remove a page from heatmap tracking config.
 * Query param: page_pattern
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin permissions
    const auth = await requirePermission(PERMISSIONS.VIEW_ANALYTICS);
    if (!auth.authorized) {
      return auth.response;
    }

    const searchParams = request.nextUrl.searchParams;
    const pagePattern = searchParams.get("page_pattern");

    if (!pagePattern) {
      return NextResponse.json(
        { error: "page_pattern query param is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await (supabase as any)
      .from("analytics_heatmap_config")
      .delete()
      .eq("page_pattern", pagePattern);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Removed ${pagePattern} from heatmap tracking`,
    });
  } catch (error) {
    console.error("Heatmap config DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete heatmap config" },
      { status: 500 }
    );
  }
}

/**
 * Default heatmap configuration
 */
function getDefaultConfig() {
  return [
    { page_pattern: "/", enabled: true, description: "Homepage" },
    { page_pattern: "/services", enabled: true, description: "Services page" },
    { page_pattern: "/contact", enabled: true, description: "Contact page" },
    { page_pattern: "/book-appointment", enabled: true, description: "Booking page" },
    { page_pattern: "/about", enabled: true, description: "About page" },
  ];
}
