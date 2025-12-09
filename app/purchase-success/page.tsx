"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  FileText,
  Download,
  Mail,
  ArrowRight,
  Loader2,
  ShoppingBag,
  Shield,
  Clock,
} from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import confetti from "canvas-confetti";

interface SessionData {
  id: string;
  status: string;
  payment_status: string;
  customer_email: string;
  amount_total: number;
  currency: string;
  metadata: {
    type: string;
    customerEmail: string;
    customerName: string;
    itemCount: string;
  };
  line_items: Array<{
    description: string;
    quantity: number;
    amount_total: number;
  }>;
}

function PurchaseSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { clearCart } = useCartStore();

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    } else {
      setError("No session ID provided");
      setLoading(false);
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/stripe/session?session_id=${sessionId}`);
      const data = await response.json();

      if (data.success && data.session) {
        setSession(data.session);
        // Clear cart after successful purchase
        clearCart();
        // Trigger confetti celebration
        triggerConfetti();
      } else {
        setError(data.error || "Failed to retrieve order details");
      }
    } catch (err) {
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#40E0D0", "#2d6a6a", "#5ba5a5"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#40E0D0", "#2d6a6a", "#5ba5a5"],
      });
    }, 150);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-tiffany mx-auto mb-4" />
          <p className="text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 bg-tiffany text-white px-6 py-3 rounded-xl font-semibold hover:bg-tiffany-dark transition-colors"
          >
            Return to Documents
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-tiffany to-tiffany-dark rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-slow">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-blair text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Purchase Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your documents are on their way!
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-tiffany to-tiffany-dark px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5" />
                <span className="font-semibold">Order Confirmed</span>
              </div>
              <span className="text-sm opacity-90">
                #{session?.id.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Line Items */}
            <div className="space-y-4 mb-6">
              {session?.line_items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-tiffany/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-tiffany" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.description}</h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(item.amount_total)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Paid</span>
                <span className="text-2xl font-bold text-tiffany-dark">
                  {session && formatCurrency(session.amount_total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="font-blair text-xl font-bold text-gray-900 mb-6">What happens next?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-tiffany/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-tiffany" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Check Your Email</h4>
                <p className="text-sm text-gray-600">
                  A confirmation email with your receipt has been sent to{" "}
                  <strong>{session?.customer_email}</strong>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-tiffany/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Download className="h-5 w-5 text-tiffany" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Document Delivery</h4>
                <p className="text-sm text-gray-600">
                  Your documents will be delivered to your email within the next few minutes.
                  Please check your spam folder if you don't see them.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-tiffany/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-tiffany" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Need Help?</h4>
                <p className="text-sm text-gray-600">
                  If you have any questions about your purchase, our team is here to help.
                  Contact us within 24 hours for any issues.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/documents"
            className="inline-flex items-center justify-center gap-2 bg-tiffany text-white px-8 py-4 rounded-xl font-semibold hover:bg-tiffany-dark transition-colors"
          >
            Browse More Documents
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-tiffany hover:text-tiffany transition-colors"
          >
            Contact Support
          </Link>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
            <Shield className="h-4 w-4 text-tiffany" />
            <span className="text-sm text-gray-600">
              Secure payment powered by Stripe
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-tiffany mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <PurchaseSuccessContent />
    </Suspense>
  );
}
