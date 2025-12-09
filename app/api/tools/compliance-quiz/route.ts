import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  calculateQuizScore,
  type QuizAnswer,
} from "@/lib/quiz/compliance-scoring";

// In-memory storage for demo purposes
const quizResults = new Map<string, {
  timestamp: number;
  result: ReturnType<typeof calculateQuizScore>;
  email?: string;
}>();

interface QuizSubmitRequest {
  answers: QuizAnswer[];
  email?: string;
}

/**
 * POST /api/tools/compliance-quiz
 * Submits quiz answers and calculates score
 */
export async function POST(request: NextRequest) {
  try {
    const body: QuizSubmitRequest = await request.json();
    const { answers, email } = body;

    // Validate input
    if (!answers || answers.length === 0) {
      return NextResponse.json(
        { error: "Quiz answers are required" },
        { status: 400 }
      );
    }

    // Calculate quiz score
    const result = calculateQuizScore(answers);

    // Get user ID if authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Store result
    const resultId = `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    quizResults.set(resultId, {
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
              tool: "compliance_quiz",
              score: result.complianceScore,
              questionsAnswered: result.questionsAnswered,
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
    console.error("Error processing quiz:", error);
    return NextResponse.json(
      { error: "Failed to process quiz" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tools/compliance-quiz?id=xxx
 * Retrieves a saved quiz result
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

    const stored = quizResults.get(resultId);
    if (!stored) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...stored.result,
      completedAt: new Date(stored.timestamp).toISOString(),
    });
  } catch (error) {
    console.error("Error retrieving quiz result:", error);
    return NextResponse.json(
      { error: "Failed to retrieve result" },
      { status: 500 }
    );
  }
}
