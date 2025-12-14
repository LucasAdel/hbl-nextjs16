/**
 * Knowledge Base API Routes
 *
 * Provides endpoints for managing and monitoring the AI knowledge base.
 * Uses Supabase for persistence and in-memory manager for fast lookups.
 *
 * SECURITY:
 * - Public actions: track, feedback (used by chatbot for all users)
 * - Admin-only actions: create-item, update-item, delete-item, dismiss-gap,
 *   generate-draft, validate (modifies knowledge base)
 * - GET analytics/export also require admin auth
 */

import { NextRequest, NextResponse } from "next/server";
import {
  knowledgeManager,
  getKnowledgeAnalytics,
  getAllKnowledgeItems,
  getKnowledgeGaps,
  trackChatQuery,
  recordChatFeedback,
} from "@/lib/chat/knowledge-manager";
import * as supabaseKnowledge from "@/lib/supabase/knowledge";
import { requireAdminAuth } from "@/lib/auth/admin-auth";

// Actions that require admin authentication
const ADMIN_ACTIONS = [
  "create-item",
  "update-item",
  "delete-item",
  "dismiss-gap",
  "generate-draft",
  "validate",
];

// GET actions that require admin authentication
const ADMIN_GET_ACTIONS = [
  "analytics",
  "export",
  "usage-stats",
  "feedback-review",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const useSupabase = searchParams.get("db") === "true";

  // SECURITY: Check admin auth for sensitive GET actions
  if (action && ADMIN_GET_ACTIONS.includes(action)) {
    const authResult = await requireAdminAuth();
    if (!authResult.authorized) {
      return authResult.response;
    }
  }

  try {
    switch (action) {
      case "analytics":
        // Use Supabase for persistent analytics if requested
        if (useSupabase) {
          const analytics = await supabaseKnowledge.getAnalytics();
          return NextResponse.json({
            success: true,
            data: analytics,
            source: "supabase",
          });
        }
        return NextResponse.json({
          success: true,
          data: getKnowledgeAnalytics(),
          source: "memory",
        });

      case "items":
        // Combine static and database items
        const staticItems = getAllKnowledgeItems();
        if (useSupabase) {
          const dbItems = await supabaseKnowledge.getKnowledgeItems();
          return NextResponse.json({
            success: true,
            data: {
              static: staticItems,
              database: dbItems,
              total: staticItems.length + dbItems.length,
            },
          });
        }
        return NextResponse.json({
          success: true,
          data: staticItems,
        });

      case "gaps":
        if (useSupabase) {
          const gaps = await supabaseKnowledge.getKnowledgeGaps();
          return NextResponse.json({
            success: true,
            data: gaps,
            source: "supabase",
          });
        }
        return NextResponse.json({
          success: true,
          data: getKnowledgeGaps(),
          source: "memory",
        });

      case "categories":
        return NextResponse.json({
          success: true,
          data: knowledgeManager.getCategoryOptions(),
        });

      case "export":
        if (useSupabase) {
          const exportData = await supabaseKnowledge.exportKnowledgeBase();
          return new NextResponse(exportData, {
            headers: {
              "Content-Type": "application/json",
              "Content-Disposition": `attachment; filename="knowledge-base-supabase-${new Date().toISOString().split("T")[0]}.json"`,
            },
          });
        }
        const exportData = knowledgeManager.exportKnowledgeBase();
        return new NextResponse(exportData, {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="knowledge-base-${new Date().toISOString().split("T")[0]}.json"`,
          },
        });

      case "usage-stats":
        const stats = await supabaseKnowledge.getUsageStats();
        return NextResponse.json({
          success: true,
          data: stats,
        });

      case "feedback-review":
        const feedback = await supabaseKnowledge.getFeedbackForImprovement();
        return NextResponse.json({
          success: true,
          data: feedback,
        });

      default:
        const allItems = getAllKnowledgeItems();
        return NextResponse.json({
          success: true,
          data: {
            totalItems: allItems.length,
            analytics: getKnowledgeAnalytics(),
            gaps: getKnowledgeGaps().length,
          },
        });
    }
  } catch (error) {
    console.error("Knowledge API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch knowledge data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, persist } = body;

    // SECURITY: Check admin auth for write operations
    if (ADMIN_ACTIONS.includes(action)) {
      const authResult = await requireAdminAuth();
      if (!authResult.authorized) {
        return authResult.response;
      }
    }

    switch (action) {
      case "track":
        // Track a user query (in-memory + optional Supabase persistence)
        const { query, sessionId, userId } = body;
        if (!query) {
          return NextResponse.json(
            { success: false, error: "Query is required" },
            { status: 400 }
          );
        }

        const startTime = Date.now();
        const trackResult = trackChatQuery(query);
        const responseTime = Date.now() - startTime;

        // Persist to Supabase if enabled
        if (persist !== false) {
          await supabaseKnowledge.logQuery({
            query,
            matched: trackResult.matched,
            matchedItems: trackResult.items.map((i) => i.id),
            intent: trackResult.items[0]?.subcategory,
            sessionId,
            userId,
            responseTimeMs: responseTime,
          });

          // Track usage for matched items
          for (const item of trackResult.items) {
            await supabaseKnowledge.trackUsage(item.id);
          }

          // Record gap if no match
          if (!trackResult.matched) {
            await supabaseKnowledge.recordGap({
              query,
              intent: trackResult.gap?.detectedIntent,
              category: trackResult.gap?.suggestedCategory,
            });
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            matched: trackResult.matched,
            itemCount: trackResult.items.length,
            items: trackResult.items.map((item) => ({
              id: item.id,
              title: item.title,
              category: item.category,
            })),
            gap: trackResult.gap
              ? {
                  query: trackResult.gap.query,
                  priority: trackResult.gap.priority,
                  frequency: trackResult.gap.frequency,
                }
              : null,
          },
        });

      case "feedback":
        // Record user feedback (in-memory + Supabase)
        const { itemId, messageId, rating, comment, suggestedImprovement } = body;
        if (!itemId || !messageId || !rating) {
          return NextResponse.json(
            { success: false, error: "itemId, messageId, and rating are required" },
            { status: 400 }
          );
        }

        // Update in-memory
        recordChatFeedback(itemId, messageId, rating, comment);

        // Persist to Supabase
        await supabaseKnowledge.recordFeedback({
          itemId,
          messageId,
          rating,
          comment,
          suggestedImprovement,
          sessionId: body.sessionId,
          userId: body.userId,
        });

        return NextResponse.json({
          success: true,
          message: "Feedback recorded",
        });

      case "generate-draft":
        // Generate a draft knowledge item from a gap
        const { gap } = body;
        if (!gap) {
          return NextResponse.json(
            { success: false, error: "Gap data is required" },
            { status: 400 }
          );
        }
        const draft = knowledgeManager.generateDraftFromGap(gap);
        return NextResponse.json({
          success: true,
          data: draft,
        });

      case "validate":
        // Validate a knowledge item
        const { item } = body;
        if (!item) {
          return NextResponse.json(
            { success: false, error: "Item data is required" },
            { status: 400 }
          );
        }
        const validation = knowledgeManager.validateKnowledgeItem(item);
        return NextResponse.json({
          success: true,
          data: validation,
        });

      case "create-item":
        // Create a new knowledge item in Supabase
        const newItem = body.item;
        if (!newItem) {
          return NextResponse.json(
            { success: false, error: "Item data is required" },
            { status: 400 }
          );
        }

        // Validate first
        const createValidation = knowledgeManager.validateKnowledgeItem(newItem);
        if (!createValidation.valid) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            errors: createValidation.errors,
          }, { status: 400 });
        }

        // Transform to database format
        const dbItem = {
          category: newItem.category,
          subcategory: newItem.subcategory,
          topic: newItem.topic,
          title: newItem.title,
          content: newItem.content,
          summary: newItem.summary,
          keywords: newItem.keywords,
          intent_patterns: newItem.intentPatterns,
          response_template: newItem.responseTemplate || null,
          requires_disclaimer: newItem.requiresDisclaimer,
          legal_disclaimer: newItem.legalDisclaimer || null,
          advice_level: newItem.adviceLevel,
          confidence_level: newItem.confidenceLevel || 7,
          related_products: newItem.relatedProducts || [],
          xp_reward: newItem.xpReward || 10,
          metadata: newItem.metadata || {},
          created_by: body.userId || null,
        };

        const created = await supabaseKnowledge.createKnowledgeItem(dbItem);
        if (!created) {
          return NextResponse.json(
            { success: false, error: "Failed to create item" },
            { status: 500 }
          );
        }

        // If this was created from a gap, mark it as addressed
        if (body.gapId) {
          await supabaseKnowledge.addressGap(body.gapId, created.id);
        }

        return NextResponse.json({
          success: true,
          data: created,
          message: "Knowledge item created successfully",
        });

      case "update-item":
        // Update an existing knowledge item
        const { id: updateId, updates } = body;
        if (!updateId || !updates) {
          return NextResponse.json(
            { success: false, error: "ID and updates are required" },
            { status: 400 }
          );
        }

        const updated = await supabaseKnowledge.updateKnowledgeItem(updateId, updates);
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

      case "delete-item":
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
        // Dismiss a knowledge gap
        const { gapId } = body;
        if (!gapId) {
          return NextResponse.json(
            { success: false, error: "Gap ID is required" },
            { status: 400 }
          );
        }

        const dismissed = await supabaseKnowledge.dismissGap(gapId);
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
    console.error("Knowledge API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
