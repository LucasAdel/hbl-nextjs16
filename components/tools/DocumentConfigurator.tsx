"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Settings,
  Clock,
  DollarSign,
  ShoppingCart,
  Save,
  Award,
  Zap,
  MapPin,
  Building2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  calculateConfiguration,
  getDefaultConfiguration,
  validateConfiguration,
  formatPrice,
  formatTimeSaved,
  TEMPLATE_LIBRARY,
  PRACTICE_TYPES,
  JURISDICTIONS,
  type ConfigurationState,
  type ConfigurationResult,
  type TemplateDefinition,
} from "@/lib/configurator/template-builder";
import confetti from "canvas-confetti";

interface DocumentConfiguratorProps {
  initialTemplateId?: string;
  onAddToCart?: (config: ConfigurationResult) => void;
  onSaveConfiguration?: (config: ConfigurationState, email: string) => void;
  onComplete?: (result: ConfigurationResult) => void;
}

type Step = "template" | "configure" | "preview";

export function DocumentConfigurator({
  initialTemplateId,
  onAddToCart,
  onSaveConfiguration,
  onComplete,
}: DocumentConfiguratorProps) {
  const [step, setStep] = useState<Step>(initialTemplateId ? "configure" : "template");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition | null>(
    initialTemplateId ? TEMPLATE_LIBRARY.find((t) => t.id === initialTemplateId) || null : null
  );
  const [configuration, setConfiguration] = useState<ConfigurationState | null>(
    initialTemplateId ? getDefaultConfiguration(initialTemplateId) : null
  );
  const [result, setResult] = useState<ConfigurationResult | null>(null);
  const [saveEmail, setSaveEmail] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  const validation = useMemo(() => {
    if (!configuration) return { valid: false, errors: [] };
    return validateConfiguration(configuration);
  }, [configuration]);

  const currentResult = useMemo(() => {
    if (!configuration) return null;
    try {
      return calculateConfiguration(configuration);
    } catch {
      return null;
    }
  }, [configuration]);

  const handleTemplateSelect = useCallback((template: TemplateDefinition) => {
    setSelectedTemplate(template);
    setConfiguration(getDefaultConfiguration(template.id));
    setStep("configure");
  }, []);

  const handleOptionToggle = useCallback(
    (sectionId: string, optionId: string, multiSelect: boolean) => {
      if (!configuration) return;

      setConfiguration((prev) => {
        if (!prev) return prev;

        const newOptions = new Map(prev.selectedOptions);
        const current = newOptions.get(sectionId) || [];

        if (multiSelect) {
          // Toggle for multi-select
          if (current.includes(optionId)) {
            newOptions.set(sectionId, current.filter((id) => id !== optionId));
          } else {
            newOptions.set(sectionId, [...current, optionId]);
          }
        } else {
          // Replace for single-select
          newOptions.set(sectionId, [optionId]);
        }

        return { ...prev, selectedOptions: newOptions };
      });
    },
    [configuration]
  );

  const handleJurisdictionChange = useCallback((jurisdiction: string) => {
    setConfiguration((prev) => prev ? { ...prev, jurisdiction } : prev);
  }, []);

  const handlePracticeTypeChange = useCallback((practiceType: string) => {
    setConfiguration((prev) => prev ? { ...prev, practiceType } : prev);
  }, []);

  const handlePreview = useCallback(async () => {
    if (!configuration || !validation.valid) return;

    const configResult = calculateConfiguration(configuration);
    setResult(configResult);
    setStep("preview");

    // Celebrate
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.7 },
    });

    // Award XP
    try {
      await fetch("/api/xp/earn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete_quiz",
          metadata: {
            tool: "document_configurator",
            templateId: configuration.templateId,
            optionsCount: Array.from(configuration.selectedOptions.values()).flat().length,
          },
        }),
      });
      setXpAwarded(true);
    } catch (error) {
      console.error("Failed to award XP:", error);
    }

    onComplete?.(configResult);
  }, [configuration, validation, onComplete]);

  const handleAddToCart = useCallback(() => {
    if (result) {
      onAddToCart?.(result);
    }
  }, [result, onAddToCart]);

  const handleSaveConfiguration = useCallback(() => {
    if (configuration && saveEmail) {
      onSaveConfiguration?.(configuration, saveEmail);
      setShowSaveModal(false);
    }
  }, [configuration, saveEmail, onSaveConfiguration]);

  const progressPercentage = step === "template" ? 33 : step === "configure" ? 66 : 100;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            Document Configurator
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Earn 100+ XP</span>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span className={step === "template" ? "font-semibold text-indigo-600" : ""}>
            Select Template
          </span>
          <span className={step === "configure" ? "font-semibold text-indigo-600" : ""}>
            Configure
          </span>
          <span className={step === "preview" ? "font-semibold text-indigo-600" : ""}>
            Preview & Order
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Template Selection */}
        {step === "template" && (
          <motion.div
            key="template"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Choose a Template to Configure
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEMPLATE_LIBRARY.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:border-indigo-300"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{template.name}</h4>
                      <span className="text-sm font-bold text-indigo-600">
                        From {formatPrice(template.basePrice)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {template.estimatedTime} min
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        Save {template.traditionalTime}h
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded capitalize">
                        {template.category}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Configuration */}
        {step === "configure" && selectedTemplate && configuration && (
          <motion.div
            key="configure"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
                <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
              </div>
              {currentResult && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatPrice(currentResult.totalPrice)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Base: {formatPrice(selectedTemplate.basePrice)}
                  </p>
                </div>
              )}
            </div>

            {/* Jurisdiction & Practice Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Jurisdiction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    value={configuration.jurisdiction}
                    onChange={(e) => handleJurisdictionChange(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {JURISDICTIONS.filter(
                      (j) =>
                        selectedTemplate.jurisdictions.includes(j.id) ||
                        selectedTemplate.jurisdictions.includes("federal")
                    ).map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.label}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Practice Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    value={configuration.practiceType}
                    onChange={(e) => handlePracticeTypeChange(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {PRACTICE_TYPES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>
            </div>

            {/* Configuration Sections */}
            {selectedTemplate.sections.map((section) => {
              const selectedOptions = configuration.selectedOptions.get(section.id) || [];
              const isMultiSelect = !section.required;

              return (
                <Card key={section.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      {section.name}
                      {section.required && (
                        <span className="text-xs text-red-500">Required</span>
                      )}
                    </CardTitle>
                    {section.description && (
                      <p className="text-xs text-gray-500">{section.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {section.options.map((option) => {
                      const isSelected = selectedOptions.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() =>
                            handleOptionToggle(section.id, option.id, isMultiSelect)
                          }
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={isSelected ? "font-medium" : ""}>
                                  {option.label}
                                </span>
                                {option.priceModifier > 0 && (
                                  <span className="text-xs text-indigo-600 font-medium">
                                    +{formatPrice(option.priceModifier)}
                                  </span>
                                )}
                              </div>
                              {option.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {option.description}
                                </p>
                              )}
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}

            {/* Validation Errors */}
            {!validation.valid && validation.errors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium mb-1">
                  Please fix the following:
                </p>
                <ul className="text-sm text-red-600 list-disc list-inside">
                  {validation.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("template");
                  setSelectedTemplate(null);
                  setConfiguration(null);
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Change Template
              </Button>
              <Button onClick={handlePreview} disabled={!validation.valid}>
                Preview Configuration
                <Eye className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Preview */}
        {step === "preview" && result && selectedTemplate && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* XP Banner */}
            {xpAwarded && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6" />
                  <div>
                    <p className="font-bold">
                      +{result.xpReward + result.bonusXP} XP Earned!
                    </p>
                    {result.bonusXP > 0 && (
                      <p className="text-sm opacity-90">
                        Including {result.bonusXP} bonus XP!
                      </p>
                    )}
                  </div>
                </div>
                <Zap className="w-8 h-8 opacity-50" />
              </motion.div>
            )}

            {/* Summary Card */}
            <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedTemplate.name}</h3>
                    <p className="text-indigo-200">Customized for your practice</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{formatPrice(result.totalPrice)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-indigo-200 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      Time to Complete
                    </div>
                    <p className="text-xl font-bold">{result.estimatedTime} min</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-indigo-200 text-sm mb-1">
                      <TrendingUp className="w-4 h-4" />
                      Time Saved
                    </div>
                    <p className="text-xl font-bold">{formatTimeSaved(result.timeSaved)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Price Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.priceBreakdown.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between py-2 border-b last:border-0"
                    >
                      <span>{item.item}</span>
                      <span className="font-medium">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 text-lg font-bold">
                    <span>Total</span>
                    <span className="text-indigo-600">
                      {formatPrice(result.totalPrice)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Outline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Document Outline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 font-mono text-sm">
                  {result.previewOutline.map((line, i) => (
                    <p key={i} className={line.startsWith("  ") ? "text-gray-600" : "font-bold"}>
                      {line}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart - {formatPrice(result.totalPrice)}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSaveModal(true)}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </div>

            {/* Back to edit */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep("configure");
                  setResult(null);
                  setXpAwarded(false);
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Edit
              </Button>
            </div>

            {/* Save Modal */}
            {showSaveModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md mx-4">
                  <CardHeader>
                    <CardTitle>Save Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Enter your email to save this configuration for later.
                    </p>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={saveEmail}
                      onChange={(e) => setSaveEmail(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowSaveModal(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveConfiguration}
                        disabled={!saveEmail}
                        className="flex-1"
                      >
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Missing import
function TrendingUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
