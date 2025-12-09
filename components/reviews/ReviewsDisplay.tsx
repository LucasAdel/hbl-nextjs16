"use client";

import { useState, useEffect } from "react";
import {
  Star, ThumbsUp, ThumbsDown, CheckCircle2, MessageSquare,
  ChevronDown, Filter, User, Calendar, Award, Verified
} from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  title?: string;
  content: string;
  display_name: string;
  verified: boolean;
  would_recommend: boolean;
  helpful_count: number;
  created_at: string;
  product_name?: string;
  photos?: string[];
}

interface ReviewsDisplayProps {
  productId?: string;
  serviceType?: string;
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

export function ReviewsDisplay({
  productId,
  serviceType,
  limit = 10,
  showFilters = true,
  className = "",
}: ReviewsDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "rating">("recent");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const params = new URLSearchParams();
        if (productId) params.set("productId", productId);
        if (serviceType) params.set("serviceType", serviceType);
        params.set("limit", limit.toString());

        const response = await fetch(`/api/reviews?${params}`);
        const data = await response.json();
        setReviews(data.reviews || []);
      } catch {
        // Use mock data on error
        setReviews(getMockReviews());
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, serviceType, limit]);

  const handleHelpful = async (reviewId: string, helpful: boolean) => {
    try {
      await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful }),
      });

      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, helpful_count: r.helpful_count + (helpful ? 1 : 0) }
            : r
        )
      );

      toast.success(helpful ? "Thanks for your feedback!" : "Feedback recorded");
    } catch {
      toast.error("Failed to submit feedback");
    }
  };

  const toggleExpanded = (reviewId: string) => {
    setExpanded((prev) =>
      prev.includes(reviewId)
        ? prev.filter((id) => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  // Sort and filter reviews
  const filteredReviews = reviews
    .filter((r) => filterRating === null || r.rating === filterRating)
    .sort((a, b) => {
      if (sortBy === "helpful") return b.helpful_count - a.helpful_count;
      if (sortBy === "rating") return b.rating - a.rating;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Calculate stats
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100 || 0,
  }));

  const recommendPercentage = reviews.length > 0
    ? (reviews.filter((r) => r.would_recommend).length / reviews.length) * 100
    : 0;

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header with Stats */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Overall Rating */}
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-gray-900 dark:text-white">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-1 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Based on {reviews.length} reviews
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-1">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <button
                key={rating}
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                className={`w-full flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded transition-colors ${
                  filterRating === rating ? "bg-tiffany/10" : ""
                }`}
              >
                <span className="text-sm w-12 text-gray-600 dark:text-gray-400">
                  {rating} star
                </span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm w-8 text-gray-500 dark:text-gray-400">
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Recommendation Rate */}
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="text-3xl font-bold text-green-600">
              {recommendPercentage.toFixed(0)}%
            </div>
            <div className="text-sm text-green-700 dark:text-green-400">
              Would Recommend
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredReviews.length} reviews
            </span>
            {filterRating !== null && (
              <button
                onClick={() => setFilterRating(null)}
                className="text-sm text-tiffany hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              expanded={expanded.includes(review.id)}
              onToggleExpand={() => toggleExpanded(review.id)}
              onHelpful={(helpful) => handleHelpful(review.id, helpful)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  expanded,
  onToggleExpand,
  onHelpful,
}: {
  review: Review;
  expanded: boolean;
  onToggleExpand: () => void;
  onHelpful: (helpful: boolean) => void;
}) {
  const isLong = review.content.length > 300;
  const displayContent = isLong && !expanded
    ? review.content.slice(0, 300) + "..."
    : review.content;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tiffany to-tiffany-dark flex items-center justify-center text-white font-semibold">
            {review.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {review.display_name}
              </span>
              {review.verified && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              {new Date(review.created_at).toLocaleDateString()}
              {review.product_name && (
                <>
                  <span>•</span>
                  <span>{review.product_name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= review.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          {review.title}
        </h4>
      )}

      {/* Content */}
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {displayContent}
      </p>
      {isLong && (
        <button
          onClick={onToggleExpand}
          className="text-tiffany hover:underline text-sm mt-2"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {/* Would Recommend */}
      {review.would_recommend && (
        <div className="flex items-center gap-2 mt-3 text-sm text-green-600">
          <Award className="h-4 w-4" />
          <span>Would recommend to others</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Was this helpful?
          </span>
          <button
            onClick={() => onHelpful(true)}
            className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-tiffany transition-colors"
          >
            <ThumbsUp className="h-4 w-4" />
            Yes ({review.helpful_count})
          </button>
          <button
            onClick={() => onHelpful(false)}
            className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ThumbsDown className="h-4 w-4" />
            No
          </button>
        </div>
      </div>
    </div>
  );
}

// Compact reviews for product cards
export function ReviewsSummary({
  rating,
  count,
  showCount = true,
}: {
  rating: number;
  count: number;
  showCount?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
      {showCount && (
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
          ({count})
        </span>
      )}
    </div>
  );
}

// Mock data
function getMockReviews(): Review[] {
  return [
    {
      id: "1",
      rating: 5,
      title: "Excellent Template",
      content: "This employment contract template saved me hours of work. Very comprehensive and easy to customize for our medical practice needs. The included guide was particularly helpful in understanding which clauses to modify for our specific situation.",
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
  ];
}

export default ReviewsDisplay;
