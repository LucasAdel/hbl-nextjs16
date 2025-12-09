/**
 * Knowledge Base Data
 * Centralized content for the knowledge base section
 */

export interface KnowledgeBaseCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  articleCount: number;
}

export interface KnowledgeBaseArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  readTime: number;
  publishedAt: string;
  updatedAt: string;
  featured: boolean;
}

export const KNOWLEDGE_BASE_CATEGORIES: KnowledgeBaseCategory[] = [
  {
    id: "medical-practice",
    name: "Medical Practice Setup",
    slug: "medical-practice-setup",
    description: "Everything you need to know about establishing and running a medical practice in Australia",
    icon: "Stethoscope",
    articleCount: 8,
  },
  {
    id: "compliance",
    name: "Regulatory Compliance",
    slug: "regulatory-compliance",
    description: "AHPRA registration, Medicare compliance, and healthcare regulations",
    icon: "Shield",
    articleCount: 12,
  },
  {
    id: "employment",
    name: "Employment & HR",
    slug: "employment-hr",
    description: "Employment contracts, workplace policies, and HR best practices for healthcare",
    icon: "Users",
    articleCount: 6,
  },
  {
    id: "property",
    name: "Property & Leasing",
    slug: "property-leasing",
    description: "Medical practice leases, tenant doctor agreements, and property considerations",
    icon: "Building",
    articleCount: 5,
  },
  {
    id: "contracts",
    name: "Healthcare Contracts",
    slug: "healthcare-contracts",
    description: "Service agreements, partnership deeds, and commercial contracts",
    icon: "FileText",
    articleCount: 9,
  },
  {
    id: "disputes",
    name: "Dispute Resolution",
    slug: "dispute-resolution",
    description: "Managing conflicts, complaints handling, and legal proceedings",
    icon: "Scale",
    articleCount: 4,
  },
];

