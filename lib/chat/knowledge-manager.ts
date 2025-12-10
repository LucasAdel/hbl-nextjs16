/**
 * Knowledge Base Manager - Hamilton Bailey AI Agent
 *
 * Proactive, intuitive system for managing and improving the AI knowledge base.
 * Tracks usage, identifies gaps, and provides easy knowledge management.
 */

import { KnowledgeItem, KNOWLEDGE_BASE, findRelevantKnowledge, detectIntent } from '@/features/bailey-ai/lib/knowledge-base';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface KnowledgeUsageStats {
  itemId: string;
  hitCount: number;
  lastUsed: Date;
  averageConfidence: number;
  userSatisfactionScore: number;
  feedbackCount: number;
}

export interface KnowledgeGap {
  query: string;
  timestamp: Date;
  detectedIntent: string;
  suggestedCategory: string;
  frequency: number;
  priority: 'high' | 'medium' | 'low';
}

export interface KnowledgeFeedback {
  itemId: string;
  messageId: string;
  rating: 'helpful' | 'not_helpful' | 'needs_improvement';
  comment?: string;
  suggestedImprovement?: string;
  timestamp: Date;
}

export interface KnowledgeAnalytics {
  totalQueries: number;
  matchedQueries: number;
  unmatchedQueries: number;
  matchRate: number;
  topCategories: { category: string; count: number }[];
  topItems: { itemId: string; title: string; count: number }[];
  recentGaps: KnowledgeGap[];
  improvementSuggestions: string[];
}

export interface NewKnowledgeItemDraft {
  category: string;
  subcategory: string;
  topic: string;
  title: string;
  content: string;
  summary: string;
  keywords: string[];
  intentPatterns: string[];
  requiresDisclaimer: boolean;
  legalDisclaimer?: string;
  adviceLevel: 'general' | 'educational' | 'specific';
  relatedProducts?: string[];
}

// ============================================
// KNOWLEDGE MANAGER CLASS
// ============================================

class KnowledgeManager {
  private usageStats: Map<string, KnowledgeUsageStats> = new Map();
  private gaps: KnowledgeGap[] = [];
  private feedback: KnowledgeFeedback[] = [];
  private queryLog: { query: string; matched: boolean; timestamp: Date }[] = [];

  constructor() {
    this.initializeStats();
  }

  private initializeStats(): void {
    KNOWLEDGE_BASE.forEach(item => {
      this.usageStats.set(item.id, {
        itemId: item.id,
        hitCount: 0,
        lastUsed: new Date(0),
        averageConfidence: item.confidenceLevel,
        userSatisfactionScore: 0,
        feedbackCount: 0,
      });
    });
  }

  // ============================================
  // QUERY TRACKING
  // ============================================

  /**
   * Track a user query and update statistics
   */
  trackQuery(query: string): { matched: boolean; items: KnowledgeItem[]; gap?: KnowledgeGap } {
    const items = findRelevantKnowledge(query);
    const matched = items.length > 0;

    // Log the query
    this.queryLog.push({ query, matched, timestamp: new Date() });

    // Update usage stats for matched items
    items.forEach(item => {
      const stats = this.usageStats.get(item.id);
      if (stats) {
        stats.hitCount++;
        stats.lastUsed = new Date();
        this.usageStats.set(item.id, stats);
      }
    });

    // Track gap if no match
    let gap: KnowledgeGap | undefined;
    if (!matched) {
      gap = this.trackGap(query);
    }

    return { matched, items, gap };
  }

  /**
   * Track a knowledge gap (unmatched query)
   */
  private trackGap(query: string): KnowledgeGap {
    const intent = detectIntent(query);
    const suggestedCategory = this.suggestCategory(query, intent);

    // Check if similar gap already exists
    const existingGap = this.gaps.find(g =>
      g.query.toLowerCase().includes(query.toLowerCase().slice(0, 20)) ||
      query.toLowerCase().includes(g.query.toLowerCase().slice(0, 20))
    );

    if (existingGap) {
      existingGap.frequency++;
      existingGap.priority = this.calculatePriority(existingGap.frequency);
      return existingGap;
    }

    const newGap: KnowledgeGap = {
      query,
      timestamp: new Date(),
      detectedIntent: intent,
      suggestedCategory,
      frequency: 1,
      priority: 'low',
    };

    this.gaps.push(newGap);
    return newGap;
  }

  private suggestCategory(query: string, intent: string): string {
    const categoryMap: Record<string, string> = {
      booking: 'services',
      pricing: 'pricing',
      tenant_doctor: 'services',
      payroll_tax: 'compliance',
      fair_work: 'compliance',
      ahpra: 'compliance',
      pathology: 'services',
      legal_audit: 'services',
      audit: 'services',
      case_law: 'expertise',
      risk_language: 'compliance',
      compliance: 'compliance',
      structure: 'services',
      property: 'services',
      partnership: 'partnerships',
      technology: 'technology',
      contact: 'contact',
      urgent: 'services',
      copyright: 'legal',
      resources: 'resources',
      about: 'company',
      team: 'team',
    };

    return categoryMap[intent] || 'general';
  }

