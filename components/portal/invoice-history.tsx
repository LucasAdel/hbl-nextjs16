"use client";

import { useState, useEffect, useCallback } from "react";

interface Invoice {
  id: string;
  invoice_number: string;
  matter_id?: string;
  matter_name?: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  pdf_url?: string;
  created_at: string;
}

interface InvoiceHistoryProps {
  clientEmail: string;
  showPayButton?: boolean;
  onPayInvoice?: (invoice: Invoice) => void;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
  sent: { bg: "bg-blue-100", text: "text-blue-700", label: "Sent" },
  viewed: { bg: "bg-purple-100", text: "text-purple-700", label: "Viewed" },
  paid: { bg: "bg-green-100", text: "text-green-700", label: "Paid" },
  overdue: { bg: "bg-red-100", text: "text-red-700", label: "Overdue" },
  cancelled: { bg: "bg-gray-100", text: "text-gray-500", label: "Cancelled" },
};

export function InvoiceHistory({ clientEmail, showPayButton = true, onPayInvoice }: InvoiceHistoryProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    outstanding: 0,
    overdue: 0,
  });

  const fetchInvoices = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/portal/invoices?email=${encodeURIComponent(clientEmail)}`
      );
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
        setStats(data.stats || { total: 0, paid: 0, outstanding: 0, overdue: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setIsLoading(false);
    }
  }, [clientEmail]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filteredInvoices = invoices.filter((invoice) => {
    if (filter === "all") return true;
    if (filter === "outstanding") return ["sent", "viewed", "overdue"].includes(invoice.status);
    return invoice.status === filter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6 animate-pulse" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice & Payment History</h3>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-xs text-gray-500">Total Invoiced</div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(stats.total)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-xs text-gray-500">Paid</div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(stats.paid)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-xs text-gray-500">Outstanding</div>
            <div className="text-lg font-bold text-amber-600">
              {formatCurrency(stats.outstanding)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-xs text-gray-500">Overdue</div>
            <div className="text-lg font-bold text-red-600">
              {formatCurrency(stats.overdue)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b bg-gray-50">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { value: "all", label: "All" },
            { value: "outstanding", label: "Outstanding" },
            { value: "paid", label: "Paid" },
            { value: "overdue", label: "Overdue" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === f.value
                  ? "bg-green-500 text-white"
                  : "bg-white border text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice List */}
      <div className="divide-y max-h-[400px] overflow-y-auto">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📃</div>
            <p>No invoices found</p>
          </div>
        ) : (
          filteredInvoices.map((invoice) => {
            const statusStyle = STATUS_STYLES[invoice.status];
            const isOverdue = invoice.status === "overdue";
            const daysOverdue = isOverdue ? getDaysOverdue(invoice.due_date) : 0;

            return (
              <div
                key={invoice.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  isOverdue ? "bg-red-50/50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Invoice Icon */}
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        invoice.status === "paid"
                          ? "bg-green-100"
                          : isOverdue
                            ? "bg-red-100"
                            : "bg-gray-100"
                      }`}
                    >
                      <span className="text-2xl">
                        {invoice.status === "paid" ? "✅" : isOverdue ? "⚠️" : "📄"}
                      </span>
                    </div>

                    {/* Invoice Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          #{invoice.invoice_number}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.label}
                        </span>
                      </div>
                      {invoice.matter_name && (
                        <div className="text-sm text-gray-500 mt-0.5">
                          {invoice.matter_name}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {invoice.status === "paid" && invoice.paid_date ? (
                          <>Paid on {formatDate(invoice.paid_date)}</>
                        ) : (
                          <>
                            Due {formatDate(invoice.due_date)}
                            {isOverdue && (
                              <span className="text-red-600 ml-1">
                                ({daysOverdue} days overdue)
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        {formatCurrency(invoice.total_amount)}
                      </div>
                      <div className="text-xs text-gray-400">
                        incl. {formatCurrency(invoice.tax_amount)} GST
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {invoice.pdf_url && (
                        <a
                          href={invoice.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Download PDF"
                        >
                          ⬇️
                        </a>
                      )}

                      {showPayButton &&
                        ["sent", "viewed", "overdue"].includes(invoice.status) && (
                          <button
                            onClick={() => {
                              if (onPayInvoice) {
                                onPayInvoice(invoice);
                              } else {
                                setSelectedInvoice(invoice);
                              }
                            }}
                            className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                          >
                            Pay Now
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md mx-4 w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Pay Invoice</h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Invoice</span>
                <span className="font-medium">#{selectedInvoice.invoice_number}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold text-lg">
                  {formatCurrency(selectedInvoice.total_amount)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                💳 Pay with Card
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                🏦 Bank Transfer
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              🔒 Secure payment powered by Stripe
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? "s" : ""}
          </span>
          {stats.overdue > 0 && (
            <span className="text-red-600 font-medium">
              ⚠️ {formatCurrency(stats.overdue)} overdue
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
