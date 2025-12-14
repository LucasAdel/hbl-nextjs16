"use client";

import { ComplianceQuiz } from "@/components/tools/ComplianceQuiz";
import { Sparkles, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { allDocuments as documents } from "@/lib/documents-data";
import { toast } from "sonner";

export default function ComplianceQuizPage() {
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = (productIds: string[]) => {
    // Find documents by ID and add to cart
    let addedCount = 0;
    productIds.forEach((productId) => {
      const doc = documents.find((d) => d.id === productId);
      if (doc) {
        addItem({
          id: doc.id,
          name: doc.name,
          description: doc.description,
          price: doc.price,
          category: doc.category,
          practiceArea: doc.practiceArea,
          jurisdictions: doc.jurisdictions,
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} recommended document${addedCount > 1 ? "s" : ""} to cart!`, {
        description: "Based on your compliance assessment results",
        action: {
          label: "View Cart",
          onClick: () => openCart(),
        },
      });
      openCart();
    }
  };

  const handleEmailCapture = (email: string, result: unknown) => {
    // Store email and results for follow-up
    // In production, this would call an API endpoint
    toast.success(`Results saved!`, {
      description: `A copy will be sent to ${email}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Earn up to 700+ XP for completing this quiz
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Compliance Health Check
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            Assess your practice&apos;s compliance status and identify areas
            that need attention before they become problems.
          </p>
        </div>
      </div>

      {/* Benefits Strip */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Shield className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="font-semibold">10 Key Areas</p>
              <p className="text-sm text-gray-500">comprehensive assessment</p>
            </div>
            <div className="flex flex-col items-center">
              <AlertTriangle className="w-8 h-8 text-amber-600 mb-2" />
              <p className="font-semibold">Risk Identification</p>
              <p className="text-sm text-gray-500">spot issues early</p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="w-8 h-8 text-blue-600 mb-2" />
              <p className="font-semibold">Personalized Report</p>
              <p className="text-sm text-gray-500">actionable recommendations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ComplianceQuiz
          onAddToCart={handleAddToCart}
          onEmailCapture={handleEmailCapture}
        />
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-500">
            This quiz provides general guidance only and does not constitute legal advice.
            For specific compliance concerns, please consult with a qualified professional.
          </p>
        </div>
      </div>
    </div>
  );
}
