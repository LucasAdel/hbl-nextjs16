"use client";

import { useState, useEffect } from "react";
import {
  Star, Send, Gift, Sparkles, CheckCircle2, Camera,
  X, AlertCircle, Trophy, Zap, Heart
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface ReviewSubmissionFormProps {
  productId?: string;
  productName?: string;
  serviceType?: "document" | "consultation" | "article";
  email?: string | null;
  onSubmitSuccess?: (review: ReviewData) => void;
  className?: string;
}

interface ReviewData {
  id?: string;
  rating: number;
  title: string;
  content: string;
  productId?: string;
  productName?: string;
  serviceType?: string;
  email?: string;
  name: string;
  wouldRecommend: boolean;
  helpfulCount?: number;
  photos?: string[];
  verified?: boolean;
  createdAt?: string;
}

// XP rewards for reviews - variable reinforcement
const REVIEW_XP_REWARDS = {
  base: 50,
  withTitle: 15,
  withPhoto: 30,
  detailed: 25, // 50+ words
  fiveStar: 10,
  bonus: { chance: 0.2, amount: 50 }, // 20% chance
  rare: { chance: 0.05, amount: 150 }, // 5% chance
  jackpot: { chance: 0.01, amount: 500 }, // 1% chance
};

// Achievement triggers
const REVIEW_ACHIEVEMENTS = {
  first_review: { id: "first_review", name: "Voice Heard", description: "Submit your first review", xp: 100 },
  five_star: { id: "five_star", name: "Glowing Praise", description: "Leave a 5-star review", xp: 50 },
  detailed_reviewer: { id: "detailed_reviewer", name: "Thoughtful Reviewer", description: "Write a detailed review (100+ words)", xp: 75 },
  photo_reviewer: { id: "photo_reviewer", name: "Picture Perfect", description: "Add a photo to your review", xp: 60 },
  reviewer_10: { id: "reviewer_10", name: "Regular Contributor", description: "Submit 10 reviews", xp: 200 },
};

function triggerReviewConfetti() {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.6 },
    colors: ["#00CED1", "#40E0D0", "#48D1CC", "#FFD700"],
  });
}