  private calculatePriority(frequency: number): 'high' | 'medium' | 'low' {
    if (frequency >= 5) return 'high';
    if (frequency >= 3) return 'medium';
    return 'low';
  }

  // ============================================
  // FEEDBACK MANAGEMENT
  // ============================================

  /**
   * Record user feedback on a knowledge item response
   */
  recordFeedback(feedback: Omit<KnowledgeFeedback, 'timestamp'>): void {
    const fullFeedback: KnowledgeFeedback = {
      ...feedback,
      timestamp: new Date(),
    };

    this.feedback.push(fullFeedback);

    // Update satisfaction score
    const stats = this.usageStats.get(feedback.itemId);
    if (stats) {
      const ratingValue = feedback.rating === 'helpful' ? 1 : feedback.rating === 'needs_improvement' ? 0.5 : 0;
      stats.feedbackCount++;
      stats.userSatisfactionScore =
        ((stats.userSatisfactionScore * (stats.feedbackCount - 1)) + ratingValue) / stats.feedbackCount;
      this.usageStats.set(feedback.itemId, stats);
    }
  }

  // ============================================
  // ANALYTICS & INSIGHTS
  // ============================================

  /**
   * Get comprehensive analytics about knowledge base usage
   */
  getAnalytics(): KnowledgeAnalytics {
    const totalQueries = this.queryLog.length;
    const matchedQueries = this.queryLog.filter(q => q.matched).length;
    const unmatchedQueries = totalQueries - matchedQueries;
    const matchRate = totalQueries > 0 ? (matchedQueries / totalQueries) * 100 : 0;

    // Get top categories
    const categoryCount = new Map<string, number>();
    KNOWLEDGE_BASE.forEach(item => {
      const stats = this.usageStats.get(item.id);
      if (stats) {
        categoryCount.set(item.category, (categoryCount.get(item.category) || 0) + stats.hitCount);
      }
    });
    const topCategories = Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get top items
    const topItems = Array.from(this.usageStats.values())
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, 10)
      .map(stats => {
        const item = KNOWLEDGE_BASE.find(i => i.id === stats.itemId);
        return {
          itemId: stats.itemId,
          title: item?.title || stats.itemId,
          count: stats.hitCount,
        };
      });

    // Get recent high-priority gaps
    const recentGaps = this.gaps
      .filter(g => g.priority === 'high' || g.priority === 'medium')
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Generate improvement suggestions
    const improvementSuggestions = this.generateImprovementSuggestions();

