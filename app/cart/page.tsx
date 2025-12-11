"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  ChevronRight,
  Plus,
  Minus,
  Tag,
  Gift,
  Sparkles,
  Loader2,
  Check,
  X,
  Zap,
  Mail,
} from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { toast } from "sonner";
import {
  validatePromoCode,
  formatCurrency as formatPromoCurrency,
  type CartItem as PromoCartItem,
} from "@/lib/ecommerce/promo-codes";
import {
  getBundleSuggestions,
  findBestBundle,
  formatCurrency as formatBundleCurrency,
} from "@/lib/ecommerce/bundle-discounts";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
    message: string;
  } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [showBundleSuggestions, setShowBundleSuggestions] = useState(true);
  const [customerEmail, setCustomerEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    document.title = "Shopping Cart | Hamilton Bailey Law Firm";
  }, []);

  // Convert cart items to promo code format
  const promoCartItems: PromoCartItem[] = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        productId: item.id,
        name: item.name,
        price: Math.round((item.stagePrice ?? item.price) * 100),
        quantity: item.quantity,
        category: item.category,
      })),
    [items]
  );

  // Get product IDs for bundle checking
  const cartProductIds = useMemo(() => items.map((item) => item.id), [items]);

  // Check for bundle suggestions and qualifications
  const bundleSuggestions = useMemo(
    () => getBundleSuggestions(cartProductIds, 2),
    [cartProductIds]
  );

  const qualifiedBundle = useMemo(
    () => findBestBundle(cartProductIds),
    [cartProductIds]
  );

  // Calculate final totals with discounts
  const subtotal = getSubtotal();
  const promoDiscount = appliedPromo ? appliedPromo.discount / 100 : 0;
  const bundleDiscount = qualifiedBundle ? qualifiedBundle.savings / 100 : 0;
  const totalDiscount = promoDiscount + bundleDiscount;
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
  const gst = discountedSubtotal * 0.1;
  const total = discountedSubtotal + gst;

  const hasDiscounts = totalDiscount > 0;
  const savingsPercentage =
    subtotal > 0 ? Math.round((totalDiscount / subtotal) * 100) : 0;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setPromoError("");

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = validatePromoCode(promoCode, promoCartItems);

    if (result.valid) {
      setAppliedPromo({
        code: promoCode.toUpperCase(),
        discount: result.discount,
        message: result.message,
      });
      setPromoCode("");

      // Gamification: Random reward for using promo
      const bonusChance = Math.random();
      if (bonusChance < 0.2) {
        toast.success("Bonus! You earned 50 XP for using a promo code!", {
          duration: 4000,
        });
      }

      toast.success(result.message);
    } else {
      setPromoError(result.message);
    }

    setPromoLoading(false);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    toast.info("Promo code removed");
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Validate email
    if (!customerEmail.trim()) {
      setEmailError("Email address is required for receipt delivery");
      return;
    }

    if (!validateEmail(customerEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");
    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "document",
          items: items.map((item) => ({
            name: item.stage ? `${item.name} - ${item.stage}` : item.name,
            price: (item.stagePrice ?? item.price) * 1.1,
            quantity: item.quantity,
          })),
          customerEmail: customerEmail.trim(),
          promoCode: appliedPromo?.code,
          bundleId: qualifiedBundle?.bundle.id,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Track checkout initiation for gamification
        try {
          await fetch("/api/gamification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "checkout_initiated", value: total }),
          });
        } catch {
          // Silent fail for gamification tracking
        }

        window.location.href = data.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An error occurred during checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleClearCart = () => {
    clearCart();
    setAppliedPromo(null);
    toast.success("Cart cleared");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-16">
        <div className="container-custom">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-tiffany" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-tiffany to-tiffany-dark text-white pt-32 pb-12">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ShoppingCart className="h-8 w-8" />
              <div>
                <h1 className="font-blair text-3xl md:text-4xl font-bold">
                  Shopping Cart
                </h1>
                <p className="text-white/80 mt-1">
                  {items.reduce((sum, item) => sum + item.quantity, 0)} item
                  {items.reduce((sum, item) => sum + item.quantity, 0) !== 1
                    ? "s"
                    : ""}{" "}
                  in your cart
                </p>
              </div>
            </div>
            {items.length > 0 && (
              <button
                onClick={handleClearCart}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
              >
                <Trash2 className="h-4 w-4" />
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container-custom">
          {items.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <ShoppingCart className="h-20 w-20 mx-auto text-gray-300 mb-6" />
              <h2 className="font-blair text-2xl mb-4 text-gray-900">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Looks like you haven&apos;t added any documents to your cart
                yet. Browse our collection of legal documents tailored for
                healthcare professionals.
              </p>
              <Link
                href="/documents"
                className="inline-flex items-center justify-center px-8 py-3 bg-tiffany text-white font-semibold rounded-xl hover:bg-tiffany-dark transition-colors"
              >
                Browse Documents
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items Column */}
              <div className="w-full lg:w-2/3">
                {/* Qualified Bundle Banner */}
                {qualifiedBundle && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6 animate-in fade-in duration-500">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Gift className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-green-800 text-lg">
                            Bundle Discount Applied!
                          </h3>
                          <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                        </div>
                        <p className="text-green-700 mt-1">
                          {qualifiedBundle.bundle.name} - You save{" "}
                          {formatBundleCurrency(qualifiedBundle.savings)}!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bundle Suggestions */}
                {bundleSuggestions.length > 0 &&
                  showBundleSuggestions &&
                  !qualifiedBundle && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-amber-100 rounded-xl">
                            <Zap className="h-6 w-6 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-amber-800">
                              Unlock Bundle Savings!
                            </h3>
                            {bundleSuggestions.slice(0, 1).map((suggestion) => (
                              <div
                                key={suggestion.bundle.id}
                                className="text-amber-700 mt-1"
                              >
                                <p className="font-medium">
                                  {suggestion.bundle.name}
                                </p>
                                <p className="text-sm mt-1">
                                  Add{" "}
                                  {suggestion.missingProducts?.slice(0, 2).join(" or ")}{" "}
                                  to save {formatBundleCurrency(suggestion.savings)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => setShowBundleSuggestions(false)}
                          className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}

                {/* Cart Items */}
                <div className="space-y-4">
                  {items.map((item) => {
                    const itemKey = item.stage
                      ? `${item.id}-${item.stage}`
                      : item.id;
                    const displayPrice = item.stagePrice ?? item.price;

                    return (
                      <div
                        key={itemKey}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {item.name}
                            </h3>
                            {item.stage && (
                              <p className="text-tiffany text-sm mt-1">
                                {item.stage}
                              </p>
                            )}
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {item.description}
                            </p>
                            <p className="text-tiffany-dark font-semibold mt-2">
                              ${displayPrice.toFixed(2)}
                              <span className="text-xs text-gray-500 font-normal ml-1">
                                + GST each
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-200 rounded-lg">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, -1, item.stage)
                                }
                                className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-4 w-4 text-gray-600" />
                              </button>
                              <span className="w-10 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, 1, item.stage)
                                }
                                className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>

                            {/* Subtotal */}
                            <div className="text-right min-w-[80px]">
                              <p className="font-semibold text-gray-900">
                                ${(displayPrice * item.quantity).toFixed(2)}
                              </p>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => {
                                removeItem(item.id, item.stage);
                                toast.success("Item removed from cart");
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Continue Shopping */}
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <Link
                    href="/documents"
                    className="flex items-center gap-2 text-tiffany-dark hover:text-tiffany transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Continue Shopping
                  </Link>
                  <button
                    onClick={handleClearCart}
                    className="sm:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors text-sm text-gray-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Order Summary Column */}
              <div className="w-full lg:w-1/3">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-28">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="font-blair text-xl">Order Summary</h2>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Item Summary */}
                    <div className="space-y-2">
                      {items.map((item) => {
                        const displayPrice = item.stagePrice ?? item.price;
                        return (
                          <div
                            key={item.stage ? `${item.id}-${item.stage}` : item.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-600 truncate pr-2">
                              {item.name}
                              {item.stage && ` (${item.stage})`} x{" "}
                              {item.quantity}
                            </span>
                            <span className="font-medium">
                              ${(displayPrice * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>

                      {/* Discount Breakdown */}
                      {promoDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600 mt-2">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            Promo ({appliedPromo?.code})
                          </span>
                          <span>-${promoDiscount.toFixed(2)}</span>
                        </div>
                      )}

                      {bundleDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600 mt-2">
                          <span className="flex items-center gap-1">
                            <Gift className="h-3 w-3" />
                            Bundle Discount
                          </span>
                          <span>-${bundleDiscount.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-600">GST (10%)</span>
                        <span>${gst.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-lg">Total</span>
                        <div className="text-right">
                          <span className="font-bold text-xl text-tiffany-dark">
                            ${total.toFixed(2)} AUD
                          </span>
                          {hasDiscounts && (
                            <p className="text-xs text-green-600 mt-1">
                              You save ${totalDiscount.toFixed(2)} (
                              {savingsPercentage}% off)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Promo Code Section */}
                    <div className="border-t border-gray-100 pt-4">
                      {appliedPromo ? (
                        <div className="flex items-center justify-between bg-tiffany/10 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <Tag className="h-5 w-5 text-tiffany" />
                            <div>
                              <span className="font-medium text-tiffany">
                                {appliedPromo.code}
                              </span>
                              <p className="text-xs text-gray-600">
                                {appliedPromo.message}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleRemovePromo}
                            className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Promo Code
                          </label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Enter code"
                                value={promoCode}
                                onChange={(e) => {
                                  setPromoCode(e.target.value.toUpperCase());
                                  setPromoError("");
                                }}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && handleApplyPromo()
                                }
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-tiffany focus:border-transparent"
                              />
                            </div>
                            <button
                              onClick={handleApplyPromo}
                              disabled={promoLoading || !promoCode.trim()}
                              className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {promoLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Apply"
                              )}
                            </button>
                          </div>
                          {promoError && (
                            <p className="text-red-500 text-xs flex items-center gap-1">
                              <X className="h-3 w-3" />
                              {promoError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <label
                        htmlFor="customer-email"
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Email Address (for receipt)
                      </label>
                      <input
                        id="customer-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={customerEmail}
                        onChange={(e) => {
                          setCustomerEmail(e.target.value);
                          if (emailError) setEmailError("");
                        }}
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-tiffany focus:border-transparent ${
                          emailError ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {emailError && (
                        <p className="text-red-500 text-xs">{emailError}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Your receipt and documents will be sent to this email
                      </p>
                    </div>

                    {/* Checkout Button */}
                    <button
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="w-full bg-tiffany text-white py-4 rounded-xl font-semibold hover:bg-tiffany-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Proceed to Checkout
                          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                      <Check className="h-3 w-3 text-green-500" />
                      Secure checkout powered by Stripe
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
