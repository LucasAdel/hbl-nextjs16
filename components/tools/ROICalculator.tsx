"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  TrendingUp,
  Clock,
  DollarSign,
  ChevronRight,
  Sparkles,
  Building2,
  FileText,
  CheckCircle2,
  ArrowRight,
  Zap,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  calculateROI,
  formatCurrency,
  formatHours,
  getSavingsTierMessage,
  PRACTICE_SIZES,
  DOCUMENT_CATEGORIES,
  type PracticeSize,
  type DocumentCategory,
  type ROICalculatorOutput,
} from "@/lib/calculators/roi-logic";
import confetti from "canvas-confetti";

interface ROICalculatorProps {
  onAddToCart?: (bundleName: string, categories: DocumentCategory[]) => void;
  onComplete?: (result: ROICalculatorOutput) => void;
}

type Step = "practice" | "documents" | "results";

export function ROICalculator({ onAddToCart, onComplete }: ROICalculatorProps) {
  const [step, setStep] = useState<Step>("practice");
  const [practiceSize, setPracticeSize] = useState<PracticeSize | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<DocumentCategory[]>([]);
  const [customHourlyRate, setCustomHourlyRate] = useState<number | undefined>();
  const [yearsToProject, setYearsToProject] = useState(3);
  const [result, setResult] = useState<ROICalculatorOutput | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  const handlePracticeSizeSelect = useCallback((size: PracticeSize) => {
    setPracticeSize(size);
    setCustomHourlyRate(PRACTICE_SIZES[size].avgHourlyRate);
  }, []);

  const handleCategoryToggle = useCallback((category: DocumentCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  const handleCalculate = useCallback(async () => {
    if (!practiceSize || selectedCategories.length === 0) return;

    setIsCalculating(true);

    // Simulate calculation time for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 1500));

    const calculationResult = calculateROI({
      practiceSize,
      currentHourlyRate: customHourlyRate,
      selectedCategories,
      yearsToProject,
    });

    setResult(calculationResult);
    setStep("results");
    setIsCalculating(false);

    // Trigger celebration
    if (calculationResult.totalSavings > 10000) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Award XP
    try {
      await fetch("/api/xp/earn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete_quiz",
          metadata: {
            tool: "roi_calculator",
            practiceSize,
            categoriesCount: selectedCategories.length,
          },
        }),
      });
      setXpAwarded(true);
    } catch (error) {
      console.error("Failed to award XP:", error);
    }

    onComplete?.(calculationResult);
  }, [practiceSize, selectedCategories, customHourlyRate, yearsToProject, onComplete]);

  const handleAddBundle = useCallback(() => {
    if (result?.recommendedBundle) {
      onAddToCart?.(result.recommendedBundle.name, result.recommendedBundle.categories);
    }
  }, [result, onAddToCart]);

  const progressPercentage = step === "practice" ? 33 : step === "documents" ? 66 : 100;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            ROI Calculator
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Earn 150+ XP</span>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span className={step === "practice" ? "font-semibold text-blue-600" : ""}>
            Practice Size
          </span>
          <span className={step === "documents" ? "font-semibold text-blue-600" : ""}>
            Document Needs
          </span>
          <span className={step === "results" ? "font-semibold text-blue-600" : ""}>
            Your Savings
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Practice Size */}
        {step === "practice" && (
          <motion.div
            key="practice"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                What size is your practice?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.entries(PRACTICE_SIZES) as [PracticeSize, typeof PRACTICE_SIZES[PracticeSize]][]).map(
                  ([key, config]) => (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        practiceSize === key
                          ? "ring-2 ring-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handlePracticeSizeSelect(key)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{config.label}</p>
                            <p className="text-sm text-gray-500">
                              ~{config.avgMonthlyDocuments} documents/month
                            </p>
                          </div>
                          {practiceSize === key && (
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>

            {practiceSize && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your hourly rate (for time savings calculation)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <input
                      type="number"
                      value={customHourlyRate}
                      onChange={(e) => setCustomHourlyRate(Number(e.target.value))}
                      className="w-32 px-3 py-2 border rounded-md"
                      min={100}
                      max={1000}
                      step={50}
                    />
                    <span className="text-gray-500">/hour</span>
                  </div>
                </div>

                <Button
                  onClick={() => setStep("documents")}
                  className="w-full md:w-auto"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 2: Document Categories */}
        {step === "documents" && (
          <motion.div
            key="documents"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                What types of legal documents do you need?
              </h3>
              <p className="text-gray-600 mb-4">
                Select all categories that apply to your practice.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.entries(DOCUMENT_CATEGORIES) as [DocumentCategory, typeof DOCUMENT_CATEGORIES[DocumentCategory]][]).map(
                  ([key, config]) => (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedCategories.includes(key)
                          ? "ring-2 ring-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleCategoryToggle(key)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{config.label}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Save up to {formatCurrency(config.traditionalCost - config.templateCost)}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {config.documents.slice(0, 3).map((doc, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-gray-100 px-2 py-0.5 rounded"
                                >
                                  {doc}
                                </span>
                              ))}
                              {config.documents.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{config.documents.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                          {selectedCategories.includes(key) && (
                            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calculate savings over:
              </label>
              <div className="flex gap-2">
                {[1, 3, 5].map((years) => (
                  <Button
                    key={years}
                    variant={yearsToProject === years ? "default" : "outline"}
                    onClick={() => setYearsToProject(years)}
                    size="sm"
                  >
                    {years} Year{years > 1 ? "s" : ""}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep("practice")}>
                Back
              </Button>
              <Button
                onClick={handleCalculate}
                disabled={selectedCategories.length === 0 || isCalculating}
                className="flex-1 md:flex-none"
              >
                {isCalculating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                    </motion.div>
                    Calculating...
                  </>
                ) : (
                  <>
                    Calculate My Savings
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* XP Award Banner */}
            {xpAwarded && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6" />
                  <div>
                    <p className="font-bold">+{result.totalXP} XP Earned!</p>
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

            {/* Main Savings Card */}
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-6 h-6" />
                  Your Potential Savings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-blue-200 text-sm">Total Savings</p>
                    <p className="text-3xl font-bold">
                      {formatCurrency(result.projectedSavings)}
                    </p>
                    <p className="text-blue-200 text-xs">
                      over {yearsToProject} year{yearsToProject > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">Time Saved</p>
                    <p className="text-3xl font-bold">
                      {Math.round(result.hoursSaved)}h
                    </p>
                    <p className="text-blue-200 text-xs">per year</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">ROI</p>
                    <p className="text-3xl font-bold">{result.roiPercentage}%</p>
                    <p className="text-blue-200 text-xs">return on investment</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">Payback Period</p>
                    <p className="text-3xl font-bold">{result.paybackPeriodMonths}</p>
                    <p className="text-blue-200 text-xs">months</p>
                  </div>
                </div>

                {(() => {
                  const tier = getSavingsTierMessage(result.projectedSavings);
                  return (
                    <div className="bg-white/20 rounded-lg p-3 flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tier.color }}
                      />
                      <span className="font-medium">{tier.message}</span>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Cost Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-red-500" />
                    Traditional Legal Costs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-600">
                    {formatCurrency(result.traditionalTotalCost)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatHours(result.traditionalTotalHours)} of work
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    With Our Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(result.templateTotalCost)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatHours(result.templateTotalHours)} of work
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Savings Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.categoryBreakdown.map((cat) => (
                    <div
                      key={cat.category}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{cat.label}</p>
                        <p className="text-sm text-gray-500">
                          Save {formatHours(cat.timeSaved)} per year
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatCurrency(cat.savings)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Template: {formatCurrency(cat.templateCost)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Bundle CTA */}
            {result.recommendedBundle && (
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-amber-700 font-medium">
                        Recommended for You
                      </p>
                      <p className="text-xl font-bold text-amber-900">
                        {result.recommendedBundle.name}
                      </p>
                      <p className="text-amber-700">
                        {Math.round(result.recommendedBundle.discount * 100)}% off •{" "}
                        <span className="line-through">
                          {formatCurrency(result.recommendedBundle.totalValue)}
                        </span>{" "}
                        <span className="font-bold">
                          {formatCurrency(result.recommendedBundle.bundlePrice)}
                        </span>
                      </p>
                    </div>
                    <Button
                      onClick={handleAddBundle}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Add to Cart
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recalculate */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("practice");
                  setResult(null);
                  setXpAwarded(false);
                }}
              >
                Recalculate with Different Options
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