export function ReviewSubmissionForm({
  productId,
  productName,
  serviceType = "document",
  email,
  onSubmitSuccess,
  className = "",
}: ReviewSubmissionFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [bonusMessage, setBonusMessage] = useState<string | null>(null);

  // Calculate potential XP in real-time
  const calculatePotentialXP = () => {
    let xp = REVIEW_XP_REWARDS.base;
    if (title.length > 5) xp += REVIEW_XP_REWARDS.withTitle;
    if (photos.length > 0) xp += REVIEW_XP_REWARDS.withPhoto;
    if (content.split(" ").length >= 50) xp += REVIEW_XP_REWARDS.detailed;
    if (rating === 5) xp += REVIEW_XP_REWARDS.fiveStar;
    return xp;
  };

  const potentialXP = calculatePotentialXP();
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  // Star rating labels
  const ratingLabels: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (content.length < 10) {
      toast.error("Please write at least a few words about your experience");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate XP with variable reinforcement
      let totalXP = potentialXP;
      let bonusType: string | null = null;

      // Variable reinforcement rolls
      const roll = Math.random();
      if (roll < REVIEW_XP_REWARDS.jackpot.chance) {
        totalXP += REVIEW_XP_REWARDS.jackpot.amount;
        bonusType = "JACKPOT";
      } else if (roll < REVIEW_XP_REWARDS.rare.chance) {
        totalXP += REVIEW_XP_REWARDS.rare.amount;
        bonusType = "RARE BONUS";
      } else if (roll < REVIEW_XP_REWARDS.bonus.chance) {
        totalXP += REVIEW_XP_REWARDS.bonus.amount;
        bonusType = "BONUS";
      }

      const reviewData: ReviewData = {
        rating,
        title,
        content,
        productId,
        productName,
        serviceType,
        email: email || undefined,
        name,
        wouldRecommend: wouldRecommend ?? true,
        photos,
        verified: !!email,
        createdAt: new Date().toISOString(),
      };

      // Submit review to API
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      // Track XP with gamification API
      await fetch("/api/gamification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review_submit",
          xpEarned: totalXP,
          metadata: {
            rating,
            wordCount,
            hasPhoto: photos.length > 0,
            productId,
          },
        }),
      }).catch(() => {});

      setEarnedXP(totalXP);
      setBonusMessage(bonusType);
      setSubmitted(true);

      // Trigger celebration
      triggerReviewConfetti();

      if (bonusType) {
        setTimeout(() => {
          toast.success(`${bonusType}! +${totalXP} XP earned!`, {
            duration: 5000,
            icon: "🎉",
          });
        }, 500);
      } else {
        toast.success(`Review submitted! +${totalXP} XP earned!`);
      }

      onSubmitSuccess?.(reviewData);
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = () => {
    // Simulated photo upload - in production, integrate with file upload service
    const mockPhotoUrl = `/api/placeholder/review-photo-${Date.now()}.jpg`;
    setPhotos([...photos, mockPhotoUrl]);
    toast.success("Photo added! +30 XP bonus unlocked");
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // Success state
  if (submitted) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center ${className}`}>
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-tiffany rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Thank You! 🎉
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your review helps others make informed decisions.
        </p>

        {/* XP Earned Card */}
        <div className="bg-gradient-to-r from-tiffany to-tiffany-dark rounded-xl p-6 text-white mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-6 w-6" />
            <span className="text-3xl font-bold">+{earnedXP} XP</span>
          </div>
          {bonusMessage && (
            <div className="bg-white/20 rounded-lg px-4 py-2 inline-block">
              <span className="text-sm font-semibold">
                {bonusMessage === "JACKPOT" && "🎰 "}
                {bonusMessage === "RARE BONUS" && "✨ "}
                {bonusMessage === "BONUS" && "🎁 "}
                {bonusMessage}!
              </span>
            </div>
          )}
        </div>

        {/* Next review prompt */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Trophy className="h-5 w-5" />
            <span className="font-medium">Submit 5 more reviews to unlock the "Trusted Voice" badge!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header with XP Preview */}
      <div className="bg-gradient-to-r from-tiffany to-tiffany-dark p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              Write a Review
            </h3>
            {productName && (
              <p className="text-sm opacity-80 mt-1">for {productName}</p>
            )}
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span className="font-semibold">+{potentialXP} XP</span>
            {potentialXP > REVIEW_XP_REWARDS.base && (
              <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Overall Rating *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-tiffany rounded"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              </button>
            ))}
            {(hoverRating || rating) > 0 && (
              <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                {ratingLabels[hoverRating || rating]}
              </span>
            )}
          </div>
          {rating === 5 && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              5-star bonus: +10 XP
            </p>
          )}
        </div>

        {/* Review Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Review Title
            {title.length > 5 && (
              <span className="text-xs text-green-600 ml-2">+15 XP</span>
            )}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
            maxLength={100}
          />
        </div>

        {/* Review Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Review *
            <span className="text-xs text-gray-500 ml-2">
              {wordCount} words
              {wordCount >= 50 && wordCount < 100 && (
                <span className="text-green-600 ml-1">+25 XP (detailed)</span>
              )}
              {wordCount >= 100 && (
                <span className="text-purple-600 ml-1">+25 XP + achievement!</span>
              )}
            </span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your experience. What did you like? How has it helped you?"
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent resize-none"
            required
            minLength={10}
          />
          {wordCount < 50 && wordCount > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Write {50 - wordCount} more words for +25 XP detailed review bonus
            </p>
          )}
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add Photos
            {photos.length === 0 && (
              <span className="text-xs text-gray-500 ml-2">+30 XP for first photo</span>
            )}
          </label>
          <div className="flex flex-wrap gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <Camera className="h-8 w-8" />
                </div>
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <button
                type="button"
                onClick={handlePhotoUpload}
                className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-tiffany hover:text-tiffany transition-colors"
              >
                <Camera className="h-6 w-6" />
                <span className="text-xs mt-1">Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Would Recommend */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Would you recommend this?
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setWouldRecommend(true)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                wouldRecommend === true
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
              }`}
            >
              <Heart className={`h-5 w-5 ${wouldRecommend === true ? "fill-current" : ""}`} />
              Yes, definitely!
            </button>
            <button
              type="button"
              onClick={() => setWouldRecommend(false)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                wouldRecommend === false
                  ? "border-gray-500 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
              }`}
            >
              Not really
            </button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Name (display name)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John D."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
            maxLength={50}
          />
        </div>

        {/* XP Preview Card */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-700 dark:text-purple-300">
                Potential Earnings
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                +{potentialXP}
              </span>
              <span className="text-sm text-purple-600 dark:text-purple-400 ml-1">XP</span>
            </div>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
            Plus up to +500 XP random bonus! 🎰
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full py-3 px-6 bg-gradient-to-r from-tiffany to-tiffany-dark text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Submit Review & Earn XP
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// Compact review prompt for product pages
export function ReviewPromptCard({
  productName,
  productId,
  onStartReview,
}: {
  productName?: string;
  productId?: string;
  onStartReview?: () => void;
}) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-full">
          <Star className="h-6 w-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            Share Your Experience
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Help others by leaving a review and earn up to 100+ XP!
          </p>
          <button
            onClick={onStartReview}
            className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
          >
            <Gift className="h-4 w-4" />
            Write a Review
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewSubmissionForm;
