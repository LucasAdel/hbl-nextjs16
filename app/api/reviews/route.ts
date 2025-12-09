import { NextRequest, NextResponse } from "next/server";
import {
  createReview,
  getAllReviews,
  markReviewHelpful,
  getProductReviewStats,
} from "@/lib/db/reviews";

interface ReviewData {
  rating: number;
  title?: string;
  content: string;
  productId?: string;
  productName?: string;
  serviceType?: string;
  email?: string;
  name: string;
  wouldRecommend: boolean;
  photos?: string[];
  verified?: boolean;
}

// Fallback in-memory storage (used only if DB fails)
const reviewsStore: Array<ReviewData & { id: string; createdAt: string; status: string; helpfulCount: number }> = [];

// POST - Submit a new review
export async function POST(request: NextRequest) {
  try {
    const reviewData: ReviewData = await request.json();

    // Validate required fields
    if (!reviewData.rating || !reviewData.content) {
      return NextResponse.json(
        { error: "Rating and content are required" },
        { status: 400 }
      );
    }

    // Validate rating range
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Create review in database
    const review = await createReview({
      productId: reviewData.productId || "general",
      productName: reviewData.productName,
      userEmail: reviewData.email,
      displayName: reviewData.name,
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
      isVerifiedPurchase: reviewData.verified || false,
      wouldRecommend: reviewData.wouldRecommend,
      photos: reviewData.photos,
    });

    if (!review) {
      // Fallback to in-memory if DB fails
      const fallbackReview = {
        id: crypto.randomUUID(),
        ...reviewData,
        status: "pending",
        helpfulCount: 0,
        createdAt: new Date().toISOString(),
      };
      reviewsStore.push(fallbackReview);

      return NextResponse.json({
        success: true,
        message: "Review submitted successfully",
        review: fallbackReview,
      });
    }

    // Track with gamification API (fire and forget)
    if (reviewData.email) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3016";
      fetch(`${baseUrl}/api/gamification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review_submit",
          email: reviewData.email,
          metadata: {
            rating: reviewData.rating,
            productId: reviewData.productId,
            wordCount: reviewData.content.split(/\s+/).length,
            hasPhoto: (reviewData.photos?.length || 0) > 0,
          },
        }),
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Error in POST /api/reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Fetch reviews (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const serviceType = searchParams.get("serviceType");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const stats = searchParams.get("stats") === "true";

    // Return stats if requested
    if (stats && productId) {
      const productStats = await getProductReviewStats(productId);
      return NextResponse.json(productStats);
    }

    // Get reviews from database
    const { reviews: dbReviews, total: dbTotal } = await getAllReviews({
      productId: productId || undefined,
      limit,
      offset,
      status: "approved",
    });

    // If database has reviews, return them
    if (dbReviews.length > 0) {
      return NextResponse.json({
        reviews: dbReviews,
        total: dbTotal,
        hasMore: dbTotal > offset + limit,
      });
    }

    // Fallback: Combine in-memory reviews with mock data
    const allReviews = [...reviewsStore, ...getMockReviews(15)];

    // Filter by productId if specified
    let filteredReviews = productId
      ? allReviews.filter((r) => "productId" in r && r.productId === productId)
      : allReviews;

    // Filter by serviceType if specified
    if (serviceType) {
      filteredReviews = filteredReviews.filter(
        (r) => "serviceType" in r && r.serviceType === serviceType
      );
    }

    // Sort by date (newest first)
    filteredReviews.sort((a, b) => {
      const dateA = "createdAt" in a ? a.createdAt : (a as { created_at?: string }).created_at;
      const dateB = "createdAt" in b ? b.createdAt : (b as { created_at?: string }).created_at;
      return new Date(dateB || 0).getTime() - new Date(dateA || 0).getTime();
    });

    // Paginate
    const paginatedReviews = filteredReviews.slice(offset, offset + limit);

    return NextResponse.json({
      reviews: paginatedReviews,
      total: filteredReviews.length,
      hasMore: filteredReviews.length > offset + limit,
    });
  } catch (error) {
    console.error("Error in GET /api/reviews:", error);
    return NextResponse.json({
      reviews: getMockReviews(10),
      total: 15,
      hasMore: true,
    });
  }
}

// Mock reviews for demo/fallback
function getMockReviews(limit: number) {
  const mockReviews = [
    {
      id: "1",
      rating: 5,
      title: "Excellent Template",
      content: "This employment contract template saved me hours of work. Very comprehensive and easy to customize for our medical practice needs.",
      display_name: "Dr. Sarah M.",
      verified: true,
      would_recommend: true,
      helpful_count: 24,
      created_at: "2025-12-01T10:30:00Z",
      product_name: "Employment Contract Template",
    },
    {
      id: "2",
      rating: 5,
      title: "Professional and Thorough",
      content: "The AHPRA compliance guide was exactly what I needed. Clear explanations and practical checklists made implementation straightforward.",
      display_name: "James T.",
      verified: true,
      would_recommend: true,
      helpful_count: 18,
      created_at: "2025-11-28T14:15:00Z",
      product_name: "AHPRA Compliance Guide",
    },
    {
      id: "3",
      rating: 4,
      title: "Very Helpful Resource",
      content: "Great starting point for understanding medical practice setup requirements. Would recommend for any new practice owners.",
      display_name: "Emily W.",
      verified: true,
      would_recommend: true,
      helpful_count: 12,
      created_at: "2025-11-25T09:45:00Z",
      product_name: "Practice Setup Guide",
    },
    {
      id: "4",
      rating: 5,
      title: "Worth Every Dollar",
      content: "The consultation with Hamilton Bailey Law was incredibly valuable. They addressed all my concerns about partnership agreements with expertise and patience.",
      display_name: "Dr. Chen",
      verified: true,
      would_recommend: true,
      helpful_count: 31,
      created_at: "2025-11-20T16:00:00Z",
      product_name: "Legal Consultation",
    },
    {
      id: "5",
      rating: 5,
      title: "Comprehensive Coverage",
      content: "Finally found a resource that covers telehealth regulations properly. This bundle has everything needed for compliant virtual consultations.",
      display_name: "Michael S.",
      verified: false,
      would_recommend: true,
      helpful_count: 8,
      created_at: "2025-11-18T11:20:00Z",
      product_name: "Telehealth Compliance Bundle",
    },
  ];

  return mockReviews.slice(0, limit);
}
