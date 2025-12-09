import { NextRequest, NextResponse } from "next/server";
import { searchArticles } from "@/lib/knowledge-base-data";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [], message: "Query must be at least 2 characters" });
  }

  const results = searchArticles(query).slice(0, limit);

  return NextResponse.json({
    results: results.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      tags: article.tags,
      readTime: article.readTime,
      url: `/knowledge-base/article/${article.slug}`,
    })),
    total: results.length,
    query,
  });
}
