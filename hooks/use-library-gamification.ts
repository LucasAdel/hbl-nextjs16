"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { LibraryArticle } from "@/lib/codex/types";

// XP rewards for library actions
const XP_REWARDS = {
  ARTICLE_VIEW: 10,
  ARTICLE_COMPLETE: 25,
  ARTICLE_SHARE: 15,
  ARTICLE_BOOKMARK: 5,
  QUIZ_COMPLETE: 50,
  STREAK_BONUS_MULTIPLIER: 0.1, // 10% per day of streak
};

// Reading progress thresholds for completion
const COMPLETION_THRESHOLDS = {
  STARTED: 0.1, // 10% read
  HALFWAY: 0.5, // 50% read
  COMPLETE: 0.9, // 90% read
};

interface UseLibraryGamificationOptions {
  article: LibraryArticle;
  onXPEarned?: (amount: number, reason: string) => void;
}

interface ReadingProgress {
  articleId: string;
  progress: number; // 0-100
  startedAt: string;
  completedAt?: string;
}

export function useLibraryGamification({ article, onXPEarned }: UseLibraryGamificationOptions) {
  const scrollPositionRef = useRef(0);
  const maxScrollRef = useRef(0);
  const hasAwardedViewRef = useRef(false);
  const hasAwardedCompleteRef = useRef(false);

  // Calculate XP with streak bonus
  const calculateXP = useCallback((baseXP: number) => {
    const streakData = localStorage.getItem("gamification-streak");
    if (!streakData) return baseXP;

    try {
      const { current } = JSON.parse(streakData);
      const streakBonus = Math.min(current * XP_REWARDS.STREAK_BONUS_MULTIPLIER, 1); // Max 100% bonus
      return Math.round(baseXP * (1 + streakBonus));
    } catch {
      return baseXP;
    }
  }, []);

  // Award XP for an action
  const awardXP = useCallback((baseAmount: number, reason: string, showToast = true) => {
    const amount = calculateXP(baseAmount);

    // Store XP transaction
    const transactions = JSON.parse(localStorage.getItem("xp-transactions") || "[]");
    transactions.push({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount,
      reason,
      timestamp: new Date().toISOString(),
      source: "library",
    });
    localStorage.setItem("xp-transactions", JSON.stringify(transactions.slice(-100))); // Keep last 100

    // Update total XP
    const totalXP = parseInt(localStorage.getItem("total-xp") || "0", 10) + amount;
    localStorage.setItem("total-xp", totalXP.toString());

    // Show toast notification
    if (showToast) {
      const isBonus = amount > baseAmount;
      toast.success(`+${amount} XP${isBonus ? " (Streak Bonus!)" : ""}`, {
        description: reason,
        duration: 3000,
      });
    }

    // Callback
    onXPEarned?.(amount, reason);

    return amount;
  }, [calculateXP, onXPEarned]);

  // Track article view
  const trackArticleView = useCallback(() => {
    if (hasAwardedViewRef.current) return;
    hasAwardedViewRef.current = true;

    // Record view in analytics
    const viewedArticles = JSON.parse(localStorage.getItem("viewed-articles") || "[]");
    if (!viewedArticles.includes(article.id)) {
      viewedArticles.push(article.id);
      localStorage.setItem("viewed-articles", JSON.stringify(viewedArticles));

      // Award XP for first-time view
      awardXP(XP_REWARDS.ARTICLE_VIEW, `Started reading: ${article.title.slice(0, 30)}...`);
    }
  }, [article.id, article.title, awardXP]);

  // Track reading progress
  const trackReadingProgress = useCallback((scrollPercentage: number) => {
    maxScrollRef.current = Math.max(maxScrollRef.current, scrollPercentage);

    // Save progress
    const progress: ReadingProgress = {
      articleId: article.id,
      progress: Math.round(maxScrollRef.current * 100),
      startedAt: new Date().toISOString(),
    };

    // Check for completion
    if (maxScrollRef.current >= COMPLETION_THRESHOLDS.COMPLETE && !hasAwardedCompleteRef.current) {
      hasAwardedCompleteRef.current = true;
      progress.completedAt = new Date().toISOString();

      // Award completion XP based on article reading time
      const completionXP = XP_REWARDS.ARTICLE_COMPLETE + (article.readingTime * 5);
      awardXP(completionXP, `Completed: ${article.title.slice(0, 30)}...`);

      // Update completed articles count
      const completedCount = parseInt(localStorage.getItem("articles-completed") || "0", 10) + 1;
      localStorage.setItem("articles-completed", completedCount.toString());

      // Check for achievements
      checkAchievements(completedCount);
    }

    // Save to localStorage
    const allProgress = JSON.parse(localStorage.getItem("reading-progress") || "{}");
    allProgress[article.id] = progress;
    localStorage.setItem("reading-progress", JSON.stringify(allProgress));
  }, [article.id, article.title, article.readingTime, awardXP]);

  // Check for achievements
  const checkAchievements = useCallback((completedCount: number) => {
    const achievements = JSON.parse(localStorage.getItem("achievements") || "[]");

    const newAchievements: { id: string; name: string; xp: number }[] = [];

    // First article read
    if (completedCount === 1 && !achievements.includes("first-article")) {
      newAchievements.push({ id: "first-article", name: "Bookworm Beginner", xp: 50 });
    }

    // Read 5 articles
    if (completedCount >= 5 && !achievements.includes("five-articles")) {
      newAchievements.push({ id: "five-articles", name: "Knowledge Seeker", xp: 100 });
    }

    // Read 10 articles
    if (completedCount >= 10 && !achievements.includes("ten-articles")) {
      newAchievements.push({ id: "ten-articles", name: "Legal Scholar", xp: 200 });
    }

    // Read 25 articles
    if (completedCount >= 25 && !achievements.includes("twentyfive-articles")) {
      newAchievements.push({ id: "twentyfive-articles", name: "Legal Expert", xp: 500 });
    }

    // Award new achievements
    newAchievements.forEach((achievement) => {
      achievements.push(achievement.id);
      awardXP(achievement.xp, `Achievement Unlocked: ${achievement.name}`, true);
    });

    localStorage.setItem("achievements", JSON.stringify(achievements));
  }, [awardXP]);

  // Track article share
  const trackShare = useCallback((platform: string) => {
    awardXP(XP_REWARDS.ARTICLE_SHARE, `Shared article on ${platform}`);

    // Track share count
    const shareCount = parseInt(localStorage.getItem("share-count") || "0", 10) + 1;
    localStorage.setItem("share-count", shareCount.toString());

    // Achievement for first share
    const achievements = JSON.parse(localStorage.getItem("achievements") || "[]");
    if (!achievements.includes("first-share")) {
      achievements.push("first-share");
      localStorage.setItem("achievements", JSON.stringify(achievements));
      awardXP(25, "Achievement Unlocked: Knowledge Spreader");
    }
  }, [awardXP]);

  // Track article bookmark
  const trackBookmark = useCallback((isBookmarking: boolean) => {
    if (isBookmarking) {
      awardXP(XP_REWARDS.ARTICLE_BOOKMARK, "Article bookmarked");

      // Save bookmark
      const bookmarks = JSON.parse(localStorage.getItem("library-bookmarks") || "[]");
      if (!bookmarks.find((b: { articleId: string }) => b.articleId === article.slug)) {
        bookmarks.push({
          articleId: article.slug,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem("library-bookmarks", JSON.stringify(bookmarks));
      }
    }
  }, [article.slug, awardXP]);

  // Setup scroll tracking
  useEffect(() => {
    trackArticleView();

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = docHeight > 0 ? scrollTop / docHeight : 0;

      trackReadingProgress(scrollPercentage);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [trackArticleView, trackReadingProgress]);

  // Get current reading progress
  const getReadingProgress = useCallback((): number => {
    const allProgress = JSON.parse(localStorage.getItem("reading-progress") || "{}");
    return allProgress[article.id]?.progress || 0;
  }, [article.id]);

  // Check if article is completed
  const isArticleCompleted = useCallback((): boolean => {
    const allProgress = JSON.parse(localStorage.getItem("reading-progress") || "{}");
    return !!allProgress[article.id]?.completedAt;
  }, [article.id]);

  return {
    trackShare,
    trackBookmark,
    getReadingProgress,
    isArticleCompleted,
    awardXP,
  };
}

// Utility function to get library stats
export function getLibraryStats() {
  const viewedArticles = JSON.parse(localStorage.getItem("viewed-articles") || "[]");
  const completedArticles = parseInt(localStorage.getItem("articles-completed") || "0", 10);
  const totalXP = parseInt(localStorage.getItem("total-xp") || "0", 10);
  const shareCount = parseInt(localStorage.getItem("share-count") || "0", 10);
  const achievements = JSON.parse(localStorage.getItem("achievements") || "[]");
  const bookmarks = JSON.parse(localStorage.getItem("library-bookmarks") || "[]");

  return {
    articlesViewed: viewedArticles.length,
    articlesCompleted: completedArticles,
    totalXP,
    shareCount,
    achievementsUnlocked: achievements.length,
    bookmarksCount: bookmarks.length,
  };
}
