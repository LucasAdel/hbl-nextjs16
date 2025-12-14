"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Calendar,
  Clock,
  Mail,
  ArrowRight,
  Loader2,
  ShoppingBag,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  CreditCard,
  User,
  ChevronRight,
  RefreshCw,
  Receipt,
  CalendarClock,
  LogOut,
  Search,
  Upload,
  Settings,
} from "lucide-react";
import { RescheduleModal } from "@/components/client-portal/RescheduleModal";
import { InvoiceModal } from "@/components/client-portal/InvoiceModal";
import { NotificationBell } from "@/components/client-portal/NotificationBell";
import { ClientProfileSection } from "@/components/client-portal/ClientProfileSection";
import { ActivityFeed } from "@/components/client-portal/ActivityFeed";
import { DocumentUpload } from "@/components/client-portal/DocumentUpload";
import { format } from "date-fns";
import { getCurrentUser, signOut, type AuthUser } from "@/lib/auth";

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  event_type_name: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string | null;
  payment_amount: number | null;
  google_meet_link: string | null;
  location_type: string;
}

interface DocumentPurchase {
  id: string;
  created: number;
  amount: number;
  status: string;
  items: Array<{ description: string; quantity: number; amount: number }>;
}

interface ConsultationPayment {
  id: string;
  created: number;
  amount: number;
  status: string;
  consultationType: string;
  date: string;
  time: string;
}

interface PortalData {
  bookings: Booking[];
  documentPurchases: DocumentPurchase[];
  consultationPayments: ConsultationPayment[];
}

