import { NextRequest, NextResponse } from "next/server";
import {
  getBaileyAISettings,
  updateBaileyAISettings,
  type BaileyAISettings,
} from "@/features/bailey-ai/lib";

/**
 * GET /api/bailey-ai/settings
 * Retrieve current Bailey AI settings
 */
export async function GET() {
  try {
    const settings = await getBaileyAISettings();

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error fetching Bailey AI settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bailey-ai/settings
 * Update Bailey AI settings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (body.activeModel === undefined) {
      return NextResponse.json(
        { success: false, error: "activeModel is required" },
        { status: 400 }
      );
    }

    // Build updates object
    const updates: Partial<Omit<BaileyAISettings, "id" | "createdAt" | "updatedAt">> = {
      activeModel: body.activeModel,
    };

    // Optional settings
    if (body.enableStreaming !== undefined) {
      updates.enableStreaming = body.enableStreaming;
    }
    if (body.enableKnowledgeBase !== undefined) {
      updates.enableKnowledgeBase = body.enableKnowledgeBase;
    }
    if (body.maxResponseLength !== undefined) {
      updates.maxResponseLength = body.maxResponseLength;
    }
    if (body.temperature !== undefined) {
      updates.temperature = body.temperature;
    }
    if (body.systemPromptVersion !== undefined) {
      updates.systemPromptVersion = body.systemPromptVersion;
    }
    if (body.enableEmergencyCheck !== undefined) {
      updates.enableEmergencyCheck = body.enableEmergencyCheck;
    }
    if (body.enableLegalAdviceGuard !== undefined) {
      updates.enableLegalAdviceGuard = body.enableLegalAdviceGuard;
    }
    if (body.enableObjectionHandling !== undefined) {
      updates.enableObjectionHandling = body.enableObjectionHandling;
    }
    if (body.enableCalendarIntegration !== undefined) {
      updates.enableCalendarIntegration = body.enableCalendarIntegration;
    }

    const updatedSettings = await updateBaileyAISettings(updates);

    if (!updatedSettings) {
      return NextResponse.json(
        { success: false, error: "Failed to update settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating Bailey AI settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
