import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  calculateROI,
  type PracticeSize,
  type DocumentCategory,
} from "@/lib/calculators/roi-logic";

// In-memory storage for demo purposes
const calculatorResults = new Map<string, {
  timestamp: number;
  result: ReturnType<typeof calculateROI>;
  email?: string;
}>();

interface ROICalculatorRequest {
  practiceSize: PracticeSize;
  currentHourlyRate?: number;
  monthlyDocuments?: number;
  selectedCategories: DocumentCategory[];
  yearsToProject: number;
  email?: string; // For saving results
}

/**
 * POST /api/tools/roi-calculator
 * Calculates ROI and optionally stores results
 */
export async function POST(request: NextRequest) {
  try {
    const body: ROICalculatorRequest = await request.json();
    const {
      practiceSize,
      currentHourlyRate,
      monthlyDocuments,
      selectedCategories,
      yearsToProject,
      email,
    } = body;

    // Validate input
    if (!practiceSize) {
      return NextResponse.json(
        { error: "Practice size is required" },
        { status: 400 }
      );
    }

    if (!selectedCategories || selectedCategories.length === 0) {
      return NextResponse.json(
        { error: "At least one document category is required" },
        { status: 400 }
      );
    }

    // Calculate ROI
    const result = calculateROI({
      practiceSize,
      currentHourlyRate,
      monthlyDocuments,
      selectedCategories,
      yearsToProject: yearsToProject || 3,
    });

    // Get user ID if authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || `anon-${Date.now()}`;

    // Store result
    const resultId = `roi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    calculatorResults.set(resultId, {
      timestamp: Date.now(),
      result,
      email,
    });

    // Award XP if authenticated
    if (user) {
      try {
        await fetch(`${request.nextUrl.origin}/api/xp/earn`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "complete_quiz",
            metadata: {
              tool: "roi_calculator",
              practiceSize,
              categoriesCount: selectedCategories.length,
            },
          }),
        });
      } catch (xpError) {
        console.error("Failed to award XP:", xpError);
      }
    }

    return NextResponse.json({
      success: true,
      resultId,
      userId: user?.id || null,
      ...result,
    });
  } catch (error) {
    console.error("Error calculating ROI:", error);
    return NextResponse.json(
      { error: "Failed to calculate ROI" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tools/roi-calculator?id=xxx
 * Retrieves a saved calculation result
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resultId = searchParams.get("id");

    if (!resultId) {
      return NextResponse.json(
        { error: "Result ID is required" },
        { status: 400 }
      );
    }

    const stored = calculatorResults.get(resultId);
    if (!stored) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...stored.result,
      calculatedAt: new Date(stored.timestamp).toISOString(),
    });
  } catch (error) {
    console.error("Error retrieving ROI result:", error);
    return NextResponse.json(
      { error: "Failed to retrieve result" },
      { status: 500 }
    );
  }
}
