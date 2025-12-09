"use client";

import { useState, useEffect } from "react";
import {
  Bundle,
  BundleCategory,
  DynamicBundleSuggestion,
  getAllBundles,
  getBundlesByCategory,
  getBundlesForAudience,
  getFeaturedBundles,
  getDynamicBundleSuggestions,
  getBundleProgress,
  BUNDLE_XP,
} from "@/lib/bundles/smart-bundles";
import { SmartBundleCard, SmartBundleSuggestion } from "./SmartBundleCard";

interface BundleGalleryProps {
  userId?: string;
  practiceType?: string;
  cartProductIds?: string[];
  onAddToCart?: (bundleId: string, price: number) => void;
  onPurchase?: (bundleId: string) => void;
  showSuggestions?: boolean;
  className?: string;
}

const CATEGORY_LABELS: Record<BundleCategory, string> = {
  starter: "Starter Kits",
  compliance: "Compliance",
  employment: "Employment",
  telehealth: "Telehealth",
  complete: "Complete Packages",
};

export function BundleGallery({
  userId,
  practiceType,
  cartProductIds = [],
  onAddToCart,
  onPurchase,
  showSuggestions = true,
  className = "",
}: BundleGalleryProps) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [suggestions, setSuggestions] = useState<DynamicBundleSuggestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BundleCategory | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBundles();
  }, [practiceType, selectedCategory]);

  useEffect(() => {
    if (showSuggestions && cartProductIds.length > 0) {
      const newSuggestions = getDynamicBundleSuggestions(cartProductIds);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [cartProductIds.join(","), showSuggestions]);

  function loadBundles() {
    setLoading(true);

    let result: Bundle[];

    if (selectedCategory === "all") {
      if (practiceType) {
        result = getBundlesForAudience(practiceType);
      } else {
        result = getAllBundles();
      }
    } else {
      result = getBundlesByCategory(selectedCategory);
    }

    setBundles(result);
    setLoading(false);
  }

  const categories: (BundleCategory | "all")[] = [
    "all",
    "starter",
    "compliance",
    "employment",
    "telehealth",
    "complete",
  ];

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-96"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Dynamic Suggestions Banner */}
      {suggestions.length > 0 && (
        <div className="mb-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.94 6.94a.75.75 0 11-1.061-1.061 5.5 5.5 0 017.778 7.778.75.75 0 11-1.06-1.06 4 4 0 00-5.657-5.657z" />
            </svg>
            Complete a Bundle & Save More
          </h3>
          {suggestions.slice(0, 2).map((suggestion, idx) => (
            <SmartBundleSuggestion
              key={idx}
              existingProducts={suggestion.existingProducts}
              suggestedProducts={suggestion.suggestedProducts}
              bundle={suggestion.bundle}
              additionalSavings={suggestion.additionalSavings}
              xpBonus={suggestion.xpBonus}
              message={suggestion.message}
              onAddSuggested={onAddToCart ? (productIds) => {
                productIds.forEach(id => {
                  const product = suggestion.suggestedProducts.find(p => p.productId === id);
                  if (product && onAddToCart) {
                    onAddToCart(id, product.originalPrice);
                  }
                });
              } : undefined}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Smart Bundles</h2>
          <p className="text-gray-600 mt-1">
            Save up to 31% with curated document packages
          </p>
        </div>

        {/* XP Bonus Banner */}
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-medium text-amber-800">
            {BUNDLE_XP.baseMultiplier}x XP on all bundles
          </span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? "bg-slate-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category === "all" ? "All Bundles" : CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {/* Bundle Grid */}
      {bundles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-600">No bundles available in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <SmartBundleCard
              key={bundle.id}
              bundle={bundle}
              onAddToCart={onAddToCart}
              onPurchase={onPurchase}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Featured Bundles Carousel
export function FeaturedBundles({
  onAddToCart,
  onPurchase,
  className = "",
}: {
  onAddToCart?: (bundleId: string, price: number) => void;
  onPurchase?: (bundleId: string) => void;
  className?: string;
}) {
  const featured = getFeaturedBundles(3);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Featured Bundles</h3>
        <a href="/bundles" className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1">
          View all
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featured.map((bundle) => (
          <SmartBundleCard
            key={bundle.id}
            bundle={bundle}
            onAddToCart={onAddToCart}
            onPurchase={onPurchase}
            compact
          />
        ))}
      </div>
    </div>
  );
}

// Cart Bundle Progress
export function CartBundleProgress({
  cartProductIds,
  onAddSuggested,
  className = "",
}: {
  cartProductIds: string[];
  onAddSuggested?: (productId: string, price: number) => void;
  className?: string;
}) {
  const progress = getBundleProgress(cartProductIds);

  if (progress.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-700">Bundle Progress</h4>
      {progress.slice(0, 2).map((item) => (
        <div
          key={item.bundle.id}
          className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-3 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">{item.bundle.name}</span>
            <span className="text-xs text-green-600 font-medium">
              Save ${item.potentialSavings}
            </span>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{item.progressPercent}% complete</span>
              <span>{item.ownedProducts}/{item.totalProducts}</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-600 transition-all duration-300"
                style={{ width: `${item.progressPercent}%` }}
              />
            </div>
          </div>
          {item.remainingValue > 0 && (
            <p className="text-xs text-gray-500">
              Add ${item.remainingValue} more for bundle pricing
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
