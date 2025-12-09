import { NextRequest, NextResponse } from "next/server";
import {
  getDiscussions,
  getDiscussion,
  createDiscussion,
  postReply,
  markReplyHelpful,
  getCategories,
  getUserDiscussionStats,
  DiscussionCategory,
} from "@/lib/community/client-discussions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const discussionId = searchParams.get("id");
  const userId = searchParams.get("userId");
  const category = searchParams.get("category") as DiscussionCategory | null;
  const action = searchParams.get("action");

  // Get categories
  if (action === "categories") {
    return NextResponse.json({ categories: getCategories() });
  }

  // Get user stats
  if (action === "stats" && userId) {
    return NextResponse.json({ stats: getUserDiscussionStats(userId) });
  }

  // Get single discussion
  if (discussionId) {
    const result = getDiscussion(discussionId);
    if (!result) {
      return NextResponse.json({ error: "Discussion not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  }

  // Get discussions list
  const result = getDiscussions({
    category: category || undefined,
    limit: 50,
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, userId, userName, isStaff } = body;

  if (!userId || !userName) {
    return NextResponse.json(
      { error: "User ID and name are required" },
      { status: 400 }
    );
  }

  // Create new discussion
  if (action === "create") {
    const { title, content, category } = body;
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "Title, content, and category are required" },
        { status: 400 }
      );
    }

    const result = createDiscussion(userId, userName, title, content, category);
    return NextResponse.json({
      success: true,
      discussion: result.discussion,
      xpEarned: result.xpResult.xpEarned,
      message: result.xpResult.message,
    });
  }

  // Post reply
  if (action === "reply") {
    const { discussionId, content } = body;
    if (!discussionId || !content) {
      return NextResponse.json(
        { error: "Discussion ID and content are required" },
        { status: 400 }
      );
    }

    const result = postReply(discussionId, userId, userName, content, isStaff || false);
    if (!result) {
      return NextResponse.json(
        { error: "Failed to post reply" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      reply: result.reply,
      xpEarned: result.xpResult.xpEarned,
      message: result.xpResult.message,
    });
  }

  // Mark reply as helpful
  if (action === "helpful") {
    const { replyId } = body;
    if (!replyId) {
      return NextResponse.json(
        { error: "Reply ID is required" },
        { status: 400 }
      );
    }

    const result = markReplyHelpful(replyId, userId);
    return NextResponse.json({
      success: result.success,
      xpAwarded: result.xpAwarded,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
