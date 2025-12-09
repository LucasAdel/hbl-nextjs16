"use client";

import { ROICalculator } from "@/components/tools/ROICalculator";
import { Sparkles, TrendingUp, Clock, Shield } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { toast } from "sonner";

// Bundle pricing based on categories
const bundlePricing: Record<string, number> = {
  "Starter Bundle": 299,
  "Compliance Bundle": 499,
  "Growth Bundle": 799,
  "Enterprise Bundle": 1499,
  "Custom Bundle": 599,
};

export default function ROICalculatorPage() {
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = (bundleName: string, categories: string[]) => {
    const price = bundlePricing[bundleName] || 499;

    addItem({
      id: `bundle-${bundleName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name: bundleName,
      description: `Includes documents for: ${categories.join(", ")}`,
      price: price,
      category: "Document Bundles",
      practiceArea: "Multiple",
      jurisdictions: ["National"],
    });

    toast.success(`${bundleName} added to cart!`, {
      description: `Includes ${categories.length} document categories`,
      action: {
        label: "View Cart",
        onClick: () => openCart(),
      },
    });
    openCart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Earn 150+ XP for completing this calculator
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Calculate Your ROI
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Discover how much time and money your practice could save with our
            professional legal templates.
          </p>
        </div>
      </div>

      {/* Benefits Strip */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
              <p className="font-semibold">Average 70% Savings</p>
              <p className="text-sm text-gray-500">vs. traditional legal costs</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 text-blue-600 mb-2" />
              <p className="font-semibold">Save Hours Per Document</p>
              <p className="text-sm text-gray-500">ready-to-use templates</p>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="w-8 h-8 text-indigo-600 mb-2" />
              <p className="font-semibold">Legally Compliant</p>
              <p className="text-sm text-gray-500">drafted by experts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ROICalculator onAddToCart={handleAddToCart} />
      </div>

      {/* Trust Badges */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 mb-4">Trusted by healthcare professionals across Australia</p>
          <div className="flex justify-center gap-8 opacity-50">
            <div className="text-gray-400 font-bold">AHPRA Compliant</div>
            <div className="text-gray-400 font-bold">Australian Law</div>
            <div className="text-gray-400 font-bold">Expert Drafted</div>
          </div>
        </div>
      </div>
    </div>
  );
}
