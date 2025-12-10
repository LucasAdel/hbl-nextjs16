/**
 * Admin Knowledge Base API Routes
 *
 * Provides admin-focused endpoints for managing knowledge base items
 * with test-match capabilities and AI draft generation.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  findRelevantKnowledge,
  detectIntent,
  type KnowledgeItem,
} from "@/features/bailey-ai/lib/knowledge-base";
import { knowledgeManager, getAllKnowledgeItems } from "@/lib/chat/knowledge-manager";
import * as supabaseKnowledge from "@/lib/supabase/knowledge";

/**
 * GET /api/admin/knowledge-base
 * List all knowledge items (combined static + database)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "test-match":
        // Test query matching in real-time
        const query = searchParams.get("query");
        if (!query) {
          return NextResponse.json(
            { success: false, error: "Query is required" },
            { status: 400 }
          );
        }

        const matches = findRelevantKnowledge(query);
        const intent = detectIntent(query);

        return NextResponse.json({
          success: true,
          data: {
            query,
            intent,
            matchCount: matches.length,
            matches: matches.map((item) => ({
              id: item.id,
              title: item.title,
              category: item.category,
              subcategory: item.subcategory,
              confidenceLevel: item.confidenceLevel,
              summary: item.summary,
              matchedKeywords: item.keywords.filter((k: string) =>
                query.toLowerCase().includes(k.toLowerCase())
              ),
            })),
          },
        });

      case "gaps":
        // Get knowledge gaps with pagination
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
        const priority = searchParams.get("priority") as "high" | "medium" | "low" | undefined;

        const gaps = await supabaseKnowledge.getKnowledgeGaps();

        // Filter by priority if specified
        let filteredGaps = gaps;
        if (priority) {
          filteredGaps = gaps.filter((g) => g.priority === priority);
        }

        // Sort by frequency (highest first) then by created date
        filteredGaps.sort((a, b) => b.frequency - a.frequency);

        // Paginate
        const startIndex = (page - 1) * pageSize;
        const paginatedGaps = filteredGaps.slice(startIndex, startIndex + pageSize);

        return NextResponse.json({
          success: true,
          data: {
            gaps: paginatedGaps,
            pagination: {
              page,
              pageSize,
              total: filteredGaps.length,
              totalPages: Math.ceil(filteredGaps.length / pageSize),
            },
          },
        });

      case "analytics":
        const analytics = await supabaseKnowledge.getAnalytics();
        const usageStats = await supabaseKnowledge.getUsageStats();
        const feedbackForImprovement = await supabaseKnowledge.getFeedbackForImprovement();

        return NextResponse.json({
          success: true,
          data: {
            overview: analytics,
            topUsedItems: usageStats,
            itemsNeedingImprovement: feedbackForImprovement,
          },
        });

      default:
        // Get all items
        const staticItems = getAllKnowledgeItems();
        const dbItems = await supabaseKnowledge.getKnowledgeItems();

        // Combine and categorize
        const allItems = [
          ...staticItems.map((item: KnowledgeItem) => ({
            ...item,
            source: "static" as const,
            isEditable: false,
          })),
          ...dbItems.map((item) => ({
            id: item.id,
            category: item.category,
            subcategory: item.subcategory,
            topic: item.topic,
            title: item.title,
            content: item.content,
            summary: item.summary,
            keywords: item.keywords || [],
            intentPatterns: item.intent_patterns || [],
            responseTemplate: item.response_template,
            requiresDisclaimer: item.requires_disclaimer,
            legalDisclaimer: item.legal_disclaimer,
            adviceLevel: item.advice_level,
            confidenceLevel: item.confidence_level,
            relatedProducts: item.related_products || [],
            xpReward: item.xp_reward,
            isActive: item.is_active,
            source: "database" as const,
            isEditable: true,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          })),
        ];

        // Group by category
        const categories = [...new Set(allItems.map((item) => item.category))];

        return NextResponse.json({
          success: true,
          data: {
            items: allItems,
            categories,
            counts: {
              total: allItems.length,
              static: staticItems.length,
              database: dbItems.length,
              byCategory: categories.reduce((acc, cat) => {
                acc[cat] = allItems.filter((i) => i.category === cat).length;
                return acc;
              }, {} as Record<string, number>),
            },
          },
        });
    }
  } catch (error) {
    console.error("Admin knowledge base error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch knowledge data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/knowledge-base
 * Create or update knowledge items, generate drafts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "generate-draft":
        // Generate AI draft from a gap
        const { gapId, gapQuery, gapIntent } = body;
        if (!gapQuery) {
          return NextResponse.json(
            { success: false, error: "Gap query is required" },
            { status: 400 }
          );
        }

        // Generate draft using knowledge manager
        const draft = knowledgeManager.generateDraftFromGap({
          query: gapQuery,
          detectedIntent: gapIntent,
          frequency: body.frequency || 1,
          suggestedCategory: body.suggestedCategory,
          timestamp: new Date(),
          priority: "medium" as const,
        });

        return NextResponse.json({
          success: true,
          data: {
            draft,
            gapId,
            rationale: `Draft generated from query: "${gapQuery}"`,
          },
        });

      case "create":
        // Create a new knowledge item
        const { item } = body;
        if (!item) {
          return NextResponse.json(
            { success: false, error: "Item data is required" },
            { status: 400 }
          );
        }

        // Validate
        const validation = knowledgeManager.validateKnowledgeItem(item);
        if (!validation.valid) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            errors: validation.errors,
          }, { status: 400 });
        }

        // Transform to database format
        const dbItem = {
          category: item.category,
          subcategory: item.subcategory,
          topic: item.topic,
          title: item.title,
          content: item.content,
          summary: item.summary,
          keywords: item.keywords || [],
          intent_patterns: item.intentPatterns || [],
          response_template: item.responseTemplate,
          requires_disclaimer: item.requiresDisclaimer || false,
          legal_disclaimer: item.legalDisclaimer,
          advice_level: item.adviceLevel || "general",
          confidence_level: item.confidenceLevel || 7,
          related_products: item.relatedProducts || [],
          xp_reward: item.xpReward || 10,
          metadata: item.metadata || {},
          created_by: body.userId,
        };

        const created = await supabaseKnowledge.createKnowledgeItem(dbItem);
        if (!created) {
          return NextResponse.json(
            { success: false, error: "Failed to create item" },
            { status: 500 }
          );
        }

        // If created from a gap, mark it as addressed
        if (body.gapId) {
          await supabaseKnowledge.addressGap(body.gapId, created.id);
        }

        return NextResponse.json({
          success: true,
          data: created,
          message: "Knowledge item created successfully",
        });

      case "update":
        // Update an existing knowledge item
        const { id, updates } = body;
        if (!id || !updates) {
          return NextResponse.json(
            { success: false, error: "ID and updates are required" },
            { status: 400 }
          );
        }

        const updated = await supabaseKnowledge.updateKnowledgeItem(id, updates);
        if (!updated) {
          return NextResponse.json(
            { success: false, error: "Failed to update item" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: updated,
          message: "Knowledge item updated successfully",
        });

      case "delete":
        // Soft delete a knowledge item
        const { id: deleteId } = body;
        if (!deleteId) {
          return NextResponse.json(
            { success: false, error: "ID is required" },
            { status: 400 }
          );
        }

        const deleted = await supabaseKnowledge.deleteKnowledgeItem(deleteId);
        if (!deleted) {
          return NextResponse.json(
            { success: false, error: "Failed to delete item" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Knowledge item deleted successfully",
        });

      case "dismiss-gap":
        // Dismiss a knowledge gap (not worth creating content for)
        const { gapId: dismissGapId, reason } = body;
        if (!dismissGapId) {
          return NextResponse.json(
            { success: false, error: "Gap ID is required" },
            { status: 400 }
          );
        }

        const dismissed = await supabaseKnowledge.dismissGap(dismissGapId);
        if (!dismissed) {
          return NextResponse.json(
            { success: false, error: "Failed to dismiss gap" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Gap dismissed successfully",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Admin knowledge base error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
