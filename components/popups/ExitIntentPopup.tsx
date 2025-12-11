"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  Users,
  FileText,
  ShoppingCart,
  Gift,
  Star,
} from "lucide-react";
import { useExitIntent } from "@/hooks/useExitIntent";
import { usePathname } from "next/navigation";

// ============================================================================
// Types
// ============================================================================

type PopupVariant = "newsletter" | "cart" | "document" | "discount";

interface ExitIntentPopupProps {
  /** Force a specific variant (auto-detected if not provided) */
  variant?: PopupVariant;
  /** Custom discount code */
  discountCode?: string;
  /** Custom discount percentage */
  discountPercent?: number;
  /** Enable gamification XP reward display */
  showXPReward?: boolean;
  /** XP amount to display */
  xpReward?: number;
  /** Disable the popup entirely */
  disabled?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const SOCIAL_PROOF_STATS = [
  { value: "700+", label: "Medical professionals served" },
  { value: "98%", label: "Client satisfaction rate" },
  { value: "14+", label: "Years of experience" },
];

const XP_REWARDS = {
  newsletter: 100,
  cart: 50,
  document: 75,
  discount: 100,
};

// ============================================================================
// Main Component
// ============================================================================

export function ExitIntentPopup({
  variant: forcedVariant,
  discountCode = "STAYWITHUS",
  discountPercent = 10,
  showXPReward = true,
  xpReward,
  disabled = false,
}: ExitIntentPopupProps) {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Determine variant based on current page
  const isCartPage = pathname?.includes("/cart") || forcedVariant === "cart";
  const isDocumentPage = pathname?.includes("/documents") || pathname?.includes("/codex") || forcedVariant === "document";

  const variant: PopupVariant = forcedVariant || (isCartPage ? "cart" : isDocumentPage ? "document" : "newsletter");

  // Use single hook with configuration based on page type
  // Cart pages get shorter delay, other pages get longer delay
  const exitIntent = useExitIntent({
    delay: isCartPage ? 15000 : 45000, // 15s for cart, 45s for others
    offerType: variant,
    excludePaths: ["/admin", "/checkout", "/thank-you", "/success", "/login", "/register"],
  });
  const { triggered, dismiss, markConverted } = exitIntent;

  // Calculate XP reward
  const actualXPReward = xpReward || XP_REWARDS[variant];

  // Don't render if disabled
  if (disabled) return null;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email address");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: `exit_intent_${variant}`,
          metadata: {
            discountCode: variant === "cart" || variant === "discount" ? discountCode : undefined,
            variant,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(getSuccessMessage());
        markConverted();
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to subscribe. Please try again later.");
    }
  };

  const getSuccessMessage = () => {
    switch (variant) {
      case "cart":
        return `Your ${discountPercent}% discount code "${discountCode}" has been sent to your email!`;
      case "document":
        return "Check your inbox for your free legal resources!";
      case "discount":
        return `Your discount code "${discountCode}" is ready!`;
      default:
        return "Welcome! Check your inbox for a confirmation email.";
    }
  };

  // ============================================================================
  // Render Content Based on Variant
  // ============================================================================

  const renderContent = () => {
    switch (variant) {
      case "cart":
        return (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-orange-500" />
              </div>
              <h2 className="font-blair text-2xl font-bold text-gray-900 mb-2">
                Wait! Don't Leave Empty-Handed
              </h2>
              <p className="text-gray-600">
                Complete your order now and get <span className="font-bold text-tiffany">{discountPercent}% off</span> your purchase!
              </p>
            </div>

            <div className="bg-gradient-to-r from-tiffany/10 to-blue-500/10 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-gray-600 mb-1">Your exclusive discount code:</p>
              <p className="font-mono text-2xl font-bold text-tiffany">{discountCode}</p>
            </div>
          </>
        );

      case "document":
        return (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
              <h2 className="font-blair text-2xl font-bold text-gray-900 mb-2">
                Get Free Legal Resources
              </h2>
              <p className="text-gray-600">
                Subscribe and receive our top 3 legal templates absolutely free!
              </p>
            </div>

            <div className="bg-gray-100 rounded-xl p-4 mb-6">
              <p className="font-medium text-gray-900 mb-3">You'll receive:</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Practice Compliance Checklist
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Employment Contract Essentials Guide
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Medical Practice Structure Overview
                </li>
              </ul>
            </div>
          </>
        );

      default: // newsletter
        return (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-tiffany/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-tiffany" />
              </div>
              <h2 className="font-blair text-2xl font-bold text-gray-900 mb-2">
                Join 700<span className="font-montserrat font-normal">+</span> Medical Professionals
              </h2>
              <p className="text-gray-600">
                Get exclusive legal insights, compliance updates, and industry news delivered to your inbox.
              </p>
            </div>

            {/* Social Proof */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {SOCIAL_PROOF_STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xl font-bold text-tiffany">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </>
        );
    }
  };

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <AnimatePresence>
      {triggered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-intent-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              aria-label="Close popup"
            >
              <X className="h-5 w-5" />
            </button>

            {/* XP Reward Badge */}
            {showXPReward && status !== "success" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-4 left-4 flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
              >
                <Sparkles className="h-3.5 w-3.5" />
                +{actualXPReward} XP
              </motion.div>
            )}

            {/* Content */}
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="font-blair text-xl font-bold text-gray-900 mb-2">
                  You're All Set!
                </h3>
                <p className="text-gray-600 mb-4">
                  {message}
                </p>

                {showXPReward && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.3 }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold"
                  >
                    <Sparkles className="h-5 w-5" />
                    +{actualXPReward} XP Earned!
                  </motion.div>
                )}

                <button
                  onClick={dismiss}
                  className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Continue Browsing
                </button>
              </motion.div>
            ) : (
              <>
                {renderContent()}

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 bg-white rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                      disabled={status === "loading"}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3.5 bg-gradient-to-r from-tiffany to-tiffany-dark text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {variant === "cart" ? "Get My Discount" : variant === "document" ? "Get Free Resources" : "Subscribe Now"}
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>

                  {status === "error" && (
                    <p className="text-red-500 text-sm text-center">{message}</p>
                  )}
                </form>

                {/* No Thanks Link */}
                <button
                  onClick={dismiss}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4 py-2 transition-colors"
                >
                  No thanks, I'll pass
                </button>

                {/* Privacy Note */}
                <p className="text-center text-xs text-gray-400 mt-4">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </>
            )}

            {/* Decorative Elements */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-tiffany/5 rounded-full" />
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-purple-500/5 rounded-full" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ExitIntentPopup;
