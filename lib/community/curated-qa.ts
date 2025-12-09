/**
 * Curated Q&A Section - BMAD Phase 3
 *
 * Moderated knowledge base with:
 * - Pre-approved questions and answers
 * - User question submission for moderation
 * - XP rewards for engagement
 * - Professional, law-firm appropriate content
 */

export interface QAEntry {
  id: string;
  question: string;
  answer: string;
  category: QACategory;
  tags: string[];
  authorId?: string; // Original submitter (if user-submitted)
  answeredBy: string; // Staff member who provided answer
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  helpfulCount: number;
  relatedProducts?: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface QASubmission {
  id: string;
  userId: string;
  userEmail: string;
  question: string;
  context?: string; // Additional context from user
  category: QACategory;
  status: SubmissionStatus;
  moderatorNotes?: string;
  convertedToQAId?: string; // If approved, links to the QA entry
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type QACategory =
  | "ahpra_compliance"
  | "telehealth"
  | "employment"
  | "privacy"
  | "contracts"
  | "practice_setup"
  | "billing"
  | "insurance"
  | "general";

export type SubmissionStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "duplicate";

export interface QAStats {
  totalEntries: number;
  totalViews: number;
  userSubmissions: number;
  approvedSubmissions: number;
  xpEarnedFromQA: number;
}

// In-memory storage
const qaEntries = new Map<string, QAEntry>();
const submissions = new Map<string, QASubmission>();
const userQAStats = new Map<string, QAStats>();
const userVotes = new Map<string, Set<string>>(); // userId -> Set of QA IDs they've marked helpful

// XP rewards for Q&A engagement
export const QA_XP_REWARDS = {
  submitQuestion: 20, // For submitting a question
  questionApproved: 100, // Bonus when your question gets approved
  markHelpful: 5, // For engaging with content
  viewComplete: 2, // For reading a full answer (scroll to end)
} as const;

// Pre-populated curated Q&A entries
export const INITIAL_QA_ENTRIES: Omit<QAEntry, "id" | "createdAt" | "updatedAt" | "publishedAt" | "viewCount" | "helpfulCount">[] = [
  {
    question: "What are the key AHPRA advertising requirements for medical practitioners?",
    answer: `AHPRA advertising requirements focus on ensuring healthcare advertising is not misleading or deceptive. Key requirements include:

**1. No testimonials** - You cannot use patient testimonials in advertising

**2. No misleading claims** - All claims must be verifiable and not create unreasonable expectations

**3. No urgency tactics** - Avoid "limited time" or pressure-based messaging

**4. Qualifications must be accurate** - Only list verified qualifications

**5. Pricing transparency** - If mentioning prices, be clear and complete

Our AHPRA Compliance Bundle includes templates that are pre-reviewed for compliance with these requirements.`,
    category: "ahpra_compliance",
    tags: ["ahpra", "advertising", "compliance", "marketing"],
    answeredBy: "Hamilton Bailey Law Team",
    isPublished: true,
    isFeatured: true,
    relatedProducts: ["ahpra-compliance-bundle"],
  },
  {
    question: "Do I need a written employment contract for my practice staff?",
    answer: `Yes, written employment contracts are strongly recommended and practically essential in Australia. Here's why:

**Legal Requirements:**
- The Fair Work Act requires certain terms to be in writing
- National Employment Standards (NES) must be provided

**Practical Benefits:**
- Clarifies roles, responsibilities, and expectations
- Protects your practice from disputes
- Documents confidentiality and IP provisions
- Outlines termination procedures

**What to Include:**
- Position and duties
- Hours and remuneration
- Leave entitlements
- Confidentiality clauses
- Termination provisions

Our Employment Contract Template Pack covers all these requirements and is tailored for medical practices.`,
    category: "employment",
    tags: ["employment", "contracts", "staff", "fair-work"],
    answeredBy: "Hamilton Bailey Law Team",
    isPublished: true,
    isFeatured: true,
    relatedProducts: ["employment-contract-pack"],
  },
  {
    question: "What privacy policies do I need for my telehealth practice?",
    answer: `Telehealth practices have specific privacy obligations under the Privacy Act 1988 and Australian Privacy Principles (APPs). Essential policies include:

**1. Privacy Policy**
- How you collect, use, and store patient information
- Third-party platforms used (video conferencing, etc.)
- Data security measures

**2. Telehealth Consent Form**
- Patient acknowledgment of telehealth limitations
- Technology requirements and responsibilities
- Recording consent (if applicable)

**3. Data Breach Response Plan**
- Required under the Notifiable Data Breaches scheme
- Must notify affected individuals and OAIC of eligible breaches

**4. Platform Security Policy**
- Approved platforms for consultations
- Staff training requirements
- Technical security measures

Our Telehealth Complete Bundle includes all these documents, pre-customized for Australian healthcare providers.`,
    category: "telehealth",
    tags: ["telehealth", "privacy", "consent", "data-security"],
    answeredBy: "Hamilton Bailey Law Team",
    isPublished: true,
    isFeatured: false,
    relatedProducts: ["telehealth-bundle"],
  },
  {
    question: "How should I structure a partnership agreement for a medical practice?",
    answer: `A medical practice partnership agreement should address several critical areas:

**Essential Clauses:**

**1. Capital Contributions**
- Initial contributions from each partner
- Future capital call procedures
- Valuation methodology

**2. Profit/Loss Sharing**
- Distribution formula
- Draw/salary provisions
- Expense allocation

**3. Decision Making**
- Voting rights
- Major decisions requiring unanimity
- Day-to-day management authority

**4. Exit Provisions**
- Retirement procedures
- Death or disability
- Voluntary withdrawal
- Expulsion procedures
- Non-compete clauses

**5. Dispute Resolution**
- Mediation requirements
- Arbitration provisions

**6. Patient Records**
- Ownership and access
- Transition procedures

Our Partnership Agreement Template is specifically designed for medical practices and includes all these provisions.`,
    category: "contracts",
    tags: ["partnership", "contracts", "business-structure"],
    answeredBy: "Hamilton Bailey Law Team",
    isPublished: true,
    isFeatured: false,
    relatedProducts: ["partnership-agreement-template"],
  },
  {
    question: "What are the requirements for patient consent forms in Australia?",
    answer: `Valid patient consent in Australia requires several elements:

**Legal Requirements:**

**1. Voluntariness**
- No pressure or coercion
- Time to consider

**2. Capacity**
- Patient can understand information
- Can make and communicate decision

**3. Information**
- Nature of treatment/procedure
- Material risks
- Alternatives available
- Consequences of not proceeding

**Documentation Best Practices:**

- Use plain language
- Include interpreter provisions
- Document the consent conversation
- Allow for questions
- Include withdrawal provisions
- Store securely with patient records

**Special Considerations:**
- Minors and guardianship
- Emergency situations
- Research participation
- Photography/recording

Our Patient Consent Forms Pack includes templates for various scenarios, all compliant with Australian healthcare standards.`,
    category: "general",
    tags: ["consent", "patients", "documentation", "compliance"],
    answeredBy: "Hamilton Bailey Law Team",
    isPublished: true,
    isFeatured: true,
    relatedProducts: ["consent-forms-pack"],
  },
];

/**
 * Initialize Q&A with curated entries
 */
export function initializeQA(): void {
  if (qaEntries.size > 0) return; // Already initialized

  INITIAL_QA_ENTRIES.forEach((entry, index) => {
    const id = `qa-${index + 1}`;
    const now = new Date().toISOString();
    qaEntries.set(id, {
      ...entry,
      id,
      viewCount: Math.floor(Math.random() * 500) + 100, // Demo data
      helpfulCount: Math.floor(Math.random() * 50) + 10, // Demo data
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    });
  });
}

/**
 * Get all published Q&A entries
 */
export function getQAEntries(
  options: {
    category?: QACategory;
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}
): { entries: QAEntry[]; total: number } {
  initializeQA();

  let entries = Array.from(qaEntries.values()).filter((e) => e.isPublished);

  // Filter by category
  if (options.category) {
    entries = entries.filter((e) => e.category === options.category);
  }

  // Filter featured only
  if (options.featured) {
    entries = entries.filter((e) => e.isFeatured);
  }

  // Search in question and answer
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    entries = entries.filter(
      (e) =>
        e.question.toLowerCase().includes(searchLower) ||
        e.answer.toLowerCase().includes(searchLower) ||
        e.tags.some((t) => t.toLowerCase().includes(searchLower))
    );
  }

  // Sort by featured first, then by helpful count
  entries.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return b.helpfulCount - a.helpfulCount;
  });

  const total = entries.length;
  const limit = options.limit || 20;
  const offset = options.offset || 0;

  return {
    entries: entries.slice(offset, offset + limit),
    total,
  };
}

