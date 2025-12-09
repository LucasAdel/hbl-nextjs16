"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Share2,
  Download,
  Filter,
  Search,
  ArrowLeft,
  FileText,
  Briefcase,
  Package,
  SortAsc,
  Star,
  ChevronDown,
  Copy,
  Check,
} from "lucide-react";
import {
  getLocalWishlist,
  saveLocalWishlist,
  removeFromWishlist,
  sortWishlistItems,
  filterWishlistItems,
  getWishlistTotal,
  formatCurrency,
  getTimeSinceAdded,
  exportWishlist,
  type WishlistItem,
} from "@/lib/ecommerce/wishlist";

const typeIcons = {
  document: FileText,
  service: Briefcase,
  bundle: Package,
};

const priorityColors = {
  high: "text-red-600 bg-red-100 dark:bg-red-900/30",
  medium: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
  low: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [sortBy, setSortBy] = useState<"added" | "price-asc" | "price-desc" | "priority" | "name">("added");
  const [filterType, setFilterType] = useState<WishlistItem["productType"] | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load wishlist from local storage
  useEffect(() => {
    const saved = getLocalWishlist();
    setItems(saved);
  }, []);

  // Save wishlist when items change
  useEffect(() => {
    if (items.length > 0 || getLocalWishlist().length > 0) {
      saveLocalWishlist(items);
    }
  }, [items]);

  const handleRemove = (productId: string) => {
    setItems((prev) => removeFromWishlist(prev, productId));
  };

  const handleMoveToCart = (item: WishlistItem) => {
    // In a real app, this would add to cart and remove from wishlist
    handleRemove(item.productId);
    // Show success message or redirect to cart
  };

  const handleExport = () => {
    const json = exportWishlist(items);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wishlist-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Apply filters and sorting
  const displayItems = sortWishlistItems(
    filterWishlistItems(items, {
      productType: filterType === "all" ? undefined : filterType,
      search: searchQuery,
    }),
    sortBy
  );

  const total = getWishlistTotal(items);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/documents"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Heart className="h-6 w-6 text-red-500" />
                  My Wishlist
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {items.length} items • {formatCurrency(total)} total
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Save documents and services you&apos;re interested in to your
              wishlist for easy access later.
            </p>
            <Link
              href="/documents"
              className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              Browse Documents
            </Link>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search wishlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) =>
                      setFilterType(
                        e.target.value as WishlistItem["productType"] | "all"
                      )
                    }
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">All Types</option>
                    <option value="document">Documents</option>
                    <option value="service">Services</option>
                    <option value="bundle">Bundles</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as typeof sortBy)
                    }
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="added">Recently Added</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="priority">Priority</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Wishlist Items */}
            <div className="space-y-4">
              {displayItems.map((item) => {
                const TypeIcon = typeIcons[item.productType];
                return (
                  <div
                    key={item.productId}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-teal-500 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Icon */}
                      <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {item.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="text-gray-500 dark:text-gray-400 capitalize">
                                {item.productType}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-500 dark:text-gray-400">
                                Added {getTimeSinceAdded(item.addedAt)}
                              </span>
                              {item.priority && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[item.priority]}`}
                                  >
                                    {item.priority} priority
                                  </span>
                                </>
                              )}
                            </div>
                            {item.notes && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {item.notes}
                              </p>
                            )}
                          </div>
                          <p className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMoveToCart(item)}
                          className="flex-1 md:flex-none inline-flex items-center justify-center px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => handleRemove(item.productId)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Wishlist Summary
                </h3>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">
                  Total ({items.length} items)
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(total)}
                </span>
              </div>
              <button className="w-full mt-4 px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors">
                Add All to Cart
              </button>
            </div>
          </>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Share Wishlist
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Share your wishlist with others by copying the link below.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={typeof window !== "undefined" ? window.location.href : ""}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
              >
                {copied ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
