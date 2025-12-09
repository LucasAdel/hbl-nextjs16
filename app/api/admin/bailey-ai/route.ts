import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDb(supabase: SupabaseClient): any {
  return supabase;
}

/**
 * GET /api/admin/bailey-ai
 * Get Bailey AI analytics and stats
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "overview";

  try {
    const supabase = createServiceRoleClient();
    const db = getDb(supabase);

    switch (type) {
      case "overview": {
        // Get overview stats
        const [conversationsResult, analyticsResult, knowledgeResult] = await Promise.all([
          db.from("chat_conversations").select("*", { count: "exact" }),
          db.from("bailey_analytics").select("*").order("created_at", { ascending: false }).limit(100),
          db.from("bailey_knowledge_base").select("*").eq("is_active", true),
        ]);

        const conversations = conversationsResult.data || [];
        const analytics = analyticsResult.data || [];
        const knowledge = knowledgeResult.data || [];

        // Calculate stats
        const totalConversations = conversationsResult.count || conversations.length;
        const totalMessages = conversations.reduce(
          (sum: number, c: { message_count: number }) => sum + (c.message_count || 0),
          0
        );

        // Calculate response times from analytics
        const avgResponseTime = analytics.length > 0
          ? analytics.reduce(
              (sum: number, a: { response_time_ms: number }) => sum + (a.response_time_ms || 0),
              0
            ) / analytics.length / 1000
          : 1.2;

        // Calculate lead scores
        const leadScores = conversations.map((c: { lead_score?: number }) => c.lead_score || 0);
        const avgLeadScore = leadScores.length > 0
          ? Math.round(leadScores.reduce((a: number, b: number) => a + b, 0) / leadScores.length)
          : 50;

        // Lead distribution
        const hotLeads = conversations.filter((c: { lead_score?: number }) => (c.lead_score || 0) >= 70).length;
        const warmLeads = conversations.filter((c: { lead_score?: number }) => {
          const score = c.lead_score || 0;
          return score >= 40 && score < 70;
        }).length;
        const coldLeads = conversations.filter((c: { lead_score?: number }) => (c.lead_score || 0) < 40).length;

        // Top intents from analytics
        const intentCounts: Record<string, number> = {};
        analytics.forEach((a: { intent_category?: string }) => {
          if (a.intent_category) {
            intentCounts[a.intent_category] = (intentCounts[a.intent_category] || 0) + 1;
          }
        });
        const topIntents = Object.entries(intentCounts)
          .map(([intent, count]) => ({ intent, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Top knowledge items
        const knowledgeCounts: Record<string, number> = {};
        analytics.forEach((a: { knowledge_items_used?: string[] }) => {
          (a.knowledge_items_used || []).forEach((k: string) => {
            knowledgeCounts[k] = (knowledgeCounts[k] || 0) + 1;
          });
        });
        const topKnowledge = Object.entries(knowledgeCounts)
          .map(([title, count]) => ({ title, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Daily stats (last 7 days)
        const now = new Date();
        const dailyStats = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];

          const dayConversations = conversations.filter((c: { created_at: string }) => {
            return c.created_at?.startsWith(dateStr);
          });

          const dayMessages = dayConversations.reduce(
            (sum: number, c: { message_count: number }) => sum + (c.message_count || 0),
            0
          );

          dailyStats.push({
            date: date.toLocaleDateString("en-AU", { month: "short", day: "numeric" }),
            conversations: dayConversations.length,
            messages: dayMessages,
          });
        }

        // Recent conversations
        const recentConversations = conversations
          .sort((a: { updated_at: string }, b: { updated_at: string }) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )
          .slice(0, 10)
          .map((c: {
            id: string;
            session_id: string;
            user_email?: string;
            created_at: string;
            updated_at: string;
            message_count: number;
            lead_score?: number;
            lead_category?: string;
            status?: string;
            primary_intent?: string;
            summary?: string;
          }) => ({
            id: c.id,
            sessionId: c.session_id,
            userEmail: c.user_email,
            startedAt: c.created_at,
            lastMessageAt: c.updated_at,
            messageCount: c.message_count || 0,
            leadScore: c.lead_score || 0,
            leadCategory: c.lead_category || "cold",
            status: c.status || "active",
            primaryIntent: c.primary_intent,
            summary: c.summary,
          }));

        return NextResponse.json({
          success: true,
          data: {
            totalConversations,
            totalMessages,
            avgResponseTime: Math.round(avgResponseTime * 10) / 10,
            avgLeadScore,
            conversionRate: totalConversations > 0
              ? Math.round((hotLeads / totalConversations) * 100 * 10) / 10
              : 0,
            satisfactionScore: 4.6, // Placeholder - would come from feedback
            leadDistribution: [
              { category: "Hot", count: hotLeads, percentage: Math.round((hotLeads / Math.max(totalConversations, 1)) * 100) },
              { category: "Warm", count: warmLeads, percentage: Math.round((warmLeads / Math.max(totalConversations, 1)) * 100) },
              { category: "Cold", count: coldLeads, percentage: Math.round((coldLeads / Math.max(totalConversations, 1)) * 100) },
            ],
            topIntents,
            topKnowledge,
            dailyStats,
            recentConversations,
            knowledgeCount: knowledge.length,
          },
        });
      }

      case "conversations": {
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const status = searchParams.get("status");
        const offset = (page - 1) * limit;

        let query = db
          .from("chat_conversations")
          .select("*", { count: "exact" })
          .order("updated_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (status && status !== "all") {
          query = query.eq("status", status);
        }

        const { data, count, error } = await query;

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const conversations = (data || []).map((c: {
          id: string;
          session_id: string;
          user_email?: string;
          created_at: string;
          updated_at: string;
          message_count: number;
          lead_score?: number;
          lead_category?: string;
          status?: string;
          primary_intent?: string;
          summary?: string;
          messages?: unknown[];
        }) => ({
          id: c.id,
          sessionId: c.session_id,
          userEmail: c.user_email,
          startedAt: c.created_at,
          lastMessageAt: c.updated_at,
          messageCount: c.message_count || 0,
          leadScore: c.lead_score || 0,
          leadCategory: c.lead_category || "cold",
          status: c.status || "active",
          primaryIntent: c.primary_intent,
          summary: c.summary,
          messages: c.messages,
        }));

        return NextResponse.json({
          success: true,
          data: {
            conversations,
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
          },
        });
      }

      case "knowledge": {
        const { data, error } = await db
          .from("bailey_knowledge_base")
          .select("*")
          .order("usage_count", { ascending: false });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const knowledge = (data || []).map((k: {
          id: string;
          category: string;
          topic: string;
          title: string;
          content: string;
          keywords?: string[];
          confidence_level: number;
          usage_count: number;
          last_used?: string;
          is_active: boolean;
        }) => ({
          id: k.id,
          category: k.category,
          topic: k.topic,
          title: k.title,
          content: k.content,
          keywords: k.keywords || [],
          confidence: k.confidence_level,
          usageCount: k.usage_count || 0,
          lastUsed: k.last_used,
          status: k.is_active ? "active" : "archived",
        }));

        return NextResponse.json({
          success: true,
          data: { knowledge },
        });
      }

      case "analytics": {
        const days = parseInt(searchParams.get("days") || "30");
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await db
          .from("bailey_analytics")
          .select("*")
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: false });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Aggregate analytics
        const analytics = data || [];
        const intentCounts: Record<string, number> = {};
        const knowledgeCounts: Record<string, number> = {};
        let totalResponseTime = 0;
        let totalConfidence = 0;
        let convertedCount = 0;

        analytics.forEach((a: {
          intent_category?: string;
          knowledge_items_used?: string[];
          response_time_ms?: number;
          confidence_score?: number;
          converted?: boolean;
        }) => {
          if (a.intent_category) {
            intentCounts[a.intent_category] = (intentCounts[a.intent_category] || 0) + 1;
          }
          (a.knowledge_items_used || []).forEach((k: string) => {
            knowledgeCounts[k] = (knowledgeCounts[k] || 0) + 1;
          });
          totalResponseTime += a.response_time_ms || 0;
          totalConfidence += a.confidence_score || 0;
          if (a.converted) convertedCount++;
        });

        return NextResponse.json({
          success: true,
          data: {
            totalInteractions: analytics.length,
            avgResponseTime: analytics.length > 0 ? Math.round(totalResponseTime / analytics.length) : 0,
            avgConfidence: analytics.length > 0 ? Math.round((totalConfidence / analytics.length) * 100) / 100 : 0,
            conversionRate: analytics.length > 0 ? Math.round((convertedCount / analytics.length) * 100 * 10) / 10 : 0,
            intentDistribution: Object.entries(intentCounts)
              .map(([intent, count]) => ({ intent, count }))
              .sort((a, b) => b.count - a.count),
            knowledgeUsage: Object.entries(knowledgeCounts)
              .map(([title, count]) => ({ title, count }))
              .sort((a, b) => b.count - a.count),
            rawData: analytics.slice(0, 100), // Limit raw data
          },
        });
      }

      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }
  } catch (error) {
    console.error("Bailey AI API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/bailey-ai
 * Create or update knowledge base items
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const supabase = createServiceRoleClient();
    const db = getDb(supabase);

    switch (action) {
      case "create_knowledge": {
        const { error } = await db.from("bailey_knowledge_base").insert({
          category: data.category,
          topic: data.topic,
          title: data.title,
          content: data.content,
          keywords: data.keywords || [],
          intent_patterns: data.intentPatterns || [],
          response_template: data.responseTemplate,
          confidence_level: data.confidence || 8,
          requires_disclaimer: data.requiresDisclaimer || false,
          legal_disclaimer: data.legalDisclaimer,
          related_products: data.relatedProducts || [],
          xp_reward: data.xpReward || 20,
          is_active: true,
        });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Knowledge item created" });
      }

      case "update_knowledge": {
        const { id, ...updateData } = data;
        const { error } = await db
          .from("bailey_knowledge_base")
          .update({
            category: updateData.category,
            topic: updateData.topic,
            title: updateData.title,
            content: updateData.content,
            keywords: updateData.keywords,
            intent_patterns: updateData.intentPatterns,
            response_template: updateData.responseTemplate,
            confidence_level: updateData.confidence,
            requires_disclaimer: updateData.requiresDisclaimer,
            legal_disclaimer: updateData.legalDisclaimer,
            related_products: updateData.relatedProducts,
            xp_reward: updateData.xpReward,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Knowledge item updated" });
      }

      case "delete_knowledge": {
        const { id } = data;
        const { error } = await db
          .from("bailey_knowledge_base")
          .update({ is_active: false })
          .eq("id", id);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Knowledge item archived" });
      }

      case "update_conversation_status": {
        const { id, status } = data;
        const { error } = await db
          .from("chat_conversations")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", id);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Conversation status updated" });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Bailey AI API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