    return {
      totalQueries,
      matchedQueries,
      unmatchedQueries,
      matchRate,
      topCategories,
      topItems,
      recentGaps,
      improvementSuggestions,
    };
  }

  private generateImprovementSuggestions(): string[] {
    const suggestions: string[] = [];

    // Check for low-performing items
    const lowPerformers = Array.from(this.usageStats.values())
      .filter(s => s.feedbackCount > 3 && s.userSatisfactionScore < 0.5);

    if (lowPerformers.length > 0) {
      suggestions.push(`${lowPerformers.length} knowledge items have low satisfaction scores and need improvement`);
    }

    // Check for high-frequency gaps
    const highPriorityGaps = this.gaps.filter(g => g.priority === 'high');
    if (highPriorityGaps.length > 0) {
      suggestions.push(`${highPriorityGaps.length} frequently asked topics are not covered in the knowledge base`);
    }

    // Check for unused items
    const unusedItems = Array.from(this.usageStats.values()).filter(s => s.hitCount === 0);
    if (unusedItems.length > 5) {
      suggestions.push(`${unusedItems.length} knowledge items have never been used - consider updating their keywords`);
    }

    // Check match rate
    const analytics = { matchRate: this.queryLog.length > 0 ?
      (this.queryLog.filter(q => q.matched).length / this.queryLog.length) * 100 : 100 };
    if (analytics.matchRate < 70) {
      suggestions.push(`Match rate is ${analytics.matchRate.toFixed(1)}% - consider adding more knowledge items`);
    }

    return suggestions;
  }

  // ============================================
  // KNOWLEDGE ITEM MANAGEMENT
  // ============================================

  /**
   * Get all knowledge items with their stats
   */
  getAllItemsWithStats(): (KnowledgeItem & { stats: KnowledgeUsageStats })[] {
    return KNOWLEDGE_BASE.map(item => ({
      ...item,
      stats: this.usageStats.get(item.id) || {
        itemId: item.id,
        hitCount: 0,
        lastUsed: new Date(0),
        averageConfidence: item.confidenceLevel,
        userSatisfactionScore: 0,
        feedbackCount: 0,
      },
    }));
  }

  /**
   * Get knowledge gaps that need attention
   */
  getKnowledgeGaps(): KnowledgeGap[] {
    return this.gaps.sort((a, b) => {
      // Sort by priority first, then by frequency
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.frequency - a.frequency;
    });
  }

  /**
   * Get feedback for improvement
   */
  getFeedbackForImprovement(): KnowledgeFeedback[] {
    return this.feedback
      .filter(f => f.rating === 'not_helpful' || f.rating === 'needs_improvement')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Generate a new knowledge item draft from a gap
   */
  generateDraftFromGap(gap: KnowledgeGap): NewKnowledgeItemDraft {
    const id = gap.query.toLowerCase().replace(/\s+/g, '-').slice(0, 30);

    return {
      category: gap.suggestedCategory,
      subcategory: gap.detectedIntent,
      topic: gap.query.toLowerCase(),
      title: this.titleCase(gap.query),
      content: `[Add detailed content about: ${gap.query}]`,
      summary: `[Add brief summary about: ${gap.query}]`,
      keywords: gap.query.toLowerCase().split(' ').filter(w => w.length > 3),
      intentPatterns: [gap.query.toLowerCase()],
      requiresDisclaimer: gap.suggestedCategory === 'compliance' || gap.suggestedCategory === 'services',
      legalDisclaimer: gap.suggestedCategory === 'compliance' ?
        'Professional advice should be obtained for your specific circumstances.' : undefined,
      adviceLevel: gap.suggestedCategory === 'compliance' ? 'specific' : 'general',
      relatedProducts: [],
    };
  }

  private titleCase(str: string): string {
    return str.replace(/\w\S*/g, txt =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Validate a new knowledge item
   */
  validateKnowledgeItem(item: NewKnowledgeItemDraft): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!item.title || item.title.length < 5) {
      errors.push('Title must be at least 5 characters');
    }
    if (!item.content || item.content.length < 50) {
      errors.push('Content must be at least 50 characters');
    }
    if (!item.summary || item.summary.length < 20) {
      errors.push('Summary must be at least 20 characters');
    }
    if (!item.keywords || item.keywords.length < 3) {
      errors.push('At least 3 keywords are required');
    }
    if (!item.intentPatterns || item.intentPatterns.length < 1) {
      errors.push('At least 1 intent pattern is required');
    }
    if (item.requiresDisclaimer && !item.legalDisclaimer) {
      errors.push('Legal disclaimer is required when requiresDisclaimer is true');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Generate response template from content
   */
  generateResponseTemplate(item: NewKnowledgeItemDraft): string {
    const sections = item.content.split('\n\n');
    let template = `**${item.title}**\n\n`;

    sections.forEach((section, index) => {
      if (index === 0) {
        template += section + '\n\n';
      } else {
        template += `**Key Points:**\n${section}\n\n`;
      }
    });

    template += '\nWould you like more information or to schedule a consultation?';

    return template;
  }

  // ============================================
  // EXPORT / IMPORT
  // ============================================

  /**
   * Export knowledge base for backup or transfer
   */
  exportKnowledgeBase(): string {
    return JSON.stringify({
      items: KNOWLEDGE_BASE,
      stats: Array.from(this.usageStats.entries()),
      gaps: this.gaps,
      feedback: this.feedback,
      exportDate: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Get category options for forms
   */
  getCategoryOptions(): { value: string; label: string }[] {
    const categories = new Set(KNOWLEDGE_BASE.map(item => item.category));
    return Array.from(categories).map(cat => ({
      value: cat,
      label: this.titleCase(cat.replace(/-/g, ' ')),
    }));
  }

  /**
   * Get subcategory options for a category
   */
  getSubcategoryOptions(category: string): { value: string; label: string }[] {
    const subcategories = new Set(
      KNOWLEDGE_BASE.filter(item => item.category === category).map(item => item.subcategory)
    );
    return Array.from(subcategories).map(sub => ({
      value: sub,
      label: this.titleCase(sub.replace(/-/g, ' ')),
    }));
  }
}

// Singleton instance
export const knowledgeManager = new KnowledgeManager();

// ============================================
// HELPER FUNCTIONS FOR QUICK ACCESS
// ============================================

export function trackChatQuery(query: string) {
  return knowledgeManager.trackQuery(query);
}

export function recordChatFeedback(
  itemId: string,
  messageId: string,
  rating: 'helpful' | 'not_helpful' | 'needs_improvement',
  comment?: string
) {
  knowledgeManager.recordFeedback({ itemId, messageId, rating, comment });
}

export function getKnowledgeAnalytics() {
  return knowledgeManager.getAnalytics();
}

export function getKnowledgeGaps() {
  return knowledgeManager.getKnowledgeGaps();
}

export function getAllKnowledgeItems() {
  return knowledgeManager.getAllItemsWithStats();
}
