/**
 * Peer Comparison - BMAD Phase 3
 *
 * Anonymous comparison to similar users for:
 * - Social proof through peer behavior
 * - Aspirational benchmarks
 * - Cross-sell opportunities
 */

export interface PeerGroup {
  id: string;
  name: string;
  description: string;
  size: number;
  criteria: PeerCriteria;
}

export interface PeerCriteria {
  practiceType?: string[];
  practiceSize?: string[];
  specialty?: string[];
  region?: string[];
}

export interface PeerComparison {
  userMetric: number;
  peerAverage: number;
  peerMedian: number;
  percentile: number;
  trend: "above" | "below" | "average";
  message: string;
}

export interface PeerInsights {
  group: PeerGroup;
  comparisons: {
    xpEarned: PeerComparison;
    purchaseCount: PeerComparison;
    totalSpent: PeerComparison;
    streakLength: PeerComparison;
    toolsCompleted: PeerComparison;
  };
  recommendations: PeerRecommendation[];
  topPurchases: TopPurchase[];
}

export interface PeerRecommendation {
  type: "product" | "action" | "bundle";
  title: string;
  description: string;
  peerAdoption: number; // Percentage of peers who have this
  link?: string;
}

export interface TopPurchase {
  productId: string;
  productName: string;
  purchaseRate: number; // Percentage of peers who purchased
  averageRating: number;
}

// Demo peer groups
const PEER_GROUPS: PeerGroup[] = [
  {
    id: "solo-gp",
    name: "Solo General Practitioners",
    description: "Independent GPs running their own practice",
    size: 847,
    criteria: { practiceType: ["solo"], specialty: ["general-practice"] },
  },
  {
    id: "small-medical",
    name: "Small Medical Practices",
    description: "Medical practices with 2-5 practitioners",
    size: 1234,
    criteria: { practiceSize: ["small"], practiceType: ["medical"] },
  },
  {
    id: "telehealth-providers",
    name: "Telehealth Providers",
    description: "Practitioners offering telehealth services",
    size: 567,
    criteria: { practiceType: ["telehealth"] },
  },
  {
    id: "allied-health",
    name: "Allied Health Professionals",
    description: "Physiotherapists, psychologists, and other allied health",
    size: 923,
    criteria: { practiceType: ["allied-health"] },
  },
];

/**
 * Calculate percentile ranking
 */
function calculatePercentile(value: number, distribution: number[]): number {
  const sorted = [...distribution].sort((a, b) => a - b);
  const index = sorted.findIndex((v) => v >= value);
  if (index === -1) return 100;
  return Math.round((index / sorted.length) * 100);
}

/**
 * Generate comparison message based on percentile
 */
function getComparisonMessage(
  metric: string,
  percentile: number,
  isHigherBetter: boolean
): string {
  const position = isHigherBetter ? percentile : 100 - percentile;

  if (position >= 90) {
    return `You're in the top 10% for ${metric}! Outstanding performance.`;
  } else if (position >= 75) {
    return `You're above average for ${metric}. Keep up the great work!`;
  } else if (position >= 50) {
    return `You're around average for ${metric}. Room to grow!`;
  } else if (position >= 25) {
    return `You're below average for ${metric}. Check what top performers are doing.`;
  } else {
    return `You're in the bottom 25% for ${metric}. Let's change that!`;
  }
}

/**
 * Get peer insights for a user
 */
