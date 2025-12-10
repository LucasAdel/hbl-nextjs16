import { NextRequest, NextResponse } from "next/server";
import {
  getConversations,
  getConversationAnalytics,
  exportConversations,
  type ConversationFilters,
} from "@/lib/supabase/conversations";

/**
 * GET /api/admin/conversations
 * List conversations with filters, pagination, and analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check if requesting analytics
    const analytics = searchParams.get("analytics");
    if (analytics === "true") {
      const dateFrom = searchParams.get("dateFrom");
      const dateTo = searchParams.get("dateTo");

      const analyticsData = await getConversationAnalytics(
        dateFrom ? new Date(dateFrom) : undefined,
        dateTo ? new Date(dateTo) : undefined
      );

      return NextResponse.json({
        success: true,
        analytics: analyticsData,
      });
    }

    // Build filters from query params
    const filters: ConversationFilters = {};

    const status = searchParams.get("status");
    if (status && ["active", "completed", "abandoned"].includes(status)) {
      filters.status = status as "active" | "completed" | "abandoned";
    }

    const leadCategory = searchParams.get("leadCategory");
    if (leadCategory && ["hot", "warm", "cold"].includes(leadCategory)) {
      filters.leadCategory = leadCategory as "hot" | "warm" | "cold";
    }

    const dateFrom = searchParams.get("dateFrom");
    if (dateFrom) {
      filters.dateFrom = new Date(dateFrom);
    }

    const dateTo = searchParams.get("dateTo");
    if (dateTo) {
      filters.dateTo = new Date(dateTo);
    }

    const userEmail = searchParams.get("userEmail");
    if (userEmail) {
      filters.userEmail = userEmail;
    }

    const minLeadScore = searchParams.get("minLeadScore");
    if (minLeadScore) {
      filters.minLeadScore = parseInt(minLeadScore, 10);
    }

    const intent = searchParams.get("intent");
    if (intent) {
      filters.intent = intent;
    }

    const search = searchParams.get("search");
    if (search) {
      filters.search = search;
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    // Get conversations
    const result = await getConversations(filters, page, pageSize);

    return NextResponse.json({
      success: true,
      conversations: result.conversations,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / result.pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/conversations
 * Export conversations in various formats
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, filters, format = "json" } = body;

    if (action !== "export") {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    // Build filters
    const exportFilters: ConversationFilters = {};

    if (filters?.status) {
      exportFilters.status = filters.status;
    }
    if (filters?.leadCategory) {
      exportFilters.leadCategory = filters.leadCategory;
    }
    if (filters?.dateFrom) {
      exportFilters.dateFrom = new Date(filters.dateFrom);
    }
    if (filters?.dateTo) {
      exportFilters.dateTo = new Date(filters.dateTo);
    }
    if (filters?.userEmail) {
      exportFilters.userEmail = filters.userEmail;
    }
    if (filters?.minLeadScore) {
      exportFilters.minLeadScore = filters.minLeadScore;
    }

    // Export conversations
    const data = await exportConversations(
      exportFilters,
      format as "json" | "csv"
    );

    if (format === "csv") {
      return new Response(data, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="conversations-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(data),
    });
  } catch (error) {
    console.error("Error exporting conversations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export conversations" },
      { status: 500 }
    );
  }
}
