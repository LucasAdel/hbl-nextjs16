"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Shield,
  Scale,
  ClipboardList,
  ShoppingCart,
  Check,
  Clock,
  Phone,
  Mail,
  MapPin,
  Eye,
} from "lucide-react";
import { getDocumentBySlug, getRelatedDocuments } from "@/lib/documents-data";
import { notFound } from "next/navigation";
import { useCartStore } from "@/lib/stores/cart-store";
import { toast } from "sonner";
import { DocumentPreviewModal } from "@/components/documents/DocumentPreviewModal";

export default function DocumentPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const document = getDocumentBySlug(slug);
  const { addItem, items, openCart } = useCartStore();
  const [showPreview, setShowPreview] = useState(false);

  if (!document) {
    notFound();
  }

  const relatedDocuments = getRelatedDocuments(document);

  const handleAddToCart = (stageName?: string, stagePrice?: number) => {
    addItem({
      id: document.id,
      name: document.name,
      description: document.description,
      price: document.price,
      category: document.category,
      practiceArea: document.practiceArea,
      jurisdictions: document.jurisdictions,
      stage: stageName,
      stagePrice: stagePrice,
    });
    toast.success(
      stageName ? `${document.name} - ${stageName} added to cart` : `${document.name} added to cart`,
      {
        action: {
          label: "View Cart",
          onClick: () => openCart(),
        },
      }
    );
  };

  const isInCart = (itemId: string, stageName?: string) => {
    return items.some((item) => {
      if (stageName) {
        return item.id === itemId && item.stage === stageName;
      }
      return item.id === itemId && !item.stage;
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(price);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Healthcare Law": "bg-emerald-100 text-emerald-800",
      "Employment Law": "bg-blue-100 text-blue-800",
      "Commercial Law": "bg-purple-100 text-purple-800",
      "Property Law": "bg-orange-100 text-orange-800",
      "Corporate Law": "bg-red-100 text-red-800",
      "Intellectual Property Law": "bg-yellow-100 text-yellow-800",
      Finance: "bg-cyan-100 text-cyan-800",
      "Business Structures": "bg-pink-100 text-pink-800",
      "Business Transactions": "bg-indigo-100 text-indigo-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        {/* Back Button */}
        <Link
          href="/documents"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Documents</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Document Info */}
          <div className="lg:col-span-2">
            {/* Document Header */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {document.name}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {document.jurisdictions.map((jurisdiction) => (
                  <span
                    key={jurisdiction}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {jurisdiction}
                  </span>
                ))}
                <span className={`px-3 py-1 text-sm rounded-full ${getCategoryColor(document.category)}`}>
                  {document.category}
                </span>
                <span className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full">
                  {document.practiceArea}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-lg leading-relaxed">
                {document.longDescription || document.description}
              </p>
            </div>

            {/* Document Preview Section */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Document Preview
              </h2>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px]">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                  <FileText className="w-16 h-16 text-teal-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Preview of {document.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    View a sample of this document before purchasing. Full document will be
                    drafted by our firm upon completion of questionnaire and
                    checklist.
                  </p>
                  <button
                    onClick={() => setShowPreview(true)}
                    className="inline-flex items-center gap-2 bg-tiffany text-white px-6 py-3 rounded-xl font-semibold hover:bg-tiffany-dark transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                    View Sample Pages
                  </button>
                </div>
              </div>
            </div>

            {/* Who This Document Is For */}
            {document.targetAudience && document.targetAudience.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Who This Document Is For
                </h2>
                <p className="text-gray-600 mb-4">
                  This document is designed for:
                </p>
                <ul className="space-y-3">
                  {document.targetAudience.map((audience, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{audience}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Documents */}
            {relatedDocuments.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Related Documents
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedDocuments.map((doc) => (
                    <Link
                      key={doc.id}
                      href={`/documents/${doc.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:shadow-md transition-all"
                    >
                      <h3 className="font-medium text-gray-900 mb-2">
                        {doc.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {doc.description}
                      </p>
                      <p className="text-teal-600 font-semibold mt-2">
                        {formatPrice(doc.price)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Pricing & Cart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8 border border-gray-200">
              <h2 className="text-2xl font-blair text-gray-900 mb-6 tracking-wider uppercase">
                Document Details
              </h2>

              {/* Stages */}
              {document.stages ? (
                <div className="space-y-0">
                  {/* Stage 1 */}
                  {document.stages[0] && (
                    <div className="mb-6">
                      {/* Stage Header */}
                      <p className="text-gray-800 mb-2">
                        <span className="font-semibold italic">Stage 1:</span>{" "}
                        {document.stages[0].name.replace(/^Stage \d+:\s*/, "")}
                      </p>

                      {/* Processing Time */}
                      <ul className="text-sm text-gray-600 mb-4 space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">•</span>
                          <span>
                            Approx. processing time {document.stages[0].processingTime} (subject to client&apos;s documentation)
                          </span>
                        </li>
                      </ul>

                      {/* Price */}
                      <div className="mb-4">
                        <p className="text-4xl font-bold text-gray-900">
                          {formatPrice(document.stages[0].price)}
                        </p>
                        <p className="text-gray-500 text-sm">plus GST</p>
                      </div>

                      {/* Add to Cart Button - Stage 1 */}
                      <button
                        onClick={() => handleAddToCart(document.stages![0].name, document.stages![0].price)}
                        disabled={isInCart(document.id, document.stages![0].name)}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          isInCart(document.id, document.stages![0].name)
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "bg-tiffany hover:bg-tiffany-dark text-white"
                        }`}
                      >
                        {isInCart(document.id, document.stages![0].name) ? (
                          <>
                            <Check className="w-5 h-5" />
                            Added to Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Stage 2 */}
                  {document.stages[1] && (
                    <div className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-tiffany/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-tiffany" />
                        </div>
                        <div className="flex-1">
                          {/* Stage Header */}
                          <p className="text-gray-900 font-semibold mb-1">
                            Stage 2: {document.stages[1].name.replace(/^Stage \d+:\s*/, "")}
                          </p>

                          {/* Price inline with plus GST */}
                          <p className="text-gray-600 mb-0.5">
                            {formatPrice(document.stages[1].price)} plus GST
                          </p>

                          {/* Subscription Details */}
                          {document.stages[1].subscriptionDetails && (
                            <p className="text-gray-500 text-sm mb-2">
                              ({document.stages[1].subscriptionDetails})
                            </p>
                          )}

                          {/* Processing Time & Requirements */}
                          <ul className="text-sm text-gray-600 space-y-0.5 ml-2">
                            <li className="flex items-start gap-1">
                              <span className="text-gray-400">•</span>
                              <span>Approx. processing time {document.stages[1].processingTime}</span>
                            </li>
                            <li className="flex items-start gap-1">
                              <span className="text-gray-400">•</span>
                              <span>Available after Stage 1 completion</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Single Price */
                <div className="mb-6">
                  <div className="mb-4">
                    <p className="text-4xl font-bold text-gray-900">
                      {formatPrice(document.price)}
                    </p>
                    <p className="text-gray-500 text-sm">plus GST</p>
                  </div>
                  <button
                    onClick={() => handleAddToCart()}
                    disabled={isInCart(document.id)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      isInCart(document.id)
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : "bg-tiffany hover:bg-tiffany-dark text-white"
                    }`}
                  >
                    {isInCart(document.id) ? (
                      <>
                        <Check className="w-5 h-5" />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Features */}
              <div className="mt-6 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-tiffany/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-tiffany" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Document Drafting
                    </h4>
                    <p className="text-sm text-gray-500">
                      Document will be drafted upon client&apos;s successful
                      completion of eligibility criteria
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-tiffany/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-tiffany" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Lawyer-Drafted</h4>
                    <p className="text-sm text-gray-500">
                      Professional legal document
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-tiffany/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-tiffany" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Australian Law Compliant
                    </h4>
                    <p className="text-sm text-gray-500">
                      Updated for current legislation
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-400">
                      Questionnaire Required
                    </h4>
                    <div className="mt-2 p-3 bg-red-50/50 rounded-r-lg border-l-4 border-gray-300">
                      <p className="text-sm text-red-400">
                        Please note a comprehensive questionnaire and checklist
                        must be completed by the client prior to final product
                        delivery, which will be emailed to the client upon
                        purchase
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* About */}
            <div>
              <h3 className="text-xl font-bold mb-4">Hamilton Bailey</h3>
              <p className="text-gray-400 mb-4">
                Specialising in legal services for medical practitioners in
                Australia.
              </p>
              <div className="flex items-start gap-2 text-gray-400">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>
                  147 Pirie Street
                  <br />
                  Adelaide, South Australia 5000
                </span>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Medical Practice Law</li>
                <li>Healthcare Compliance</li>
                <li>Intellectual Property</li>
                <li>Employment Law</li>
                <li>Commercial Agreements</li>
                <li>Legal Documents</li>
                <li>Visas (Medical/Healthcare)</li>
              </ul>
            </div>

            {/* Legal Documents */}
            <div>
              <h4 className="font-semibold mb-4">Legal Documents</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Service Agreements</li>
                <li>Licencing Agreements</li>
                <li>Employment Contracts</li>
                <li>Practice Management</li>
                <li>Dispute Resolution</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+61 8 5122 0056</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Secure Contact Form</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Response Time: Within 48 Hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Notices */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-400">
              <div>
                <h5 className="font-semibold text-white mb-2">
                  Professional Membership
                </h5>
                <p>Member of the Law Society of South Australia</p>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-2">Code of Conduct</h5>
                <p>
                  Liability limited by a scheme approved under Professional
                  Standards Legislation.
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-2">
                  Quality Assurance
                </h5>
                <p>
                  Committed to the highest standards of legal practice and
                  client service.
                </p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2025 Hamilton Bailey Law Firm. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-white">
                Terms of Service
              </Link>
              <Link href="/disclaimer" className="hover:text-white">
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        document={{
          name: document.name,
          slug: document.id,
          description: document.description,
          price: document.price,
          category: document.category,
          totalPages: 8,
        }}
        onAddToCart={() => handleAddToCart()}
      />
    </div>
  );
}
