/**
 * ROI Calculator Logic
 * Calculates cost savings from using legal templates vs traditional methods
 * Part of BMAD Phase 2 - Interactive Tools
 */

import { XP_CONFIG } from "../xp-economy";

// Practice size configurations
export const PRACTICE_SIZES = {
  solo: {
    label: "Solo Practitioner",
    avgHourlyRate: 250,
    avgMonthlyDocuments: 5,
    avgHoursPerDocument: 3,
    staffMultiplier: 1,
  },
  small: {
    label: "Small Practice (2-5 practitioners)",
    avgHourlyRate: 300,
    avgMonthlyDocuments: 15,
    avgHoursPerDocument: 2.5,
    staffMultiplier: 3,
  },
  medium: {
    label: "Medium Practice (6-15 practitioners)",
    avgHourlyRate: 350,
    avgMonthlyDocuments: 40,
    avgHoursPerDocument: 2,
    staffMultiplier: 8,
  },
  large: {
    label: "Large Practice (16+ practitioners)",
    avgHourlyRate: 400,
    avgMonthlyDocuments: 100,
    avgHoursPerDocument: 1.5,
    staffMultiplier: 20,
  },
} as const;

export type PracticeSize = keyof typeof PRACTICE_SIZES;

// Document categories with savings multipliers
export const DOCUMENT_CATEGORIES = {
  employment: {
    label: "Employment Contracts & Policies",
    templateCost: 149,
    traditionalCost: 1500,
    timeToComplete: 0.5, // hours with template
    traditionalTime: 4, // hours without template
    documents: [
      "Employment Contract",
      "Independent Contractor Agreement",
      "Non-Compete Agreement",
      "Confidentiality Agreement",
      "Employee Handbook",
    ],
  },
  compliance: {
    label: "AHPRA & Regulatory Compliance",
    templateCost: 199,
    traditionalCost: 2500,
    timeToComplete: 1,
    traditionalTime: 8,
    documents: [
      "AHPRA Registration Checklist",
      "Mandatory Reporting Policy",
      "CPD Documentation",
      "Complaint Handling Procedure",
      "Professional Indemnity Compliance",
    ],
  },
  telehealth: {
    label: "Telehealth & Digital Health",
    templateCost: 179,
    traditionalCost: 2000,
    timeToComplete: 0.75,
    traditionalTime: 6,
    documents: [
      "Telehealth Consent Form",
      "Digital Health Policy",
      "Video Consultation Guidelines",
      "Electronic Prescribing Policy",
      "Remote Patient Monitoring Agreement",
    ],
  },
  patient: {
    label: "Patient Agreements & Consent",
    templateCost: 99,
    traditionalCost: 800,
    timeToComplete: 0.25,
    traditionalTime: 2,
    documents: [
      "Patient Consent Form",
      "Treatment Agreement",
      "Privacy Notice",
      "Fee Agreement",
      "Medical Records Release",
    ],
  },
  partnership: {
    label: "Partnership & Business Agreements",
    templateCost: 249,
    traditionalCost: 3500,
    timeToComplete: 1.5,
    traditionalTime: 10,
    documents: [
      "Partnership Agreement",
      "Associate Agreement",
      "Buy-Sell Agreement",
      "Practice Sale Agreement",
      "Locum Agreement",
    ],
  },
  property: {
    label: "Property & Lease Agreements",
    templateCost: 199,
    traditionalCost: 2000,
    timeToComplete: 1,
    traditionalTime: 6,
    documents: [
      "Commercial Lease Review Checklist",
      "Sublease Agreement",
      "Fitout Agreement",
      "Licence to Occupy",
      "Equipment Lease Agreement",
    ],
  },
} as const;

export type DocumentCategory = keyof typeof DOCUMENT_CATEGORIES;

// Calculator input types
export interface ROICalculatorInput {
  practiceSize: PracticeSize;
  currentHourlyRate?: number; // Override default
  monthlyDocuments?: number; // Override default
  selectedCategories: DocumentCategory[];
  yearsToProject: number; // 1, 3, or 5 years
}

// Calculator output types
export interface ROICalculatorOutput {
  // Cost comparison
  templateTotalCost: number;
  traditionalTotalCost: number;
  totalSavings: number;
  savingsPercentage: number;

  // Time savings
  templateTotalHours: number;
  traditionalTotalHours: number;
  hoursSaved: number;
  hoursSavedValue: number; // At hourly rate

  // Annual projections
  annualSavings: number;
  projectedSavings: number; // Over yearsToProject
  monthlyEquivalent: number;

  // ROI metrics
  roiPercentage: number;
  paybackPeriodMonths: number;

  // XP rewards
  xpForCalculation: number;
  bonusXP: number;
  totalXP: number;

  // Recommended bundles
  recommendedBundle: {
    name: string;
    discount: number;
    categories: DocumentCategory[];
    totalValue: number;
    bundlePrice: number;
  } | null;

  // Breakdown by category
  categoryBreakdown: Array<{
    category: DocumentCategory;
    label: string;
    templateCost: number;
    traditionalCost: number;
    savings: number;
    timeSaved: number;
  }>;
}

// Bundle definitions
const BUNDLES = [
  {
    name: "New Practice Starter",
    discount: 0.25,
    categories: ["employment", "compliance", "patient"] as DocumentCategory[],
    minCategories: 2,
  },
  {
    name: "AHPRA Compliance Package",
    discount: 0.20,
    categories: ["compliance", "telehealth"] as DocumentCategory[],
    minCategories: 2,
  },
  {
    name: "Telehealth Complete",
    discount: 0.20,
    categories: ["telehealth", "patient"] as DocumentCategory[],
    minCategories: 2,
  },
  {
    name: "Employment Bundle",
    discount: 0.15,
    categories: ["employment"] as DocumentCategory[],
    minCategories: 1,
  },
  {
    name: "Full Practice Bundle",
    discount: 0.30,
    categories: ["employment", "compliance", "telehealth", "patient", "partnership"] as DocumentCategory[],
    minCategories: 4,
  },
];

