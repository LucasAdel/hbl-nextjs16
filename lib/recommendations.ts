/**
 * AI-Powered Document Recommendation Engine
 * Provides personalized document recommendations based on:
 * - Browsing history
 * - Purchase history
 * - Co-purchase patterns ("users who bought X also bought Y")
 * - Content similarity
 */

import { createClient } from "@/lib/supabase/server";

interface Document {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  description?: string;
}

interface Recommendation {
  document: Document;
  score: number;
  reason: string;
  reasonType: "co_purchase" | "similar_category" | "popular" | "browsing_history" | "personalized";
}

// Document categories and their relationships
const CATEGORY_RELATIONSHIPS: Record<string, string[]> = {
  "medical-practice": ["employment", "compliance", "property"],
  employment: ["medical-practice", "compliance"],
  compliance: ["medical-practice", "employment"],
  property: ["medical-practice", "business"],
  business: ["property", "employment"],
};

// Sample documents (in production, fetch from database)
const DOCUMENTS: Document[] = [
  { id: "tenant-doctor", name: "Tenant Doctor Agreement", slug: "tenant-doctor-agreement", price: 495, category: "medical-practice" },
  { id: "partnership", name: "Medical Partnership Agreement", slug: "partnership-agreement", price: 695, category: "medical-practice" },
  { id: "employment", name: "Medical Employee Contract", slug: "employment-contract", price: 395, category: "employment" },
  { id: "locum", name: "Locum Tenens Agreement", slug: "locum-agreement", price: 295, category: "employment" },
  { id: "compliance", name: "AHPRA Compliance Checklist", slug: "ahpra-compliance", price: 195, category: "compliance" },
  { id: "privacy", name: "Privacy Policy Template", slug: "privacy-policy", price: 245, category: "compliance" },
  { id: "lease", name: "Medical Practice Lease", slug: "practice-lease", price: 595, category: "property" },
  { id: "sale", name: "Practice Sale Agreement", slug: "practice-sale", price: 895, category: "business" },
  { id: "nda", name: "Non-Disclosure Agreement", slug: "nda-template", price: 195, category: "business" },
  { id: "consent", name: "Patient Consent Forms Pack", slug: "consent-forms", price: 295, category: "compliance" },
];

/**
 * Get personalized recommendations for a user
 */
export async function getRecommendations(
  email: string | null,
  sessionId: string,
  currentDocumentId?: string,
  limit: number = 4
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];
  const addedIds = new Set<string>();

  // If viewing a document, exclude it from recommendations
  if (currentDocumentId) {
    addedIds.add(currentDocumentId);
  }

  // 1. Get co-purchase recommendations (highest priority)
  if (currentDocumentId) {
    const coPurchaseRecs = await getCoPurchaseRecommendations(currentDocumentId);
    for (const rec of coPurchaseRecs) {
      if (!addedIds.has(rec.document.id) && recommendations.length < limit) {
        recommendations.push(rec);
        addedIds.add(rec.document.id);
      }
    }
  }

  // 2. Get browsing history recommendations
  const browsingRecs = await getBrowsingHistoryRecommendations(email, sessionId);
  for (const rec of browsingRecs) {
    if (!addedIds.has(rec.document.id) && recommendations.length < limit) {
      recommendations.push(rec);
      addedIds.add(rec.document.id);
    }
  }

  // 3. Get category-based recommendations
  if (currentDocumentId) {
    const currentDoc = DOCUMENTS.find((d) => d.id === currentDocumentId);
    if (currentDoc) {
      const categoryRecs = getCategoryRecommendations(currentDoc.category);
      for (const rec of categoryRecs) {
        if (!addedIds.has(rec.document.id) && recommendations.length < limit) {
          recommendations.push(rec);
          addedIds.add(rec.document.id);
        }
      }
    }
  }

  // 4. Fill remaining slots with popular documents
  const popularRecs = await getPopularRecommendations();
  for (const rec of popularRecs) {
    if (!addedIds.has(rec.document.id) && recommendations.length < limit) {
      recommendations.push(rec);
      addedIds.add(rec.document.id);
    }
  }

  // Sort by score
  return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Get recommendations based on co-purchase patterns
 */
async function getCoPurchaseRecommendations(documentId: string): Promise<Recommendation[]> {
  const supabase = await createClient();

  const { data: correlations } = await supabase
    .from("document_correlations")
    .select("document_id_2, correlation_score, co_purchase_count")
    .eq("document_id_1", documentId)
    .order("correlation_score", { ascending: false })
    .limit(5);

  if (!correlations || correlations.length === 0) {
    return [];
  }

  const recommendations: Recommendation[] = [];

  for (const corr of correlations) {
    const doc = DOCUMENTS.find((d) => d.id === corr.document_id_2);
    if (doc) {
      recommendations.push({
        document: doc,
        score: corr.correlation_score * 100,
        reason: `${corr.co_purchase_count} people also bought this`,
        reasonType: "co_purchase" as const,
      });
    }
  }

  return recommendations;
}

/**
 * Get recommendations based on browsing history
 */
