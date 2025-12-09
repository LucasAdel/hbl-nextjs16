import { NextRequest, NextResponse } from "next/server";
import {
  getRecommendations,
  getCartRecommendations,
  getProductPageRecommendations,
  trackProductView,
  trackPurchase,
  updateUserProfile,
  calculateRecommendationPurchaseXP,
  getTrendingProducts,
  getProductsByCategory,
  UserProfile,
  ProductCategory,
} from "@/lib/recommendations/recommendation-engine";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";

// Rate limit: 60 requests per minute for recommendations
const RECOMMENDATIONS_RATE_LIMIT = {
  maxRequests: 60,
  windowMs: 60000,
};

/**
 * GET /api/recommendations
 * Get personalized recommendations for a user
 *
 * Query params:
 * - userId: User ID for personalized recommendations
 * - context: homepage | product_page | cart | checkout
 * - currentProductId: For product page context
 * - cartProductIds: Comma-separated product IDs in cart
 * - limit: Number of recommendations (default: 5)
 * - category: Filter by product category
 */
export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`recommendations-${clientId}`, RECOMMENDATIONS_RATE_LIMIT);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const context = searchParams.get("context") as "homepage" | "product_page" | "cart" | "checkout" | null;
    const currentProductId = searchParams.get("currentProductId");
    const cartProductIds = searchParams.get("cartProductIds")?.split(",").filter(Boolean) || [];
    const limit = parseInt(searchParams.get("limit") || "5");
    const category = searchParams.get("category") as ProductCategory | null;

    // If no user, return trending products
    if (!userId) {
      if (category) {
        return NextResponse.json({
          success: true,
          recommendations: getProductsByCategory(category).map(product => ({
            product,
            score: product.popularity,
            reason: `Popular in ${category}`,
            reasonType: "trending",
            xpBonus: 50,
            confidence: "medium",
          })),
        });
      }

      return NextResponse.json({
        success: true,
        recommendations: getTrendingProducts(limit).map(product => ({
          product,
          score: product.popularity,
          reason: `Popular with ${product.purchaseCount.toLocaleString()}+ practitioners`,
          reasonType: "trending",
          xpBonus: 50,
          confidence: "medium",
        })),
      });
    }

    let recommendations;

    if (context === "product_page" && currentProductId) {
      recommendations = await getProductPageRecommendations(userId, currentProductId);
    } else if (context === "cart" || context === "checkout") {
      recommendations = await getCartRecommendations(userId, cartProductIds);
    } else {
      recommendations = await getRecommendations(userId, {
        limit,
        excludeOwned: true,
        cartProductIds,
        context: context || "homepage",
      });
    }

    return NextResponse.json({
      success: true,
      recommendations: recommendations.slice(0, limit),
      context: context || "homepage",
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendations
 * Track user actions and update profile
 *
 * Actions:
 * - track_view: Track product view
 * - track_purchase: Track purchase
 * - update_profile: Update user profile
 * - calculate_xp: Calculate XP for recommended purchases
 */
export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`recommendations-update-${clientId}`, {
    maxRequests: 30,
    windowMs: 60000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { action, userId, data } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "track_view": {
        const { productId, duration, userEmail } = data;
        if (!productId) {
          return NextResponse.json(
            { success: false, error: "Product ID required" },
            { status: 400 }
          );
        }
        await trackProductView(userId, productId, duration, userEmail);
        return NextResponse.json({
          success: true,
          message: "View tracked",
        });
      }

      case "track_purchase": {
        const { productId, amount } = data;
        if (!productId || !amount) {
          return NextResponse.json(
            { success: false, error: "Product ID and amount required" },
            { status: 400 }
          );
        }
        trackPurchase(userId, productId, amount);
        return NextResponse.json({
          success: true,
          message: "Purchase tracked",
        });
      }

      case "update_profile": {
        const profile: Partial<UserProfile> = data;
        const updated = updateUserProfile(userId, profile);
        return NextResponse.json({
          success: true,
          profile: updated,
        });
      }

      case "calculate_xp": {
        const { purchasedProductIds, recommendedProductIds } = data;
        if (!purchasedProductIds || !recommendedProductIds) {
          return NextResponse.json(
            { success: false, error: "Product IDs required" },
            { status: 400 }
          );
        }
        const xpResult = calculateRecommendationPurchaseXP(
          userId,
          purchasedProductIds,
          recommendedProductIds
        );
        return NextResponse.json({
          success: true,
          xp: xpResult,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Recommendations action error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process action" },
      { status: 500 }
    );
  }
}
