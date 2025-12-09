import { NextRequest, NextResponse } from "next/server";
import {
  getQAEntries,
  getQAEntry,
  markQAHelpful,
  submitQuestion,
  getQACategories,
  searchQA,
  getUserQAStats,
  QACategory,
} from "@/lib/community/curated-qa";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const entryId = searchParams.get("id");
  const userId = searchParams.get("userId");
  const category = searchParams.get("category") as QACategory | null;
  const search = searchParams.get("search");
  const action = searchParams.get("action");
  const featured = searchParams.get("featured") === "true";

  // Get categories
  if (action === "categories") {
    return NextResponse.json({ categories: getQACategories() });
  }

  // Get user stats
  if (action === "stats" && userId) {
    return NextResponse.json({ stats: getUserQAStats(userId) });
  }

  // Search
  if (search) {
    const results = searchQA(search);
    return NextResponse.json({ entries: results, total: results.length });
  }

  // Get single entry
  if (entryId) {
    const entry = getQAEntry(entryId, userId || undefined);
    if (!entry) {
      return NextResponse.json({ error: "Q&A entry not found" }, { status: 404 });
    }
    return NextResponse.json({ entry });
  }

  // Get entries list
  const result = getQAEntries({
    category: category || undefined,
    featured: featured || undefined,
    limit: 50,
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, userId } = body;

  // Mark as helpful
  if (action === "helpful") {
    const { entryId } = body;
    if (!userId || !entryId) {
      return NextResponse.json(
        { error: "User ID and entry ID are required" },
        { status: 400 }
      );
    }

    const result = markQAHelpful(entryId, userId);
    return NextResponse.json({
      success: result.success,
      xpAwarded: result.xpAwarded,
      alreadyVoted: result.alreadyVoted,
    });
  }

  // Submit question
  if (action === "submit") {
    const { userEmail, question, category, context } = body;
    if (!userId || !userEmail || !question || !category) {
      return NextResponse.json(
        { error: "User ID, email, question, and category are required" },
        { status: 400 }
      );
    }

    const result = submitQuestion(userId, userEmail, question, category, context);
    return NextResponse.json({
      success: true,
      submission: result.submission,
      xpAwarded: result.xpAwarded,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
