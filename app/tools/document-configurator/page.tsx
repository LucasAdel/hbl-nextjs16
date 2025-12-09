"use client";

import { DocumentConfigurator } from "@/components/tools/DocumentConfigurator";
import { Sparkles, FileText, Settings, Zap } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { toast } from "sonner";

interface DocumentConfig {
  templateId: string;
  templateName: string;
  selectedClauses: string[];
  totalPrice: number;
  jurisdiction?: string;
}

export default function DocumentConfiguratorPage() {
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = (config: unknown) => {
    const docConfig = config as DocumentConfig;

    // Add configured document to cart
    addItem({
      id: `custom-${docConfig.templateId}-${Date.now()}`,
      name: `Custom ${docConfig.templateName}`,
      description: `Customized document with ${docConfig.selectedClauses.length} selected clauses`,
      price: docConfig.totalPrice,
      category: "Custom Documents",
      practiceArea: "Practice Management",
      jurisdictions: docConfig.jurisdiction ? [docConfig.jurisdiction] : ["National"],
    });

    toast.success("Custom document added to cart!", {
      description: `${docConfig.templateName} with your selected options`,
      action: {
        label: "View Cart",
        onClick: () => openCart(),
      },
    });
    openCart();
  };

  const handleSaveConfiguration = (config: unknown, email: string) => {
    // In production, this would save to database and send email
    const docConfig = config as DocumentConfig;
    console.log("Saving configuration for:", email, docConfig);

    // Store in localStorage for demo purposes
    const savedConfigs = JSON.parse(localStorage.getItem("saved-doc-configs") || "[]");
    savedConfigs.push({
      ...docConfig,
      email,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem("saved-doc-configs", JSON.stringify(savedConfigs));

    toast.success("Configuration saved!", {
      description: `A link has been sent to ${email}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Earn 100+ XP for configuring a document
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Document Configurator
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Customize your legal documents to match your exact needs.
            Select the clauses and provisions that matter to your practice.
          </p>
        </div>
      </div>

      {/* Benefits Strip */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <FileText className="w-8 h-8 text-indigo-600 mb-2" />
              <p className="font-semibold">5+ Templates</p>
              <p className="text-sm text-gray-500">professional documents</p>
            </div>
            <div className="flex flex-col items-center">
              <Settings className="w-8 h-8 text-purple-600 mb-2" />
              <p className="font-semibold">Fully Customizable</p>
              <p className="text-sm text-gray-500">pick exactly what you need</p>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="w-8 h-8 text-amber-600 mb-2" />
              <p className="font-semibold">Instant Preview</p>
              <p className="text-sm text-gray-500">see before you buy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configurator */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <DocumentConfigurator
          onAddToCart={handleAddToCart}
          onSaveConfiguration={handleSaveConfiguration}
        />
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Can I edit the document after purchase?</h3>
              <p className="text-sm text-gray-600">
                Yes! All documents are delivered in editable Word format so you can
                make additional changes as needed.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Are the templates legally compliant?</h3>
              <p className="text-sm text-gray-600">
                All templates are drafted by legal professionals and updated
                regularly to reflect current Australian law.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">What if I need help customizing?</h3>
              <p className="text-sm text-gray-600">
                Contact our support team for guidance, or consider our premium
                service for personalized assistance.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-sm text-gray-600">
                We offer a satisfaction guarantee. If the document doesn&apos;t meet
                your needs, contact us within 14 days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
