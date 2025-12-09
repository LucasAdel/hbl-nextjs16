"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Mail,
  ArrowRight,
  Loader2,
  Video,
  Shield,
  User,
  MapPin,
} from "lucide-react";
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
    consultationType: string;
    consultationName: string;
    bookingId: string;
    date: string;
    time: string;
    customerEmail: string;
    customerName: string;
  };
  line_items: Array<{
    description: string;
    quantity: number;
    amount_total: number;
  }>;
}

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        // Trigger confetti celebration
        triggerConfetti();
      } else {
        setError(data.error || "Failed to retrieve booking details");
      }
    } catch (err) {
      setError("Failed to load booking details");
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-AU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-tiffany mx-auto mb-4" />
          <p className="text-gray-600">Confirming your booking...</p>
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
            href="/book-appointment"
            className="inline-flex items-center gap-2 bg-tiffany text-white px-6 py-3 rounded-xl font-semibold hover:bg-tiffany-dark transition-colors"
          >
            Try Again
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
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Your consultation has been scheduled. We look forward to meeting you!
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-tiffany to-tiffany-dark px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5" />
                <span className="font-semibold">Appointment Confirmed</span>
              </div>
              <span className="text-sm opacity-90">
                #{session?.metadata?.bookingId?.slice(-8).toUpperCase() || session?.id.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Consultation Details */}
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-tiffany-lighter/20 rounded-xl border border-tiffany/20">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Video className="h-5 w-5 text-tiffany" />
                  {session?.metadata?.consultationName || session?.line_items[0]?.description || "Legal Consultation"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Calendar className="h-5 w-5 text-tiffany" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                      <p className="font-medium text-gray-900">
                        {session?.metadata?.date ? formatDate(session.metadata.date) : "Pending confirmation"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Clock className="h-5 w-5 text-tiffany" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Time</p>
                      <p className="font-medium text-gray-900">
                        {session?.metadata?.time || "Pending confirmation"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Client</p>
                  <p className="font-medium text-gray-900">{session?.metadata?.customerName || "Client"}</p>
                  <p className="text-sm text-gray-600">{session?.customer_email}</p>
                </div>
              </div>

              {/* Meeting Location */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <MapPin className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                  <p className="font-medium text-gray-900">Virtual Meeting (Google Meet)</p>
                  <p className="text-sm text-gray-600">Link will be sent via email</p>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Amount Paid</span>
                <span className="text-2xl font-bold text-tiffany-dark">
                  {session && formatCurrency(session.amount_total)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Includes GST</p>
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="font-blair text-xl font-bold text-gray-900 mb-6">What happens next?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-tiffany/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-tiffany font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Confirmation Email</h4>
                <p className="text-sm text-gray-600">
                  A confirmation email with your booking details and receipt has been sent to{" "}
                  <strong>{session?.customer_email}</strong>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-tiffany/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-tiffany font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Meeting Link</h4>
                <p className="text-sm text-gray-600">
                  You'll receive a Google Meet link via email 24 hours before your appointment.
                  The link will also be added to your calendar invitation.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-tiffany/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-tiffany font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Prepare for Your Consultation</h4>
                <p className="text-sm text-gray-600">
                  Gather any relevant documents or notes you'd like to discuss.
                  Our team will reach out if any additional information is needed.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-tiffany/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-tiffany font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Join the Meeting</h4>
                <p className="text-sm text-gray-600">
                  Join the Google Meet link at your scheduled time. We recommend joining
                  a few minutes early to test your audio and video.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 mb-8">
          <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Important Information
          </h3>
          <ul className="space-y-2 text-sm text-amber-800">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">•</span>
              <span>Please be ready 5 minutes before your scheduled time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">•</span>
              <span>Ensure you have a stable internet connection for the video call</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">•</span>
              <span>If you need to reschedule, please contact us at least 24 hours in advance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">•</span>
              <span>Check your spam folder if you don't receive confirmation emails</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-tiffany text-white px-8 py-4 rounded-xl font-semibold hover:bg-tiffany-dark transition-colors"
          >
            Return Home
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-tiffany hover:text-tiffany transition-colors"
          >
            Contact Us
          </Link>
        </div>

        {/* Add to Calendar CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-3">
            A calendar invitation will be sent to your email shortly
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
            <Mail className="h-4 w-4 text-tiffany" />
            <span className="text-sm text-gray-600">
              Check your inbox for booking confirmation
            </span>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 text-center">
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

export default function BookingSuccessPage() {
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
      <BookingSuccessContent />
    </Suspense>
  );
}