export function getPeerInsights(
  userId: string,
  userProfile: {
    practiceType?: string;
    practiceSize?: string;
    specialty?: string;
    xpEarned: number;
    purchaseCount: number;
    totalSpent: number;
    streakLength: number;
    toolsCompleted: number;
  }
): PeerInsights {
  // Find matching peer group
  const group = PEER_GROUPS.find(
    (g) =>
      g.criteria.practiceType?.includes(userProfile.practiceType || "") ||
      g.criteria.practiceSize?.includes(userProfile.practiceSize || "") ||
      g.criteria.specialty?.includes(userProfile.specialty || "")
  ) || PEER_GROUPS[0];

  // Generate demo distribution data (in production, query from database)
  const xpDistribution = Array.from({ length: group.size }, () =>
    Math.floor(Math.random() * 10000)
  );
  const purchaseDistribution = Array.from({ length: group.size }, () =>
    Math.floor(Math.random() * 10)
  );
  const spentDistribution = Array.from({ length: group.size }, () =>
    Math.floor(Math.random() * 2000)
  );
  const streakDistribution = Array.from({ length: group.size }, () =>
    Math.floor(Math.random() * 30)
  );
  const toolsDistribution = Array.from({ length: group.size }, () =>
    Math.floor(Math.random() * 5)
  );

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const median = (arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const createComparison = (
    userValue: number,
    distribution: number[],
    metricName: string,
    isHigherBetter = true
  ): PeerComparison => {
    const percentile = calculatePercentile(userValue, distribution);
    const peerAvg = avg(distribution);
    const peerMed = median(distribution);

    return {
      userMetric: userValue,
      peerAverage: Math.round(peerAvg),
      peerMedian: Math.round(peerMed),
      percentile,
      trend:
        userValue > peerAvg * 1.1
          ? "above"
          : userValue < peerAvg * 0.9
          ? "below"
          : "average",
      message: getComparisonMessage(metricName, percentile, isHigherBetter),
    };
  };

  return {
    group,
    comparisons: {
      xpEarned: createComparison(userProfile.xpEarned, xpDistribution, "XP earned"),
      purchaseCount: createComparison(
        userProfile.purchaseCount,
        purchaseDistribution,
        "purchases"
      ),
      totalSpent: createComparison(
        userProfile.totalSpent,
        spentDistribution,
        "investment in compliance"
      ),
      streakLength: createComparison(
        userProfile.streakLength,
        streakDistribution,
        "streak length"
      ),
      toolsCompleted: createComparison(
        userProfile.toolsCompleted,
        toolsDistribution,
        "tools completed"
      ),
    },
    recommendations: [
      {
        type: "product",
        title: "AHPRA Compliance Bundle",
        description: "72% of practitioners in your group have this",
        peerAdoption: 72,
        link: "/products/ahpra-bundle",
      },
      {
        type: "action",
        title: "Complete the Compliance Quiz",
        description: "Top performers in your group complete this first",
        peerAdoption: 85,
        link: "/tools/compliance-quiz",
      },
      {
        type: "bundle",
        title: "Telehealth Setup Kit",
        description: "Growing fast among solo practitioners",
        peerAdoption: 45,
        link: "/products/telehealth-kit",
      },
    ],
    topPurchases: [
      {
        productId: "emp-contract-1",
        productName: "Employment Contract Template",
        purchaseRate: 68,
        averageRating: 4.8,
      },
      {
        productId: "privacy-policy-1",
        productName: "Privacy Policy Bundle",
        purchaseRate: 54,
        averageRating: 4.7,
      },
      {
        productId: "consent-forms-1",
        productName: "Patient Consent Forms Pack",
        purchaseRate: 47,
        averageRating: 4.9,
      },
    ],
  };
}

/**
 * Get peer comparison summary for display
 */
export function getPeerComparisonSummary(
  userId: string,
  userProfile: {
    practiceType?: string;
    practiceSize?: string;
    xpEarned: number;
    totalSpent: number;
    purchaseCount: number;
  }
): {
  groupName: string;
  groupSize: number;
  highlights: Array<{
    metric: string;
    value: string;
    comparison: string;
    percentile: number;
    trend: "up" | "down" | "neutral";
  }>;
} {
  const insights = getPeerInsights(userId, {
    ...userProfile,
    specialty: "",
    streakLength: 0,
    toolsCompleted: 0,
  });

  return {
    groupName: insights.group.name,
    groupSize: insights.group.size,
    highlights: [
      {
        metric: "XP Earned",
        value: insights.comparisons.xpEarned.userMetric.toLocaleString(),
        comparison: `vs ${insights.comparisons.xpEarned.peerAverage.toLocaleString()} avg`,
        percentile: insights.comparisons.xpEarned.percentile,
        trend:
          insights.comparisons.xpEarned.trend === "above"
            ? "up"
            : insights.comparisons.xpEarned.trend === "below"
            ? "down"
            : "neutral",
      },
      {
        metric: "Total Investment",
        value: `$${insights.comparisons.totalSpent.userMetric.toLocaleString()}`,
        comparison: `vs $${insights.comparisons.totalSpent.peerAverage.toLocaleString()} avg`,
        percentile: insights.comparisons.totalSpent.percentile,
        trend:
          insights.comparisons.totalSpent.trend === "above"
            ? "up"
            : insights.comparisons.totalSpent.trend === "below"
            ? "down"
            : "neutral",
      },
      {
        metric: "Purchases",
        value: insights.comparisons.purchaseCount.userMetric.toString(),
        comparison: `vs ${insights.comparisons.purchaseCount.peerAverage} avg`,
        percentile: insights.comparisons.purchaseCount.percentile,
        trend:
          insights.comparisons.purchaseCount.trend === "above"
            ? "up"
            : insights.comparisons.purchaseCount.trend === "below"
            ? "down"
            : "neutral",
      },
    ],
  };
}