export default function ClientPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<PortalData | null>(null);
  const [activeTab, setActiveTab] = useState<"bookings" | "documents" | "payments" | "profile" | "uploads">("bookings");

  // Search and filter states
  const [documentSearch, setDocumentSearch] = useState("");
  const [bookingFilter, setBookingFilter] = useState<"all" | "upcoming" | "past">("all");

  // Modal states
  const [rescheduleModal, setRescheduleModal] = useState<{ isOpen: boolean; booking: Booking | null }>({
    isOpen: false,
    booking: null,
  });
  const [invoiceModal, setInvoiceModal] = useState<{ isOpen: boolean; sessionId: string }>({
    isOpen: false,
    sessionId: "",
  });
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);

  // Fetch authenticated user on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          // Not authenticated - redirect to login
          router.push("/login?redirect=/client-portal");
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user:", error);
        router.push("/login?redirect=/client-portal");
      } finally {
        setIsAuthLoading(false);
      }
    }

    loadUser();
  }, [router]);

  // Fetch portal data when user is authenticated
  useEffect(() => {
    async function fetchPortalData() {
      if (!user?.email) return;

      setDataLoading(true);
      setError("");

      try {
        const response = await fetch("/api/client-portal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });

        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || "Failed to fetch your data");
        }
      } catch (err) {
        setError("An error occurred. Please try again.");
      } finally {
        setDataLoading(false);
      }
    }

    fetchPortalData();
  }, [user?.email]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      confirmed: { bg: "bg-green-100", text: "text-green-800", icon: <CheckCircle2 className="h-3 w-3" /> },
      completed: { bg: "bg-blue-100", text: "text-blue-800", icon: <CheckCircle2 className="h-3 w-3" /> },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: <Clock className="h-3 w-3" /> },
      pending_payment: { bg: "bg-orange-100", text: "text-orange-800", icon: <CreditCard className="h-3 w-3" /> },
      cancelled: { bg: "bg-red-100", text: "text-red-800", icon: <XCircle className="h-3 w-3" /> },
      paid: { bg: "bg-green-100", text: "text-green-800", icon: <CheckCircle2 className="h-3 w-3" /> },
    };

    const style = styles[status] || { bg: "bg-gray-100", text: "text-gray-800", icon: <AlertCircle className="h-3 w-3" /> };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
      </span>
    );
  };

  const totalBookings = data?.bookings.length || 0;
  const totalDocuments = data?.documentPurchases.reduce((acc, p) => acc + p.items.length, 0) || 0;
  const totalSpent = (data?.documentPurchases.reduce((acc, p) => acc + p.amount, 0) || 0) +
    (data?.consultationPayments.reduce((acc, p) => acc + p.amount, 0) || 0);

  // Refresh data after modal actions
  const refreshData = async () => {
    if (!user?.email) return;
    try {
      const response = await fetch("/api/client-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  // Handle document download
  const handleDownload = async (sessionId: string, documentSlug?: string) => {
    if (!user?.email) return;
    setDownloadingDoc(sessionId);
    try {
      const response = await fetch("/api/client-portal/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, sessionId, documentSlug }),
      });
      const result = await response.json();
      if (result.success && result.downloadUrl) {
        // In production, this would trigger actual file download
        // For now, show a success message
        alert("Document download link generated! In production, this would download the actual document file.");
      } else {
        alert(result.error || "Failed to generate download link");
      }
    } catch {
      alert("An error occurred. Please try again.");
    } finally {
      setDownloadingDoc(null);
    }
  };

  // Check if booking can be modified
  const canModifyBooking = (booking: Booking) => {
    const bookingTime = new Date(booking.start_time);
    const now = new Date();
    const hoursUntilBooking = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilBooking >= 24 && booking.status !== "cancelled" && booking.status !== "completed";
  };

  // Show loading while checking authentication
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-tiffany animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, will redirect (handled in useEffect)
  if (!user) {
    return null;
  }

  // Show loading while fetching data
  if (dataLoading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-tiffany animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Fetching your bookings and documents...</p>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 pt-24 pb-16">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="font-blair text-3xl font-bold text-gray-900 mb-3">
              Something went wrong
            </h1>
            <p className="text-lg text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-tiffany text-white px-6 py-3 rounded-xl font-semibold hover:bg-tiffany-dark transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.firstName || user.email;

  // Guard against null data (TypeScript satisfaction)
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-tiffany animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-14 h-14 rounded-2xl border-2 border-tiffany/20"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-tiffany to-tiffany-dark flex items-center justify-center text-xl font-bold text-white shadow-lg">
                {(user.firstName?.[0] || user.email[0]).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-blair text-2xl md:text-3xl font-bold text-gray-900">
                Welcome, {user.firstName || "Back"}
              </h1>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell userId={user.id} userEmail={user.email} />
            <button
              onClick={refreshData}
              disabled={dataLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-white rounded-xl border hover:border-gray-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${dataLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/account/settings"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Account Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 bg-white rounded-xl border border-red-200 hover:border-red-300 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-tiffany" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
                <p className="text-sm text-gray-600">Consultations</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-tiffany" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalDocuments}</p>
                <p className="text-sm text-gray-600">Documents</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-tiffany" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab("bookings")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === "bookings"
                    ? "text-tiffany"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Consultations
                  {data.bookings.length > 0 && (
                    <span className="bg-tiffany/10 text-tiffany text-xs px-2 py-0.5 rounded-full">
                      {data.bookings.length}
                    </span>
                  )}
                </span>
                {activeTab === "bookings" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tiffany" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === "documents"
                    ? "text-tiffany"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                  {totalDocuments > 0 && (
                    <span className="bg-tiffany/10 text-tiffany text-xs px-2 py-0.5 rounded-full">
                      {totalDocuments}
                    </span>
                  )}
                </span>
                {activeTab === "documents" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tiffany" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === "payments"
                    ? "text-tiffany"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payments
                </span>
                {activeTab === "payments" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tiffany" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("uploads")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === "uploads"
                    ? "text-tiffany"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Upload className="h-4 w-4" />
                  Uploads
                </span>
                {activeTab === "uploads" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tiffany" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === "profile"
                    ? "text-tiffany"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </span>
                {activeTab === "profile" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tiffany" />
                )}
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div className="space-y-4">
                {data.bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No consultations found</h3>
                    <p className="text-gray-600 mb-6">You haven't booked any consultations yet.</p>
                    <Link
                      href="/book-appointment"
                      className="inline-flex items-center gap-2 bg-tiffany text-white px-6 py-3 rounded-xl font-semibold hover:bg-tiffany-dark transition-colors"
                    >
                      Book a Consultation
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  data.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-tiffany/30 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Video className="h-6 w-6 text-tiffany" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{booking.event_type_name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {format(new Date(booking.start_time), "EEEE, MMMM d, yyyy")} at{" "}
                              {format(new Date(booking.start_time), "h:mm a")}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {getStatusBadge(booking.status)}
                              {booking.payment_amount && (
                                <span className="text-sm text-gray-600">
                                  {formatCurrency(booking.payment_amount * 100)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {booking.google_meet_link && booking.status === "confirmed" && (
                            <a
                              href={booking.google_meet_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-tiffany text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-tiffany-dark transition-colors"
                            >
                              <Video className="h-4 w-4" />
                              Join
                            </a>
                          )}
                          {canModifyBooking(booking) && (
                            <button
                              onClick={() => setRescheduleModal({ isOpen: true, booking })}
                              className="inline-flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                            >
                              <CalendarClock className="h-4 w-4" />
                              Manage
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="space-y-4">
                {/* Search Bar */}
                {data.documentPurchases.length > 0 && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={documentSearch}
                      onChange={(e) => setDocumentSearch(e.target.value)}
                      placeholder="Search documents..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tiffany/20 focus:border-tiffany transition-colors"
                    />
                    {documentSearch && (
                      <button
                        onClick={() => setDocumentSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {data.documentPurchases.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents purchased</h3>
                    <p className="text-gray-600 mb-6">Browse our collection of legal document templates.</p>
                    <Link
                      href="/documents"
                      className="inline-flex items-center gap-2 bg-tiffany text-white px-6 py-3 rounded-xl font-semibold hover:bg-tiffany-dark transition-colors"
                    >
                      Browse Documents
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  data.documentPurchases
                    .filter((purchase) =>
                      documentSearch
                        ? purchase.items.some((item) =>
                            item.description.toLowerCase().includes(documentSearch.toLowerCase())
                          )
                        : true
                    )
                    .map((purchase) => (
                    <div
                      key={purchase.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {format(new Date(purchase.created * 1000), "MMM d, yyyy")}
                          </span>
                        </div>
                        {getStatusBadge(purchase.status)}
                      </div>
                      <div className="space-y-2">
                        {purchase.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-tiffany/10 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-tiffany" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{item.description}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(item.amount)}
                              </span>
                              <button
                                onClick={() => handleDownload(purchase.id)}
                                disabled={downloadingDoc === purchase.id}
                                className="p-2 text-tiffany hover:bg-tiffany/10 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {downloadingDoc === purchase.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <span className="text-sm text-gray-600">Order Total</span>
                        <span className="font-bold text-gray-900">{formatCurrency(purchase.amount)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <div className="space-y-4">
                {data.documentPurchases.length === 0 && data.consultationPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment history</h3>
                    <p className="text-gray-600">Your payment history will appear here.</p>
                  </div>
                ) : (
                  <>
                    {/* Document Payments */}
                    {data.documentPurchases.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-tiffany/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-tiffany" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Document Purchase</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(purchase.created * 1000), "MMM d, yyyy")} • {purchase.items.length} item(s)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(purchase.amount)}</p>
                            {getStatusBadge(purchase.status)}
                          </div>
                          <button
                            onClick={() => setInvoiceModal({ isOpen: true, sessionId: purchase.id })}
                            className="p-2 text-gray-500 hover:text-tiffany hover:bg-tiffany/10 rounded-lg transition-colors"
                            title="View Invoice"
                          >
                            <Receipt className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Consultation Payments */}
                    {data.consultationPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-tiffany/10 rounded-lg flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-tiffany" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{payment.consultationType}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(payment.created * 1000), "MMM d, yyyy")}
                              {payment.date && ` • ${payment.date}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                            {getStatusBadge(payment.status)}
                          </div>
                          <button
                            onClick={() => setInvoiceModal({ isOpen: true, sessionId: payment.id })}
                            className="p-2 text-gray-500 hover:text-tiffany hover:bg-tiffany/10 rounded-lg transition-colors"
                            title="View Invoice"
                          >
                            <Receipt className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Uploads Tab */}
            {activeTab === "uploads" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Documents</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload supporting documents for your consultations. Accepted formats: PDF, Word, JPEG, PNG (max 10MB)
                  </p>
                  <DocumentUpload
                    userEmail={user.email}
                    onUploadComplete={(files) => {
                      refreshData();
                    }}
                  />
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <ClientProfileSection
                user={user}
                onProfileUpdate={refreshData}
              />
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="mt-8">
          <ActivityFeed userEmail={user.email} limit={5} />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/book-appointment"
            className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-tiffany/30 transition-colors group"
          >
            <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center group-hover:bg-tiffany/20 transition-colors">
              <Calendar className="h-6 w-6 text-tiffany" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Book a Consultation</h4>
              <p className="text-sm text-gray-600">Schedule a meeting with our team</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-tiffany transition-colors" />
          </Link>
          <Link
            href="/documents"
            className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-tiffany/30 transition-colors group"
          >
            <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center group-hover:bg-tiffany/20 transition-colors">
              <FileText className="h-6 w-6 text-tiffany" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Browse Documents</h4>
              <p className="text-sm text-gray-600">View our legal document templates</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-tiffany transition-colors" />
          </Link>
        </div>
      </div>

      {/* Modals */}
      {rescheduleModal.booking && user && (
        <RescheduleModal
          isOpen={rescheduleModal.isOpen}
          onClose={() => setRescheduleModal({ isOpen: false, booking: null })}
          booking={rescheduleModal.booking}
          email={user.email}
          onSuccess={refreshData}
        />
      )}

      {user && (
        <InvoiceModal
          isOpen={invoiceModal.isOpen}
          onClose={() => setInvoiceModal({ isOpen: false, sessionId: "" })}
          sessionId={invoiceModal.sessionId}
          email={user.email}
        />
      )}
    </div>
  );
}
