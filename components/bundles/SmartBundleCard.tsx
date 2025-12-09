"use client";

import { useState } from "react";
import { Bundle, BUNDLE_XP } from "@/lib/bundles/smart-bundles";

interface SmartBundleCardProps {
  bundle: Bundle;
  onPurchase?: (bundleId: string) => void;
  onAddToCart?: (bundleId: string, price: number) => void;
  compact?: boolean;
  className?: string;
}

export function SmartBundleCard({
  bundle,
  onPurchase,
  onAddToCart,
  compact = false,
  className = "",
}: SmartBundleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!onAddToCart) return;
    setIsAdding(true);
    await onAddToCart(bundle.id, bundle.bundlePrice);
    setTimeout(() => setIsAdding(false), 500);
  };

  const getBadgeColor = (badge: Bundle["badge"]) => {
    switch (badge) {
      case "best_value":
        return "bg-green-500 text-white";
      case "most_popular":
        return "bg-blue-500 text-white";
      case "new":
        return "bg-purple-500 text-white";
      case "limited":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getBadgeLabel = (badge: Bundle["badge"]) => {
    switch (badge) {
      case "best_value":
        return "Best Value";
      case "most_popular":
        return "Most Popular";
      case "new":
        return "New";
      case "limited":
        return "Limited";
      default:
        return "";
    }
  };

  if (compact) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-900">{bundle.name}</h4>
          {bundle.badge && (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor(bundle.badge)}`}>
              {getBadgeLabel(bundle.badge)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">${bundle.bundlePrice}</span>
            <span className="text-sm text-gray-500 line-through ml-2">${bundle.totalValue}</span>
            <span className="text-sm text-green-600 ml-2">Save {bundle.savingsPercent}%</span>
          </div>
          {onAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 disabled:opacity-50"
            >
              {isAdding ? "Adding..." : "Add"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      {/* Header with Badge */}
      <div className="relative">
        <div className="h-24 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
          <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        {bundle.badge && (
          <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeColor(bundle.badge)}`}>
            {getBadgeLabel(bundle.badge)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{bundle.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{bundle.description}</p>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">${bundle.bundlePrice}</span>
          <span className="text-lg text-gray-400 line-through">${bundle.totalValue}</span>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-sm font-medium rounded">
            Save ${bundle.savings}
          </span>
        </div>

        {/* XP Bonus */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-amber-50 rounded-lg">
          <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div>
            <span className="text-sm font-medium text-amber-800">
              {BUNDLE_XP.baseMultiplier}x XP Bonus
            </span>
            <span className="text-xs text-amber-600 ml-1">
              + {BUNDLE_XP.completePackage} bonus XP
            </span>
          </div>
        </div>

        {/* Product List Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span>{bundle.products.length} items included</span>
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expanded Product List */}
        {isExpanded && (
          <div className="mt-2 space-y-2 pb-2">
            {bundle.products.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded"
              >
                <span className="text-sm text-gray-700">{product.productName}</span>
                <span className="text-sm text-gray-500">${product.originalPrice}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {onAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-1 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {isAdding ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding...
                </span>
              ) : (
                "Add to Cart"
              )}
            </button>
          )}
          {onPurchase && (
            <button
              onClick={() => onPurchase(bundle.id)}
              className="flex-1 py-2.5 border border-slate-900 text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Buy Now
            </button>
          )}
        </div>

        {/* Purchase Count */}
        {bundle.purchaseCount > 0 && (
          <p className="text-xs text-gray-500 text-center mt-3">
            {bundle.purchaseCount.toLocaleString()} practitioners have purchased this bundle
          </p>
        )}
      </div>
    </div>
  );
}

// Bundle Suggestion for Cart
export function SmartBundleSuggestion({
  existingProducts,
  suggestedProducts,
  bundle,
  additionalSavings,
  xpBonus,
  message,
  onAddSuggested,
  className = "",
}: {
  existingProducts: string[];
  suggestedProducts: { productId: string; productName: string; originalPrice: number }[];
  bundle: Bundle;
  additionalSavings: number;
  xpBonus: number;
  message: string;
  onAddSuggested?: (productIds: string[]) => void;
  className?: string;
}) {
  const progressPercent = Math.round(
    (existingProducts.length / (existingProducts.length + suggestedProducts.length)) * 100
  );

  return (
    <div className={`bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 mb-1">
            Complete the {bundle.name}
          </h4>
          <p className="text-sm text-gray-600 mb-3">{message}</p>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{progressPercent}% complete</span>
              <span>{existingProducts.length}/{existingProducts.length + suggestedProducts.length} items</span>
            </div>
            <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Missing Products */}
          <div className="space-y-1 mb-3">
            {suggestedProducts.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700">+ {product.productName}</span>
                <span className="text-gray-500">${product.originalPrice}</span>
              </div>
            ))}
          </div>

          {/* Savings */}
          <div className="flex items-center justify-between p-2 bg-white/60 rounded-lg mb-3">
            <div>
              <span className="text-sm font-medium text-green-700">
                Save ${additionalSavings.toFixed(0)} more
              </span>
              <span className="text-xs text-amber-600 ml-2">
                +{xpBonus} bonus XP
              </span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              ${bundle.bundlePrice}
            </span>
          </div>

          {onAddSuggested && (
            <button
              onClick={() => onAddSuggested(suggestedProducts.map((p) => p.productId))}
              className="w-full py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              Add {suggestedProducts.length} Item{suggestedProducts.length > 1 ? "s" : ""} to Complete Bundle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