/**
 * Get a single Q&A entry
 */
export function getQAEntry(id: string, userId?: string): QAEntry | null {
  initializeQA();
  const entry = qaEntries.get(id);
  if (!entry || !entry.isPublished) return null;

  // Increment view count
  entry.viewCount++;

  // Award view XP if user provided
  if (userId) {
    const stats = getUserQAStats(userId);
    stats.totalViews++;
    // Small XP for viewing (only once per entry per user would be ideal, simplified here)
    stats.xpEarnedFromQA += QA_XP_REWARDS.viewComplete;
    userQAStats.set(userId, stats);
  }

  return entry;
}

/**
 * Mark a Q&A entry as helpful
 */
export function markQAHelpful(
  qaId: string,
  userId: string
): { success: boolean; xpAwarded: number; alreadyVoted: boolean } {
  initializeQA();
  const entry = qaEntries.get(qaId);
  if (!entry) return { success: false, xpAwarded: 0, alreadyVoted: false };

  // Check if user already voted
  const votes = userVotes.get(userId) || new Set();
  if (votes.has(qaId)) {
    return { success: false, xpAwarded: 0, alreadyVoted: true };
  }

  // Record vote and increment count
  votes.add(qaId);
  userVotes.set(userId, votes);
  entry.helpfulCount++;

  // Award XP
  const stats = getUserQAStats(userId);
  stats.xpEarnedFromQA += QA_XP_REWARDS.markHelpful;
  userQAStats.set(userId, stats);

  return { success: true, xpAwarded: QA_XP_REWARDS.markHelpful, alreadyVoted: false };
}

