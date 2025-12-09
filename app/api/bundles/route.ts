import { NextRequest, NextResponse } from "next/server";
import {
  getAllBundles,
  getBundle,
  getBundlesByCategory,
  getBundlesForAudience,
  getFeaturedBundles,
  getDynamicBundleSuggestions,
  checkBundleCompletion,
  calculateBundlePurchaseXP,
  getBundleProgress,
  BundleCategory,
} from "@/lib/bundles/smart-bundles";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";

/**
 * GET /api/bundles
 * Get bundles with optional filtering
 *
 * Query params:
 * - id: Get specific bundle by ID
 * - category: Filter by category
 * - practiceType: Filter by practice type
 * - featured: Get featured bundles only (true/false)
 * - cartProductIds: Get dynamic suggestions based on cart
 * - limit: Number of results
 */
export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`bundles-${clientId}`, {
    maxRequests: 60,
    windowMs: 60000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category") as BundleCategory | null;
    const practiceType = searchParams.get("practiceType");
    const featured = searchParams.get("featured");
    const cartProductIds = searchParams.get("cartProductIds")?.split(",").filter(Boolean) || [];
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get specific bundle
    if (id) {
      const bundle = getBundle(id);
      if (!bundle) {
        return NextResponse.json(
          { success: false, error: "Bundle not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        bundle,
      });
    }

    // Get featured bundles
    if (featured === "true") {
      return NextResponse.json({
        success: true,
        bundles: getFeaturedBundles(limit),
      });
    }

    // Get dynamic suggestions based on cart
    if (cartProductIds.length > 0) {
      const suggestions = getDynamicBundleSuggestions(cartProductIds);
      const completion = checkBundleCompletion(cartProductIds);
      const progress = getBundleProgress(cartProductIds);

      return NextResponse.json({
        success: true,
        suggestions,
        completedBundle: completion,
        progress,
      });
    }

    // Filter by category
    if (category) {
      return NextResponse.json({
        success: true,
        bundles: getBundlesByCategory(category),
      });
    }

    // Filter by practice type
    if (practiceType) {
      return NextResponse.json({
        success: true,
        bundles: getBundlesForAudience(practiceType),
      });
    }

    // Get all bundles
    return NextResponse.json({
      success: true,
      bundles: getAllBundles().slice(0, limit),
    });
  } catch (error) {
    console.error("Bundles error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get bundles" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bundles
 * Process bundle purchase and calculate XP
 *
 * Body:
 * - action: "purchase" | "check_completion"
 * - bundleId: Bundle ID for purchase
 * - purchaseAmount: Amount paid
 * - isFirstBundle: Whether this is user's first bundle
 * - cartProductIds: For completion check
 */
export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`bundles-action-${clientId}`, {
    maxRequests: 20,
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
    const { action, bundleId, purchaseAmount, isFirstBundle, cartProductIds } = body;

    switch (action) {
      case "purchase": {
        if (!bundleId || !purchaseAmount) {
          return NextResponse.json(
            { success: false, error: "Bundle ID and purchase amount required" },
            { status: 400 }
          );
        }

        const bundle = getBundle(bundleId);
        if (!bundle) {
          return NextResponse.json(
            { success: false, error: "Bundle not found" },
            { status: 404 }
          );
        }

        const xpResult = calculateBundlePurchaseXP(
          bundleId,
          purchaseAmount,
          isFirstBundle || false
        );

        return NextResponse.json({
          success: true,
          bundle,
          xp: xpResult,
        });
      }

      case "check_completion": {
        if (!cartProductIds || !Array.isArray(cartProductIds)) {
          return NextResponse.json(
            { success: false, error: "Cart product IDs required" },
            { status: 400 }
          );
        }

        const completedBundle = checkBundleCompletion(cartProductIds);
        const progress = getBundleProgress(cartProductIds);

        return NextResponse.json({
          success: true,
          completedBundle,
          progress,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Bundles action error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process action" },
      { status: 500 }
    );
  }
}
