/**
 * Compliance Quiz Scoring Logic
 * Multi-step quiz with risk assessment and product recommendations
 * Part of BMAD Phase 2 - Interactive Tools
 */

// Quiz question definitions
export interface QuizQuestion {
  id: string;
  category: "practice" | "compliance" | "risk" | "operations" | "growth";
  question: string;
  description?: string;
  type: "single" | "multiple" | "scale";
  options: QuizOption[];
  weight: number; // 1-5, impact on score
  xpReward: number;
}

export interface QuizOption {
  id: string;
  label: string;
  value: number; // Score impact (-10 to +10)
  riskFlag?: string; // Risk area if applicable
  recommendedProducts?: string[];
}

export interface QuizAnswer {
  questionId: string;
  selectedOptions: string[];
  timestamp: number;
}

export interface QuizResult {
  // Overall score
  complianceScore: number; // 0-100
  riskLevel: "low" | "moderate" | "high" | "critical";

  // Category scores
  categoryScores: {
    practice: number;
    compliance: number;
    risk: number;
    operations: number;
    growth: number;
  };

  // Risk analysis
  riskAreas: Array<{
    area: string;
    severity: "warning" | "danger" | "critical";
    description: string;
    recommendation: string;
  }>;

  // Product recommendations
  recommendations: Array<{
    productId: string;
    productName: string;
    relevanceScore: number;
    reason: string;
    category: string;
  }>;

  // XP rewards
  questionsAnswered: number;
  baseXP: number;
  completionBonus: number;
  bonusXP: number; // Variable reinforcement
  totalXP: number;

  // Summary
  summary: string;
  priorityActions: string[];
}

// Product catalog for recommendations
export const COMPLIANCE_PRODUCTS = {
  ahpra_registration: {
    name: "AHPRA Registration Compliance Kit",
    category: "compliance",
    price: 199,
    tags: ["ahpra", "registration", "compliance"],
  },
  mandatory_reporting: {
    name: "Mandatory Reporting Policy Bundle",
    category: "compliance",
    price: 149,
    tags: ["reporting", "compliance", "risk"],
  },
  telehealth_consent: {
    name: "Telehealth Consent & Policy Pack",
    category: "telehealth",
    price: 179,
    tags: ["telehealth", "consent", "digital"],
  },
  employment_contracts: {
    name: "Healthcare Employment Contract Suite",
    category: "employment",
    price: 249,
    tags: ["employment", "contracts", "hr"],
  },
  patient_privacy: {
    name: "Patient Privacy & Consent Bundle",
    category: "patient",
    price: 129,
    tags: ["privacy", "consent", "patient"],
  },
  incident_management: {
    name: "Incident Management System",
    category: "risk",
    price: 199,
    tags: ["incident", "risk", "reporting"],
  },
  cpd_documentation: {
    name: "CPD Documentation Templates",
    category: "compliance",
    price: 99,
    tags: ["cpd", "documentation", "compliance"],
  },
  partnership_agreement: {
    name: "Medical Partnership Agreement",
    category: "partnership",
    price: 299,
    tags: ["partnership", "business", "legal"],
  },
};

