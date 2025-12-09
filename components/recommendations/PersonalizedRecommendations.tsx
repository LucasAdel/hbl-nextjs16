"use client";

import { useState, useEffect } from "react";
import {
  Recommendation,
  getRecommendations,
  getCartRecommendations,
  getProductPageRecommendations,
  trackProductView,
  RECOMMENDATION_XP,
} from "@/lib/recommendations/recommendation-engine";

interface PersonalizedRecommendationsProps {
  userId: string;
  context?: "homepage" | "product_page" | "cart" | "checkout";
  currentProductId?: string;
  cartProductIds?: string[];
  limit?: number;
  onAddToCart?: (productId: string, price: number) => void;
  className?: string;
}

export function PersonalizedRecommendations({
  userId,
  context = "homepage",
  currentProductId,
  cartProductIds = [],
  limit = 4,
  onAddToCart,
  className = "",
}: PersonalizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [userId, context, currentProductId, cartProductIds.join(",")]);

  async function loadRecommendations() {
    setLoading(true);

    let recs: Recommendation[];

    if (context === "product_page" && currentProductId) {
      recs = await getProductPageRecommendations(userId, currentProductId);
    } else if (context === "cart" || context === "checkout") {
      recs = await getCartRecommendations(userId, cartProductIds);
    } else {
      recs = await getRecommendations(userId, {
        limit,
        excludeOwned: true,
        cartProductIds,
        context,
      });
    }

    setRecommendations(recs.slice(0, limit));
    setLoading(false);
  }

  function handleProductClick(productId: string) {
    // Fire and forget - no need to await
    trackProductView(userId, productId);
  }

  async function handleAddToCart(product: Recommendation["product"]) {
    if (!onAddToCart) return;

    setAddingToCart(product.id);

    // Track the view (fire and forget)
    trackProductView(userId, product.id, 5000);

    // Call parent handler
    onAddToCart(product.id, product.price);

    // Brief delay for animation
    setTimeout(() => {
      setAddingToCart(null);
      // Refresh recommendations after adding to cart
      loadRecommendations();
    }, 500);
  }

  const getContextTitle = () => {
    switch (context) {
      case "product_page":
        return "Frequently Bought Together";
      case "cart":
        return "Complete Your Order";
      case "checkout":
        return "You Might Also Need";
      default:
        return "Recommended for You";
    }
  };

  const getConfidenceBadge = (confidence: Recommendation["confidence"]) => {
    switch (confidence) {
      case "high":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Top Pick
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Recommended
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {getContextTitle()}
        </h3>
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>+{RECOMMENDATION_XP.purchaseRecommended} XP per recommended purchase</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.product.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            onClick={() => handleProductClick(rec.product.id)}
          >
            {/* Product Image Placeholder */}
            <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                  {rec.product.name}
                </h4>
                {getConfidenceBadge(rec.confidence)}
              </div>

              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {rec.reason}
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-gray-900">
                    ${rec.product.price}
                  </span>
                  {rec.xpBonus > 0 && (
                    <span className="ml-2 text-xs text-amber-600 font-medium">
                      +{rec.xpBonus} XP
                    </span>
                  )}
                </div>

                {onAddToCart && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(rec.product);
                    }}
                    disabled={addingToCart === rec.product.id}
                    className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {addingToCart === rec.product.id ? (
                      <span className="flex items-center gap-1">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Adding
                      </span>
                    ) : (
                      "Add"
                    )}
                  </button>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(rec.product.averageRating)
                          ? "text-amber-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  ({rec.product.purchaseCount.toLocaleString()})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact version for sidebar/cart
export function CompactRecommendations({
  userId,
  cartProductIds = [],
  onAddToCart,
  className = "",
}: {
  userId: string;
  cartProductIds?: string[];
  onAddToCart?: (productId: string, price: number) => void;
  className?: string;
}) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    async function load() {
      const recs = await getCartRecommendations(userId, cartProductIds);
      setRecommendations(recs.slice(0, 3));
    }
    load();
  }, [userId, cartProductIds.join(",")]);

  if (recommendations.length === 0) return null;

  return (
    <div className={`bg-amber-50 rounded-lg p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Complete Your Order
      </h4>

      <div className="space-y-2">
        {recommendations.map((rec) => (
          <div
            key={rec.product.id}
            className="flex items-center justify-between bg-white rounded-md p-2"
          >
            <div className="flex-1 min-w-0 mr-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {rec.product.name}
              </p>
              <p className="text-xs text-amber-600">
                +{rec.xpBonus} XP bonus
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">${rec.product.price}</span>
              {onAddToCart && (
                <button
                  onClick={() => onAddToCart(rec.product.id, rec.product.price)}
                  className="p-1.5 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
                  title="Quick add"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
