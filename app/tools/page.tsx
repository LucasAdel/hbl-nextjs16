"use client";

import Link from "next/link";
import { Calculator, ClipboardCheck, FileText, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const tools = [
  {
    id: "roi-calculator",
    name: "ROI Calculator",
    description: "Calculate how much time and money your practice could save with our legal templates.",
    icon: Calculator,
    color: "blue",
    xpReward: "150+ XP",
    href: "/tools/roi-calculator",
    features: [
      "Compare template vs traditional costs",
      "Calculate time savings",
      "Get personalized bundle recommendations",
    ],
  },
  {
    id: "compliance-quiz",
    name: "Compliance Health Check",
    description: "Assess your practice's compliance status and identify areas that need attention.",
    icon: ClipboardCheck,
    color: "emerald",
    xpReward: "700+ XP",
    href: "/tools/compliance-quiz",
    features: [
      "10-question comprehensive assessment",
      "Risk level analysis",
      "Personalized recommendations",
    ],
  },
  {
    id: "document-configurator",
    name: "Document Configurator",
    description: "Customize legal documents to match your exact practice needs with real-time pricing.",
    icon: FileText,
    color: "indigo",
    xpReward: "100+ XP",
    href: "/tools/document-configurator",
    features: [
      "5+ customizable templates",
      "Real-time price calculation",
      "Preview before purchase",
    ],
  },
];

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-600",
    button: "bg-blue-600 hover:bg-blue-700",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "text-emerald-600",
    button: "bg-emerald-600 hover:bg-emerald-700",
  },
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    icon: "text-indigo-600",
    button: "bg-indigo-600 hover:bg-indigo-700",
  },
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Interactive Tools
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Use our free tools to assess your practice needs, calculate savings,
            and configure the perfect legal documents.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>Earn XP for completing each tool</span>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tools.map((tool) => {
            const colors = colorClasses[tool.color as keyof typeof colorClasses];
            const Icon = tool.icon;

            return (
              <Card
                key={tool.id}
                className={`${colors.bg} ${colors.border} border-2 overflow-hidden hover:shadow-lg transition-all`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 rounded-lg bg-white ${colors.icon}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="flex items-center gap-1 text-sm text-amber-600 font-medium">
                      <Sparkles className="w-4 h-4" />
                      {tool.xpReward}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{tool.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{tool.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tool.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.icon.replace("text-", "bg-")}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={tool.href}>
                    <Button className={`w-full ${colors.button} text-white`}>
                      Start Tool
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Why Use Our Tools?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">Free</p>
              <p className="text-sm text-gray-600">No cost to use any tool</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">950+ XP</p>
              <p className="text-sm text-gray-600">Earn by completing all tools</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-indigo-600">&lt;10 min</p>
              <p className="text-sm text-gray-600">Each tool takes minutes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">Personalized</p>
              <p className="text-sm text-gray-600">Tailored recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
