"use client";

import { useState } from "react";
import { ThumbsUp, MessageCircle, Share2, Bookmark, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import type { LibraryArticle } from "@/lib/library/types";

interface ArticleActionsProps {
  article: LibraryArticle;
}

export function ArticleActions({ article }: ArticleActionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      toast.success("Thanks for the feedback!", {
        description: "+10 XP for engaging with content",
      });
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (!isBookmarked) {
      toast.success("Article saved!", {
        description: "Find it in your bookmarks anytime",
      });
    } else {
      toast.info("Removed from bookmarks");
    }
  };

  const handleShare = async (platform: string) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = article.title;

    switch (platform) {
      case "copy":
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "email":
        window.open(
          `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this article: ${url}`)}`,
          "_blank"
        );
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Like Button */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          isLiked
            ? "bg-tiffany-100 dark:bg-tiffany-900/30 text-tiffany-700 dark:text-tiffany-300"
            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
        }`}
      >
        <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
        {isLiked ? "Helpful" : "Was this helpful?"}
      </button>

      {/* Bookmark Button */}
      <button
        onClick={handleBookmark}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          isBookmarked
            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
        }`}
      >
        <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
        {isBookmarked ? "Saved" : "Save"}
      </button>

      {/* Share Button */}
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>

        {/* Share Menu Dropdown */}
        {showShareMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowShareMenu(false)}
            />
            <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-2 z-50 min-w-[160px]">
              <button
                onClick={() => handleShare("copy")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </button>
              <button
                onClick={() => handleShare("twitter")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter/X
              </button>
              <button
                onClick={() => handleShare("linkedin")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </button>
              <button
                onClick={() => handleShare("email")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Email
              </button>
            </div>
          </>
        )}
      </div>

      {/* Feedback Link */}
      <a
        href={`/contact?subject=Feedback on: ${encodeURIComponent(article.title)}`}
        className="ml-auto text-sm text-slate-500 dark:text-slate-400 hover:text-tiffany-600 dark:hover:text-tiffany-400 transition-colors"
      >
        Report an issue
      </a>
    </div>
  );
}
