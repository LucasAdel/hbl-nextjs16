"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Lock, ShoppingCart, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    name: string;
    slug: string;
    description: string;
    price: number;
    category: string;
    previewPages?: string[];
    totalPages?: number;
  };
  onAddToCart: () => void;
}

// Sample preview content for documents (in production, these would be actual PDF previews)
const generatePreviewContent = (documentName: string, pageNumber: number, totalPreview: number) => {
  return {
    isPreview: pageNumber <= totalPreview,
    content: pageNumber <= totalPreview ? `preview` : `locked`,
  };
};

export function DocumentPreviewModal({
  isOpen,
  onClose,
  document,
  onAddToCart,
}: DocumentPreviewModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  // Preview shows 2-3 pages, rest are locked
  const previewPages = 3;
  const totalPages = document.totalPages || 8;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleZoomIn = () => {
    if (zoom < 150) setZoom(zoom + 25);
  };

  const handleZoomOut = () => {
    if (zoom > 50) setZoom(zoom - 25);
  };

  const isPageLocked = currentPage > previewPages;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-8 z-50 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-tiffany" />
                <div>
                  <h2 className="font-semibold text-gray-900 line-clamp-1">{document.name}</h2>
                  <p className="text-sm text-gray-500">
                    Preview • {previewPages} of {totalPages} pages available
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="hidden sm:flex items-center gap-1 px-3 py-1 bg-white border rounded-lg">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 50}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ZoomOut className="h-4 w-4 text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 150}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ZoomIn className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Document Preview Area */}
              <div className="flex-1 bg-gray-100 p-4 md:p-8 overflow-auto">
                <div
                  className="mx-auto transition-transform duration-200"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
                >
                  {/* Preview Page */}
                  <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-2xl mx-auto">
                    {isPageLocked ? (
                      /* Locked Page */
                      <div className="aspect-[8.5/11] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                          <Lock className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Page {currentPage} is Locked</h3>
                        <p className="text-gray-500 text-center max-w-sm mb-6">
                          Purchase this document to access all {totalPages} pages
                        </p>
                        <button
                          onClick={() => {
                            onAddToCart();
                            onClose();
                          }}
                          className="inline-flex items-center gap-2 bg-tiffany text-white px-6 py-3 rounded-xl font-semibold hover:bg-tiffany-dark transition-colors"
                        >
                          <ShoppingCart className="h-5 w-5" />
                          Add to Cart - {formatCurrency(document.price)}
                        </button>
                      </div>
                    ) : (
                      /* Preview Page Content */
                      <div className="aspect-[8.5/11] p-8 md:p-12 relative">
                        {/* Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-[-30deg]">
                          <span className="text-6xl md:text-8xl font-bold text-gray-500 whitespace-nowrap">
                            PREVIEW
                          </span>
                        </div>

                        {/* Document Header */}
                        <div className="relative">
                          <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-tiffany">
                            <div>
                              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                                Hamilton Bailey Law
                              </h1>
                              <p className="text-sm text-gray-500">Legal Document Template</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">ABN: XX XXX XXX XXX</p>
                              <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
                            </div>
                          </div>

                          {/* Document Title */}
                          <h2 className="text-lg md:text-xl font-bold text-center text-gray-900 mb-6">
                            {document.name.toUpperCase()}
                          </h2>

                          {/* Sample Content Based on Page */}
                          {currentPage === 1 && (
                            <div className="space-y-4 text-sm md:text-base text-gray-700">
                              <p className="font-semibold">PARTIES</p>
                              <p>This Agreement is made on [DATE] between:</p>
                              <p className="pl-4">
                                <strong>Party A:</strong> [Name and ABN/ACN] of [Address] (<strong>"First Party"</strong>)
                              </p>
                              <p className="pl-4">
                                <strong>Party B:</strong> [Name and ABN/ACN] of [Address] (<strong>"Second Party"</strong>)
                              </p>
                              <p className="mt-6 font-semibold">BACKGROUND</p>
                              <p>
                                A. The First Party operates [description of business/practice].
                              </p>
                              <p>
                                B. The Second Party wishes to [purpose of agreement].
                              </p>
                              <p>
                                C. The Parties have agreed to enter into this Agreement on the terms set out below.
                              </p>
                            </div>
                          )}

                          {currentPage === 2 && (
                            <div className="space-y-4 text-sm md:text-base text-gray-700">
                              <p className="font-semibold">1. DEFINITIONS AND INTERPRETATION</p>
                              <p className="font-semibold mt-4">1.1 Definitions</p>
                              <p>In this Agreement, unless the context otherwise requires:</p>
                              <p className="pl-4">
                                <strong>"Agreement"</strong> means this agreement including any schedules and annexures.
                              </p>
                              <p className="pl-4">
                                <strong>"Business Day"</strong> means a day that is not a Saturday, Sunday, public holiday or bank holiday in South Australia.
                              </p>
                              <p className="pl-4">
                                <strong>"Commencement Date"</strong> means [DATE] or such other date as agreed by the Parties.
                              </p>
                              <p className="pl-4">
                                <strong>"Confidential Information"</strong> means all information disclosed by one Party to the other...
                              </p>
                            </div>
                          )}

                          {currentPage === 3 && (
                            <div className="space-y-4 text-sm md:text-base text-gray-700">
                              <p className="font-semibold">2. TERM</p>
                              <p>
                                2.1 This Agreement commences on the Commencement Date and continues for an initial term of [PERIOD] (<strong>"Initial Term"</strong>).
                              </p>
                              <p>
                                2.2 Upon expiry of the Initial Term, this Agreement will automatically renew for successive periods of [PERIOD] unless terminated in accordance with this Agreement.
                              </p>
                              <p className="font-semibold mt-4">3. SERVICES / OBLIGATIONS</p>
                              <p>
                                3.1 The [Party] agrees to provide the following services / fulfil the following obligations:
                              </p>
                              <p className="pl-4">(a) [Obligation 1];</p>
                              <p className="pl-4">(b) [Obligation 2];</p>
                              <p className="pl-4">(c) [Obligation 3].</p>
                              <p className="mt-4">
                                3.2 The [Party] must perform all obligations under this Agreement...
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="hidden lg:flex flex-col w-72 border-l bg-white">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900 mb-2">Document Details</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{document.description}</p>
                </div>

                {/* Page Navigator */}
                <div className="p-4 border-b">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Pages</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-colors ${
                          currentPage === page
                            ? "bg-tiffany text-white"
                            : page <= previewPages
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-gray-50 text-gray-400"
                        }`}
                      >
                        {page <= previewPages ? page : <Lock className="h-3 w-3" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purchase CTA */}
                <div className="mt-auto p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600">Price</span>
                    <span className="text-xl font-bold text-gray-900">{formatCurrency(document.price)}</span>
                  </div>
                  <button
                    onClick={() => {
                      onAddToCart();
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-tiffany text-white px-4 py-3 rounded-xl font-semibold hover:bg-tiffany-dark transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Instant digital delivery after purchase
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  Page <span className="font-semibold">{currentPage}</span> of {totalPages}
                </span>
                {!isPageLocked && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Preview Available
                  </span>
                )}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Purchase CTA */}
            <div className="lg:hidden flex items-center justify-between px-6 py-4 border-t bg-white">
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(document.price)}</p>
              </div>
              <button
                onClick={() => {
                  onAddToCart();
                  onClose();
                }}
                className="flex items-center gap-2 bg-tiffany text-white px-6 py-3 rounded-xl font-semibold hover:bg-tiffany-dark transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
