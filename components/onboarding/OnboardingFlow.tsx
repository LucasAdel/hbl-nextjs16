"use client";

import { useState, useEffect } from "react";
import {
  User, Mail, Building2, Briefcase, Target, CheckCircle2,
  ChevronRight, ChevronLeft, Zap, Gift, Trophy, Star,
  Sparkles, FileText, BookOpen, Calendar, Users, Crown
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface OnboardingFlowProps {
  email?: string;
  onComplete?: (data: OnboardingData) => void;
  className?: string;
}

interface OnboardingData {
  name: string;
  practiceType: string;
  specialty: string[];
  teamSize: string;
  primaryGoals: string[];
  interests: string[];
  referralSource: string;
}

// Progressive XP rewards for each step
const STEP_REWARDS = [
  { step: 1, xp: 25, label: "Getting Started" },
  { step: 2, xp: 35, label: "Practice Details" },
  { step: 3, xp: 45, label: "Goals & Interests" },
  { step: 4, xp: 50, label: "Final Step" },
  { completion: true, xp: 100, label: "Completion Bonus" },
];

// Variable bonus for completing all steps
const COMPLETION_BONUS = {
  base: 100,
  bonus: { chance: 0.3, amount: 75 },
  rare: { chance: 0.1, amount: 200 },
  legendary: { chance: 0.03, amount: 500 },
};

const PRACTICE_TYPES = [
  { id: "solo", label: "Solo Practice", icon: User },
  { id: "group", label: "Group Practice", icon: Users },
  { id: "hospital", label: "Hospital/Clinic", icon: Building2 },
  { id: "corporate", label: "Corporate", icon: Briefcase },
];

const SPECIALTIES = [
  "General Practice", "Surgery", "Cardiology", "Dermatology",
  "Pediatrics", "Psychiatry", "Orthopedics", "Oncology",
  "Radiology", "Emergency Medicine", "Other"
];

const TEAM_SIZES = [
  { id: "1", label: "Just me" },
  { id: "2-5", label: "2-5 people" },
  { id: "6-20", label: "6-20 people" },
  { id: "20+", label: "20+ people" },
];

const GOALS = [
  { id: "compliance", label: "AHPRA Compliance", icon: CheckCircle2 },
  { id: "contracts", label: "Employment Contracts", icon: FileText },
  { id: "setup", label: "Practice Setup", icon: Building2 },
  { id: "telehealth", label: "Telehealth Compliance", icon: Calendar },
  { id: "templates", label: "Legal Templates", icon: BookOpen },
  { id: "learning", label: "Legal Education", icon: Star },
];

const INTERESTS = [
  "Employment Law", "Healthcare Regulations", "Privacy & Data",
  "Contract Templates", "Risk Management", "Practice Management",
  "Telehealth", "Medicare Billing", "Partnership Agreements"
];

function triggerStepConfetti() {
  confetti({
    particleCount: 40,
    spread: 50,
    origin: { y: 0.7 },
    colors: ["#00CED1", "#40E0D0", "#FFD700"],
  });
}

function triggerCompletionConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }

    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#00CED1", "#FFD700", "#FF69B4"],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#00CED1", "#FFD700", "#FF69B4"],
    });
  }, 50);
}