// Quiz questions
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "practice_type",
    category: "practice",
    question: "What type of healthcare practice do you operate?",
    type: "single",
    weight: 3,
    xpReward: 50,
    options: [
      { id: "gp", label: "General Practice", value: 0 },
      { id: "specialist", label: "Specialist Practice", value: 0 },
      { id: "allied", label: "Allied Health", value: 0 },
      { id: "dental", label: "Dental Practice", value: 0 },
      { id: "pharmacy", label: "Pharmacy", value: 0 },
      { id: "mental", label: "Mental Health Services", value: 0, riskFlag: "mental_health_compliance" },
    ],
  },
  {
    id: "practice_size",
    category: "practice",
    question: "How many practitioners work at your practice?",
    type: "single",
    weight: 2,
    xpReward: 50,
    options: [
      { id: "solo", label: "Solo practitioner", value: 0 },
      { id: "small", label: "2-5 practitioners", value: 0 },
      { id: "medium", label: "6-15 practitioners", value: 0 },
      { id: "large", label: "16+ practitioners", value: 0, riskFlag: "complex_compliance" },
    ],
  },
  {
    id: "ahpra_status",
    category: "compliance",
    question: "When did you last review your AHPRA registration requirements?",
    type: "single",
    weight: 5,
    xpReward: 50,
    options: [
      { id: "current", label: "Within the last 3 months", value: 10 },
      { id: "recent", label: "3-6 months ago", value: 5 },
      { id: "overdue", label: "6-12 months ago", value: -5, riskFlag: "ahpra_review", recommendedProducts: ["ahpra_registration"] },
      { id: "unknown", label: "More than 12 months / Not sure", value: -10, riskFlag: "ahpra_critical", recommendedProducts: ["ahpra_registration", "cpd_documentation"] },
    ],
  },
  {
    id: "mandatory_reporting",
    category: "compliance",
    question: "Do you have documented mandatory reporting policies?",
    type: "single",
    weight: 5,
    xpReward: 50,
    options: [
      { id: "comprehensive", label: "Yes, comprehensive and regularly reviewed", value: 10 },
      { id: "basic", label: "Yes, but needs updating", value: 0, recommendedProducts: ["mandatory_reporting"] },
      { id: "informal", label: "Informal process only", value: -5, riskFlag: "reporting_gap", recommendedProducts: ["mandatory_reporting"] },
      { id: "none", label: "No formal policies", value: -10, riskFlag: "reporting_critical", recommendedProducts: ["mandatory_reporting", "incident_management"] },
    ],
  },
  {
    id: "telehealth",
    category: "operations",
    question: "Does your practice offer telehealth services?",
    type: "single",
    weight: 3,
    xpReward: 50,
    options: [
      { id: "full", label: "Yes, with proper consent and documentation", value: 5 },
      { id: "partial", label: "Yes, but consent process needs improvement", value: 0, recommendedProducts: ["telehealth_consent"] },
      { id: "planning", label: "Planning to implement", value: 0, recommendedProducts: ["telehealth_consent"] },
      { id: "no", label: "No telehealth services", value: 0 },
    ],
  },
  {
    id: "patient_consent",
    category: "risk",
    question: "How do you manage patient consent documentation?",
    type: "single",
    weight: 4,
    xpReward: 50,
    options: [
      { id: "digital", label: "Digital system with audit trail", value: 10 },
      { id: "paper", label: "Paper-based system, well organized", value: 5 },
      { id: "mixed", label: "Mixed systems, some gaps", value: -5, riskFlag: "consent_gaps", recommendedProducts: ["patient_privacy"] },
      { id: "adhoc", label: "Ad-hoc, no consistent process", value: -10, riskFlag: "consent_critical", recommendedProducts: ["patient_privacy", "incident_management"] },
    ],
  },
  {
    id: "employment_docs",
    category: "operations",
    question: "Do you have current employment contracts for all staff?",
    type: "single",
    weight: 4,
    xpReward: 50,
    options: [
      { id: "all", label: "Yes, all up-to-date and compliant", value: 10 },
      { id: "most", label: "Yes, but some need updating", value: 0, recommendedProducts: ["employment_contracts"] },
      { id: "some", label: "Some staff on informal arrangements", value: -5, riskFlag: "employment_gaps", recommendedProducts: ["employment_contracts"] },
      { id: "none", label: "No formal contracts in place", value: -10, riskFlag: "employment_critical", recommendedProducts: ["employment_contracts"] },
    ],
  },
  {
    id: "incident_reporting",
    category: "risk",
    question: "How does your practice handle adverse events and incidents?",
    type: "single",
    weight: 5,
    xpReward: 50,
    options: [
      { id: "system", label: "Formal incident management system", value: 10 },
      { id: "documented", label: "Documented process, manual tracking", value: 5 },
      { id: "informal", label: "Informal handling, limited documentation", value: -5, riskFlag: "incident_gap", recommendedProducts: ["incident_management"] },
      { id: "none", label: "No formal process", value: -10, riskFlag: "incident_critical", recommendedProducts: ["incident_management", "mandatory_reporting"] },
    ],
  },
  {
    id: "cpd_tracking",
    category: "compliance",
    question: "How do you track Continuing Professional Development (CPD)?",
    type: "single",
    weight: 3,
    xpReward: 50,
    options: [
      { id: "system", label: "Digital tracking system", value: 10 },
      { id: "spreadsheet", label: "Spreadsheet or manual tracking", value: 5 },
      { id: "certificates", label: "Certificates only, no central tracking", value: -5, riskFlag: "cpd_gap", recommendedProducts: ["cpd_documentation"] },
      { id: "adhoc", label: "No formal tracking", value: -10, riskFlag: "cpd_critical", recommendedProducts: ["cpd_documentation", "ahpra_registration"] },
    ],
  },
  {
    id: "growth_plans",
    category: "growth",
    question: "Are you planning any practice changes in the next 12 months?",
    type: "multiple",
    weight: 2,
    xpReward: 50,
    options: [
      { id: "new_location", label: "Opening new location", value: 0, recommendedProducts: ["partnership_agreement"] },
      { id: "partners", label: "Adding partners/associates", value: 0, recommendedProducts: ["partnership_agreement", "employment_contracts"] },
      { id: "telehealth", label: "Expanding telehealth", value: 0, recommendedProducts: ["telehealth_consent"] },
      { id: "staff", label: "Hiring more staff", value: 0, recommendedProducts: ["employment_contracts"] },
      { id: "none", label: "No major changes planned", value: 5 },
    ],
  },
];

