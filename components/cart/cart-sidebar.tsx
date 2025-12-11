"use client";

import { useCartStore } from "@/lib/stores/cart-store";
import { X, Plus, Minus, ShoppingCart, Trash2, Tag, Gift, Sparkles, Check, Loader2, ChevronRight, Zap } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { validatePromoCode, formatCurrency as formatPromoCurrency, type CartItem as PromoCartItem } from "@/lib/ecommerce/promo-codes";
import { getBundleSuggestions, findBestBundle, formatCurrency as formatBundleCurrency, type BundleCalculation } from "@/lib/ecommerce/bundle-discounts";

export function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getGST,
    getTotal,
  } = useCartStore();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; message: string } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [showBundleSuggestions, setShowBundleSuggestions] = useState(true);

  // Convert cart items to promo code format
  const promoCartItems: PromoCartItem[] = useMemo(() =>
    items.map(item => ({
      id: item.id,
      productId: item.id,
      name: item.name,
      price: Math.round((item.stagePrice ?? item.price) * 100), // Convert to cents
      quantity: item.quantity,
      category: item.category,
    })), [items]
  );

  // Get product IDs for bundle checking
  const cartProductIds = useMemo(() => items.map(item => item.id), [items]);

  // Check for bundle suggestions and qualifications
  const bundleSuggestions = useMemo(() =>
    getBundleSuggestions(cartProductIds, 2), [cartProductIds]
  );

  const qualifiedBundle = useMemo(() =>
    findBestBundle(cartProductIds), [cartProductIds]
  );

  // Calculate final totals with discounts
  const subtotal = getSubtotal();
  const promoDiscount = appliedPromo ? appliedPromo.discount / 100 : 0; // Convert from cents
  const bundleDiscount = qualifiedBundle ? qualifiedBundle.savings / 100 : 0;
  const totalDiscount = promoDiscount + bundleDiscount;
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
  const gst = discountedSubtotal * 0.1;
  const total = discountedSubtotal + gst;

  // Apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setPromoError("");

    // Simulate API call delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

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
        toast.success("🎉 Bonus! You earned 50 XP for using a promo code!", {
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

    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "document",
          items: items.map((item) => ({
            name: item.stage ? `${item.name} - ${item.stage}` : item.name,
            price: (item.stagePrice ?? item.price) * 1.1, // Include GST
            quantity: item.quantity,
          })),
          customerEmail: "",
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

  if (!isOpen) return null;

  const hasDiscounts = totalDiscount > 0;
  const savingsPercentage = subtotal > 0 ? Math.round((totalDiscount / subtotal) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-white dark:bg-gray-900 shadow-xl transform transition-transform animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-tiffany" />
              <h2 className="font-blair text-xl dark:text-white">Your Cart</h2>
              {items.length > 0 && (
                <span className="bg-tiffany text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={() => {
                    clearCart();
                    setAppliedPromo(null);
                    toast.success("Cart cleared");
                  }}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Clear cart"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Your cart is empty</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  Add some documents to get started
                </p>
                <button
                  onClick={closeCart}
                  className="mt-4 px-4 py-2 bg-tiffany text-white rounded-lg hover:bg-tiffany-dark transition-colors text-sm font-medium"
                >
                  Browse Documents
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Qualified Bundle Banner */}
                {qualifiedBundle && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 animate-in fade-in duration-500">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                        <Gift className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm">
                            Bundle Discount Applied!
                          </h4>
                          <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                        </div>
                        <p className="text-green-700 dark:text-green-400 text-xs mt-1">
                          {qualifiedBundle.bundle.name} - Save {formatBundleCurrency(qualifiedBundle.savings)}!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bundle Suggestions */}
                {bundleSuggestions.length > 0 && showBundleSuggestions && !qualifiedBundle && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                          Unlock Bundle Savings!
                        </span>
                      </div>
                      <button
                        onClick={() => setShowBundleSuggestions(false)}
                        className="text-amber-600 dark:text-amber-400 hover:text-amber-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {bundleSuggestions.slice(0, 1).map((suggestion) => (
                      <div key={suggestion.bundle.id} className="text-xs text-amber-700 dark:text-amber-400">
                        <p className="font-medium">{suggestion.bundle.name}</p>
                        <p className="mt-1">
                          Add {suggestion.missingProducts?.slice(0, 2).join(" or ")} to save {formatBundleCurrency(suggestion.savings)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cart Items List */}
                {items.map((item) => {
                  const itemKey = item.stage
                    ? `${item.id}-${item.stage}`
                    : item.id;
                  const displayPrice = item.stagePrice ?? item.price;

                  return (
                    <div
                      key={itemKey}
                      className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl group hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate dark:text-white">
                          {item.name}
                        </h4>
                        {item.stage && (
                          <p className="text-xs text-tiffany mt-0.5">
                            {item.stage}
                          </p>
                        )}
                        <p className="text-tiffany-dark font-semibold mt-1">
                          ${displayPrice.toFixed(2)}
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-1">
                            + GST
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1, item.stage)}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <Minus className="h-4 w-4 dark:text-gray-400" />
                        </button>
                        <span className="w-8 text-center font-medium dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1, item.stage)}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <Plus className="h-4 w-4 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            removeItem(item.id, item.stage);
                            toast.success("Item removed from cart");
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors ml-2 opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Promo Code Section */}
                <div className="pt-4 border-t dark:border-gray-700">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-tiffany/10 dark:bg-tiffany/20 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-tiffany" />
                        <div>
                          <span className="font-medium text-tiffany text-sm">{appliedPromo.code}</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{appliedPromo.message}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Promo code"
                            value={promoCode}
                            onChange={(e) => {
                              setPromoCode(e.target.value.toUpperCase());
                              setPromoError("");
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                            className="w-full pl-10 pr-4 py-2.5 border dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-tiffany focus:border-transparent dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <button
                          onClick={handleApplyPromo}
                          disabled={promoLoading || !promoCode.trim()}
                          className="px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {promoLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {promoError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer with totals */}
          {items.length > 0 && (
            <div className="border-t dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-800/50">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {/* Discount Breakdown */}
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Promo ({appliedPromo?.code})
                    </span>
                    <span>-${promoDiscount.toFixed(2)}</span>
                  </div>
                )}

                {bundleDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1">
                      <Gift className="h-3 w-3" />
                      Bundle Discount
                    </span>
                    <span>-${bundleDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>GST (10%)</span>
                  <span>${gst.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-700">
                  <span className="dark:text-white">Total</span>
                  <div className="text-right">
                    <span className="text-tiffany-dark dark:text-tiffany">
                      ${total.toFixed(2)} AUD
                    </span>
                    {hasDiscounts && (
                      <p className="text-xs text-green-600 dark:text-green-400 font-normal">
                        You save ${totalDiscount.toFixed(2)} ({savingsPercentage}% off)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-tiffany text-white py-3.5 rounded-xl font-semibold hover:bg-tiffany-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isCheckingOut ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Checkout
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                Secure checkout powered by Stripe
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
