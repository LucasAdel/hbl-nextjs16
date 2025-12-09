export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  author: {
    name: string;
    role: string;
    image?: string;
  };
  publishedAt: string;
  updatedAt?: string;
  readTime: number;
  featured: boolean;
  image?: string;
  tags: string[];
}

export type ArticleCategory =
  | "practice-management"
  | "regulatory"
  | "employment"
  | "property"
  | "compliance"
  | "business";

export const categoryLabels: Record<ArticleCategory, string> = {
  "practice-management": "Practice Management",
  regulatory: "Regulatory",
  employment: "Employment",
  property: "Property & Leasing",
  compliance: "Compliance",
  business: "Business",
};

export const articles: Article[] = [
  {
    id: "1",
    slug: "understanding-tenant-doctor-agreements",
    title: "Understanding Tenant Doctor Agreements: A Comprehensive Guide",
    excerpt:
      "Tenant doctor agreements are crucial documents that govern the relationship between medical practitioners and practice owners. Learn what to look for and how to negotiate better terms.",
    content: `
## What is a Tenant Doctor Agreement?

A tenant doctor agreement (TDA) is a contractual arrangement between a practice owner and a medical practitioner who will work from the practice premises. Unlike a traditional lease, a TDA typically covers more than just the use of space – it often includes access to staff, equipment, billing systems, and patient bookings.

## Key Elements to Review

### 1. Fee Structure

The most critical aspect of any TDA is understanding exactly what you'll pay. Common arrangements include:

- **Percentage of billings**: Typically 30-40% of gross billings
- **Fixed rent**: A set weekly or monthly amount
- **Hybrid models**: Combination of fixed and percentage components

Always clarify what's included in the fee – does it cover consumables, staff time, IT systems, and professional indemnity?

### 2. Patient Ownership

This is often the most contentious issue. Key questions to ask:

- Who owns the patient records?
- What happens to your patient list if you leave?
- Are there restrictions on contacting patients after departure?

We recommend negotiating clear terms that acknowledge the practitioner's contribution to building a patient base.

### 3. Notice Periods

Standard notice periods range from 1-6 months, but some agreements require up to 12 months. Consider:

- Is the notice period reasonable for your circumstances?
- Are there provisions for early termination in certain situations?
- What happens if the practice is sold?

### 4. Restrictive Covenants

Many TDAs include restrictions on where you can practice after leaving. Be cautious of:

- Overly broad geographic restrictions
- Excessively long restriction periods
- Unreasonable definitions of "competing practice"

## Red Flags to Watch For

- Unclear fee calculation methods
- One-sided termination provisions
- Automatic renewal clauses without notice requirements
- Unreasonable restrictive covenants
- Liability provisions that expose you to practice-wide issues

## Our Recommendation

Never sign a TDA without professional review. The cost of legal advice upfront is minimal compared to the potential consequences of a poorly structured agreement.

Contact us for a complimentary TDA review – we'll identify the key issues and help you negotiate better terms.
    `,
    category: "property",
    author: {
      name: "Sarah Mitchell",
      role: "Senior Associate",
    },
    publishedAt: "2024-11-15",
    readTime: 8,
    featured: true,
    tags: ["tenant-doctor", "medical-practice", "contracts", "leasing"],
  },
  {
    id: "2",
    slug: "ahpra-notification-guide",
    title: "What to Do When You Receive an AHPRA Notification",
    excerpt:
      "Receiving an AHPRA notification can be stressful. This guide walks you through the process and explains your rights and options at each stage.",
    content: `
## Understanding AHPRA Notifications

The Australian Health Practitioner Regulation Agency (AHPRA) handles complaints and notifications about registered health practitioners. Receiving a notification doesn't mean you've done something wrong – it means a concern has been raised that requires investigation.

## Types of Notifications

AHPRA deals with various types of notifications:

1. **Performance concerns**: Questions about your clinical competence
2. **Conduct concerns**: Issues about your professional behaviour
3. **Health concerns**: Matters relating to your health that may affect practice
4. **Statutory notifications**: Mandatory reports from employers or practitioners

## What to Do Immediately

### 1. Don't Panic

While it's natural to feel anxious, remember that most notifications are resolved without serious consequences. Many involve misunderstandings or minor issues.

### 2. Seek Legal Advice

Contact a lawyer experienced in health practitioner regulation **before** responding. Your response is crucial and can significantly influence the outcome.

### 3. Notify Your Insurer

Most professional indemnity policies cover regulatory matters. Contact your insurer immediately as they may fund your legal representation.

### 4. Preserve Evidence

Gather and preserve all relevant documentation, including:
- Clinical records
- Correspondence
- Policies and procedures
- Witness contact details

## The Investigation Process

### Initial Assessment

AHPRA will assess whether the notification requires further investigation or can be closed without action.

### Investigation

If investigated, AHPRA may:
- Request your response to allegations
- Interview witnesses
- Obtain expert opinions
- Access relevant records

### Outcomes

Possible outcomes include:
- No further action
- Caution or reprimand
- Conditions on registration
- Undertakings
- Suspension
- Tribunal referral

## Responding to AHPRA

Your written response is critical. Key principles:

- Be honest and transparent
- Address each allegation specifically
- Provide context where relevant
- Demonstrate insight and reflection
- Show what you've learned or changed

**Never** ignore AHPRA correspondence or miss deadlines.

## Our Support

We have extensive experience in AHPRA matters and can:
- Prepare your response
- Represent you at interviews
- Negotiate outcomes
- Appear at tribunal hearings

Contact us immediately if you receive an AHPRA notification.
    `,
    category: "regulatory",
    author: {
      name: "James Wong",
      role: "Partner",
    },
    publishedAt: "2024-11-08",
    readTime: 10,
    featured: true,
    tags: ["ahpra", "regulation", "compliance", "medical-board"],
  },
  {
    id: "3",
    slug: "employment-contracts-medical-staff",
    title: "Employment Contracts for Medical Practice Staff: Essential Inclusions",
    excerpt:
      "A well-drafted employment contract protects both the employer and employee. Learn what should be included in contracts for medical practice staff.",
    content: `
## Why Employment Contracts Matter

While written employment contracts aren't legally required in Australia, they're essential for medical practices. A good contract:

- Clarifies expectations on both sides
- Protects confidential patient information
- Prevents disputes about entitlements
- Enables enforcement of post-employment restrictions

## Essential Contract Elements

### 1. Position and Duties

Clearly define:
- Job title and reporting structure
- Key responsibilities and duties
- Hours of work and flexibility requirements
- Location(s) of work

### 2. Remuneration and Benefits

Specify:
- Base salary or hourly rate
- Superannuation contributions
- Bonuses or incentives (if applicable)
- Allowances (uniform, parking, etc.)
- Salary review provisions

### 3. Leave Entitlements

Cover all leave types:
- Annual leave (minimum 4 weeks)
- Personal/carer's leave
- Parental leave
- Long service leave
- Any additional leave provided

### 4. Confidentiality

Critical for medical practices:
- Define confidential information broadly
- Include patient information specifically
- Specify obligations during and after employment
- Address social media and communications

### 5. Restraint of Trade

Consider including:
- Non-compete provisions
- Non-solicitation of patients
- Non-solicitation of staff
- Reasonable geographic and time limits

## Award Compliance

Most medical practice staff are covered by:
- Health Professionals and Support Services Award
- Nurses Award

Ensure contracts meet or exceed minimum award entitlements.

## Common Mistakes to Avoid

1. **Using generic templates**: Medical practices have specific requirements
2. **Ignoring awards**: Contracts can't reduce award entitlements
3. **Unreasonable restraints**: Courts won't enforce excessive restrictions
4. **Missing probation provisions**: Include clear probation terms
5. **Unclear termination**: Specify notice periods and grounds

## Our Service

We prepare customised employment contracts for medical practices that:
- Comply with relevant awards
- Protect patient confidentiality
- Include appropriate restraints
- Reflect your practice's specific needs

Contact us for a contract package tailored to your practice.
    `,
    category: "employment",
    author: {
      name: "Michelle Chen",
      role: "Associate",
    },
    publishedAt: "2024-10-25",
    readTime: 7,
    featured: false,
    tags: ["employment", "contracts", "staff", "hr"],
  },
  {
    id: "4",
    slug: "medicare-billing-compliance",
    title: "Medicare Billing Compliance: Avoiding Common Pitfalls",
    excerpt:
      "Medicare compliance is crucial for medical practices. Understand the common billing errors that can lead to audits and how to avoid them.",
    content: `
## The Importance of Medicare Compliance

Incorrect Medicare billing can result in:
- Repayment demands (often substantial amounts)
- Financial penalties
- Referral to the PSR (Professional Services Review)
- Damage to professional reputation
- In serious cases, criminal prosecution

## Common Billing Errors

### 1. Incorrect Item Numbers

- Using item numbers that don't match services provided
- Claiming higher-value items than justified
- Misunderstanding item descriptor requirements

### 2. Time-Based Items

- Not meeting minimum time requirements
- Inadequate documentation of consultation length
- Billing for time not directly with the patient

### 3. Bulk Billing Issues

- Failing to collect patient signatures
- Not meeting bulk billing requirements
- Incorrect assignment of benefits

### 4. Duplicate Billing

- Billing multiple items for the same service
- Claiming for services already included in another item
- Multiple practitioners billing for the same consultation

### 5. Referral Problems

- Accepting invalid referrals
- Billing without current referral
- Not checking referral validity

## Documentation Requirements

Adequate clinical records should include:
- Date and time of service
- Patient identification
- Clinical findings
- Diagnosis or clinical impression
- Treatment provided
- Follow-up plan

## Compliance Program Recommendations

### 1. Staff Training

- Regular billing training for all staff
- Updates when MBS changes
- Clear escalation procedures

### 2. Internal Audits

- Regular review of billing patterns
- Comparison with peer data
- Random record audits

### 3. Written Policies

- Billing procedures manual
- Escalation procedures
- Documentation standards

### 4. Professional Advice

- Seek clarification when unsure
- Engage billing experts for complex items
- Legal review of compliance program

## If You're Audited

If Medicare initiates an audit:
1. Contact us immediately
2. Don't respond without legal advice
3. Gather relevant documentation
4. Cooperate fully while protecting your rights

## Our Support

We assist practices with:
- Compliance program development
- Staff training
- Audit preparation and response
- PSR matters

Contact us for a confidential compliance review.
    `,
    category: "compliance",
    author: {
      name: "David Park",
      role: "Consultant",
    },
    publishedAt: "2024-10-18",
    readTime: 9,
    featured: false,
    tags: ["medicare", "billing", "compliance", "audit"],
  },
  {
    id: "5",
    slug: "buying-medical-practice",
    title: "Buying a Medical Practice: Due Diligence Checklist",
    excerpt:
      "Acquiring an existing medical practice can fast-track your business goals, but proper due diligence is essential. Here's what to investigate before signing.",
    content: `
## Why Due Diligence Matters

Buying a medical practice is a significant investment. Proper due diligence helps you:
- Understand what you're actually buying
- Identify potential problems
- Negotiate appropriate price and terms
- Plan for transition and integration

## Financial Due Diligence

### Revenue Analysis

- 3-5 years of financial statements
- Revenue by practitioner and service type
- Patient mix and demographics
- Medicare and private billing breakdown
- Seasonal variations

### Expense Review

- Rent and lease terms
- Staff costs and contracts
- Equipment and maintenance
- Insurance and compliance costs
- Outstanding liabilities

### Working Capital

- Accounts receivable aging
- Outstanding Medicare claims
- Prepaid expenses
- Inventory (if applicable)

## Legal Due Diligence

### Property and Leases

- Lease terms and renewal options
- Assignment provisions
- Make-good obligations
- Landlord consent requirements

### Contracts

- Staff employment contracts
- Supplier agreements
- Equipment leases
- Service agreements

### Compliance

- Registration and accreditation status
- Outstanding complaints or notifications
- Compliance history
- Insurance coverage

## Operational Due Diligence

### Staff

- Staff qualifications and experience
- Employment terms and entitlements
- Key person risk
- Staff attitudes to sale

### Patients

- Patient demographics and loyalty
- Record keeping practices
- Transfer arrangements
- Privacy compliance

### Systems

- Practice management software
- Billing systems
- Clinical equipment
- IT infrastructure

## Key Questions to Ask

1. Why is the practice being sold?
2. What are the growth opportunities?
3. What are the main challenges?
4. How dependent is the practice on the seller?
5. What support will the seller provide post-sale?

## Common Pitfalls

- Overvaluing patient goodwill
- Underestimating transition challenges
- Missing hidden liabilities
- Inadequate seller warranties
- Poor transition planning

## Our Role

We assist buyers with:
- Due diligence coordination
- Contract negotiation
- Transition planning
- Post-acquisition integration

Contact us early in your acquisition process.
    `,
    category: "business",
    author: {
      name: "James Wong",
      role: "Partner",
    },
    publishedAt: "2024-10-10",
    readTime: 11,
    featured: false,
    tags: ["acquisition", "due-diligence", "business", "practice-management"],
  },
  {
    id: "6",
    slug: "medical-practice-partnership-agreements",
    title: "Partnership Agreements for Medical Practices: Getting It Right",
    excerpt:
      "A well-structured partnership agreement prevents disputes and protects all parties. Learn the essential elements every medical practice partnership should address.",
    content: `
## The Foundation of Successful Partnerships

Partnership disputes are among the most damaging events a medical practice can experience. A comprehensive partnership agreement establishes clear rules and expectations from the outset.

## Essential Partnership Terms

### 1. Ownership Structure

- Percentage interests of each partner
- Capital contributions required
- How additional capital will be raised
- Process for admitting new partners

### 2. Profit Sharing

- How profits (and losses) are divided
- Drawings and distribution timing
- Treatment of work-in-progress
- Individual billing arrangements

### 3. Decision Making

- Day-to-day management authority
- Major decisions requiring unanimous consent
- Meeting and voting procedures
- Deadlock resolution mechanisms

### 4. Partner Obligations

- Minimum time/billing commitments
- Outside activities restrictions
- Non-compete during partnership
- Insurance requirements

### 5. Exit Provisions

- Notice periods for withdrawal
- Valuation methodology
- Payment terms for departing partners
- Restrictive covenants on exit

### 6. Death and Incapacity

- Insurance arrangements
- Succession planning
- Treatment of incapacitated partners
- Estate entitlements

## Valuation Methods

Common approaches include:
- **Multiple of earnings**: Typically 0.5-2x annual profits
- **Asset-based**: Net assets plus goodwill factor
- **Revenue-based**: Percentage of gross revenue
- **Independent valuation**: Third-party assessment

## Dispute Resolution

Build in mechanisms before disputes arise:
1. Internal negotiation requirements
2. Mediation with nominated mediator
3. Expert determination for valuation disputes
4. Arbitration as final resort

## Common Partnership Issues

### Workload Imbalances

Address scenarios where partners contribute unequally:
- Define minimum requirements
- Allow flexible arrangements
- Adjust profit shares accordingly

### Personal Circumstances

Plan for:
- Parental leave
- Extended illness
- Study or sabbatical
- Gradual retirement

### Practice Growth

Agree on:
- Expansion decisions
- Capital requirements
- New partner admission process

## Our Approach

We draft partnership agreements that:
- Reflect your practice's specific circumstances
- Anticipate common issues
- Provide clear dispute resolution paths
- Balance flexibility with certainty

Contact us to review or prepare your partnership agreement.
    `,
    category: "practice-management",
    author: {
      name: "Sarah Mitchell",
      role: "Senior Associate",
    },
    publishedAt: "2024-09-28",
    readTime: 9,
    featured: false,
    tags: ["partnership", "agreements", "practice-management", "business"],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getArticlesByCategory(category: ArticleCategory): Article[] {
  return articles.filter((article) => article.category === category);
}

export function getFeaturedArticles(): Article[] {
  return articles.filter((article) => article.featured);
}

export function getRelatedArticles(currentSlug: string, limit = 3): Article[] {
  const currentArticle = getArticleBySlug(currentSlug);
  if (!currentArticle) return [];

  return articles
    .filter(
      (article) =>
        article.slug !== currentSlug &&
        (article.category === currentArticle.category ||
          article.tags.some((tag) => currentArticle.tags.includes(tag)))
    )
    .slice(0, limit);
}

export function getAllArticleSlugs(): string[] {
  return articles.map((article) => article.slug);
}

export function searchArticles(query: string): Article[] {
  const lowerQuery = query.toLowerCase();
  return articles.filter(
    (article) =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.excerpt.toLowerCase().includes(lowerQuery) ||
      article.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}
