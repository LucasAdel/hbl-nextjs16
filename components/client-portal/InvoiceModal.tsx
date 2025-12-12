"use client";

import { useState, useEffect } from "react";
import { X, Download, Printer, Loader2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import DOMPurify from "dompurify";

// Escape HTML entities to prevent XSS in document.write
function escapeHtml(str: string): string {
  return DOMPurify.sanitize(str, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerEmail: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  transactionId: string;
  type: string;
  consultationType?: string;
  consultationDate?: string;
  consultationTime?: string;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  email: string;
}

export function InvoiceModal({ isOpen, onClose, sessionId, email }: InvoiceModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchInvoice();
    }
  }, [isOpen, sessionId]);

  const fetchInvoice = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/client-portal/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sessionId }),
      });

      const result = await response.json();

      if (result.success) {
        setInvoice(result.invoice);
      } else {
        setError(result.error || "Failed to load invoice");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount / 100);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a printable version and trigger download
    const printWindow = window.open("", "_blank");
    if (printWindow && invoice) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${escapeHtml(invoice.invoiceNumber)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .logo { font-size: 24px; font-weight: bold; color: #40E0D0; }
            .invoice-details { text-align: right; }
            .customer-info { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
            th { background: #f9fafb; font-weight: 600; }
            .totals { text-align: right; }
            .total-row { font-weight: bold; font-size: 18px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Hamilton Bailey Law</div>
            <div class="invoice-details">
              <h2>TAX INVOICE</h2>
              <p><strong>Invoice #:</strong> ${escapeHtml(invoice.invoiceNumber)}</p>
              <p><strong>Date:</strong> ${format(new Date(invoice.date), "dd MMM yyyy")}</p>
            </div>
          </div>
          <div class="customer-info">
            <h3>Bill To:</h3>
            <p>${escapeHtml(invoice.customerName)}</p>
            <p>${escapeHtml(invoice.customerEmail)}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${escapeHtml(item.description)}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="totals">
            <p><strong>Subtotal:</strong> ${formatCurrency(invoice.subtotal)}</p>
            <p><strong>GST (10%):</strong> ${formatCurrency(invoice.tax)}</p>
            <p class="total-row"><strong>Total:</strong> ${formatCurrency(invoice.total)}</p>
          </div>
          <div class="footer">
            <p><strong>Hamilton Bailey Law</strong></p>
            <p>ABN: XX XXX XXX XXX</p>
            <p>Level 1, 123 King William Street, Adelaide SA 5000</p>
            <p>Phone: (08) 8212 8585 | Email: info@hamiltonbaileylaw.com.au</p>
            <p style="margin-top: 20px;">Thank you for your business.</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
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
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto print:max-w-none print:shadow-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b print:hidden">
                <h2 className="text-xl font-bold text-gray-900">Invoice</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Print"
                  >
                    <Printer className="h-5 w-5 text-gray-500" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="h-5 w-5 text-gray-500" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-tiffany" />
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : invoice ? (
                  <div className="space-y-6">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-2xl font-bold text-tiffany">Hamilton Bailey Law</h1>
                        <p className="text-sm text-gray-600 mt-1">Legal Services for Medical Practitioners</p>
                      </div>
                      <div className="text-right">
                        <h2 className="text-xl font-bold text-gray-900">TAX INVOICE</h2>
                        <p className="text-sm text-gray-600 mt-1">#{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(invoice.date), "dd MMMM yyyy")}
                        </p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Bill To</h3>
                      <p className="font-medium text-gray-900">{invoice.customerName}</p>
                      <p className="text-gray-600">{invoice.customerEmail}</p>
                    </div>

                    {/* Consultation Details (if applicable) */}
                    {invoice.consultationType && (
                      <div className="bg-tiffany/5 rounded-xl p-4">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Consultation Details</h3>
                        <p className="font-medium text-gray-900">{invoice.consultationType}</p>
                        {invoice.consultationDate && (
                          <p className="text-gray-600">
                            {invoice.consultationDate} at {invoice.consultationTime}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Items Table */}
                    <div className="border rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Description</th>
                            <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Qty</th>
                            <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Unit Price</th>
                            <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoice.items.map((item, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-4 py-3 text-gray-900">{item.description}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                              <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                              <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span>
                          <span>{formatCurrency(invoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>GST (10%)</span>
                          <span>{formatCurrency(invoice.tax)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                          <span>Total</span>
                          <span>{formatCurrency(invoice.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-green-800">Payment Received</p>
                        <p className="text-sm text-green-700">Transaction ID: {invoice.transactionId.slice(0, 20)}...</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t pt-6 text-sm text-gray-500">
                      <p className="font-medium text-gray-700">Hamilton Bailey Law</p>
                      <p>ABN: XX XXX XXX XXX</p>
                      <p>Level 1, 123 King William Street, Adelaide SA 5000</p>
                      <p>Phone: (08) 8212 8585 | Email: info@hamiltonbaileylaw.com.au</p>
                      <p className="mt-4">Thank you for your business.</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