/**
 * Calculate quiz results based on answers
 */
export function calculateQuizScore(answers: QuizAnswer[]): QuizResult {
  // Initialize category scores
  const categoryScores = {
    practice: 50, // Start at neutral
    compliance: 50,
    risk: 50,
    operations: 50,
    growth: 50,
  };

  const riskAreas: QuizResult["riskAreas"] = [];
  const productRecommendations = new Map<string, { score: number; reasons: string[] }>();

  let totalWeight = 0;
  let weightedScore = 0;

  // Process each answer
  answers.forEach((answer) => {
    const question = QUIZ_QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) return;

    answer.selectedOptions.forEach((optionId) => {
      const option = question.options.find((o) => o.id === optionId);
      if (!option) return;

      // Update category score
      const categoryImpact = option.value * question.weight;
      categoryScores[question.category] = Math.max(0, Math.min(100,
        categoryScores[question.category] + categoryImpact
      ));

      // Track weighted score
      totalWeight += question.weight;
      weightedScore += (50 + option.value * 5) * question.weight;

      // Track risk areas
      if (option.riskFlag) {
        const severity: "warning" | "danger" | "critical" =
          option.value <= -10 ? "critical" :
          option.value <= -5 ? "danger" : "warning";

        riskAreas.push({
          area: option.riskFlag,
          severity,
          description: getRiskDescription(option.riskFlag),
          recommendation: getRiskRecommendation(option.riskFlag),
        });
      }

      // Track product recommendations
      if (option.recommendedProducts) {
        option.recommendedProducts.forEach((productId) => {
          const existing = productRecommendations.get(productId) || { score: 0, reasons: [] };
          existing.score += question.weight;
          existing.reasons.push(`Addresses: ${question.question.substring(0, 50)}...`);
          productRecommendations.set(productId, existing);
        });
      }
    });
  });

  // Calculate overall compliance score
  const complianceScore = totalWeight > 0
    ? Math.round(weightedScore / totalWeight)
    : 50;

  // Determine risk level
  const riskLevel: QuizResult["riskLevel"] =
    complianceScore >= 80 ? "low" :
    complianceScore >= 60 ? "moderate" :
    complianceScore >= 40 ? "high" : "critical";

  // Build sorted recommendations
  const recommendations: QuizResult["recommendations"] = [];
  productRecommendations.forEach((data, productId) => {
    const product = COMPLIANCE_PRODUCTS[productId as keyof typeof COMPLIANCE_PRODUCTS];
    if (product) {
      recommendations.push({
        productId,
        productName: product.name,
        relevanceScore: data.score,
        reason: data.reasons[0],
        category: product.category,
      });
    }
  });
  recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Calculate XP
  const questionsAnswered = answers.length;
  const baseXP = answers.reduce((sum, a) => {
    const q = QUIZ_QUESTIONS.find((q) => q.id === a.questionId);
    return sum + (q?.xpReward || 0);
  }, 0);
  const completionBonus = questionsAnswered >= QUIZ_QUESTIONS.length ? 200 : 0;

  // Variable reinforcement bonus
  const bonusChance = Math.random();
  let bonusXP = 0;
  if (bonusChance < 0.01) {
    bonusXP = 500; // 1% jackpot
  } else if (bonusChance < 0.11) {
    bonusXP = 150; // 10% rare
  } else if (bonusChance < 0.31) {
    bonusXP = 50; // 20% bonus
  }

  // Generate summary and priority actions
  const { summary, priorityActions } = generateSummary(
    complianceScore,
    riskLevel,
    riskAreas,
    recommendations
  );

  return {
    complianceScore,
    riskLevel,
    categoryScores,
    riskAreas,
    recommendations: recommendations.slice(0, 5), // Top 5
    questionsAnswered,
    baseXP,
    completionBonus,
    bonusXP,
    totalXP: baseXP + completionBonus + bonusXP,
    summary,
    priorityActions,
  };
}