export function OnboardingFlow({ email, onComplete, className = "" }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [totalXP, setTotalXP] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [bonusType, setBonusType] = useState<string | null>(null);

  // Form data
  const [data, setData] = useState<OnboardingData>({
    name: "",
    practiceType: "",
    specialty: [],
    teamSize: "",
    primaryGoals: [],
    interests: [],
    referralSource: "",
  });

  const totalSteps = 4;

  const handleNext = () => {
    // Validate current step
    if (currentStep === 1 && !data.name) {
      toast.error("Please enter your name");
      return;
    }
    if (currentStep === 2 && (!data.practiceType || !data.teamSize)) {
      toast.error("Please complete all fields");
      return;
    }
    if (currentStep === 3 && data.primaryGoals.length === 0) {
      toast.error("Please select at least one goal");
      return;
    }

    // Award XP for step
    const stepReward = STEP_REWARDS.find((s) => s.step === currentStep);
    if (stepReward) {
      setTotalXP((prev) => prev + stepReward.xp);
      toast.success(`+${stepReward.xp} XP earned!`, { icon: "⚡" });
      triggerStepConfetti();
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    // Calculate completion bonus with variable reinforcement
    let completionXP = COMPLETION_BONUS.base;
    let bonus: string | null = null;

    const roll = Math.random();
    if (roll < COMPLETION_BONUS.legendary.chance) {
      completionXP += COMPLETION_BONUS.legendary.amount;
      bonus = "LEGENDARY";
    } else if (roll < COMPLETION_BONUS.rare.chance) {
      completionXP += COMPLETION_BONUS.rare.amount;
      bonus = "RARE";
    } else if (roll < COMPLETION_BONUS.bonus.chance) {
      completionXP += COMPLETION_BONUS.bonus.amount;
      bonus = "BONUS";
    }

    const finalXP = totalXP + completionXP;
    setTotalXP(finalXP);
    setBonusType(bonus);
    setIsComplete(true);

    triggerCompletionConfetti();

    // Save to API
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          ...data,
          xpEarned: finalXP,
        }),
      });

      // Track with gamification
      await fetch("/api/gamification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "onboarding_complete",
          email,
          xpEarned: finalXP,
          metadata: { bonusType: bonus },
        }),
      });
    } catch {
      // Silent fail
    }

    if (bonus) {
      setTimeout(() => {
        toast.success(`${bonus} BONUS! You earned ${finalXP} XP total!`, {
          duration: 5000,
          icon: bonus === "LEGENDARY" ? "👑" : bonus === "RARE" ? "✨" : "🎁",
        });
      }, 500);
    }

    onComplete?.(data);
  };

  const toggleArrayItem = <K extends keyof OnboardingData>(
    key: K,
    item: string
  ) => {
    setData((prev) => {
      const arr = prev[key] as string[];
      if (arr.includes(item)) {
        return { ...prev, [key]: arr.filter((i) => i !== item) };
      }
      return { ...prev, [key]: [...arr, item] };
    });
  };

  // Completion screen
  if (isComplete) {
    return (
      <div className={`bg-gradient-to-br from-tiffany via-tiffany-dark to-blue-600 rounded-2xl p-8 text-white text-center ${className}`}>
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <Trophy className="h-12 w-12" />
        </div>

        <h2 className="text-3xl font-bold mb-2">Welcome Aboard! 🎉</h2>
        <p className="opacity-80 mb-6">
          Your profile is all set up. Let&apos;s start your journey!
        </p>

        {/* XP Earned */}
        <div className="bg-white/20 rounded-xl p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-8 w-8 text-yellow-300" />
            <span className="text-4xl font-bold">{totalXP}</span>
            <span className="text-xl">XP</span>
          </div>
          {bonusType && (
            <div className="bg-white/20 rounded-lg px-4 py-2 inline-block mt-2">
              <span className="font-semibold">
                {bonusType === "LEGENDARY" && "👑 LEGENDARY BONUS!"}
                {bonusType === "RARE" && "✨ RARE BONUS!"}
                {bonusType === "BONUS" && "🎁 BONUS REWARD!"}
              </span>
            </div>
          )}
        </div>

        {/* Unlocked Benefits */}
        <div className="text-left bg-white/10 rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-3">You&apos;ve Unlocked:</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span>Personalized document recommendations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span>Daily challenges tailored to your goals</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span>Early Bird achievement badge</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <a
            href="/dashboard"
            className="flex-1 py-3 bg-white text-tiffany-dark font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <ChevronRight className="h-4 w-4" />
          </a>
          <a
            href="/documents"
            className="flex-1 py-3 bg-white/20 font-semibold rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
          >
            Browse Documents
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header with Progress */}
      <div className="bg-gradient-to-r from-tiffany to-tiffany-dark p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Complete Your Profile</h2>
            <p className="text-sm opacity-80">Step {currentStep} of {totalSteps}</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
            <Zap className="h-5 w-5 text-yellow-300" />
            <span className="font-bold">{totalXP} XP</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* XP Preview */}
        <div className="flex justify-between mt-3 text-sm">
          {STEP_REWARDS.filter((s) => s.step).map((reward) => (
            <div
              key={reward.step}
              className={`flex items-center gap-1 ${
                (reward.step ?? 0) <= currentStep ? "opacity-100" : "opacity-50"
              }`}
            >
              {(reward.step ?? 0) < currentStep ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <Gift className="h-4 w-4" />
              )}
              <span>+{reward.xp}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-tiffany/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-tiffany" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Let&apos;s get to know you
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Tell us a bit about yourself
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="Dr. Jane Smith"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                How did you hear about us?
              </label>
              <select
                value={data.referralSource}
                onChange={(e) => setData({ ...data, referralSource: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany"
              >
                <option value="">Select an option</option>
                <option value="google">Google Search</option>
                <option value="colleague">Colleague Referral</option>
                <option value="social">Social Media</option>
                <option value="conference">Conference/Event</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Practice Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                About Your Practice
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Help us personalize your experience
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Practice Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PRACTICE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setData({ ...data, practiceType: type.id })}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      data.practiceType === type.id
                        ? "border-tiffany bg-tiffany/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <type.icon className={`h-6 w-6 ${
                      data.practiceType === type.id ? "text-tiffany" : "text-gray-500"
                    }`} />
                    <span className={`text-sm font-medium ${
                      data.practiceType === type.id ? "text-tiffany" : "text-gray-700 dark:text-gray-300"
                    }`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Specialty (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((specialty) => (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => toggleArrayItem("specialty", specialty)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      data.specialty.includes(specialty)
                        ? "bg-tiffany text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Team Size
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TEAM_SIZES.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setData({ ...data, teamSize: size.id })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      data.teamSize === size.id
                        ? "border-tiffany bg-tiffany/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className={`font-medium ${
                      data.teamSize === size.id ? "text-tiffany" : "text-gray-700 dark:text-gray-300"
                    }`}>
                      {size.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Goals
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                What are you hoping to achieve?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Primary Goals (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleArrayItem("primaryGoals", goal.id)}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      data.primaryGoals.includes(goal.id)
                        ? "border-tiffany bg-tiffany/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <goal.icon className={`h-5 w-5 ${
                      data.primaryGoals.includes(goal.id) ? "text-tiffany" : "text-gray-500"
                    }`} />
                    <span className={`text-sm font-medium ${
                      data.primaryGoals.includes(goal.id) ? "text-tiffany" : "text-gray-700 dark:text-gray-300"
                    }`}>
                      {goal.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Interests */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Almost Done!
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Select topics you&apos;re interested in
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Topics of Interest
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleArrayItem("interests", interest)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      data.interests.includes(interest)
                        ? "bg-pink-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Completion bonus preview */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <Gift className="h-6 w-6 text-amber-600" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Completion Bonus Awaits!
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    +100 XP guaranteed, with up to +500 XP bonus chance! 🎰
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="h-5 w-5" />
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-gradient-to-r from-tiffany to-tiffany-dark text-white font-semibold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {currentStep === totalSteps ? (
              <>
                <Sparkles className="h-5 w-5" />
                Complete & Earn XP
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingFlow;
