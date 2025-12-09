/**
 * Library Content Types
 * Comprehensive type definitions for the legal resource library
 */

// ============================================
// Article Types
// ============================================

export interface LibraryArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  author: ArticleAuthor;
  category: ArticleCategory;
  tags: string[];
  publishDate: string;
  lastModified?: string;
  status: ArticleStatus;
  featured: boolean;
  priority: number;

  // Content metadata
  readingTime: number;
  wordCount?: number;
  heroImage?: string;

  // Legal-specific
  jurisdiction: Jurisdiction[];
  practiceAreas: PracticeArea[];
  legalCitations?: LegalCitation[];
  legislation?: Legislation[];

  // Audience targeting
  targetAudience: TargetAudience[];
  difficulty: DifficultyLevel;

  // Display options
  showTableOfContents: boolean;
  showAuthor: boolean;
  showPublishDate: boolean;
  showReadingTime: boolean;
  showSocialShare: boolean;

  // Engagement
  estimatedEngagement?: number;
  viewCount?: number;

  // Relations
  relatedArticles?: string[];
  series?: string;
  seriesOrder?: number;

  // Premium content
  isPremium?: boolean;
  requiredSubscription?: SubscriptionLevel;
}

export interface ArticleAuthor {
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
  email?: string;
  linkedIn?: string;
}

export type ArticleCategory =
  | "Medical Practice Law"
  | "Payroll Tax"
  | "AHPRA Compliance"
  | "Healthcare Compliance"
  | "Employment Law"
  | "Commercial Agreements"
  | "Intellectual Property"
  | "Corporate Law"
  | "Property Law"
  | "Visa & Immigration"
  | "Tax Compliance"
  | "Regulatory"
  | "Business";

export type ArticleStatus = "draft" | "published" | "archived";

export type Jurisdiction =
  | "National"
  | "NSW"
  | "VIC"
  | "QLD"
  | "SA"
  | "WA"
  | "TAS"
  | "NT"
  | "ACT"
  | "All States";

export type PracticeArea =
  | "General Practice"
  | "Medical Practice"
  | "Dental Practice"
  | "Specialist Practice"
  | "Allied Health"
  | "Aged Care"
  | "Mental Health"
  | "Pathology"
  | "Radiology"
  | "Pharmacy";

export type TargetAudience =
  | "General Practitioners"
  | "Medical Centre Owners"
  | "Practice Managers"
  | "Healthcare Administrators"
  | "Specialists"
  | "Allied Health Professionals"
  | "Accountants"
  | "Healthcare CFOs"
  | "Lawyers";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type SubscriptionLevel = "free" | "basic" | "premium";

export interface LegalCitation {
  case: string;
  court: string;
  year: number;
  citation: string;
  url?: string;
}

export interface Legislation {
  title: string;
  jurisdiction: Jurisdiction;
  year: number;
  url?: string;
}

// ============================================
// Search & Filter Types
// ============================================

export interface SearchFilters {
  query: string;
  categories: ArticleCategory[];
  practiceAreas: PracticeArea[];
  targetAudience: TargetAudience[];
  jurisdictions: Jurisdiction[];
  readingTimeRange: ReadingTimeRange;
  dateRange: DateRange;
  author?: string;
  difficulty?: DifficultyLevel;
  featured?: boolean;
  premium?: boolean;
}

export type ReadingTimeRange =
  | "all"
  | "1-5"
  | "6-10"
  | "11-15"
  | "16+";

export type DateRange =
  | "all"
  | "last-month"
  | "last-3-months"
  | "last-6-months"
  | "last-year";

export type SortOption =
  | "relevance"
  | "newest"
  | "oldest"
  | "title-asc"
  | "title-desc"
  | "reading-time-asc"
  | "reading-time-desc"
  | "popular";

export interface SearchResult {
  article: LibraryArticle;
  score: number;
  matchPercentage: number;
  highlights: SearchHighlight[];
}