function getRiskDescription(riskFlag: string): string {
  const descriptions: Record<string, string> = {
    ahpra_review: "Your AHPRA registration review may be overdue, which could affect your practising status.",
    ahpra_critical: "Urgent attention needed on AHPRA compliance. This is a critical regulatory requirement.",
    reporting_gap: "Your mandatory reporting processes have gaps that could expose the practice to liability.",
    reporting_critical: "Lack of mandatory reporting policies is a serious compliance and legal risk.",
    consent_gaps: "Inconsistent consent processes create documentation gaps and potential liability.",
    consent_critical: "Inadequate consent documentation is a significant medico-legal risk.",
    employment_gaps: "Some staff employment arrangements need formalization to protect both parties.",
    employment_critical: "Lack of employment contracts creates significant legal and operational risks.",
    incident_gap: "Informal incident handling may result in incomplete records and missed learnings.",
    incident_critical: "No incident management system creates serious liability and quality concerns.",
    cpd_gap: "Incomplete CPD tracking may cause issues at registration renewal.",
    cpd_critical: "Inadequate CPD documentation could affect your ability to maintain registration.",
    mental_health_compliance: "Mental health services have additional compliance requirements.",
    complex_compliance: "Larger practices have more complex compliance obligations.",
  };
  return descriptions[riskFlag] || "This area requires attention to ensure compliance.";
}

function getRiskRecommendation(riskFlag: string): string {
  const recommendations: Record<string, string> = {
    ahpra_review: "Schedule an AHPRA registration review within the next 30 days.",
    ahpra_critical: "Immediate review of AHPRA requirements needed. Consider compliance audit.",
    reporting_gap: "Update your mandatory reporting policies and train staff on procedures.",
    reporting_critical: "Implement mandatory reporting policies urgently. This is a legal requirement.",
    consent_gaps: "Standardize your consent documentation process across all services.",
    consent_critical: "Implement a proper consent management system immediately.",
    employment_gaps: "Review and update employment contracts for all staff members.",
    employment_critical: "Engage an employment lawyer to draft proper contracts for all staff.",
    incident_gap: "Establish a formal incident reporting and management process.",
    incident_critical: "Implement an incident management system as a priority.",
    cpd_gap: "Set up a tracking system for CPD activities and documentation.",
    cpd_critical: "Urgently establish CPD tracking and ensure all practitioners are compliant.",
    mental_health_compliance: "Review mental health-specific regulatory requirements.",
    complex_compliance: "Consider a compliance audit due to practice size and complexity.",
  };
  return recommendations[riskFlag] || "Address this area to improve your compliance posture.";
}

function generateSummary(
  score: number,
  riskLevel: QuizResult["riskLevel"],
  riskAreas: QuizResult["riskAreas"],
  recommendations: QuizResult["recommendations"]
): { summary: string; priorityActions: string[] } {
  let summary = "";
  const priorityActions: string[] = [];

  if (score >= 80) {
    summary = "Your practice demonstrates strong compliance foundations. A few minor improvements could further strengthen your position.";
  } else if (score >= 60) {
    summary = "Your practice has reasonable compliance coverage, but there are areas that need attention to reduce risk exposure.";
  } else if (score >= 40) {
    summary = "Several compliance gaps have been identified that require prompt attention to protect your practice.";
  } else {
    summary = "Critical compliance issues have been identified. Immediate action is recommended to address these risks.";
  }

  // Generate priority actions from risks
  const criticalRisks = riskAreas.filter((r) => r.severity === "critical");
  const dangerRisks = riskAreas.filter((r) => r.severity === "danger");

  criticalRisks.forEach((risk) => {
    priorityActions.push(`URGENT: ${risk.recommendation}`);
  });

  dangerRisks.slice(0, 2).forEach((risk) => {
    priorityActions.push(risk.recommendation);
  });

  // Add product-based actions if needed
  if (recommendations.length > 0 && priorityActions.length < 3) {
    priorityActions.push(`Consider: ${recommendations[0].productName} to address identified gaps`);
  }

  return { summary, priorityActions: priorityActions.slice(0, 4) };
}

/**
 * Get color for risk level
 */
export function getRiskLevelColor(level: QuizResult["riskLevel"]): string {
  switch (level) {
    case "low": return "#10b981";
    case "moderate": return "#f59e0b";
    case "high": return "#ef4444";
    case "critical": return "#7f1d1d";
  }
}

/**
 * Get label for risk level
 */
export function getRiskLevelLabel(level: QuizResult["riskLevel"]): string {
  switch (level) {
    case "low": return "Low Risk";
    case "moderate": return "Moderate Risk";
    case "high": return "High Risk";
    case "critical": return "Critical Risk";
  }
}