async function getBrowsingHistoryRecommendations(
  email: string | null,
  sessionId: string
): Promise<Recommendation[]> {
  const supabase = await createClient();

  // Get recently viewed documents
  let query = supabase
    .from("document_views")
    .select("document_id")
    .order("created_at", { ascending: false })
    .limit(10);

  if (email) {
    query = query.eq("user_email", email.toLowerCase());
  } else {
    query = query.eq("session_id", sessionId);
  }

  const { data: views } = await query;

  if (!views || views.length === 0) {
    return [];
  }

  // Get categories of viewed documents
  const viewedIds = views.map((v: { document_id: string }) => v.document_id);
  const viewedDocs = DOCUMENTS.filter((d) => viewedIds.includes(d.id));
  const viewedCategories = [...new Set(viewedDocs.map((d) => d.category))];

  // Recommend related documents from same/related categories
  const recommendations: Recommendation[] = [];

  for (const category of viewedCategories) {
    const relatedCategories = [category, ...(CATEGORY_RELATIONSHIPS[category] || [])];

    for (const doc of DOCUMENTS) {
      if (!viewedIds.includes(doc.id) && relatedCategories.includes(doc.category)) {
        recommendations.push({
          document: doc,
          score: 60 + Math.random() * 20, // Base score + variation
          reason: "Based on your browsing history",
          reasonType: "browsing_history",
        });
      }
    }
  }

  return recommendations.slice(0, 5);
}

/**
 * Get category-based recommendations
 */
function getCategoryRecommendations(category: string): Recommendation[] {
  const relatedCategories = CATEGORY_RELATIONSHIPS[category] || [];

  return DOCUMENTS.filter(
    (doc) => doc.category === category || relatedCategories.includes(doc.category)
  ).map((doc) => ({
    document: doc,
    score: doc.category === category ? 50 : 40,
    reason: doc.category === category ? "Similar document" : "Related category",
    reasonType: "similar_category" as const,
  }));
}

/**
 * Get popular documents as fallback recommendations
 */
async function getPopularRecommendations(): Promise<Recommendation[]> {
  const supabase = await createClient();

  // Get most viewed documents in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: viewCounts } = await supabase
    .from("document_views")
    .select("document_id")
    .gte("created_at", thirtyDaysAgo.toISOString());

  // Count views per document
  const counts: Record<string, number> = {};
  if (viewCounts) {
    for (const view of viewCounts) {
      counts[view.document_id] = (counts[view.document_id] || 0) + 1;
    }
  }

  // Sort by view count
  const sortedDocs = DOCUMENTS.map((doc) => ({
    doc,
    views: counts[doc.id] || 0,
  }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return sortedDocs.map(({ doc, views }) => ({
    document: doc,
    score: 30 + Math.min(views, 20), // Base score + views bonus
    reason: views > 10 ? "Popular choice" : "Recommended for you",
    reasonType: "popular" as const,
  }));
}

/**
 * Update document correlation when a purchase is made
 */
export async function updateDocumentCorrelations(
  email: string,
  purchasedDocumentId: string
): Promise<void> {
  const supabase = await createClient();

  // Get user's previous purchases
  const { data: previousPurchases } = await supabase
    .from("user_activity_log")
    .select("document_id")
    .eq("user_email", email.toLowerCase())
    .eq("activity_type", "document_purchase")
    .not("document_id", "is", null);

  if (!previousPurchases || previousPurchases.length === 0) {
    return;
  }

  // Update correlations for each previous purchase
  for (const prev of previousPurchases) {
    if (!prev.document_id || prev.document_id === purchasedDocumentId) continue;

    // Check if correlation exists
    const { data: existing } = await supabase
      .from("document_correlations")
      .select("*")
      .eq("document_id_1", prev.document_id)
      .eq("document_id_2", purchasedDocumentId)
      .single();

    if (existing) {
      // Update existing correlation
      const newCount = existing.co_purchase_count + 1;
      const newScore = Math.min(1.0, newCount * 0.1); // Increase score with each co-purchase

      await supabase
        .from("document_correlations")
        .update({
          co_purchase_count: newCount,
          correlation_score: newScore,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Create new correlation (both directions)
      await supabase.from("document_correlations").insert([
        {
          document_id_1: prev.document_id,
          document_id_2: purchasedDocumentId,
          correlation_score: 0.1,
          co_purchase_count: 1,
        },
        {
          document_id_1: purchasedDocumentId,
          document_id_2: prev.document_id,
          correlation_score: 0.1,
          co_purchase_count: 1,
        },
      ]);
    }
  }
}

/**
 * Get "Frequently Bought Together" documents
 */
export async function getFrequentlyBoughtTogether(
  documentId: string,
  limit: number = 3
): Promise<Document[]> {
  const supabase = await createClient();

  const { data: correlations } = await supabase
    .from("document_correlations")
    .select("document_id_2, correlation_score")
    .eq("document_id_1", documentId)
    .order("correlation_score", { ascending: false })
    .limit(limit);

  if (!correlations) return [];

  return correlations
    .map((c: { document_id_2: string; correlation_score: number }) => DOCUMENTS.find((d) => d.id === c.document_id_2))
    .filter((d: Document | undefined): d is Document => d !== undefined);
}