export const KNOWLEDGE_BASE_ARTICLES: KnowledgeBaseArticle[] = [
  {
    id: "tenant-doctor-101",
    slug: "tenant-doctor-agreements-explained",
    title: "Tenant Doctor Agreements Explained: A Complete Guide",
    excerpt: "Understanding the key elements of tenant doctor arrangements and how they differ from employment relationships.",
    content: `
# Tenant Doctor Agreements Explained

A tenant doctor agreement is a contractual arrangement where a medical practitioner operates their practice within premises owned or leased by another party, typically a medical center or practice owner.

## Key Elements

### 1. Nature of the Relationship
Unlike employment, a tenant doctor arrangement creates an independent contractor relationship. This has significant implications for:
- Tax obligations
- Professional liability
- Practice autonomy
- Income structure

### 2. Financial Arrangements
Common financial models include:
- **Percentage-based fees**: The tenant pays a percentage (typically 30-40%) of gross billings
- **Fixed rental**: A set monthly fee regardless of billings
- **Hybrid models**: Combining fixed rent with percentage payments

### 3. Essential Terms
Every tenant doctor agreement should address:
- Duration and renewal terms
- Service fee calculation and payment
- Equipment and consumables provision
- Administrative support scope
- Patient record ownership
- Termination conditions
- Restraint of trade clauses

## Legal Considerations

### Tax Implications
The ATO closely scrutinizes tenant doctor arrangements. Key factors they consider:
- Control over work methods
- Risk and responsibility allocation
- Tool and equipment provision
- Ability to delegate or subcontract

### Insurance Requirements
Tenant doctors must maintain:
- Professional indemnity insurance
- Public liability coverage
- Income protection (recommended)

## Common Pitfalls to Avoid

1. **Ambiguous terms**: Ensure all financial arrangements are clearly documented
2. **Inadequate notice periods**: Both parties need reasonable exit terms
3. **Restrictive restraints**: Overly broad non-compete clauses may be unenforceable
4. **Missing intellectual property provisions**: Address patient lists and practice goodwill

## Next Steps

If you're entering into a tenant doctor arrangement, we recommend:
1. Having the agreement reviewed by a healthcare lawyer
2. Understanding your tax obligations with an accountant
3. Ensuring adequate insurance coverage
4. Documenting all verbal understandings in writing
    `,
    category: "medical-practice",
    tags: ["tenant doctor", "agreements", "medical practice", "independent contractor"],
    readTime: 8,
    publishedAt: "2024-03-15",
    updatedAt: "2024-11-20",
    featured: true,
  },
  {
    id: "ahpra-registration",
    slug: "ahpra-registration-guide",
    title: "AHPRA Registration: Complete Guide for Medical Practitioners",
    excerpt: "Step-by-step guide to AHPRA registration, renewal, and maintaining your registration as a healthcare professional.",
    content: `
# AHPRA Registration Guide

The Australian Health Practitioner Regulation Agency (AHPRA) is responsible for registering and regulating healthcare practitioners in Australia.

## Registration Types

### 1. General Registration
The standard registration for qualified practitioners who meet all requirements.

### 2. Specialist Registration
For practitioners who have completed specialist training and qualifications.

### 3. Limited Registration
Available for:
- Postgraduate training or supervised practice
- Area of need
- Public interest
- Teaching or research

### 4. Non-Practising Registration
For those not currently practicing but wish to maintain their registration.

## Initial Registration Process

1. **Complete your qualification** recognized by the relevant Board
2. **Gather required documents**:
   - Identity verification
   - Qualification certificates
   - English language evidence
   - Criminal history check
   - Professional indemnity insurance

3. **Submit online application** through AHPRA portal
4. **Pay registration fee**
5. **Await assessment** (typically 4-8 weeks)

## Maintaining Registration

### Annual Renewal
- Renew before your registration expiry date
- Complete required CPD hours
- Declare any relevant matters
- Update contact and practice details

### Continuing Professional Development (CPD)
Requirements vary by profession but generally include:
- Minimum hours per registration period
- Mix of educational activities
- Reflection and planning components

## Common Issues

### Notifications and Complaints
AHPRA manages notifications about practitioner conduct. If you receive a notification:
1. Respond within required timeframes
2. Seek legal advice promptly
3. Cooperate with the investigation
4. Maintain your records

### Conditions on Registration
Conditions may be imposed for:
- Health matters
- Performance concerns
- Conduct issues
- Supervised practice requirements

## Professional Support

If you're facing registration issues or AHPRA matters, early legal advice can help protect your career and registration status.
    `,
    category: "compliance",
    tags: ["AHPRA", "registration", "compliance", "medical practitioners"],
    readTime: 10,
    publishedAt: "2024-02-20",
    updatedAt: "2024-12-01",
    featured: true,
  },
  {
    id: "medical-employee-contracts",
    slug: "medical-employee-contracts-guide",
    title: "Medical Employee Contracts: What Every Practice Owner Should Know",
    excerpt: "Essential clauses, compliance requirements, and best practices for medical practice employment agreements.",
    content: `
# Medical Employee Contracts Guide

Employment contracts in healthcare settings require careful consideration of industry-specific requirements and regulations.

## Essential Contract Elements

### 1. Position and Duties
- Clear role description
- Reporting structure
- Scope of clinical responsibilities
- Administrative duties

### 2. Remuneration
- Base salary or hourly rate
- Medicare billing arrangements
- Bonus structures
- Leave entitlements

### 3. Working Hours
- Standard hours
- On-call requirements
- After-hours expectations
- Rostering arrangements

### 4. Professional Requirements
- AHPRA registration maintenance
- Professional indemnity insurance
- CPD obligations
- Credentialing requirements

## Compliance Considerations

### Modern Award Coverage
Most medical employees are covered by:
- Health Professionals and Support Services Award
- Medical Practitioners Award (for doctors)

### National Employment Standards
All employees are entitled to NES minimums:
- Maximum weekly hours
- Annual leave (4 weeks)
- Personal/carer's leave (10 days)
- Parental leave
- Public holidays

## Special Clauses for Medical Practices

### Restraint of Trade
- Must be reasonable in scope and duration
- Consider geographical limitations
- Define restricted activities clearly

### Intellectual Property
- Patient records remain with the practice
- Clinical protocols and procedures
- Research and publications

### Confidentiality
- Patient information protection
- Practice systems and processes
- Commercial information

## Termination Provisions

Ensure your contract addresses:
- Notice periods (typically 4-12 weeks)
- Grounds for summary dismissal
- Handover requirements
- Post-termination obligations
    `,
    category: "employment",
    tags: ["employment", "contracts", "medical practice", "HR"],
    readTime: 7,
    publishedAt: "2024-01-10",
    updatedAt: "2024-10-15",
    featured: false,
  },
  {
    id: "medical-lease-guide",
    slug: "medical-practice-lease-guide",
    title: "Medical Practice Leases: Essential Guide for Healthcare Providers",
    excerpt: "Key considerations when leasing premises for your medical practice, including fit-out, compliance, and negotiation strategies.",
    content: `
# Medical Practice Lease Guide

Leasing premises for a medical practice involves unique considerations beyond standard commercial leases.

## Location Considerations

### 1. Accessibility
- Public transport access
- Parking availability
- Disability compliance
- Patient demographics

### 2. Zoning and Permits
- Verify medical use is permitted
- Development approval requirements
- Signage restrictions
- Operating hours limitations

## Essential Lease Terms

### Permitted Use
Ensure the lease allows for:
- All intended medical services
- Allied health practitioners
- Ancillary services (pharmacy, pathology)

### Fit-Out Provisions
Consider:
- Make-good obligations
- Landlord contributions
- Approval processes
- Ownership of fixtures

### Medical-Specific Requirements
- Waste management
- Infection control compliance
- Ventilation standards
- Acoustic requirements

## Financial Considerations

### Rent Structure
- Base rent calculation (per sqm)
- Outgoings and their caps
- Rent review mechanisms
- Incentives and rent-free periods

### Additional Costs
Budget for:
- Fit-out costs ($500-2000/sqm typical)
- Compliance upgrades
- Ongoing maintenance
- Insurance requirements

## Negotiation Strategies

### Before Signing
1. Engage a commercial lawyer early
2. Conduct due diligence on the premises
3. Verify all verbal promises in writing
4. Negotiate key terms before detailed drafting

### Key Points to Negotiate
- Lease term and options
- Rent review methodology
- Make-good limitations
- Assignment and subletting rights
- Exclusivity provisions
    `,
    category: "property",
    tags: ["lease", "property", "medical practice", "premises"],
    readTime: 6,
    publishedAt: "2024-04-05",
    updatedAt: "2024-09-20",
    featured: false,
  },
];

export function getArticlesByCategory(categorySlug: string): KnowledgeBaseArticle[] {
  const category = KNOWLEDGE_BASE_CATEGORIES.find((c) => c.slug === categorySlug);
  if (!category) return [];
  return KNOWLEDGE_BASE_ARTICLES.filter((a) => a.category === category.id);
}

export function getArticleBySlug(slug: string): KnowledgeBaseArticle | undefined {
  return KNOWLEDGE_BASE_ARTICLES.find((a) => a.slug === slug);
}

export function getFeaturedArticles(): KnowledgeBaseArticle[] {
  return KNOWLEDGE_BASE_ARTICLES.filter((a) => a.featured);
}

export function searchArticles(query: string): KnowledgeBaseArticle[] {
  const lowerQuery = query.toLowerCase();
  return KNOWLEDGE_BASE_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(lowerQuery) ||
      a.excerpt.toLowerCase().includes(lowerQuery) ||
      a.tags.some((t) => t.toLowerCase().includes(lowerQuery))
  );
}