export interface SearchHighlight {
  field: string;
  matches: string[];
}

// ============================================
// Tag System
// ============================================

export interface Tag {
  id: string;
  name: string;
  slug: string;
  category: TagCategory;
  description?: string;
  relatedTags?: string[];
  articleCount?: number;
}

export type TagCategory =
  | "practice-area"
  | "legal-topic"
  | "audience"
  | "document-type"
  | "compliance"
  | "business-type"
  | "jurisdiction"
  | "difficulty-level";

// ============================================
// Practice Area Types
// ============================================

export interface PracticeAreaDetails {
  id: string;
  name: PracticeArea;
  slug: string;
  description: string;
  overview: string;
  icon: string;
  color: string;
  services?: ServiceItem[];
  faqs?: FAQItem[];
  relatedArticles?: string[];
  articleCount?: number;
}

export interface ServiceItem {
  name: string;
  description: string;
  price?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

// ============================================
// Analytics & Engagement
// ============================================

export interface ArticleAnalytics {
  articleId: string;
  views: number;
  uniqueViews: number;
  averageReadTime: number;
  completionRate: number;
  shares: ShareMetrics;
  bookmarks: number;
}

export interface ShareMetrics {
  total: number;
  twitter: number;
  linkedin: number;
  facebook: number;
  email: number;
  copy: number;
}

export interface ReadingProgress {
  articleId: string;
  userId: string;
  progress: number; // 0-100
  lastPosition: number;
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

// ============================================
// Bookmarks & Collections
// ============================================

export interface Bookmark {
  id: string;
  userId: string;
  articleId: string;
  createdAt: Date;
  notes?: string;
  collection?: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  articleIds: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// RSS & Syndication
// ============================================

export interface RSSFeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author: string;
  category: string;
  guid: string;
  content?: string;
}

// ============================================
// Constants
// ============================================

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  "Medical Practice Law",
  "Payroll Tax",
  "AHPRA Compliance",
  "Healthcare Compliance",
  "Employment Law",
  "Commercial Agreements",
  "Intellectual Property",
  "Corporate Law",
  "Property Law",
  "Visa & Immigration",
  "Tax Compliance",
  "Regulatory",
  "Business",
];

export const JURISDICTIONS: Jurisdiction[] = [
  "National",
  "NSW",
  "VIC",
  "QLD",
  "SA",
  "WA",
  "TAS",
  "NT",
  "ACT",
  "All States",
];

export const PRACTICE_AREAS: PracticeArea[] = [
  "General Practice",
  "Medical Practice",
  "Dental Practice",
  "Specialist Practice",
  "Allied Health",
  "Aged Care",
  "Mental Health",
  "Pathology",
  "Radiology",
  "Pharmacy",
];

export const TARGET_AUDIENCES: TargetAudience[] = [
  "General Practitioners",
  "Medical Centre Owners",
  "Practice Managers",
  "Healthcare Administrators",
  "Specialists",
  "Allied Health Professionals",
  "Accountants",
  "Healthcare CFOs",
  "Lawyers",
];

export const READING_TIME_RANGES: { value: ReadingTimeRange; label: string }[] = [
  { value: "all", label: "Any length" },
  { value: "1-5", label: "1-5 minutes" },
  { value: "6-10", label: "6-10 minutes" },
  { value: "11-15", label: "11-15 minutes" },
  { value: "16+", label: "16+ minutes" },
];

export const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "last-month", label: "Last month" },
  { value: "last-3-months", label: "Last 3 months" },
  { value: "last-6-months", label: "Last 6 months" },
  { value: "last-year", label: "Last year" },
];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Most Relevant" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title-asc", label: "Title A-Z" },
  { value: "title-desc", label: "Title Z-A" },
  { value: "reading-time-asc", label: "Shortest First" },
  { value: "reading-time-desc", label: "Longest First" },
  { value: "popular", label: "Most Popular" },
];
