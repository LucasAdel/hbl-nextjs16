"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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

interface DocumentRecommendationsProps {
  email?: string | null;
  sessionId: string;
  currentDocumentId?: string;
  title?: string;
  limit?: number;
  variant?: "inline" | "sidebar" | "grid";
}

export function DocumentRecommendations({
  email,
  sessionId,
  currentDocumentId,
  title = "Recommended For You",
  limit = 4,
  variant = "grid",
}: DocumentRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecommendations = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        sessionId,
        limit: limit.toString(),
      });
      if (email) params.append("email", email);
      if (currentDocumentId) params.append("documentId", currentDocumentId);

      const response = await fetch(`/api/recommendations?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [email, sessionId, currentDocumentId, limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (isLoading) {
    return (
      <div className={`${variant === "sidebar" ? "space-y-3" : "grid grid-cols-2 md:grid-cols-4 gap-4"}`}>
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-32" />
            <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
            <div className="mt-1 h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  const getReasonIcon = (reasonType: Recommendation["reasonType"]) => {
    switch (reasonType) {
      case "co_purchase":
        return "👥";
      case "browsing_history":
        return "👁️";
      case "similar_category":
        return "📂";
      case "popular":
        return "🔥";
      case "personalized":
        return "✨";
      default:
        return "📄";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(price);
  };

  if (variant === "sidebar") {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <Link
              key={rec.document.id}
              href={`/documents/${rec.document.slug}`}
              className="block group"
            >
              <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-lg">
                  {getReasonIcon(rec.reasonType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors truncate">
                    {rec.document.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{rec.reason}</div>
                  <div className="text-sm font-semibold text-amber-600 mt-1">
                    {formatPrice(rec.document.price)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="overflow-x-auto">
        <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
        <div className="flex gap-4 pb-2">
          {recommendations.map((rec) => (
            <Link
              key={rec.document.id}
              href={`/documents/${rec.document.slug}`}
              className="flex-shrink-0 w-48 group"
            >
              <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span>{getReasonIcon(rec.reasonType)}</span>
                  <span className="text-xs text-gray-500">{rec.reason}</span>
                </div>
                <div className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                  {rec.document.name}
                </div>
                <div className="text-sm font-semibold text-amber-600 mt-2">
                  {formatPrice(rec.document.price)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div>
      <h3 className="font-semibold text-gray-900 text-lg mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((rec) => (
          <Link
            key={rec.document.id}
            href={`/documents/${rec.document.slug}`}
            className="group"
          >
            <div className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-lg hover:border-amber-300 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{getReasonIcon(rec.reasonType)}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {rec.reason}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors mb-2 line-clamp-2">
                {rec.document.name}
              </h4>
              {rec.document.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {rec.document.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-amber-600">
                  {formatPrice(rec.document.price)}
                </span>
                <span className="text-xs text-gray-400 capitalize">
                  {rec.document.category.replace("-", " ")}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Frequently Bought Together component
export function FrequentlyBoughtTogether({
  documentId,
  sessionId,
  limit = 3,
}: {
  documentId: string;
  sessionId: string;
  limit?: number;
}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFBT() {
      try {
        const params = new URLSearchParams({
          sessionId,
          documentId,
          type: "frequently_bought_together",
          limit: limit.toString(),
        });

        const response = await fetch(`/api/recommendations?${params}`);
        if (response.ok) {
          const data = await response.json();
          setDocuments(data.documents || []);
        }
      } catch (error) {
        console.error("Failed to fetch FBT:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFBT();
  }, [documentId, sessionId, limit]);

  if (isLoading || documents.length === 0) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(price);
  };

  const totalPrice = documents.reduce((sum, doc) => sum + doc.price, 0);

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">👥</span>
        <h3 className="font-semibold text-gray-900">Frequently Bought Together</h3>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {documents.map((doc, index) => (
          <div key={doc.id} className="flex items-center">
            {index > 0 && <span className="text-gray-400 mx-2">+</span>}
            <Link
              href={`/documents/${doc.slug}`}
              className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-sm font-medium text-gray-900 hover:text-amber-600 line-clamp-2 max-w-[150px]">
                {doc.name}
              </div>
              <div className="text-xs text-amber-600 font-semibold mt-1">
                {formatPrice(doc.price)}
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-amber-200">
        <div>
          <span className="text-gray-600">Bundle Price:</span>
          <span className="ml-2 text-xl font-bold text-amber-600">
            {formatPrice(totalPrice)}
          </span>
        </div>
        <button className="bg-amber-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors">
          Add All to Cart
        </button>
      </div>
    </div>
  );
}
