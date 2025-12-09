"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  TrendingUp,
  ShoppingCart,
  Award,
  Zap,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  calculateQuizScore,
  QUIZ_QUESTIONS,
  getRiskLevelColor,
  getRiskLevelLabel,
  type QuizAnswer,
  type QuizResult,
} from "@/lib/quiz/compliance-scoring";
import confetti from "canvas-confetti";

interface ComplianceQuizProps {
  onAddToCart?: (productIds: string[]) => void;
  onComplete?: (result: QuizResult) => void;
  onEmailCapture?: (email: string, result: QuizResult) => void;
}

export function ComplianceQuiz({
  onAddToCart,
  onComplete,
  onEmailCapture,
}: ComplianceQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [email, setEmail] = useState("");
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100;

  const getCurrentAnswer = useCallback(() => {
    return answers.find((a) => a.questionId === currentQuestion?.id);
  }, [answers, currentQuestion]);

  const handleOptionSelect = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return;

      setAnswers((prev) => {
        const existing = prev.find((a) => a.questionId === currentQuestion.id);

        if (currentQuestion.type === "multiple") {
          // Toggle for multiple select
          if (existing) {
            const newOptions = existing.selectedOptions.includes(optionId)
              ? existing.selectedOptions.filter((o) => o !== optionId)
              : [...existing.selectedOptions, optionId];
            return prev.map((a) =>
              a.questionId === currentQuestion.id
                ? { ...a, selectedOptions: newOptions }
                : a
            );
          }
          return [
            ...prev,
            { questionId: currentQuestion.id, selectedOptions: [optionId], timestamp: Date.now() },
          ];
        } else {
          // Single select
          if (existing) {
            return prev.map((a) =>
              a.questionId === currentQuestion.id
                ? { ...a, selectedOptions: [optionId] }
                : a
            );
          }
          return [
            ...prev,
            { questionId: currentQuestion.id, selectedOptions: [optionId], timestamp: Date.now() },
          ];
        }
      });
    },
    [currentQuestion]
  );

  const handleNext = useCallback(async () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      // Calculate results
      setIsCalculating(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const quizResult = calculateQuizScore(answers);
      setResult(quizResult);
      setIsCalculating(false);

      // Celebration for good scores
      if (quizResult.complianceScore >= 70) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#10b981", "#34d399", "#6ee7b7"],
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
              tool: "compliance_quiz",
              score: quizResult.complianceScore,
              questionsAnswered: quizResult.questionsAnswered,
            },
          }),
        });
        setXpAwarded(true);
      } catch (error) {
        console.error("Failed to award XP:", error);
      }

      onComplete?.(quizResult);
    }
  }, [currentQuestionIndex, answers, onComplete]);

  const handleBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  }, [currentQuestionIndex]);

  const handleEmailSubmit = useCallback(() => {
    if (email && result) {
      onEmailCapture?.(email, result);
      setShowEmailCapture(false);
    }
  }, [email, result, onEmailCapture]);

  const handleAddRecommendations = useCallback(() => {
    if (result?.recommendations) {
      const productIds = result.recommendations.map((r) => r.productId);
      onAddToCart?.(productIds);
    }
  }, [result, onAddToCart]);

  const handleRestart = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);
    setXpAwarded(false);
  }, []);

  const currentAnswer = getCurrentAnswer();
  const canProceed = currentAnswer && currentAnswer.selectedOptions.length > 0;

  // Calculating state
  if (isCalculating) {
    return (
      <div className="w-full max-w-2xl mx-auto py-12">
        <Card className="text-center py-16">
          <CardContent className="space-y-6">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-block"
            >
              <Shield className="w-16 h-16 text-blue-600 mx-auto" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold mb-2">Analyzing Your Responses</h3>
              <p className="text-gray-600">
                Calculating your compliance score and generating personalized recommendations...
              </p>
            </div>
            <div className="max-w-xs mx-auto">
              <motion.div
                className="h-2 bg-gray-200 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-blue-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results view
  if (result) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
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

        {/* Score Card */}
        <Card className="overflow-hidden">
          <div
            className="p-6 text-white"
            style={{
              background: `linear-gradient(135deg, ${getRiskLevelColor(result.riskLevel)}, ${getRiskLevelColor(result.riskLevel)}88)`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Your Compliance Score</p>
                <p className="text-5xl font-bold">{result.complianceScore}</p>
                <p className="text-lg font-medium mt-1">
                  {getRiskLevelLabel(result.riskLevel)}
                </p>
              </div>
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${result.complianceScore * 3.52} 352`}
                    initial={{ strokeDasharray: "0 352" }}
                    animate={{ strokeDasharray: `${result.complianceScore * 3.52} 352` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </svg>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <p className="text-gray-700">{result.summary}</p>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Category Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(result.categoryScores).map(([category, score]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize font-medium">{category}</span>
                  <span>{score}/100</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor:
                        score >= 70 ? "#10b981" :
                        score >= 50 ? "#f59e0b" : "#ef4444",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Risk Areas */}
        {result.riskAreas.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                Areas Requiring Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.riskAreas.map((risk, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    risk.severity === "critical"
                      ? "bg-red-50 border-red-200"
                      : risk.severity === "danger"
                      ? "bg-orange-50 border-orange-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {risk.severity === "critical" ? (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{risk.description}</p>
                      <p className="text-sm text-gray-600 mt-1">{risk.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Priority Actions */}
        {result.priorityActions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {result.priorityActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{action}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Product Recommendations */}
        {result.recommendations.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                Recommended Solutions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.recommendations.map((rec) => (
                <div
                  key={rec.productId}
                  className="flex items-center justify-between bg-white p-3 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{rec.productName}</p>
                    <p className="text-sm text-gray-500">{rec.reason}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {rec.category}
                  </span>
                </div>
              ))}
              <Button
                onClick={handleAddRecommendations}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Add All to Cart
                <ShoppingCart className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Email Capture */}
        {!showEmailCapture ? (
          <Card className="bg-gray-50">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-4">
                Want a detailed PDF report of your compliance assessment?
              </p>
              <Button variant="outline" onClick={() => setShowEmailCapture(true)}>
                Get Full Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button onClick={handleEmailSubmit}>
                  Send Report
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We&apos;ll send you a detailed PDF report with your full compliance analysis.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Restart */}
        <div className="text-center">
          <Button variant="ghost" onClick={handleRestart}>
            Take Quiz Again
          </Button>
        </div>
      </div>
    );
  }

  // Quiz questions view
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            Compliance Quiz
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Earn up to 700+ XP</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-gray-500 mt-2">
          Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
        </p>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                <span className="px-2 py-0.5 bg-blue-100 rounded capitalize">
                  {currentQuestion.category}
                </span>
                <span className="text-gray-400">•</span>
                <span className="flex items-center gap-1 text-amber-600">
                  <Sparkles className="w-3 h-3" />
                  +{currentQuestion.xpReward} XP
                </span>
              </div>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
              {currentQuestion.description && (
                <p className="text-gray-600 mt-2">{currentQuestion.description}</p>
              )}
              {currentQuestion.type === "multiple" && (
                <p className="text-sm text-blue-600 mt-2">
                  Select all that apply
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = currentAnswer?.selectedOptions.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={isSelected ? "font-medium" : ""}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={!canProceed}>
          {currentQuestionIndex === QUIZ_QUESTIONS.length - 1 ? (
            <>
              See Results
              <Sparkles className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
