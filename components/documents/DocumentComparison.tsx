"use client";

import { useState, useEffect } from "react";
import {
  Scale, CheckCircle2, XCircle, MinusCircle, ArrowRight,
  FileText, Star, Zap, ShoppingCart, Info, ChevronDown,
  Plus, X, AlertCircle, Crown, Gift, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface DocumentComparisonProps {
  documents?: ComparisonDocument[];
  maxCompare?: number;
  className?: string;
}

interface ComparisonDocument {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  features: {
    name: string;
    value: boolean | string | number;
    highlight?: boolean;
  }[];
  rating: number;
  reviewCount: number;
  popularity: number; // 0-100
  bestFor?: string[];
  limitations?: string[];
  included?: string[];
  lastUpdated: string;
}

// Sample documents for comparison
const SAMPLE_DOCUMENTS: ComparisonDocument[] = [
  {
    id: "employment-basic",
    name: "Basic Employment Contract",
    description: "Standard employment agreement for simple arrangements",
    price: 149,
    category: "Employment",
    features: [
      { name: "AHPRA Compliant", value: true },
      { name: "Customizable Clauses", value: 5 },
      { name: "Restraint Clauses", value: false },
      { name: "IP Protection", value: "Basic" },
      { name: "Termination Provisions", value: "Standard" },
      { name: "Non-compete Period", value: "6 months" },
      { name: "Free Updates", value: "1 year" },
      { name: "Legal Review Included", value: false },
    ],
    rating: 4.2,
    reviewCount: 45,
    popularity: 72,
    bestFor: ["Solo practices", "Part-time staff", "Simple roles"],
    limitations: ["No complex IP clauses", "Limited restraints"],
    included: ["Word template", "PDF guide", "Basic instructions"],
    lastUpdated: "2025-11-15",
  },
  {
    id: "employment-professional",
    name: "Professional Employment Contract",
    description: "Comprehensive contract for medical professionals",
    price: 299,
    category: "Employment",
    features: [
      { name: "AHPRA Compliant", value: true, highlight: true },
      { name: "Customizable Clauses", value: 15, highlight: true },
      { name: "Restraint Clauses", value: true, highlight: true },
      { name: "IP Protection", value: "Comprehensive" },
      { name: "Termination Provisions", value: "Detailed" },
      { name: "Non-compete Period", value: "12 months" },
      { name: "Free Updates", value: "2 years" },
      { name: "Legal Review Included", value: false },
    ],
    rating: 4.7,
    reviewCount: 128,
    popularity: 95,
    bestFor: ["Group practices", "Senior staff", "Specialists"],
    limitations: ["No consultation included"],
    included: ["Word template", "PDF guide", "Video walkthrough", "Email support"],
    lastUpdated: "2025-12-01",
  },
  {
    id: "employment-enterprise",
    name: "Enterprise Employment Suite",
    description: "Complete employment documentation package with consultation",
    price: 599,
    category: "Employment",
    features: [
      { name: "AHPRA Compliant", value: true, highlight: true },
      { name: "Customizable Clauses", value: 25, highlight: true },
      { name: "Restraint Clauses", value: true, highlight: true },
      { name: "IP Protection", value: "Maximum" },
      { name: "Termination Provisions", value: "Comprehensive" },
      { name: "Non-compete Period", value: "24 months" },
      { name: "Free Updates", value: "Lifetime", highlight: true },
      { name: "Legal Review Included", value: true, highlight: true },
    ],
    rating: 4.9,
    reviewCount: 67,
    popularity: 88,
    bestFor: ["Large practices", "Hospital groups", "Complex arrangements"],
    included: [
      "Word template", "PDF guide", "Video walkthrough",
      "30-min consultation", "Priority support", "Custom modifications"
    ],
    lastUpdated: "2025-12-05",
  },
];

// Feature categories for grouped comparison
const FEATURE_CATEGORIES = [
  { id: "compliance", name: "Compliance", features: ["AHPRA Compliant"] },
  { id: "customization", name: "Customization", features: ["Customizable Clauses", "IP Protection"] },
  { id: "protection", name: "Protection", features: ["Restraint Clauses", "Non-compete Period", "Termination Provisions"] },
  { id: "support", name: "Support & Updates", features: ["Free Updates", "Legal Review Included"] },
];

export function DocumentComparison({
  documents = SAMPLE_DOCUMENTS,
  maxCompare = 3,
  className = "",
}: DocumentComparisonProps) {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["compliance", "customization"]);
  const [showAddModal, setShowAddModal] = useState(false);

  const selectedDocuments = documents.filter((d) => selectedDocs.includes(d.id));

  const toggleDocument = (docId: string) => {
    if (selectedDocs.includes(docId)) {
      setSelectedDocs((prev) => prev.filter((id) => id !== docId));
    } else if (selectedDocs.length < maxCompare) {
      setSelectedDocs((prev) => [...prev, docId]);
      toast.success("Document added to comparison");
    } else {
      toast.error(`Maximum ${maxCompare} documents can be compared`);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getFeatureValue = (doc: ComparisonDocument, featureName: string) => {
    const feature = doc.features.find((f) => f.name === featureName);
    return feature?.value;
  };

  const isFeatureHighlighted = (doc: ComparisonDocument, featureName: string) => {
    const feature = doc.features.find((f) => f.name === featureName);
    return feature?.highlight || false;
  };

  const renderFeatureValue = (value: boolean | string | number | undefined) => {
    if (value === undefined) return <MinusCircle className="h-5 w-5 text-gray-400" />;
    if (typeof value === "boolean") {
      return value ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-400" />
      );
    }
    return <span className="font-medium text-gray-900 dark:text-white">{value}</span>;
  };

  // Selection UI when no documents selected
  if (selectedDocs.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-tiffany to-tiffany-dark p-6 text-white">
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-bold">Compare Documents</h2>
              <p className="text-sm opacity-80">Select up to {maxCompare} documents to compare features</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => toggleDocument(doc.id)}
                className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-tiffany transition-all text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <FileText className="h-8 w-8 text-tiffany" />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ${doc.price}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {doc.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {doc.description}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">{doc.rating}</span>
                  </div>
                  <span className="text-xs text-gray-400">({doc.reviewCount} reviews)</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-tiffany to-tiffany-dark p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-bold">Document Comparison</h2>
              <p className="text-sm opacity-80">
                Comparing {selectedDocs.length} of {maxCompare} documents
              </p>
            </div>
          </div>
          {selectedDocs.length < maxCompare && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Document
            </button>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Document Headers */}
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-4 text-left w-48">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Feature
                </span>
              </th>
              {selectedDocuments.map((doc) => (
                <th key={doc.id} className="p-4 text-center min-w-[200px]">
                  <div className="relative">
                    <button
                      onClick={() => toggleDocument(doc.id)}
                      className="absolute -top-1 -right-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <X className="h-3 w-3 text-gray-500" />
                    </button>

                    {doc.popularity >= 90 && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Popular
                      </div>
                    )}

                    <div className="pt-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {doc.name}
                      </h3>
                      <div className="text-2xl font-bold text-tiffany mb-2">
                        ${doc.price}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-amber-500 mb-3">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{doc.rating}</span>
                        <span className="text-xs text-gray-400">({doc.reviewCount})</span>
                      </div>
                      <button
                        onClick={() => toast.success(`${doc.name} added to cart!`)}
                        className="px-4 py-2 bg-tiffany text-white text-sm font-medium rounded-lg hover:bg-tiffany-dark transition-colors flex items-center gap-2 mx-auto"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {/* Feature Categories */}
            {FEATURE_CATEGORIES.map((category) => (
              <>
                {/* Category Header */}
                <tr key={category.id} className="bg-gray-50 dark:bg-gray-800/50">
                  <td
                    colSpan={selectedDocuments.length + 1}
                    className="p-0"
                  >
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full p-3 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <ChevronDown
                        className={`h-4 w-4 text-gray-500 transition-transform ${
                          expandedCategories.includes(category.id) ? "rotate-180" : ""
                        }`}
                      />
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {category.name}
                      </span>
                    </button>
                  </td>
                </tr>

                {/* Features in Category */}
                {expandedCategories.includes(category.id) &&
                  category.features.map((featureName) => (
                    <tr key={featureName} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="p-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {featureName}
                        </span>
                      </td>
                      {selectedDocuments.map((doc) => {
                        const value = getFeatureValue(doc, featureName);
                        const highlighted = isFeatureHighlighted(doc, featureName);
                        return (
                          <td
                            key={doc.id}
                            className={`p-4 text-center ${
                              highlighted ? "bg-tiffany/5" : ""
                            }`}
                          >
                            <div className={`flex items-center justify-center ${
                              highlighted ? "font-semibold" : ""
                            }`}>
                              {renderFeatureValue(value)}
                              {highlighted && (
                                <Sparkles className="h-4 w-4 text-amber-500 ml-1" />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </>
            ))}

            {/* Best For Section */}
            <tr className="bg-green-50 dark:bg-green-900/20">
              <td className="p-4">
                <span className="font-medium text-green-700 dark:text-green-400">
                  Best For
                </span>
              </td>
              {selectedDocuments.map((doc) => (
                <td key={doc.id} className="p-4">
                  <ul className="space-y-1">
                    {doc.bestFor?.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Included Section */}
            <tr>
              <td className="p-4">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  What&apos;s Included
                </span>
              </td>
              {selectedDocuments.map((doc) => (
                <td key={doc.id} className="p-4">
                  <ul className="space-y-1">
                    {doc.included?.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Gift className="h-4 w-4 flex-shrink-0 text-tiffany" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Limitations Section */}
            {selectedDocuments.some((doc) => doc.limitations && doc.limitations.length > 0) && (
              <tr className="bg-amber-50/50 dark:bg-amber-900/10">
                <td className="p-4">
                  <span className="font-medium text-amber-700 dark:text-amber-400">
                    Limitations
                  </span>
                </td>
                {selectedDocuments.map((doc) => (
                  <td key={doc.id} className="p-4">
                    <ul className="space-y-1">
                      {doc.limitations?.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                      {(!doc.limitations || doc.limitations.length === 0) && (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                    </ul>
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer CTAs */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Info className="h-4 w-4" />
            <span>Can&apos;t decide? Contact us to find the right fit.</span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/contact"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Get Advice
            </Link>
            <button
              onClick={() => {
                selectedDocuments.forEach((doc) => {
                  toast.success(`${doc.name} added to cart!`);
                });
              }}
              className="px-6 py-2 bg-tiffany text-white font-semibold rounded-lg hover:bg-tiffany-dark transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Add All to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[80vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Add Document to Compare
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {documents
                .filter((doc) => !selectedDocs.includes(doc.id))
                .map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      toggleDocument(doc.id);
                      setShowAddModal(false);
                    }}
                    className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-tiffany transition-all text-left flex items-center gap-4"
                  >
                    <FileText className="h-8 w-8 text-tiffany flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {doc.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {doc.description}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-tiffany">
                      ${doc.price}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact comparison for product pages
export function QuickCompare({
  currentDocumentId,
  alternatives,
}: {
  currentDocumentId: string;
  alternatives: ComparisonDocument[];
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <Scale className="h-4 w-4 text-tiffany" />
        Compare Options
      </h4>
      <div className="space-y-2">
        {alternatives.slice(0, 2).map((doc) => (
          <Link
            key={doc.id}
            href={`/documents/compare?ids=${currentDocumentId},${doc.id}`}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {doc.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-tiffany">${doc.price}</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>
      <Link
        href="/documents/compare"
        className="mt-3 block text-center text-sm text-tiffany hover:underline"
      >
        View Full Comparison Tool
      </Link>
    </div>
  );
}

export default DocumentComparison;