/**
 * Calculate ROI based on practice inputs
 */
export function calculateROI(input: ROICalculatorInput): ROICalculatorOutput {
  const practiceConfig = PRACTICE_SIZES[input.practiceSize];

  const hourlyRate = input.currentHourlyRate || practiceConfig.avgHourlyRate;
  const monthlyDocs = input.monthlyDocuments || practiceConfig.avgMonthlyDocuments;

  // Calculate per-category costs and savings
  const categoryBreakdown = input.selectedCategories.map(category => {
    const config = DOCUMENT_CATEGORIES[category];
    const documentsPerYear = monthlyDocs * 12;
    const categoryDocRatio = 1 / input.selectedCategories.length; // Even distribution
    const categoryDocs = documentsPerYear * categoryDocRatio;

    const templateCost = config.templateCost; // One-time purchase
    const traditionalCost = config.traditionalCost * (categoryDocs / 12); // Scaled by usage

    const templateHours = config.timeToComplete * categoryDocs;
    const traditionalHours = config.traditionalTime * categoryDocs;

    return {
      category,
      label: config.label,
      templateCost,
      traditionalCost,
      savings: traditionalCost - templateCost,
      timeSaved: traditionalHours - templateHours,
    };
  });

  // Aggregate totals
  const templateTotalCost = categoryBreakdown.reduce((sum, c) => sum + c.templateCost, 0);
  const traditionalTotalCost = categoryBreakdown.reduce((sum, c) => sum + c.traditionalCost, 0);
  const totalSavings = traditionalTotalCost - templateTotalCost;
  const savingsPercentage = traditionalTotalCost > 0
    ? Math.round((totalSavings / traditionalTotalCost) * 100)
    : 0;

  // Time calculations
  const hoursSaved = categoryBreakdown.reduce((sum, c) => sum + c.timeSaved, 0);
  const templateTotalHours = input.selectedCategories.reduce((sum, cat) => {
    const config = DOCUMENT_CATEGORIES[cat];
    return sum + (config.timeToComplete * monthlyDocs * 12 / input.selectedCategories.length);
  }, 0);
  const traditionalTotalHours = templateTotalHours + hoursSaved;
  const hoursSavedValue = hoursSaved * hourlyRate;

  // Annual projections
  const annualSavings = totalSavings + hoursSavedValue;
  const projectedSavings = annualSavings * input.yearsToProject;
  const monthlyEquivalent = annualSavings / 12;

  // ROI metrics
  const roiPercentage = templateTotalCost > 0
    ? Math.round((annualSavings / templateTotalCost) * 100)
    : 0;
  const paybackPeriodMonths = monthlyEquivalent > 0
    ? Math.round((templateTotalCost / monthlyEquivalent) * 10) / 10
    : 0;

  // Find best matching bundle
  const matchingBundles = BUNDLES.filter(bundle => {
    const matchingCategories = bundle.categories.filter(c =>
      input.selectedCategories.includes(c)
    );
    return matchingCategories.length >= bundle.minCategories;
  }).sort((a, b) => b.discount - a.discount);

  const recommendedBundle = matchingBundles.length > 0 ? (() => {
    const bundle = matchingBundles[0];
    const bundleCategories = bundle.categories.filter(c =>
      input.selectedCategories.includes(c)
    );
    const totalValue = bundleCategories.reduce((sum, cat) =>
      sum + DOCUMENT_CATEGORIES[cat].templateCost, 0
    );
    const bundlePrice = Math.round(totalValue * (1 - bundle.discount));

    return {
      name: bundle.name,
      discount: bundle.discount,
      categories: bundleCategories,
      totalValue,
      bundlePrice,
    };
  })() : null;

  // XP rewards (variable reinforcement)
  const baseXP = 150; // Base XP for completing calculation
  const bonusChance = Math.random();
  let bonusXP = 0;

  if (bonusChance < 0.01) {
    bonusXP = 500; // 1% jackpot
  } else if (bonusChance < 0.06) {
    bonusXP = 200; // 5% rare bonus
  } else if (bonusChance < 0.26) {
    bonusXP = 75; // 20% standard bonus
  }

  return {
    templateTotalCost,
    traditionalTotalCost,
    totalSavings,
    savingsPercentage,
    templateTotalHours,
    traditionalTotalHours,
    hoursSaved,
    hoursSavedValue,
    annualSavings,
    projectedSavings,
    monthlyEquivalent,
    roiPercentage,
    paybackPeriodMonths,
    xpForCalculation: baseXP,
    bonusXP,
    totalXP: baseXP + bonusXP,
    recommendedBundle,
    categoryBreakdown,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format hours for display
 */
export function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  }
  return `${Math.round(hours * 10) / 10} hours`;
}

/**
 * Get savings tier message based on amount
 */
export function getSavingsTierMessage(savings: number): {
  tier: "bronze" | "silver" | "gold" | "platinum";
  message: string;
  color: string;
} {
  if (savings >= 50000) {
    return {
      tier: "platinum",
      message: "Exceptional savings potential!",
      color: "#9333ea",
    };
  } else if (savings >= 20000) {
    return {
      tier: "gold",
      message: "Significant cost reduction identified",
      color: "#eab308",
    };
  } else if (savings >= 5000) {
    return {
      tier: "silver",
      message: "Great opportunity for savings",
      color: "#6b7280",
    };
  }
  return {
    tier: "bronze",
    message: "Smart investment for your practice",
    color: "#d97706",
  };
}
