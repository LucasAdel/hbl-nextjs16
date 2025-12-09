"use client";

import { useEffect, useState, useCallback } from "react";
import { useCartStore } from "@/lib/stores/cart-store";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Mail, Gift } from "lucide-react";

export function CartAbandonmentTracker() {
  const { items, isOpen } = useCartStore();
  const [email, setEmail] = useState("");
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));

  // Calculate total value
  const totalValue = items.reduce((sum, item) => {
    const price = item.stagePrice || item.price;
    return sum + price * (item.quantity || 1);
  }, 0);

  // Track cart and send to backend
  const trackCartAbandonment = useCallback(async (userEmail: string) => {
    if (items.length === 0) return;

    try {
      await fetch("/api/cart/abandon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.stagePrice || item.price,
            quantity: item.quantity || 1,
            stage: item.stage,
          })),
          totalValue,
          sessionId,
        }),
      });
    } catch (error) {
      console.error("Error tracking cart:", error);
    }
  }, [items, totalValue, sessionId]);

  // Show email capture modal when user has items and is about to leave
  useEffect(() => {
    if (items.length === 0 || submitted) return;

    // Check for stored email first
    const storedEmail = localStorage.getItem("hbl-cart-email");
    if (storedEmail) {
      setEmail(storedEmail);
      trackCartAbandonment(storedEmail);
      return;
    }

    // Show email capture after 30 seconds with items in cart
    const timer = setTimeout(() => {
      if (!isOpen && items.length > 0 && !submitted) {
        setShowEmailCapture(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [items.length, isOpen, submitted, trackCartAbandonment]);

  // Track on page unload
  useEffect(() => {
    const handleUnload = () => {
      const storedEmail = localStorage.getItem("hbl-cart-email");
      if (storedEmail && items.length > 0) {
        // Use sendBeacon for reliable delivery on page unload
        navigator.sendBeacon(
          "/api/cart/abandon",
          JSON.stringify({
            email: storedEmail,
            items: items.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.stagePrice || item.price,
              quantity: item.quantity || 1,
              stage: item.stage,
            })),
            totalValue,
            sessionId,
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [items, totalValue, sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Store email locally
    localStorage.setItem("hbl-cart-email", email.trim());

    // Track the cart
    await trackCartAbandonment(email.trim());

    setSubmitted(true);
    setShowEmailCapture(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  return (
    <AnimatePresence>
      {showEmailCapture && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowEmailCapture(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 w-[calc(100%-2rem)] md:w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-br from-tiffany to-tiffany-dark p-6 text-white relative">
                <button
                  onClick={() => setShowEmailCapture(false)}
                  className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Save Your Cart</h3>
                    <p className="text-white/80 text-sm">{items.length} item(s) • {formatCurrency(totalValue)}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">
                  Enter your email and we'll save your cart. If you don't complete your purchase, we'll send you a reminder with your items.
                </p>

                {/* Incentive */}
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg mb-4">
                  <Gift className="h-5 w-5 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">Bonus:</span> Get 10% off your first purchase!
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tiffany focus:border-transparent"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-tiffany text-white py-3 rounded-xl font-semibold hover:bg-tiffany-dark transition-colors"
                  >
                    Save My Cart
                  </button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                  We'll only email about your cart. No spam, unsubscribe anytime.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