/**
 * Submit a question for moderation
 */
export function submitQuestion(
  userId: string,
  userEmail: string,
  question: string,
  category: QACategory,
  context?: string
): { submission: QASubmission; xpAwarded: number } {
  const submission: QASubmission = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    userEmail,
    question,
    context,
    category,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  submissions.set(submission.id, submission);

  // Update user stats
  const stats = getUserQAStats(userId);
  stats.userSubmissions++;
  stats.xpEarnedFromQA += QA_XP_REWARDS.submitQuestion;
  userQAStats.set(userId, stats);

  return { submission, xpAwarded: QA_XP_REWARDS.submitQuestion };
}

/**
 * Get pending submissions (for moderation)
 */
export function getPendingSubmissions(): QASubmission[] {
  return Array.from(submissions.values())
    .filter((s) => s.status === "pending" || s.status === "under_review")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Approve a submission and create Q&A entry
 */
export function approveSubmission(
  submissionId: string,
  answer: string,
  answeredBy: string,
  tags: string[] = [],
  relatedProducts: string[] = []
): { qaEntry: QAEntry; submitterXpBonus: number } | null {
  const submission = submissions.get(submissionId);
  if (!submission) return null;

  const now = new Date().toISOString();
  const qaId = `qa-${Date.now()}`;

  const qaEntry: QAEntry = {
    id: qaId,
    question: submission.question,
    answer,
    category: submission.category,
    tags,
    authorId: submission.userId,
    answeredBy,
    isPublished: true,
    isFeatured: false,
    viewCount: 0,
    helpfulCount: 0,
    relatedProducts,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  };

  qaEntries.set(qaId, qaEntry);

  // Update submission
  submission.status = "approved";
  submission.convertedToQAId = qaId;
  submission.reviewedAt = now;
  submission.reviewedBy = answeredBy;

  // Award bonus XP to submitter
  const stats = getUserQAStats(submission.userId);
  stats.approvedSubmissions++;
  stats.xpEarnedFromQA += QA_XP_REWARDS.questionApproved;
  userQAStats.set(submission.userId, stats);

  return { qaEntry, submitterXpBonus: QA_XP_REWARDS.questionApproved };
}

/**
 * Reject a submission
 */
export function rejectSubmission(
  submissionId: string,
  reason: string,
  reviewedBy: string
): boolean {
  const submission = submissions.get(submissionId);
  if (!submission) return false;

  submission.status = "rejected";
  submission.moderatorNotes = reason;
  submission.reviewedAt = new Date().toISOString();
  submission.reviewedBy = reviewedBy;

  return true;
}

/**
 * Get user's Q&A stats
 */
export function getUserQAStats(userId: string): QAStats {
  initializeQA();
  return userQAStats.get(userId) || {
    totalEntries: qaEntries.size,
    totalViews: 0,
    userSubmissions: 0,
    approvedSubmissions: 0,
    xpEarnedFromQA: 0,
  };
}

/**
 * Get Q&A categories with counts
 */
export function getQACategories(): Array<{
  category: QACategory;
  label: string;
  count: number;
  icon: string;
}> {
  initializeQA();

  const categoryCounts = new Map<QACategory, number>();
  qaEntries.forEach((e) => {
    if (e.isPublished) {
      categoryCounts.set(e.category, (categoryCounts.get(e.category) || 0) + 1);
    }
  });

  return [
    {
      category: "ahpra_compliance",
      label: "AHPRA & Compliance",
      count: categoryCounts.get("ahpra_compliance") || 0,
      icon: "shield-check",
    },
    {
      category: "telehealth",
      label: "Telehealth",
      count: categoryCounts.get("telehealth") || 0,
      icon: "video",
    },
    {
      category: "employment",
      label: "Employment",
      count: categoryCounts.get("employment") || 0,
      icon: "users",
    },
    {
      category: "privacy",
      label: "Privacy & Data",
      count: categoryCounts.get("privacy") || 0,
      icon: "lock",
    },
    {
      category: "contracts",
      label: "Contracts",
      count: categoryCounts.get("contracts") || 0,
      icon: "file-text",
    },
    {
      category: "practice_setup",
      label: "Practice Setup",
      count: categoryCounts.get("practice_setup") || 0,
      icon: "building",
    },
    {
      category: "billing",
      label: "Billing & Medicare",
      count: categoryCounts.get("billing") || 0,
      icon: "credit-card",
    },
    {
      category: "insurance",
      label: "Insurance",
      count: categoryCounts.get("insurance") || 0,
      icon: "umbrella",
    },
    {
      category: "general",
      label: "General",
      count: categoryCounts.get("general") || 0,
      icon: "help-circle",
    },
  ];
}

/**
 * Search Q&A entries
 */
export function searchQA(query: string): QAEntry[] {
  initializeQA();
  const queryLower = query.toLowerCase();

  return Array.from(qaEntries.values())
    .filter((e) => e.isPublished)
    .filter(
      (e) =>
        e.question.toLowerCase().includes(queryLower) ||
        e.answer.toLowerCase().includes(queryLower) ||
        e.tags.some((t) => t.includes(queryLower))
    )
    .sort((a, b) => b.helpfulCount - a.helpfulCount)
    .slice(0, 10);
}
