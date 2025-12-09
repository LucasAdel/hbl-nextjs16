"use client";

import { useCartStore } from "@/lib/stores/cart-store";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

export function FloatingCartButton() {
  const { items, openCart, getTotalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalItems = getTotalItems();

  if (totalItems === 0) return null;

  return (
    <button
      onClick={openCart}
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 bg-tiffany text-white p-3.5 sm:p-4 rounded-full shadow-lg hover:bg-tiffany-dark transition-all z-40 hover:scale-105 active:scale-95 min-w-[52px] min-h-[52px] flex items-center justify-center"
      aria-label={`Open cart with ${totalItems} items`}
    >
      <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
      <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-md">
        {totalItems > 99 ? "99+" : totalItems}
      </span>
    </button>
  );
}
