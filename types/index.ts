/**
 * Core type definitions for Hamilton Bailey Law application
 */

// ============================================
// User & Authentication Types
// ============================================

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  preferences?: UserPreferences;
}

export type UserRole = "client" | "admin" | "staff" | "guest";

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  newsletter: boolean;
  theme: "light" | "dark" | "system";
  timezone?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Document & Product Types
// ============================================

export interface LegalDocument {
  id: string;
  name: string;
  description: string;
  price: number;
  category: DocumentCategory;
  practiceArea: PracticeArea;
  jurisdictions: Jurisdiction[];
  featured?: boolean;
  popularity?: number;
  stages?: DocumentStage[];
  relatedDocuments?: string[];
  tags?: string[];
  lastUpdated?: string;
}

export interface DocumentStage {
  id: string;
  name: string;
  description: string;
  price: number;
}

export type DocumentCategory =
  | "Employment"
  | "Practice Management"
  | "Compliance"
  | "Property"
  | "Corporate"
  | "Regulatory"
  | "Visa & Immigration"
  | "Custom Documents"
  | "Document Bundles";

export type PracticeArea =
  | "General Practice"
  | "Medical Practice"
  | "Dental Practice"
  | "Specialist Practice"
  | "Allied Health"
  | "Multiple";

export type Jurisdiction =
  | "National"
  | "NSW"
  | "VIC"
  | "QLD"
  | "SA"
  | "WA"
  | "TAS"
  | "NT"
  | "ACT";

// ============================================
// Cart & E-Commerce Types
// ============================================

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  practiceArea: string;
  jurisdictions: string[];
  quantity: number;
  stage?: string;
  stagePrice?: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode?: string;
  discount?: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  gst: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "card" | "invoice" | "bank_transfer";

// ============================================
// Blog & Content Types
// ============================================

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: BlogAuthor;
  category: BlogCategory;
  tags: string[];
  publishedAt: string;
  readTime: number;
  featured?: boolean;
  image?: string;
}

export interface BlogAuthor {
  name: string;
  role: string;
  image?: string;
  bio?: string;
}

export type BlogCategory =
  | "Healthcare Law"
  | "Regulatory"
  | "Business"
  | "Employment Law"
  | "Property Law"
  | "Intellectual Property"
  | "Tax Compliance";

// ============================================
// Service Types
// ============================================

export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription?: string;
  icon?: string;
  features: string[];
  pricing?: ServicePricing;
  faqs?: FAQ[];
  relatedServices?: string[];
}

export interface ServicePricing {
  type: "fixed" | "hourly" | "quote";
  amount?: number;
  currency?: string;
  note?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

// ============================================
// Gamification Types
// ============================================

export interface GamificationState {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  lastActivityDate: string;
  achievements: Achievement[];
  badges: Badge[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  unlockedAt?: Date;
  progress?: number;
  target?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: Date;
}

export interface XPEvent {
  type: XPEventType;
  xp: number;
  description: string;
  timestamp: Date;
}

export type XPEventType =
  | "page_view"
  | "document_view"
  | "document_purchase"
  | "quiz_complete"
  | "tool_use"
  | "streak_bonus"
  | "achievement_unlock"
  | "referral";

// ============================================
// Form & Contact Types
// ============================================

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  practiceType?: string;
  message: string;
  preferredContact?: "email" | "phone";
}

export interface AppointmentBooking {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  preferredDate: Date;
  preferredTime: string;
  notes?: string;
  status: BookingStatus;
  createdAt: Date;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export type NotificationType =
  | "order"
  | "document"
  | "appointment"
  | "achievement"
  | "system"
  | "promotion";

// ============================================
// Analytics Types
// ============================================

export interface PageView {
  path: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  referrer?: string;
  userAgent?: string;
}

export interface ConversionEvent {
  type: "purchase" | "signup" | "booking" | "download";
  value?: number;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

// ============================================
// Utility Types
// ============================================

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
