/**
 * useKnowledgeTracking Hook
 *
 * Automatically tracks chat queries and user feedback for knowledge base improvement.
 * Integrates seamlessly with the AIChatAssistant component.
 */

"use client";

import { useCallback, useRef } from "react";
import { trackChatQuery, recordChatFeedback } from "./knowledge-manager";
import { findRelevantKnowledge, detectIntent, type KnowledgeItem } from "@/features/bailey-ai/lib/knowledge-base";

interface TrackingResult {
  matched: boolean;
  items: KnowledgeItem[];
  intent: string;
  gapDetected: boolean;
}

interface UseKnowledgeTrackingReturn {
  trackQuery: (query: string) => TrackingResult;
  recordFeedback: (
    itemId: string,
    messageId: string,
    rating: "helpful" | "not_helpful" | "needs_improvement",
    comment?: string
  ) => void;
  getRelevantKnowledge: (query: string) => KnowledgeItem[];
  getIntent: (query: string) => string;
}

/**
 * Hook for tracking knowledge base usage and gathering improvement data
 */
export function useKnowledgeTracking(): UseKnowledgeTrackingReturn {
  // Track processed queries to avoid duplicates
  const processedQueries = useRef<Set<string>>(new Set());

  /**
   * Track a user query and return matching knowledge items
   */
  const trackQuery = useCallback((query: string): TrackingResult => {
    // Normalize query
    const normalizedQuery = query.trim().toLowerCase();

    // Skip if already processed recently (within same session)
    if (processedQueries.current.has(normalizedQuery)) {
      const items = findRelevantKnowledge(query);
      return {
        matched: items.length > 0,
        items,
        intent: detectIntent(query),
        gapDetected: false,
      };
    }

    // Track the query
    const result = trackChatQuery(query);
    processedQueries.current.add(normalizedQuery);

    return {
      matched: result.matched,
      items: result.items,
      intent: detectIntent(query),
      gapDetected: !!result.gap,
    };
  }, []);

  /**
   * Record user feedback on a response
   */
  const recordFeedback = useCallback(
    (
      itemId: string,
      messageId: string,
      rating: "helpful" | "not_helpful" | "needs_improvement",
      comment?: string
    ) => {
      recordChatFeedback(itemId, messageId, rating, comment);
    },
    []
  );

  /**
   * Get relevant knowledge items without tracking (for preview/display)
   */
  const getRelevantKnowledge = useCallback((query: string): KnowledgeItem[] => {
    return findRelevantKnowledge(query);
  }, []);

  /**
   * Get detected intent without tracking
   */
  const getIntent = useCallback((query: string): string => {
    return detectIntent(query);
  }, []);

  return {
    trackQuery,
    recordFeedback,
    getRelevantKnowledge,
    getIntent,
  };
}

/**
 * Utility function to generate a unique message ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Utility to check if a response quality is high enough
 */
export function isHighQualityResponse(
  items: KnowledgeItem[],
  minConfidence: number = 7
): boolean {
  if (items.length === 0) return false;
  return items[0].confidenceLevel >= minConfidence;
}

/**
 * Utility to get suggested follow-up topics based on current query
 */
export function getSuggestedTopics(currentItem: KnowledgeItem): string[] {
  const relatedCategories: Record<string, string[]> = {
    "tenant-doctor": ["payroll-tax", "fair-work", "compliance"],
    "payroll-tax": ["tenant-doctor", "state-revenue-offices", "case_law"],
    compliance: ["ahpra-declarations", "fair-work", "risk-indicators"],
    services: ["pricing-info", "contact-info", "booking"],
    partnership: ["doctors-pay-calculator", "technology-integration"],
  };

  const related = relatedCategories[currentItem.subcategory] || [];
  return related.slice(0, 3);
}
