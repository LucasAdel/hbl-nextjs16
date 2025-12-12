/**
 * Bailey AI Knowledge Base - Hamilton Bailey Law Firm
 *
 * Comprehensive knowledge base containing all Hamilton Bailey-specific information
 * (76 entries total)
 *
 * Categories covered:
 * - Company information (overview, principal, contact, offices)
 * - Services (Tenant Doctor™, payroll tax, commercial law, audits, pathology)
 * - Compliance (AHPRA, Fair Work, risk indicators, regulatory, Medicare)
 * - Expertise (case law: Thomas/Naaz, Optical Superstore, Hollis v Vabu, etc.)
 * - Partnerships (Health and Life, David Dahm clarification)
 * - Resources (library, educational, technology)
 * - Medical Practice Types (GP, specialist, allied health, dental, etc.)
 * - State-specific (SA, NSW, VIC, QLD, TAS variations)
 * - Common Scenarios (practice sale, new practice, restructuring)
 * - FAQ (common questions, objections, concerns)
 */

import { KnowledgeItem, CHAT_XP_REWARDS } from "../types";

// Re-export types for convenience
export type { KnowledgeItem };

export const KNOWLEDGE_BASE: KnowledgeItem[] = [
  // ============================================
  // CORE COMPANY INFORMATION (from bailey-ai-knowledge-update.ts)
  // ============================================

  // 1. Company Overview
  {
    id: "company-overview",
    category: "company",
    subcategory: "overview",
    topic: "about hamilton bailey",
    title: "About Hamilton Bailey Law Firm",
    content: "Hamilton Bailey is a boutique medical law firm specialising in commercial medical practice legal matters. We operate from two offices - our main office in Adelaide at Level 2/147 Pirie Street, and our international office in Dubai. We focus on providing pragmatic legal solutions that are both practical and timely for medical practitioners.",
    summary: "Boutique medical law firm with offices in Adelaide and Dubai, specialising in medical practice compliance and commercial law.",
    keywords: ["hamilton bailey", "law firm", "about us", "medical law", "adelaide", "dubai", "boutique", "who are you"],
    intentPatterns: ["about hamilton bailey", "tell me about", "who are you", "what do you do", "about the firm"],
    responseTemplate: "Hamilton Bailey is a boutique medical law firm specialising in commercial medical practice legal matters. We have offices in Adelaide (Level 2/147 Pirie Street) and Dubai, focusing on pragmatic legal solutions for healthcare professionals.\n\nOur expertise includes Tenant Doctor™ arrangements (we are exclusively licensed to use this trademark in legal documents), payroll tax compliance, medical practice structuring, and commercial property law.\n\nWould you like to know more about our specific services or book a consultation?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 15,
    metadata: { office_hours: "Monday-Friday 9AM-5PM (Adelaide)" }
  },

  // 2. Principal Lawyer
  {
    id: "principal-lawyer",
    category: "team",
    subcategory: "principal",
    topic: "lukasz wyszynski",
    title: "Lukasz Wyszynski - Principal Lawyer",
    content: "Lukasz Wyszynski is the principal lawyer at Hamilton Bailey Law Firm. He leads our specialised medical practice law team and has extensive experience in healthcare compliance, commercial law, and regulatory matters affecting medical practitioners.",
    summary: "Lukasz Wyszynski is the principal lawyer at Hamilton Bailey, specialising in medical practice law and healthcare compliance.",
    keywords: ["lukasz", "wyszynski", "principal", "lawyer", "team", "who is", "founder"],
    intentPatterns: ["who is lukasz", "principal lawyer", "who runs", "founder", "who started"],
    responseTemplate: "Lukasz Wyszynski is the principal lawyer at Hamilton Bailey Law Firm. He leads our team in providing specialised legal services to medical practitioners across Australia.\n\nLukasz has extensive experience in:\n• Tenant Doctor™ arrangements and structuring\n• Payroll tax compliance and defence\n• Medical practice commercial law\n• Healthcare regulatory compliance\n\nWould you like to schedule a consultation with Lukasz or learn more about how our team can assist with your legal needs?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 15,
    metadata: { role: "Principal Lawyer" }
  },

  // 3. Tenant Doctor Trademark
  {
    id: "tenant-doctor",
    category: "services",
    subcategory: "tenant-doctor",
    topic: "tenant doctor arrangements",
    title: "Tenant Doctor™ Arrangements",
    content: "Hamilton Bailey is exclusively licensed to use the Tenant Doctor™ trademark in legal documents within Australia and specialises in structuring independent practitioner arrangements that comply with payroll tax regulations. We help Facilities Service Providers structure arrangements so they are deemed not eligible for payroll tax while maintaining operational efficiency.",
    summary: "We are exclusively licensed to use the Tenant Doctor™ trademark and specialise in compliant independent practitioner arrangements.",
    keywords: ["tenant doctor", "trademark", "independent contractor", "payroll tax", "practitioner arrangements", "contractor"],
    intentPatterns: ["tenant doctor", "independent contractor", "practitioner arrangement", "contractor structure"],
    responseTemplate: "Hamilton Bailey is exclusively licensed to use the Tenant Doctor™ trademark in legal documents within Australia. We specialise in structuring these arrangements to help Facilities Service Providers:\n\n• Be deemed not eligible for payroll tax (liabilities can exceed $250,000)\n• Maintain compliant independent contractor relationships\n• Navigate the 'triple regulatory threat' from ATO, State Revenue, and Fair Work\n• Structure operations for maximum efficiency\n\nOur expertise is based on recent case law including Thomas and Naaz [2022] and established precedents. Would you like to discuss how Tenant Doctor™ arrangements could benefit your Facilities Service Provider entity?",
    requiresDisclaimer: true,
    legalDisclaimer: "Each practice's situation is unique. Specific advice should be obtained regarding your particular circumstances.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["tenant-doctor-package"],
    xpReward: 30,
    metadata: { trademark: "Tenant Doctor™", risk_amount: "$250,000+" }
  },

  // 4. Payroll Tax Compliance
  {
    id: "payroll-tax",
    category: "services",
    subcategory: "payroll-tax",
    topic: "payroll tax compliance",
    title: "Payroll Tax Compliance for Facilities Service Providers",
    content: "We specialise in payroll tax compliance for Facilities Service Providers, including risk assessments, audit defence, and restructuring to ensure FSPs are not eligible for retrospective assessments that can exceed $250,000 excluding penalties.",
    summary: "Expert payroll tax compliance services to protect Facilities Service Providers from significant financial liabilities.",
    keywords: ["payroll tax", "compliance", "audit", "state revenue", "tax liability", "facilities service provider", "assessment"],
    intentPatterns: ["payroll tax", "tax compliance", "state revenue", "tax audit", "tax liability"],
    responseTemplate: "Payroll tax compliance is critical for Facilities Service Providers as liabilities can exceed $250,000, not including penalties and interest. We provide:\n\n• Risk assessments to identify potential exposures\n• Audit defence and State Revenue Office negotiations\n• Restructuring to achieve compliance\n• Preventive strategies based on recent cases like Thomas and Naaz [2022]\n\nMany Facilities Service Providers are unaware they may have retrospective liabilities going back several years. Would you like a confidential assessment of your FSP's payroll tax position?",
    requiresDisclaimer: true,
    legalDisclaimer: "Tax outcomes depend on individual circumstances. Professional advice should be obtained.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["payroll-tax-review"],
    xpReward: 35,
    metadata: { typical_liability: "$250,000+", key_cases: ["Thomas and Naaz [2022]", "Optical Superstore [2019]"] }
  },

  // 5. Commercial Medical Practice Law
  {
    id: "commercial-law",
    category: "services",
    subcategory: "commercial-law",
    topic: "commercial law services",
    title: "Commercial Medical Practice Law",
    content: "We provide comprehensive commercial law services for medical practices including service entity structuring, practice agreements, Fair Work compliance, commercial property leasing, and corporate governance.",
    summary: "Full-service commercial law support tailored specifically for medical practices and healthcare businesses.",
    keywords: ["commercial law", "medical practice", "contracts", "agreements", "fair work", "employment", "business law"],
    intentPatterns: ["commercial law", "business legal", "practice agreements", "contracts"],
    responseTemplate: "Our commercial medical practice law services cover all aspects of running a compliant and efficient medical business:\n\n• Service entity structuring and practice agreements\n• Employment contracts and Fair Work Act compliance\n• Commercial property leases (including pathology agreements)\n• Partnership and associate agreements\n• Corporate governance and regulatory compliance\n\nWe understand the unique challenges medical practices face and provide practical, fixed-fee solutions. What specific commercial law matters can we help you with?",
    requiresDisclaimer: true,
    legalDisclaimer: "Commercial matters require specific advice based on your circumstances.",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 25,
    metadata: { service_type: "commercial", pricing: "fixed-fee available" }
  },

  // 6. Contact Information
  {
    id: "contact-info",
    category: "contact",
    subcategory: "details",
    topic: "contact details",
    title: "Contact Hamilton Bailey",
    content: "Adelaide Office: Level 2/147 Pirie Street, Adelaide SA 5000. Phone: (08) 8121 5167. Email: admin@hamiltonbailey.com.au. Dubai Office: Level 17/38 Sheikh Zayed Road, Dubai, UAE.",
    summary: "Contact us at our Adelaide or Dubai offices for expert legal assistance.",
    keywords: ["contact", "phone", "email", "address", "office", "location", "hours", "call", "reach"],
    intentPatterns: ["contact", "get in touch", "speak to someone", "call", "email", "phone number", "address"],
    responseTemplate: "Here's how you can reach Hamilton Bailey Law Firm:\n\n**Adelaide Office**\nLevel 2/147 Pirie Street, Adelaide SA 5000\nPhone: (08) 8121 5167\nEmail: admin@hamiltonbailey.com.au\nHours: Monday-Friday 9AM-5PM\n\n**Dubai Office**\nLevel 17/38 Sheikh Zayed Road, Dubai, UAE\nExtended hours for international clients\n\nWould you like me to help you book a consultation or would you prefer to call directly?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 10,
    metadata: { primary_phone: "(08) 8121 5167", email: "admin@hamiltonbailey.com.au" }
  },

  // 7. Pricing and Fees
  {
    id: "pricing-info",
    category: "pricing",
    subcategory: "structure",
    topic: "legal fees",
    title: "Legal Fees and Pricing",
    content: "Hamilton Bailey offers transparent, fixed-fee pricing for standard services. We provide written quotes after preliminary analysis with no hidden costs. Our pricing model ensures cost certainty for medical practices.",
    summary: "Transparent fixed-fee pricing with written quotes and no hidden costs.",
    keywords: ["pricing", "fees", "cost", "fixed fee", "quote", "legal fees", "how much", "price"],
    intentPatterns: ["how much", "price", "cost", "pricing", "fees", "quote"],
    responseTemplate: "Hamilton Bailey believes in transparent pricing for our legal services:\n\n• **Fixed-fee pricing** for standard services\n• **Written quotes** provided after preliminary assessment\n• **No hidden costs** - all fees disclosed upfront\n• **Project-based billing** for complex matters\n\nOur fixed-fee approach gives you cost certainty, which is especially important for medical practices managing their budgets. Would you like a quote for a specific service?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 15,
    metadata: { pricing_model: "fixed-fee", quote_process: "after preliminary analysis" }
  },

  // 8. Legal Expertise and Cases
  {
    id: "legal-expertise",
    category: "expertise",
    subcategory: "cases",
    topic: "case law expertise",
    title: "Legal Expertise and Recent Cases",
    content: "Our expertise is grounded in recent case law including Thomas and Naaz [2022], Optical Superstore [2019], and established precedents like Hollis v Vabu [2001]. We stay current with evolving payroll tax interpretations and regulatory changes.",
    summary: "Deep expertise based on recent case law and evolving regulatory interpretations.",
    keywords: ["case law", "expertise", "thomas naaz", "optical superstore", "hollis vabu", "precedent", "experience"],
    intentPatterns: ["experience", "expertise", "case law", "qualifications", "why choose"],
    responseTemplate: "Our legal strategies are informed by the latest case law and regulatory developments:\n\n• **Thomas and Naaz [2022]** - Recent payroll tax precedent\n• **Optical Superstore [2019]** - Contractor classification principles\n• **Hollis v Vabu [2001]** - Foundational independent contractor law\n\nWe understand how these cases impact medical practices and can help you navigate the evolving regulatory landscape. The interpretations are constantly changing, which is why specialised expertise is crucial.\n\nWould you like to discuss how recent cases might affect your practice?",
    requiresDisclaimer: true,
    legalDisclaimer: "Case law application depends on specific circumstances.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 20,
    metadata: { key_cases: ["Thomas and Naaz [2022]", "Optical Superstore [2019]", "Hollis v Vabu [2001]"] }
  },

  // 9. Triple Regulatory Threat
  {
    id: "triple-threat",
    category: "compliance",
    subcategory: "regulatory",
    topic: "triple regulatory threat",
    title: "Triple Regulatory Contractor Threat",
    content: "Medical practices face a 'triple regulatory threat' from State Revenue Office (payroll tax), Australian Taxation Office (income tax/GST), and Fair Work Commission (employment classification). We help navigate all three regulatory bodies.",
    summary: "Expert navigation of the triple regulatory threat facing medical practices.",
    keywords: ["regulatory", "compliance", "ato", "state revenue", "fair work", "triple threat", "regulators"],
    intentPatterns: ["triple threat", "regulatory risk", "compliance risk", "ato audit", "fair work"],
    responseTemplate: "Medical practices face what we call the 'Triple Regulatory Contractor Threat':\n\n1. **State Revenue Office** - Payroll tax compliance and audits\n2. **Australian Taxation Office** - Income tax and GST obligations\n3. **Fair Work Commission** - Employment vs contractor classification\n\nEach regulator has different tests and requirements, creating a complex compliance environment. One misstep can trigger investigations from multiple authorities.\n\nWe help practices navigate all three regulatory bodies with comprehensive compliance strategies. Would you like to assess your practice's exposure to these regulatory risks?",
    requiresDisclaimer: true,
    legalDisclaimer: "Regulatory requirements vary and professional advice should be obtained.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["compliance-review"],
    xpReward: 30,
    metadata: { regulators: ["State Revenue Office", "ATO", "Fair Work Commission"] }
  },

  // 10. International Services
  {
    id: "international-services",
    category: "services",
    subcategory: "international",
    topic: "international legal services",
    title: "International Legal Services",
    content: "With offices in Adelaide and Dubai, we provide international legal services for Australian medical practitioners with global interests, including cross-border practice considerations and extended operating hours.",
    summary: "International legal services through our Adelaide and Dubai offices.",
    keywords: ["international", "dubai", "global", "cross border", "overseas", "international office"],
    intentPatterns: ["international", "dubai office", "overseas", "global services"],
    responseTemplate: "Hamilton Bailey offers international legal services through our two offices:\n\n• **Adelaide Office** - Serving Australian medical practitioners\n• **Dubai Office** - Supporting practitioners with international interests\n\nOur Dubai office provides:\n• Extended operating hours for different time zones\n• Cross-border practice structuring\n• International compliance considerations\n• Support for Australian practitioners working overseas\n\nDo you have international practice interests we can assist with?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 20,
    metadata: { offices: ["Adelaide", "Dubai"], international: true }
  },

  // ============================================
  // COMPREHENSIVE KNOWLEDGE (from bailey-ai-knowledge-comprehensive.ts)
  // ============================================

  // 11. Health and Life Partnership
  {
    id: "health-and-life",
    category: "partnerships",
    subcategory: "health-and-life",
    topic: "health and life partnership",
    title: "Health and Life Partnership",
    content: "Hamilton Bailey partners with Health and Life, Australia's leading healthcare accounting firm founded in 1991. Health and Life has 34+ years of experience, 1,200+ medical practice clients, and operates from Adelaide with offices in Queensland and Victoria. CEO David Dahm (CA, FCPA, CTA) leads their team of 60 specialists.",
    summary: "Strategic partnership with Health and Life, Australia's premier healthcare accounting firm serving 1,200+ medical practices.",
    keywords: ["health and life", "partnership", "david dahm", "accounting", "collaboration", "accountant"],
    intentPatterns: ["health and life", "accounting partner", "david dahm", "accounting firm"],
    responseTemplate: "Hamilton Bailey has a strategic partnership with Health and Life, Australia's leading healthcare accounting firm:\n\n**About Health and Life:**\n• Founded 1991 (34+ years of healthcare expertise)\n• 1,200+ medical practice clients nationally\n• 60 specialist staff across Adelaide, Queensland, Victoria\n• CEO: David Dahm (CA, FCPA, CTA, former AGPAL surveyor)\n• 55% annual growth since 2007\n\n**Partnership Benefits:**\n• Comprehensive legal + accounting solutions\n• Tenant Doctor™ arrangements with financial optimization\n• Integrated compliance strategies\n• Doctors Pay Calculator™ integration\n\nThis partnership provides complete business solutions for medical practices. Would you like to know more about our integrated services?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 20,
    metadata: { partner_since: "2020", client_base: "1200+" }
  },

  // 12. Doctors Pay Calculator
  {
    id: "doctors-pay-calculator",
    category: "technology",
    subcategory: "doctors-pay-calculator",
    topic: "doctors pay calculator",
    title: "Doctors Pay Calculator™ Technology",
    content: "The Doctors Pay Calculator™ is proprietary technology developed by Health and Life, available from $70 per practitioner per month. It provides automated income calculations, government grants integration, Xero accounting integration, and encrypted cloud agreements. It has applied for national ATO Class Tax Ruling.",
    summary: "Proprietary automated payment calculation technology for medical practices, integrated with our legal services.",
    keywords: ["doctors pay calculator", "technology", "automation", "payments", "david dahm", "calculator"],
    intentPatterns: ["doctors pay calculator", "payment calculator", "automated payments", "pay calculator"],
    responseTemplate: "The Doctors Pay Calculator™ is innovative technology from our partner Health and Life:\n\n**Key Features:**\n• Automated practitioner payment calculations\n• Government grants and incentives integration\n• Xero accounting system integration\n• Encrypted cloud-based agreements\n• Database-driven accuracy\n\n**Pricing:** From $70 per practitioner per month\n\n**Regulatory Status:** Applied for national ATO Class Tax Ruling\n\n**Integration with Legal Services:**\nWe integrate this technology with our Tenant Doctor™ arrangements to ensure both legal compliance and financial optimization.\n\nWould you like a demonstration of how this technology can streamline your practice operations?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: ["doctors-pay-calculator"],
    xpReward: 25,
    metadata: { pricing_from: "$70/practitioner/month", developer: "Health and Life" }
  },

  // 13. Payroll Tax Risk Indicators
  {
    id: "risk-indicators",
    category: "compliance",
    subcategory: "risk-indicators",
    topic: "risk indicators",
    title: "Payroll Tax Risk Indicators",
    content: "Key risk indicators include using terms like 'our doctors', 'staff doctors', 'medical team', or 'our practitioners' which imply employment. Also risky: 'medical centre policies', 'practice procedures', 'staff meetings', 'performance reviews'. Safer alternatives: 'independent practitioners', 'tenant doctors', 'visiting practitioners'.",
    summary: "Critical language patterns that trigger payroll tax risks and compliant alternatives.",
    keywords: ["risk indicators", "compliance language", "payroll tax risk", "terminology", "language", "red flags"],
    intentPatterns: ["risk indicators", "risky language", "what to avoid", "compliance language"],
    responseTemplate: "Understanding payroll tax risk indicators is crucial for medical practices. Here are the key patterns:\n\n**HIGH-RISK LANGUAGE (Avoid):**\n• \"Our doctors\" → Use \"Independent practitioners\"\n• \"Staff doctors\" → Use \"Tenant doctors\"\n• \"Medical team\" → Use \"Visiting practitioners\"\n• \"Our practitioners\" → Use \"Associated practitioners\"\n• \"Staff meetings\" → Use \"Practitioner forums\"\n• \"Performance reviews\" → Use \"Quality discussions\"\n\n**WHY IT MATTERS:**\nThese terms can indicate employment relationships to State Revenue Offices, potentially triggering payroll tax liabilities exceeding $250,000.\n\n**COMPLIANCE TIP:**\nReview all practice documentation, websites, and communications to ensure compliant language.\n\nWould you like us to review your practice's documentation for risk indicators?",
    requiresDisclaimer: true,
    legalDisclaimer: "Compliance requirements depend on specific circumstances.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["compliance-review"],
    xpReward: 35,
    metadata: { risk_level: "high", typical_exposure: "$250,000+" }
  },

  // 14. Market Intelligence
  {
    id: "market-intelligence",
    category: "market",
    subcategory: "intelligence",
    topic: "market trends",
    title: "Healthcare Legal Market Intelligence",
    content: "The healthcare legal services market is experiencing increased demand due to regulatory complexity. Key trends: rising payroll tax audits, contractor classification challenges, Fair Work investigations. Specialization in healthcare law commands premium positioning over generalist firms.",
    summary: "Market intelligence showing increased demand for specialised healthcare legal services.",
    keywords: ["market trends", "industry analysis", "healthcare law market", "demand", "trends"],
    intentPatterns: ["market trends", "industry trends", "healthcare legal market"],
    responseTemplate: "The healthcare legal services market is evolving rapidly:\n\n**Key Market Trends:**\n• Increased State Revenue payroll tax audits\n• Rising Fair Work contractor investigations\n• Growing regulatory complexity\n• Medical practices seeking specialised expertise\n\n**Market Positioning:**\n• Specialized healthcare lawyers command premium over generalists\n• Integrated legal-accounting solutions in high demand\n• Technology-enabled compliance gaining traction\n• Fixed-fee pricing preferred by medical practices\n\n**Hamilton Bailey Advantages:**\n• Tenant Doctor™ trademark ownership\n• Health and Life partnership (1,200+ clients)\n• International presence (Dubai office)\n• Specialized expertise vs generalist competitors\n\nHow can we help position your practice for success in this evolving landscape?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 9,
    relatedProducts: [],
    xpReward: 20,
    metadata: { market_growth: "increasing", specialization_premium: "high" }
  },

  // 15. Thought Leadership
  {
    id: "thought-leadership",
    category: "expertise",
    subcategory: "thought-leadership",
    topic: "thought leadership",
    title: "Industry Thought Leadership",
    content: "Hamilton Bailey and Health and Life are recognized thought leaders. David Dahm has conducted 950+ presentations, co-authored Australia's first national GP GST Guide (2000), and contributed 460+ articles to major publications including AFR, The Australian, and Medical Journal of Australia.",
    summary: "Recognized thought leadership through extensive publications, presentations, and industry contributions.",
    keywords: ["thought leadership", "publications", "presentations", "david dahm", "expertise", "articles"],
    intentPatterns: ["thought leadership", "publications", "industry expertise", "recognition"],
    responseTemplate: "Hamilton Bailey benefits from strategic thought leadership through our Health and Life partnership:\n\n**David Dahm's Contributions:**\n• 950+ industry presentations delivered\n• Co-authored Australia's first GP GST Guide (2000)\n• 460+ articles in major publications\n• Regular Medical Observer contributor (22,000 doctors)\n• 2019-2020 National Telstra Business Women Judge\n\n**Media Presence:**\n• The Australian Financial Review\n• The Australian\n• Sydney Morning Herald\n• Medical Journal of Australia\n\n**Awards:**\n• 2011 Telstra Award Winner\n• SA Small Business of the Year\n• Xero National Partner of the Year\n\nThis thought leadership ensures our advice is based on deep industry knowledge. How can we share this expertise with your practice?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 20,
    metadata: { presentations: "950+", articles: "460+" }
  },

  // 16. Service Entity Structures
  {
    id: "service-entity",
    category: "services",
    subcategory: "structures",
    topic: "practice structures",
    title: "Service Entity and Practice Structures",
    content: "We specialise in designing compliant service entity structures that separate clinical operations from business services. This includes trust structures, corporate entities, partnership arrangements, and integrated compliance frameworks that satisfy all regulatory requirements.",
    summary: "Expert design of compliant service entity and practice structures for medical businesses.",
    keywords: ["service entity", "practice structure", "trust", "corporate structure", "compliance", "structuring"],
    intentPatterns: ["service entity", "practice structure", "trust structure", "corporate structure"],
    responseTemplate: "Service entity structuring is crucial for modern medical practices:\n\n**Our Structural Solutions:**\n• Service entity separation (clinical vs business)\n• Trust structures for asset protection\n• Corporate entity optimization\n• Partnership and associate frameworks\n• Integrated compliance design\n\n**Benefits:**\n• Payroll tax optimization\n• Asset protection\n• Operational efficiency\n• Regulatory compliance\n• Tax effectiveness\n\n**Recent Changes:**\nPost Thomas and Naaz [2022], proper structuring is more critical than ever. We ensure your structure meets current regulatory interpretations.\n\nWould you like a confidential review of your current practice structure?",
    requiresDisclaimer: true,
    legalDisclaimer: "Structuring advice depends on individual circumstances and professional advice should be obtained.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["structure-review"],
    xpReward: 30,
    metadata: { structure_types: ["service entity", "trust", "corporate", "partnership"] }
  },

  // 17. Fair Work Compliance
  {
    id: "fair-work",
    category: "compliance",
    subcategory: "fair-work",
    topic: "fair work compliance",
    title: "Fair Work Act Compliance",
    content: "Fair Work Act compliance for medical practices includes proper contractor vs employee classification, minimum entitlement compliance, award coverage assessment, and workplace policies. Misclassification can result in back-pay claims, penalties, and reputation damage.",
    summary: "Comprehensive Fair Work Act compliance to prevent employee misclassification and penalties.",
    keywords: ["fair work", "employment law", "contractor", "employee", "classification", "employment"],
    intentPatterns: ["fair work", "employment compliance", "employee contractor", "misclassification"],
    responseTemplate: "Fair Work Act compliance is the third pillar of the 'triple regulatory threat':\n\n**Key Compliance Areas:**\n• Contractor vs employee classification\n• Minimum wage and entitlement compliance\n• Award coverage determination\n• Workplace policies and procedures\n• Termination and redundancy obligations\n\n**Risks of Non-Compliance:**\n• Back-pay claims for entitlements\n• Penalties up to $66,600 per breach\n• Reputation damage\n• Class action exposure\n\n**Our Approach:**\nWe ensure your practitioner arrangements satisfy Fair Work tests while maintaining commercial flexibility. This integrates with our Tenant Doctor™ structures.\n\nDo you need a Fair Work compliance assessment for your practice?",
    requiresDisclaimer: true,
    legalDisclaimer: "Employment law is complex and professional advice should be obtained.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["fair-work-review"],
    xpReward: 30,
    metadata: { max_penalty: "$66,600 per breach", legislation: "Fair Work Act 2009" }
  },

  // 18. Property and Leasing
  {
    id: "property-leasing",
    category: "services",
    subcategory: "property",
    topic: "commercial property",
    title: "Medical Practice Property and Leasing",
    content: "We provide specialised commercial property services for medical practices including lease negotiations, pathology collection room agreements, pharmacy arrangements, medical centre purchases, and property investment structuring. Medical leases have unique requirements.",
    summary: "Expert commercial property and leasing services tailored for medical practices.",
    keywords: ["property", "lease", "commercial", "pathology", "medical centre", "real estate", "rent"],
    intentPatterns: ["property lease", "medical centre lease", "commercial property", "rent agreement"],
    responseTemplate: "Medical practice property matters require specialised expertise:\n\n**Our Property Services:**\n• Medical centre lease negotiations\n• Pathology collection room agreements\n• Pharmacy co-location arrangements\n• Practice purchase and sale\n• Property investment structuring\n• Lease dispute resolution\n\n**Key Considerations:**\n• Permitted use and council approvals\n• Assignment and subletting rights\n• Make-good obligations\n• Rent review mechanisms\n• Incentive documentation\n• Compliance with health regulations\n\n**Why Specialized Advice Matters:**\nMedical leases have unique terms that general commercial lawyers often miss. We understand the healthcare property market.\n\nDo you have a property matter we can assist with?",
    requiresDisclaimer: true,
    legalDisclaimer: "Property matters require specific advice based on the particular lease and circumstances.",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 25,
    metadata: { property_types: ["medical centre", "pathology", "pharmacy", "consulting rooms"] }
  },

  // 19. Audit Defense
  {
    id: "audit-defense",
    category: "services",
    subcategory: "audit-defense",
    topic: "audit defence",
    title: "Audit Defense and Regulatory Investigations",
    content: "We provide comprehensive audit defence services for State Revenue Office payroll tax audits, ATO reviews, Fair Work investigations, and Medicare audits. Our strategic approach includes early intervention, documentation review, negotiation strategies, and settlement optimization.",
    summary: "Expert defense against regulatory audits and investigations with proven negotiation strategies.",
    keywords: ["audit", "defense", "investigation", "state revenue", "ato", "negotiation", "audit notice"],
    intentPatterns: ["audit defence", "audit notice", "investigation", "state revenue audit", "ato audit"],
    responseTemplate: "Facing a regulatory audit or investigation? We provide expert defense:\n\n**Audit Defense Services:**\n• State Revenue Office payroll tax audits\n• ATO income tax and GST reviews\n• Fair Work contractor investigations\n• Medicare billing audits\n• WorkCover premium audits\n\n**Our Strategic Approach:**\n1. Early intervention to control narrative\n2. Comprehensive documentation review\n3. Legal privilege protection\n4. Strategic negotiation\n5. Settlement optimization\n\n**Recent Success:**\nWe've helped practices reduce proposed assessments by up to 75% through effective representation and negotiation.\n\n**Urgent Response:**\nAudit notices have strict deadlines. Contact us immediately if you've received one.\n\nHave you received an audit notice we should review?",
    requiresDisclaimer: true,
    legalDisclaimer: "Audit outcomes depend on individual circumstances.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["audit-defense"],
    xpReward: 40,
    metadata: { response_time: "urgent", success_rate: "up to 75% reduction" }
  },

  // 20. Technology Integration
  {
    id: "technology-integration",
    category: "technology",
    subcategory: "integration",
    topic: "technology integration",
    title: "Legal Technology and Practice Management Integration",
    content: "We integrate legal compliance with practice management technology including Xero accounting, practice management systems, document automation, compliance tracking tools, and the Doctors Pay Calculator™. This creates seamless operational compliance.",
    summary: "Technology integration for seamless legal compliance and practice management efficiency.",
    keywords: ["technology", "integration", "xero", "practice management", "automation", "software"],
    intentPatterns: ["technology integration", "xero integration", "practice management", "automation"],
    responseTemplate: "Modern medical practices need integrated legal and technology solutions:\n\n**Our Technology Integration:**\n• Xero accounting system compliance setup\n• Practice management software configuration\n• Document automation templates\n• Compliance tracking dashboards\n• Doctors Pay Calculator™ integration\n\n**Benefits:**\n• Automated compliance monitoring\n• Real-time risk alerts\n• Streamlined documentation\n• Reduced administrative burden\n• Enhanced accuracy\n\n**Partner Technologies:**\nThrough Health and Life, we access cutting-edge healthcare technology including their proprietary Doctors Pay Calculator™.\n\nWould you like to see how technology can enhance your practice's compliance?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 9,
    relatedProducts: [],
    xpReward: 20,
    metadata: { key_integrations: ["Xero", "Doctors Pay Calculator", "Practice Management Systems"] }
  },

  // 21. Risk Assessment
  {
    id: "risk-assessment",
    category: "services",
    subcategory: "risk-assessment",
    topic: "risk assessment",
    title: "Comprehensive Risk Assessment",
    content: "Our risk assessment service evaluates payroll tax exposure, contractor classification risks, Fair Work compliance gaps, regulatory investigation likelihood, and financial impact quantification. We provide a detailed report with mitigation strategies.",
    summary: "Thorough risk assessment identifying compliance gaps and quantifying potential exposures.",
    keywords: ["risk assessment", "compliance review", "exposure", "evaluation", "risk management", "review"],
    intentPatterns: ["risk assessment", "compliance review", "risk evaluation", "assess my practice"],
    responseTemplate: "Our comprehensive risk assessment service helps medical practices understand their exposure:\n\n**Assessment Scope:**\n• Payroll tax liability calculation (often $250,000+)\n• Contractor vs employee classification review\n• Fair Work Act compliance gaps\n• Regulatory investigation triggers\n• Financial impact modeling\n\n**Process:**\n1. Confidential documentation review\n2. Practice structure analysis\n3. Risk quantification\n4. Mitigation strategy development\n5. Implementation roadmap\n\n**Deliverables:**\n• Detailed risk assessment report\n• Financial exposure calculations\n• Priority action plan\n• Ongoing monitoring framework\n\n**Investment:** Fixed fee based on practice size\n\nWould you like to schedule a confidential risk assessment?",
    requiresDisclaimer: true,
    legalDisclaimer: "Risk assessments are based on available information and professional advice should be obtained.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["risk-assessment"],
    xpReward: 35,
    metadata: { typical_exposure: "$250,000+", assessment_type: "comprehensive" }
  },

  // 22. Educational Resources
  {
    id: "educational-resources",
    category: "resources",
    subcategory: "education",
    topic: "educational resources",
    title: "Educational Resources and Training",
    content: "We provide educational resources including compliance webinars, practice management workshops, regulatory update briefings, template libraries, and best practice guides. Education is key to maintaining ongoing compliance.",
    summary: "Comprehensive educational resources to keep medical practices informed and compliant.",
    keywords: ["education", "training", "webinar", "resources", "learning", "workshops", "guides"],
    intentPatterns: ["educational resources", "training", "webinar", "learn more", "resources"],
    responseTemplate: "Stay informed with our educational resources:\n\n**Available Resources:**\n• Monthly compliance webinars\n• Practice management workshops\n• Regulatory update newsletters\n• Template document libraries\n• Best practice implementation guides\n\n**Recent Topics:**\n• \"Post Thomas and Naaz Compliance\"\n• \"Tenant Doctor™ Implementation\"\n• \"Payroll Tax Risk Mitigation\"\n• \"Fair Work Classification Tests\"\n• \"Practice Structure Optimization\"\n\n**Access:**\n• Free for existing clients\n• Individual session bookings available\n• Customized practice training\n\n**CPD Points:**\nMany sessions qualify for professional development points.\n\nWould you like to join our next educational session?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 9,
    relatedProducts: [],
    xpReward: 15,
    metadata: { frequency: "monthly", cpd_eligible: true }
  },

  // 23. Emergency Response
  {
    id: "emergency-response",
    category: "services",
    subcategory: "emergency",
    topic: "urgent matters",
    title: "Urgent Legal Response Services",
    content: "We provide urgent response services for regulatory investigations, audit notices, employment disputes, compliance breaches, and crisis management. Time-critical matters receive immediate attention with 24-hour initial response.",
    summary: "Immediate legal response for urgent regulatory and compliance matters.",
    keywords: ["urgent", "emergency", "immediate", "crisis", "24 hour", "rapid response", "help now"],
    intentPatterns: ["urgent", "emergency", "immediate help", "crisis", "need help now", "audit received"],
    responseTemplate: "Facing an urgent legal matter? We provide rapid response:\n\n**Emergency Services:**\n• Regulatory investigation response (24hr)\n• Audit notice strategy\n• Employment dispute management\n• Compliance breach mitigation\n• Crisis communications\n\n**Our Urgent Response Process:**\n1. Immediate telephone consultation\n2. Document preservation protocols\n3. Regulatory engagement strategy\n4. Damage mitigation actions\n5. Long-term resolution planning\n\n**Why Timing Matters:**\n• Audit responses have strict deadlines\n• Early intervention improves outcomes\n• Preserving legal privilege is critical\n\n**Contact for Urgent Matters:**\nPhone: (08) 8121 5167\nEmail: admin@hamiltonbailey.com.au\n\nDo you have an urgent matter requiring immediate attention?",
    requiresDisclaimer: true,
    legalDisclaimer: "Urgent matters require immediate professional advice.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 25,
    metadata: { response_time: "24 hours", contact_priority: "high" }
  },

  // 24. Success Stories
  {
    id: "success-stories",
    category: "expertise",
    subcategory: "success-stories",
    topic: "client outcomes",
    title: "Client Success Stories",
    content: "Our clients have achieved significant outcomes including 75% reduction in proposed payroll tax assessments, successful Tenant Doctor™ implementations resulting in non-eligibility for $250,000+ liabilities, Fair Work investigation dismissals, and optimised practice structures saving thousands annually.",
    summary: "Proven track record of achieving significant positive outcomes for medical practice clients.",
    keywords: ["success stories", "case studies", "results", "outcomes", "testimonials", "track record"],
    intentPatterns: ["success stories", "results", "outcomes", "case studies", "track record"],
    responseTemplate: "Our track record speaks for itself:\n\n**Recent Client Successes:**\n\n✓ **Payroll Tax Victory**\nReduced proposed assessment from $340,000 to $85,000 through strategic negotiation and restructuring.\n\n✓ **Tenant Doctor™ Implementation**\nMedical centre achieved non-eligibility for $250,000+ liability by transitioning to compliant structure before audit.\n\n✓ **Fair Work Defence**\nSuccessfully defended contractor classifications, protecting against back-pay claims and penalties.\n\n✓ **Practice Sale Optimisation**\nStructured sale to maximise after-tax proceeds while ensuring compliance.\n\n**Common Results:**\n• 50-75% reduction in proposed assessments\n• Achieved non-eligibility for retrospective liabilities\n• Improved operational efficiency\n• Enhanced compliance confidence\n\nWould you like to discuss how we can achieve similar results for your practice?",
    requiresDisclaimer: true,
    legalDisclaimer: "Past results do not guarantee future outcomes. Each matter depends on its specific circumstances.",
    adviceLevel: "general",
    confidenceLevel: 9,
    relatedProducts: [],
    xpReward: 20,
    metadata: { average_savings: "50-75%", success_rate: "high" }
  },

  // ============================================
  // ADDITIONAL KNOWLEDGE (from bailey-legal-bloom knowledge-base)
  // ============================================

  // 25. AHPRA Annual Declarations
  {
    id: "ahpra-declarations",
    category: "compliance",
    subcategory: "ahpra",
    topic: "ahpra annual declarations",
    title: "AHPRA Annual Declaration Requirements",
    content: "AHPRA requires self-employed health practitioners to make annual declarations including: (1) Self-Employment Status - clear written statement confirming independent status, (2) Practice Addresses - disclosure of every premises including telehealth locations, (3) Business Names - all business names and practice company names used, (4) Shared Premises Practitioners - names of all registered health practitioners you share premises with and cost-sharing arrangements.",
    summary: "Four key AHPRA declaration requirements for self-employed health practitioners.",
    keywords: ["ahpra", "annual declaration", "self-employed", "registration", "national law", "practitioner registration"],
    intentPatterns: ["ahpra", "annual declaration", "ahpra compliance", "practitioner registration", "national law"],
    responseTemplate: "AHPRA Annual Declarations are critical for maintaining your professional registration. Here are the four key requirements:\n\n**1. Self-Employment Status**\nProvide clear written confirmation of your independent status when responding to AHPRA enquiries.\n\n**2. Practice Addresses**\nDisclose EVERY premises where you practise, including:\n• Primary clinics\n• Secondary locations\n• Telehealth service addresses\n\n**3. Business Names**\nDocument all business and practice company names under which you operate professionally.\n\n**4. Shared Premises Practitioners**\nList full names of all registered health practitioners you share premises with, including any cost-sharing arrangements (even informal ones).\n\n**Why It Matters:**\nIncomplete declarations can trigger regulatory issues and must align with your payroll tax documentation.\n\nWould you like help ensuring your AHPRA declarations are complete and compliant?",
    requiresDisclaimer: true,
    legalDisclaimer: "AHPRA requirements may change. Verify current requirements with AHPRA directly.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["ahpra-compliance-review"],
    xpReward: 30,
    metadata: { requirements: 4, legislation: "National Law" }
  },

  // 26. Pathology Lease Negotiations
  {
    id: "pathology-lease",
    category: "services",
    subcategory: "pathology",
    topic: "pathology lease agreements",
    title: "Pathology Lease & Rent Negotiations",
    content: "Hamilton Bailey specialises in pathology collection room agreements for medical practices. We negotiate lease terms with major pathology providers, review existing agreements for compliance and value optimization, and ensure arrangements comply with ACCC guidelines and healthcare regulations. Services include rent review negotiations, lease renewals, and new agreement establishment.",
    summary: "Expert negotiation of pathology collection room leases and agreements.",
    keywords: ["pathology", "lease", "rent", "collection room", "pathology agreement", "pathology provider"],
    intentPatterns: ["pathology lease", "pathology rent", "collection room", "pathology agreement", "pathology negotiation"],
    responseTemplate: "Pathology lease agreements require specialised expertise. Hamilton Bailey provides:\n\n**Negotiation Services:**\n• New pathology collection room agreements\n• Lease renewals and rent reviews\n• Terms optimization with major providers\n• Multi-site pathology arrangements\n\n**Compliance Review:**\n• ACCC guideline compliance\n• Healthcare regulation alignment\n• Value assessment and benchmarking\n• Risk identification in existing agreements\n\n**Key Considerations:**\n• Rental rates vs market value\n• Term length and renewal options\n• Exclusivity provisions\n• Service level requirements\n• Make-good obligations\n\n**Our Advantage:**\nWe understand pathology provider business models and can negotiate optimal terms for your practice.\n\nWould you like us to review your pathology lease or negotiate a new agreement?",
    requiresDisclaimer: true,
    legalDisclaimer: "Lease advice depends on specific terms and circumstances.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["pathology-lease-review"],
    xpReward: 30,
    metadata: { service_type: "negotiation", providers: ["major pathology companies"] }
  },

  // 27. Legal Audit Services
  {
    id: "legal-audit",
    category: "services",
    subcategory: "audit",
    topic: "legal audit services",
    title: "Legal Audit for Medical Practices",
    content: "Our legal audit service provides comprehensive review of existing medical practice agreements including pathology leases, tenant-doctor service agreements, compliance documentation, and business structure review. We provide a detailed Letter of Advice outlining findings, risks, and recommendations with priority ranking.",
    summary: "Comprehensive legal audit of medical practice agreements and documentation.",
    keywords: ["legal audit", "document review", "compliance audit", "agreement review", "practice audit"],
    intentPatterns: ["legal audit", "review my agreements", "document audit", "compliance review", "audit my practice"],
    responseTemplate: "Our Legal Audit service provides comprehensive review of your practice documentation:\n\n**What We Audit:**\n• Pathology lease agreements\n• Tenant-Doctor service agreements\n• Compliance documentation\n• Business structure documents\n• Employment/contractor agreements\n\n**Our Process:**\n1. Initial contact and preliminary discussion\n2. Terms of Engagement execution\n3. Document collection and review\n4. Comprehensive analysis\n5. Letter of Advice delivery\n\n**What You Receive:**\n• Detailed analysis of existing agreements\n• Identification of problematic issues\n• Strategy recommendations\n• Compliance gap analysis\n• Priority ranking of issues requiring attention\n• Cost estimates for remediation\n\n**Investment:** Fixed fee based on scope\n\nWould you like to request a legal audit of your practice documentation?",
    requiresDisclaimer: true,
    legalDisclaimer: "Audit findings depend on documents provided and specific circumstances.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["legal-audit-package"],
    xpReward: 35,
    metadata: { deliverable: "Letter of Advice", process_steps: 5 }
  },

  // 28. PT21 Requirements for Accountants
  {
    id: "pt21-requirements",
    category: "compliance",
    subcategory: "payroll-tax",
    topic: "21 requirements for accountants",
    title: "21 Payroll Tax Requirements for Accountants",
    content: "The PT21 framework comprises 21 critical requirements that accountants must verify when advising medical practices on payroll tax compliance. These requirements ensure proper contractor classification and compliance with State Revenue Office interpretations based on recent case law including Thomas and Naaz [2022].",
    summary: "21 critical payroll tax compliance requirements for accountants advising medical practices.",
    keywords: ["pt21", "21 requirements", "accountant", "certification", "payroll tax requirements", "compliance checklist"],
    intentPatterns: ["21 requirements", "pt21", "accountant requirements", "payroll tax checklist", "compliance requirements"],
    responseTemplate: "The PT21 Framework provides accountants with 21 critical requirements for payroll tax compliance:\n\n**Purpose:**\nEnsure proper verification when advising medical practices on contractor arrangements and payroll tax obligations.\n\n**Key Areas Covered:**\n• Contractor classification criteria\n• Documentation requirements\n• Service agreement essentials\n• Business structure verification\n• Independence indicators\n\n**Based On:**\n• Recent case law (Thomas and Naaz [2022])\n• State Revenue Office interpretations\n• ATO guidelines\n• Fair Work Act considerations\n\n**For Accountants:**\nThis framework helps you:\n• Verify compliance before providing advice\n• Identify risk areas requiring legal review\n• Support due diligence processes\n• Collaborate effectively with legal advisors\n\n**Certification:**\nAccountants can become certified in applying these requirements through our training program.\n\nWould you like information about PT21 certification or training?",
    requiresDisclaimer: true,
    legalDisclaimer: "Requirements may change with regulatory updates. Professional advice should be obtained.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["pt21-certification"],
    xpReward: 30,
    metadata: { requirements_count: 21, target_audience: "accountants" }
  },

  // 29. Thomas and Naaz Case Law Detail
  {
    id: "thomas-naaz-case",
    category: "expertise",
    subcategory: "case-law",
    topic: "thomas and naaz case",
    title: "Thomas and Naaz [2022] NSWCATAD - Case Analysis",
    content: "Thomas and Naaz Pty Ltd v Chief Commissioner of State Revenue [2022] NSWCATAD 56 is a landmark payroll tax case where a medical practice was assessed for payroll tax on GP contractor payments. The case established key principles for determining employment vs contractor relationships in medical practices, emphasizing factors like control, integration, and the reality of the working arrangement.",
    summary: "Landmark 2022 payroll tax case establishing key principles for medical practice contractor classification.",
    keywords: ["thomas and naaz", "case law", "nswcatad", "payroll tax case", "2022", "contractor case"],
    intentPatterns: ["thomas and naaz", "thomas naaz case", "2022 payroll tax case", "contractor case law"],
    responseTemplate: "**Thomas and Naaz Pty Ltd v Chief Commissioner of State Revenue [2022] NSWCATAD 56**\n\nThis landmark case significantly impacts medical practice payroll tax compliance:\n\n**Case Background:**\n• Medical practice assessed for payroll tax on GP contractor payments\n• Practice argued GPs were independent contractors\n• State Revenue claimed employment relationship existed\n\n**Key Findings:**\n• Control indicators examined beyond contract terms\n• Integration into practice operations considered\n• Economic reality of arrangement analyzed\n• Administrative and billing arrangements reviewed\n\n**Implications for Medical Practices:**\n• Contract terms alone don't determine status\n• Practical working arrangements are scrutinized\n• Integration level affects classification\n• Risk of retrospective assessments increased\n\n**Our Response:**\nHamilton Bailey has restructured our Tenant Doctor™ arrangements to address these specific findings, ensuring compliance with current interpretations.\n\nWould you like to discuss how Thomas and Naaz affects your practice?",
    requiresDisclaimer: true,
    legalDisclaimer: "Case law interpretation requires specific legal advice.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["compliance-review"],
    xpReward: 25,
    metadata: { year: 2022, jurisdiction: "NSW", case_type: "payroll tax" }
  },

  // 30. Optical Superstore Case Detail
  {
    id: "optical-superstore-case",
    category: "expertise",
    subcategory: "case-law",
    topic: "optical superstore case",
    title: "Optical Superstore v Commissioner [2019] - Case Analysis",
    content: "Optical Superstore Pty Ltd v Commissioner of State Revenue [2019] established important principles for contractor classification in healthcare retail settings. The case examined factors including the level of control, provision of equipment, rostering practices, and integration into business operations.",
    summary: "2019 case establishing contractor classification principles in healthcare retail contexts.",
    keywords: ["optical superstore", "case law", "2019", "contractor classification", "healthcare retail"],
    intentPatterns: ["optical superstore", "optical superstore case", "2019 case", "contractor classification"],
    responseTemplate: "**Optical Superstore Pty Ltd v Commissioner of State Revenue [2019]**\n\nThis case provides important precedent for contractor classification:\n\n**Case Context:**\n• Optometrists engaged as contractors\n• State Revenue assessed payroll tax liability\n• Examined relationship between retailer and practitioners\n\n**Key Principles Established:**\n• Equipment provision as control indicator\n• Rostering practices examined\n• Customer relationship ownership\n• Integration into retail operations\n• Branding and presentation requirements\n\n**Relevance to Medical Practices:**\n• Similar factors apply to GP/specialist arrangements\n• Rostering and scheduling scrutinized\n• Practice presentation requirements matter\n• Equipment and facility provision analyzed\n\n**Application:**\nWe apply lessons from Optical Superstore when structuring Tenant Doctor™ arrangements to ensure appropriate independence indicators.\n\nWould you like to understand how this case affects your practitioner arrangements?",
    requiresDisclaimer: true,
    legalDisclaimer: "Case law application depends on specific circumstances.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 25,
    metadata: { year: 2019, case_type: "payroll tax", sector: "healthcare retail" }
  },

  // 31. David Dahm and Health & Life Clarification
  {
    id: "david-dahm-clarification",
    category: "partnerships",
    subcategory: "health-and-life",
    topic: "david dahm role",
    title: "David Dahm - Health and Life CEO (Partner Firm)",
    content: "IMPORTANT: David Dahm is the CEO of Health and Life, a SEPARATE entity that partners with Hamilton Bailey. He is NOT an employee or partner of Hamilton Bailey Law Firm. Health and Life is an independent healthcare accounting firm founded in 1991, and David leads their team of 60 specialists serving 1,200+ medical practice clients.",
    summary: "David Dahm is CEO of Health and Life (partner firm), NOT a Hamilton Bailey employee.",
    keywords: ["david dahm", "health and life ceo", "separate entity", "partner not employee", "accounting ceo"],
    intentPatterns: ["who is david dahm", "david dahm hamilton bailey", "david dahm role", "is david dahm"],
    responseTemplate: "**Important Clarification about David Dahm:**\n\nDavid Dahm is the **CEO of Health and Life**, which is a **SEPARATE** entity from Hamilton Bailey Law Firm.\n\n**About David Dahm:**\n• CEO of Health and Life (since founding partner)\n• CA, FCPA, CTA qualifications\n• Former AGPAL surveyor\n• 2019-2020 National Telstra Business Women Judge\n• Led 950+ industry presentations\n• 460+ published articles\n\n**Health and Life (Separate Entity):**\n• Australia's leading healthcare accounting firm\n• Founded 1991 (34+ years experience)\n• 1,200+ medical practice clients\n• 60 specialist staff nationally\n• Developer of Doctors Pay Calculator™\n\n**Relationship with Hamilton Bailey:**\nHealth and Life is a **strategic partner** of Hamilton Bailey, not part of our firm. We collaborate to provide integrated legal and accounting solutions.\n\nFor legal matters: Contact Hamilton Bailey\nFor accounting matters: Contact Health and Life\n\nWould you like contact information for either firm?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 15,
    metadata: { entity: "Health and Life", role: "CEO", relationship: "partner not employee" }
  },

  // 32. Extended Risk Language Patterns
  {
    id: "risk-language-extended",
    category: "compliance",
    subcategory: "risk-indicators",
    topic: "extended risk language",
    title: "Extended Risk Language Patterns for Payroll Tax",
    content: "Comprehensive list of high-risk language patterns that may indicate employment relationships. Website content, practice policies, and all communications should be reviewed for: possessive pronouns with practitioners, integration language, control indicators, and employee-like terminology. Low-risk alternatives emphasize independence and separate business relationships.",
    summary: "Extended guide to risky vs compliant language in medical practice communications.",
    keywords: ["risk language", "compliance language", "website review", "policy language", "communication compliance"],
    intentPatterns: ["risky language", "what language to avoid", "compliance wording", "safe terminology"],
    responseTemplate: "Extended Risk Language Guide for Medical Practices:\n\n**HIGH RISK LANGUAGE (Avoid These):**\n\n*Possessive Pronouns:*\n• \"Our doctors/practitioners/medical team\"\n• \"Staff members\"\n• \"Our specialists\"\n\n*Control Indicators:*\n• \"Doctors must/are required to\"\n• \"Practice policies require\"\n• \"Performance reviews\"\n• \"Staff meetings\"\n• \"Allocated patients\"\n\n*Integration Language:*\n• \"Part of the team\"\n• \"Join our practice\"\n• \"Work for us\"\n• \"Employment opportunities\"\n\n**LOW RISK ALTERNATIVES:**\n\n*Independence Language:*\n• \"Independent practitioners\"\n• \"Tenant doctors\"\n• \"Visiting practitioners\"\n• \"Associated specialists\"\n• \"Practitioners operate their own business\"\n\n*Business Relationship:*\n• \"Practice premises available\"\n• \"Consulting room arrangements\"\n• \"Professional services agreement\"\n• \"Licence to occupy\"\n\n**ACTION REQUIRED:**\n• Review all website content\n• Update practice policies\n• Revise patient communications\n• Train reception staff on terminology\n\nWould you like a comprehensive review of your practice's communications?",
    requiresDisclaimer: true,
    legalDisclaimer: "Language alone does not determine classification. Professional advice required.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["compliance-language-review"],
    xpReward: 35,
    metadata: { review_areas: ["website", "policies", "communications", "staff training"] }
  },

  // 33. Hollis v Vabu Case Detail
  {
    id: "hollis-vabu-case",
    category: "expertise",
    subcategory: "case-law",
    topic: "hollis v vabu case",
    title: "Hollis v Vabu [2001] HCA - Foundational Contractor Law",
    content: "Hollis v Vabu Pty Ltd [2001] HCA 44 is a High Court of Australia decision establishing foundational principles for distinguishing employees from independent contractors. The multi-factor test examines control, integration, economic reality, and the totality of the relationship.",
    summary: "High Court foundation case for contractor vs employee classification in Australia.",
    keywords: ["hollis v vabu", "high court", "2001", "contractor employee", "multi-factor test", "foundational case"],
    intentPatterns: ["hollis v vabu", "high court contractor case", "foundational case law", "employee contractor test"],
    responseTemplate: "**Hollis v Vabu Pty Ltd [2001] HCA 44 - High Court of Australia**\n\nThis foundational case establishes the framework for contractor classification:\n\n**Background:**\n• High Court examined bicycle courier arrangements\n• Established multi-factor test for classification\n• Remains cornerstone of contractor law\n\n**Multi-Factor Test Factors:**\n1. **Control** - Over how, when, where work performed\n2. **Integration** - Part of the business or own enterprise\n3. **Economic Reality** - Risk bearing, profit opportunity\n4. **Exclusivity** - Ability to work for others\n5. **Equipment** - Who provides tools of trade\n6. **Presentation** - Uniform, branding requirements\n\n**Application to Medical Practices:**\n• Each factor examined in totality\n• No single factor determinative\n• Practical reality prevails over contract terms\n• Subsequent cases (Thomas and Naaz, Optical Superstore) apply these principles\n\n**Current Relevance:**\nThis case underpins all contractor classification analysis in Australia, including medical practice arrangements.\n\nWould you like to understand how these factors apply to your practitioner arrangements?",
    requiresDisclaimer: true,
    legalDisclaimer: "Legal classification requires professional analysis of all factors.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 25,
    metadata: { year: 2001, court: "High Court of Australia", significance: "foundational" }
  },

  // 34. Copyright and Licensing
  {
    id: "copyright-licensing",
    category: "legal",
    subcategory: "intellectual-property",
    topic: "copyright and licensing",
    title: "Licensing, Trademark & Copyright",
    content: "All Hamilton Bailey materials, templates, agreements, and content are protected by Australian and international copyright law. Registered clients receive licensed access to documents which must not be redistributed, modified for commercial distribution, or shared with unauthorized parties. Violations may result in service termination and legal action.",
    summary: "Copyright protection and licensing terms for Hamilton Bailey materials and templates.",
    keywords: ["copyright", "licensing", "trademark", "intellectual property", "terms", "permitted use"],
    intentPatterns: ["copyright", "licensing terms", "can I share", "permitted use", "trademark"],
    responseTemplate: "Hamilton Bailey Copyright and Licensing Information:\n\n**Copyright Protection:**\n© Hamilton Bailey Lawyers. All rights reserved.\n• All materials protected by Australian and international copyright law\n• Templates, agreements, and content are proprietary\n\n**Permitted Use (Registered Clients):**\n✓ Use templates within your own practice\n✓ Make copies for internal use and record-keeping\n✓ Share with professional advisors for compliance purposes\n\n**Prohibited Use:**\n✗ Redistribution or resale of materials\n✗ Creating derivative works for commercial distribution\n✗ Sharing access credentials or documents with unauthorized parties\n✗ Using materials to compete with Hamilton Bailey\n✗ Removing or altering copyright notices\n\n**Trademark Notice:**\n\"Hamilton Bailey\" and \"Tenant Doctor\" are registered trademarks.\n\n**Enforcement:**\nViolations may result in:\n• Service termination\n• Legal action for infringement\n• Claims for damages including legal costs\n\nQuestions about permitted use? Please contact us directly.",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 10,
    metadata: { trademark: "Tenant Doctor™", protected: true }
  },

  // 35. Medical Practice Advisory Overview
  {
    id: "medical-practice-advisory",
    category: "services",
    subcategory: "advisory",
    topic: "medical practice advisory",
    title: "Comprehensive Medical Practice Advisory Services",
    content: "Hamilton Bailey provides end-to-end advisory services for medical practices including establishment, compliance, growth, and exit planning. Our integrated approach combines legal expertise with strategic business advice specifically tailored for healthcare professionals navigating complex regulatory environments.",
    summary: "End-to-end advisory services for medical practice lifecycle management.",
    keywords: ["advisory", "medical practice", "consulting", "strategic advice", "practice management", "business advice"],
    intentPatterns: ["advisory services", "practice advice", "consulting", "strategic guidance", "practice management"],
    responseTemplate: "Hamilton Bailey Medical Practice Advisory Services:\n\n**Practice Lifecycle Support:**\n\n**1. Establishment**\n• Business structure selection\n• Regulatory compliance setup\n• Initial agreements and documentation\n• Service entity configuration\n\n**2. Ongoing Operations**\n• Tenant Doctor™ arrangements\n• Payroll tax compliance\n• Fair Work Act adherence\n• Contract management\n\n**3. Growth & Expansion**\n• New location structuring\n• Partner/associate integration\n• Practice acquisitions\n• Multi-site compliance\n\n**4. Exit Planning**\n• Practice sale structuring\n• Succession planning\n• Asset protection\n• Tax optimization\n\n**Our Approach:**\n• Fixed-fee pricing transparency\n• Integrated legal-accounting solutions (with Health and Life)\n• Proactive compliance management\n• Technology-enabled efficiency\n\nWhat stage of practice development can we assist with?",
    requiresDisclaimer: true,
    legalDisclaimer: "Advisory services require engagement and specific advice based on circumstances.",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: ["advisory-package"],
    xpReward: 25,
    metadata: { lifecycle_stages: ["establishment", "operations", "growth", "exit"] }
  },

  // 36. Tenant Doctor Characteristics Detail
  {
    id: "tenant-doctor-characteristics",
    category: "services",
    subcategory: "tenant-doctor",
    topic: "tenant doctor key characteristics",
    title: "Key Characteristics of Tenant Doctor™ Arrangements",
    content: "A Tenant Doctor™ arrangement must demonstrate key characteristics of independence: operating own ABN/business, control over work methods, bearing business risk, ability to delegate, own professional indemnity insurance, setting own fees, separate Medicare provider number, and independent patient relationships. These factors distinguish contractors from employees.",
    summary: "Essential characteristics that define compliant Tenant Doctor™ arrangements.",
    keywords: ["tenant doctor characteristics", "independence indicators", "contractor characteristics", "abn", "business risk"],
    intentPatterns: ["tenant doctor characteristics", "what makes tenant doctor", "independence requirements", "contractor indicators"],
    responseTemplate: "Key Characteristics of a Compliant Tenant Doctor™ Arrangement:\n\n**Business Independence:**\n✓ Operates own ABN and business entity\n✓ Bears own business risk (good months and bad)\n✓ Sets own consultation fees\n✓ Has independent Medicare provider number\n\n**Control & Autonomy:**\n✓ Controls work methods and clinical decisions\n✓ Determines own hours (within facility access)\n✓ Can delegate work to locums\n✓ Free to work at multiple locations\n\n**Risk & Insurance:**\n✓ Own professional indemnity insurance\n✓ Own public liability coverage\n✓ Responsible for own compliance\n\n**Patient Relationships:**\n✓ Patients are the practitioner's patients\n✓ Own patient records and data\n✓ Independent recall and follow-up\n\n**Premises Arrangement:**\n✓ Licence to occupy (not employment)\n✓ Pays for premises access\n✓ Separate identifiable practice\n\n**Warning Signs (Avoid):**\n✗ Practice 'allocating' patients\n✗ Required attendance at staff meetings\n✗ Performance management processes\n✗ Practice setting fees\n\nWould you like us to assess whether your arrangements meet these characteristics?",
    requiresDisclaimer: true,
    legalDisclaimer: "Characteristics alone don't guarantee classification. Professional assessment required.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["tenant-doctor-assessment"],
    xpReward: 35,
    metadata: { indicators: ["independence", "control", "risk", "autonomy"] }
  },

  // 37. State Revenue Office Information
  {
    id: "state-revenue-offices",
    category: "compliance",
    subcategory: "regulatory",
    topic: "state revenue office",
    title: "State Revenue Office - Payroll Tax Authority",
    content: "State Revenue Offices (SRO) in each Australian state and territory administer payroll tax. Medical practices must register for payroll tax if contractor payments are deemed wages and exceed thresholds. SROs are increasingly auditing medical practices following Thomas and Naaz [2022], with retrospective assessments commonly covering 5+ years.",
    summary: "Understanding State Revenue Office payroll tax authority and audit activity.",
    keywords: ["state revenue", "sro", "payroll tax authority", "revenue office", "tax audit", "state tax"],
    intentPatterns: ["state revenue", "sro", "who administers payroll tax", "revenue office audit", "state tax authority"],
    responseTemplate: "State Revenue Office (SRO) - Payroll Tax Information:\n\n**What is the SRO?**\nEach Australian state/territory has a State Revenue Office that administers payroll tax (names vary by jurisdiction).\n\n**Current Audit Focus:**\n• Medical practices are priority audit targets\n• Post-Thomas and Naaz [2022] increased scrutiny\n• Contractor arrangement reviews intensified\n• Retrospective assessments covering 5+ years common\n\n**Payroll Tax Basics:**\n• Applies to 'wages' including deemed contractor payments\n• Thresholds vary by state\n• Grouping provisions may combine related entities\n• Significant penalties for non-compliance\n\n**Typical Assessment Process:**\n1. Risk profiling and selection\n2. Information request\n3. Document review\n4. Interview/site visit\n5. Assessment notice\n6. Objection/appeal rights\n\n**Our SRO Experience:**\n• Regular negotiations with all state SROs\n• Successful assessment reductions\n• Audit defense expertise\n• Proactive compliance strategies\n\nHave you received contact from State Revenue Office? We should discuss immediately.",
    requiresDisclaimer: true,
    legalDisclaimer: "Payroll tax obligations depend on specific circumstances and state legislation.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["sro-representation"],
    xpReward: 25,
    metadata: { audit_period: "5+ years", status: "increased enforcement" }
  },

  // 38. Library Resources
  {
    id: "library-resources",
    category: "resources",
    subcategory: "library",
    topic: "legal resource library",
    title: "Hamilton Bailey Legal Resource Library",
    content: "Hamilton Bailey maintains a comprehensive legal resource library for registered clients including template agreements, compliance checklists, regulatory guides, case summaries, and educational materials. Resources are regularly updated to reflect changes in law, regulations, and case law interpretations.",
    summary: "Comprehensive legal resource library available to registered Hamilton Bailey clients.",
    keywords: ["library", "resources", "templates", "guides", "documents", "client resources"],
    intentPatterns: ["library", "resources", "templates", "client documents", "legal resources"],
    responseTemplate: "Hamilton Bailey Legal Resource Library:\n\n**Available Resources:**\n\n**Templates & Agreements:**\n• Tenant Doctor™ agreement templates\n• Service agreements\n• Employment contracts\n• Lease documentation\n• Policy templates\n\n**Compliance Materials:**\n• Payroll tax checklists\n• AHPRA declaration guides\n• Fair Work compliance guides\n• Risk assessment tools\n\n**Educational Content:**\n• Case law summaries\n• Regulatory update bulletins\n• Best practice guides\n• Video tutorials\n\n**Access:**\n• Available to registered clients\n• Regularly updated with legal changes\n• Searchable by topic\n• Downloadable formats\n\n**Client Portal:**\nRegistered clients access resources through our secure client portal with encrypted document storage.\n\n**Updates:**\nAll resources updated following significant:\n• Legislative changes\n• Case law developments\n• Regulatory interpretations\n\nWould you like information about accessing our resource library?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 9,
    relatedProducts: [],
    xpReward: 15,
    metadata: { access: "registered clients", format: "digital" }
  },

  // ============================================
  // NEW KNOWLEDGE: MEDICAL PRACTICE TYPES
  // ============================================

  // 39. General Practice (GP) Legal Services
  {
    id: "gp-legal-services",
    category: "practice-types",
    subcategory: "general-practice",
    topic: "gp legal services",
    title: "Legal Services for General Practitioners",
    content: "Hamilton Bailey provides specialised legal services for General Practitioners including Tenant Doctor™ arrangements, payroll tax compliance, Medicare billing compliance, practice sale and purchase, partnership agreements, and regulatory defence. GPs face unique compliance challenges given their high patient volume and contractor arrangements.",
    summary: "Specialised legal services tailored for General Practice medical centres and GPs.",
    keywords: ["gp", "general practitioner", "general practice", "family medicine", "bulk billing", "medicare"],
    intentPatterns: ["general practice", "gp legal", "family doctor", "bulk billing practice", "gp compliance"],
    responseTemplate: "Legal Services for General Practitioners:\n\n**Why GPs Need Specialised Legal Support:**\nGeneral Practices are the most common targets for payroll tax audits due to:\n• High volume of contractor arrangements\n• Complex billing structures (bulk billing, private, mixed)\n• Multiple practitioners sharing facilities\n• Varying engagement models\n\n**Our GP-Specific Services:**\n\n**Structure & Compliance:**\n• Tenant Doctor™ arrangements optimised for GP settings\n• Payroll tax risk assessment and mitigation\n• Medicare billing compliance review\n• Practice management agreements\n\n**Commercial Matters:**\n• Practice sale and purchase\n• Partnership and associate agreements\n• Lease negotiations (including pathology collection rooms)\n• Succession planning\n\n**Regulatory Support:**\n• AHPRA compliance\n• State Revenue Office audit defence\n• Fair Work contractor reviews\n\n**GP Challenges We Address:**\n• After-hours clinics and locum arrangements\n• Bulk billing practices and mixed billing structures\n• Practice nurse employment vs contractor status\n• Allied health co-location agreements\n\nWould you like to discuss your GP practice's specific legal needs?",
    requiresDisclaimer: true,
    legalDisclaimer: "Each GP practice has unique circumstances. Specific advice should be obtained.",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: ["gp-compliance-package"],
    xpReward: 25,
    metadata: { practice_type: "General Practice", risk_level: "high" }
  },

  // 40. Specialist Practice Legal Services
  {
    id: "specialist-legal-services",
    category: "practice-types",
    subcategory: "specialist",
    topic: "specialist practice legal",
    title: "Legal Services for Medical Specialists",
    content: "Hamilton Bailey provides legal services for medical specialists including surgeons, physicians, psychiatrists, and other specialty practitioners. Specialist practices have unique structuring requirements due to higher billing rates, hospital affiliations, procedural focus, and different patient relationship models.",
    summary: "Legal services tailored for specialist medical practitioners and specialist clinics.",
    keywords: ["specialist", "surgeon", "physician", "psychiatrist", "dermatologist", "cardiologist", "specialist practice"],
    intentPatterns: ["specialist practice", "surgeon legal", "specialist clinic", "medical specialist", "consulting specialist"],
    responseTemplate: "Legal Services for Medical Specialists:\n\n**Specialist Practice Considerations:**\nSpecialist practices have unique legal requirements due to:\n• Higher consultation and procedural fees\n• Hospital visiting rights and affiliations\n• Referral relationships with GPs\n• Complex billing (Medicare rebates, gap fees, no-gap arrangements)\n\n**Our Specialist Services:**\n\n**Practice Structuring:**\n• Service entity design for specialists\n• Hospital affiliation agreements\n• Rooms licence arrangements in specialist centres\n• Tenant Doctor™ structures for specialist settings\n\n**Commercial Agreements:**\n• Specialist rooms leases\n• Equipment sharing agreements\n• Group practice arrangements\n• Associate specialist agreements\n\n**Compliance:**\n• Specialist-specific payroll tax considerations\n• AHPRA specialist registration requirements\n• Medicare compliance for specialist billing\n• Private health fund agreements\n\n**Succession & Exit:**\n• Specialist practice valuations\n• Patient list transitions\n• Referrer relationship management\n• Post-sale consulting arrangements\n\nWhich specialty area is your practice focused on?",
    requiresDisclaimer: true,
    legalDisclaimer: "Specialist practices have unique requirements. Professional advice is recommended.",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: ["specialist-compliance-review"],
    xpReward: 25,
    metadata: { practice_type: "Specialist", complexity: "high" }
  },

  // 41. Allied Health Legal Services
  {
    id: "allied-health-legal",
    category: "practice-types",
    subcategory: "allied-health",
    topic: "allied health legal services",
    title: "Legal Services for Allied Health Practices",
    content: "Hamilton Bailey provides legal services for allied health practitioners including physiotherapists, occupational therapists, speech pathologists, dietitians, podiatrists, and psychologists. Allied health practices face unique regulatory and structuring challenges including NDIS compliance, Medicare CDM items, and multi-disciplinary practice models.",
    summary: "Specialised legal services for allied health practices and practitioners.",
    keywords: ["allied health", "physiotherapy", "psychology", "occupational therapy", "speech pathology", "dietitian", "podiatry", "ndis"],
    intentPatterns: ["allied health", "physio practice", "psychology practice", "ndis provider", "cdm billing"],
    responseTemplate: "Legal Services for Allied Health Practices:\n\n**Allied Health Legal Challenges:**\nAllied health practices face distinct compliance requirements:\n• NDIS provider registration and compliance\n• Medicare CDM (Chronic Disease Management) billing\n• Multi-disciplinary practice structuring\n• WorkCover and TAC provider agreements\n\n**Our Allied Health Services:**\n\n**Practice Structuring:**\n• Multi-disciplinary practice models\n• Contractor vs employee classification (critical for allied health)\n• Service entity structures\n• Partnership and association agreements\n\n**Regulatory Compliance:**\n• NDIS pricing and compliance requirements\n• Medicare CDM item claiming\n• WorkCover and TAC provider registration\n• AHPRA allied health registration\n\n**Commercial Agreements:**\n• Practitioner service agreements\n• Room rental arrangements\n• Equipment and resource sharing\n• Referral relationship documentation\n\n**NDIS-Specific:**\n• Provider agreement reviews\n• Service agreement templates\n• Plan management compliance\n• Quality and safeguarding requirements\n\nWhat type of allied health practice do you operate?",
    requiresDisclaimer: true,
    legalDisclaimer: "Allied health regulations vary by profession. Specific advice should be obtained.",
    adviceLevel: "general",
    confidenceLevel: 9,
    relatedProducts: ["allied-health-package"],
    xpReward: 25,
    metadata: { practice_type: "Allied Health", ndis_relevant: true }
  },

  // 42. Dental Practice Legal Services
  {
    id: "dental-legal-services",
    category: "practice-types",
    subcategory: "dental",
    topic: "dental practice legal",
    title: "Legal Services for Dental Practices",
    content: "Hamilton Bailey provides legal services for dental practices including dentists, dental specialists, and dental groups. Dental practices have unique considerations including equipment financing, practice ownership restrictions in some states, specialist referral relationships, and corporate dental group structures.",
    summary: "Legal services tailored for dental practices, dentists, and dental groups.",
    keywords: ["dental", "dentist", "dental practice", "orthodontist", "oral surgeon", "dental group", "dental corporate"],
    intentPatterns: ["dental practice", "dentist legal", "dental group", "dental compliance", "dental sale"],
    responseTemplate: "Legal Services for Dental Practices:\n\n**Dental Practice Legal Considerations:**\nDental practices have unique structuring requirements:\n• Significant equipment and fit-out investments\n• Practice ownership rules (vary by state)\n• Dental specialist referral networks\n• Corporate dental group arrangements\n\n**Our Dental Services:**\n\n**Practice Structuring:**\n• Dental practice entity structures\n• Associate dentist agreements\n• Specialist dental arrangements\n• Corporate dental group compliance\n\n**Commercial Matters:**\n• Practice purchase and sale\n• Equipment financing agreements\n• Lease negotiations (dental-specific fit-out considerations)\n• Partnership and shareholder agreements\n\n**Compliance:**\n• Dental Board registration requirements\n• Payroll tax for dental associates\n• Fair Work compliance for dental nurses/assistants\n• Health fund provider agreements\n\n**Special Considerations:**\n• Goodwill protection on sale\n• Restrictive covenant enforceability\n• Patient record transitions\n• Dental nurse/hygienist contractor status\n\nAre you looking at practice structuring, sale/purchase, or compliance matters?",
    requiresDisclaimer: true,
    legalDisclaimer: "Dental practice regulations vary by state. Professional advice is recommended.",
    adviceLevel: "general",
    confidenceLevel: 9,
    relatedProducts: ["dental-practice-package"],
    xpReward: 25,
    metadata: { practice_type: "Dental", equipment_intensive: true }
  },

  // 43. Veterinary Practice Legal Services
  {
    id: "veterinary-legal-services",
    category: "practice-types",
    subcategory: "veterinary",
    topic: "veterinary practice legal",
    title: "Legal Services for Veterinary Practices",
    content: "Hamilton Bailey provides legal services for veterinary practices including vet clinics, veterinary hospitals, and specialty veterinary services. Veterinary practices share many compliance challenges with medical practices but have unique considerations around animal welfare, emergency services, and corporate ownership.",
    summary: "Legal services for veterinary clinics, hospitals, and veterinary professionals.",
    keywords: ["veterinary", "vet", "animal hospital", "vet clinic", "veterinarian", "vet practice"],
    intentPatterns: ["veterinary practice", "vet clinic", "vet legal", "veterinary compliance", "vet sale"],
    responseTemplate: "Legal Services for Veterinary Practices:\n\n**Why Vet Practices Need Specialised Support:**\nVeterinary practices share many characteristics with medical practices:\n• Contractor vs employee classification issues\n• Equipment-intensive operations\n• Emergency and after-hours services\n• Corporate group structures\n\n**Our Veterinary Services:**\n\n**Practice Structuring:**\n• Veterinary practice entity structures\n• Associate vet agreements\n• Locum and emergency vet arrangements\n• Corporate veterinary group compliance\n\n**Commercial Matters:**\n• Practice purchase and sale\n• Lease negotiations\n• Partnership agreements\n• Equipment financing\n\n**Compliance:**\n• Veterinary Board registration\n• Payroll tax for associate vets\n• Fair Work compliance for vet nurses\n• WorkCover obligations\n\n**Unique Veterinary Considerations:**\n• 24/7 emergency service structures\n• Animal welfare compliance\n• Drug and medication handling\n• Client (pet owner) relationship management\n\nWhat aspect of your veterinary practice can we assist with?",
    requiresDisclaimer: true,
    legalDisclaimer: "Veterinary regulations vary by state. Professional advice is recommended.",
    adviceLevel: "general",
    confidenceLevel: 9,
    relatedProducts: [],
    xpReward: 20,
    metadata: { practice_type: "Veterinary", emergency_services: true }
  },

  // ============================================
  // NEW KNOWLEDGE: STATE-SPECIFIC INFORMATION
  // ============================================

  // 44. South Australia Payroll Tax
  {
    id: "sa-payroll-tax",
    category: "state-specific",
    subcategory: "south-australia",
    topic: "sa payroll tax",
    title: "South Australia Payroll Tax for Medical Practices",
    content: "South Australia payroll tax is administered by RevenueSA. The current threshold is $1.5 million (as of 2024). SA has been active in auditing medical practices following national trends. Key considerations include grouping provisions and contractor deeming rules.",
    summary: "South Australian payroll tax rules and compliance for medical practices.",
    keywords: ["south australia", "sa", "revenuesa", "adelaide", "sa payroll tax", "south australian"],
    intentPatterns: ["south australia payroll", "sa payroll tax", "revenuesa", "adelaide practice", "sa compliance"],
    responseTemplate: "South Australia Payroll Tax Information:\n\n**RevenueSA Administration:**\nPayroll tax in SA is administered by RevenueSA, with medical practices being a key audit focus.\n\n**Current Thresholds (2024-25):**\n• Threshold: $1.5 million\n• Rate: 4.95% (general)\n• Higher rate applies above $1.7 million\n\n**SA-Specific Considerations:**\n• Active audit program targeting medical practices\n• Grouping provisions for related entities\n• Contractor deeming rules aligned with national approach\n• Focus on GP and specialist practices\n\n**Recent SA Activity:**\n• Increased audit activity post-Thomas and Naaz\n• Focus on contractor arrangements in medical centres\n• Retrospective assessments commonly 5+ years\n\n**Hamilton Bailey Advantage:**\n• Based in Adelaide with direct RevenueSA experience\n• Local knowledge of SA regulatory landscape\n• Established relationships with SA practitioners\n\n**Our Adelaide Office:**\nLevel 2/147 Pirie Street, Adelaide SA 5000\nPhone: (08) 8121 5167\n\nWould you like a SA-specific payroll tax risk assessment?",
    requiresDisclaimer: true,
    legalDisclaimer: "Tax thresholds and rates may change. Verify current figures with RevenueSA.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["sa-payroll-review"],
    xpReward: 25,
    metadata: { state: "South Australia", threshold: "$1.5M", authority: "RevenueSA" }
  },

  // 45. New South Wales Payroll Tax
  {
    id: "nsw-payroll-tax",
    category: "state-specific",
    subcategory: "new-south-wales",
    topic: "nsw payroll tax",
    title: "New South Wales Payroll Tax for Medical Practices",
    content: "NSW payroll tax is administered by Revenue NSW. The Thomas and Naaz [2022] case originated in NSW, making it particularly relevant for NSW medical practices. NSW has the highest concentration of medical practices and aggressive audit activity.",
    summary: "New South Wales payroll tax rules and compliance for medical practices.",
    keywords: ["new south wales", "nsw", "revenue nsw", "sydney", "nsw payroll tax", "thomas naaz nsw"],
    intentPatterns: ["nsw payroll tax", "new south wales payroll", "sydney practice", "revenue nsw", "nsw compliance"],
    responseTemplate: "New South Wales Payroll Tax Information:\n\n**Revenue NSW Administration:**\nNSW is the most active jurisdiction for medical practice payroll tax audits.\n\n**Current Thresholds (2024-25):**\n• Threshold: $1.2 million\n• Rate: 5.45%\n\n**NSW-Specific Significance:**\n• Thomas and Naaz [2022] case originated in NSW\n• Sets precedent applied nationally\n• Highest volume of medical practice audits\n• Largest concentration of medical practices\n\n**NSW Audit Focus:**\n• GP contractor arrangements\n• Specialist rooms licences\n• Corporate medical group structures\n• Allied health contractor status\n\n**NSW Case Law:**\n• Thomas and Naaz [2022] NSWCATAD 56 - Landmark medical practice decision\n• Establishes NSW-specific interpretation of contractor tests\n• Retrospective assessments common (5-7 years)\n\n**Our NSW Support:**\nWhile based in Adelaide, we assist NSW practices with:\n• Revenue NSW audit defence\n• Restructuring to achieve compliance\n• Risk assessment based on Thomas and Naaz principles\n\nDo you have an NSW practice requiring compliance review?",
    requiresDisclaimer: true,
    legalDisclaimer: "Tax thresholds and rates may change. Verify current figures with Revenue NSW.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["nsw-compliance-review"],
    xpReward: 25,
    metadata: { state: "New South Wales", threshold: "$1.2M", authority: "Revenue NSW" }
  },

  // 46. Victoria Payroll Tax
  {
    id: "vic-payroll-tax",
    category: "state-specific",
    subcategory: "victoria",
    topic: "vic payroll tax",
    title: "Victoria Payroll Tax for Medical Practices",
    content: "Victoria payroll tax is administered by the State Revenue Office Victoria. VIC has specific contractor provisions and has been applying Thomas and Naaz principles to Victorian medical practices. Mental health levy applies to larger employers.",
    summary: "Victorian payroll tax rules and compliance for medical practices.",
    keywords: ["victoria", "vic", "sro victoria", "melbourne", "vic payroll tax", "victorian"],
    intentPatterns: ["victoria payroll", "vic payroll tax", "melbourne practice", "sro victoria", "vic compliance"],
    responseTemplate: "Victoria Payroll Tax Information:\n\n**State Revenue Office Victoria:**\nVIC has been actively applying national precedents to medical practice audits.\n\n**Current Thresholds (2024-25):**\n• Threshold: $900,000\n• Rate: 4.85% (up to $100M)\n• Mental health levy: Additional 0.5% (wages > $10M)\n\n**VIC-Specific Considerations:**\n• Lower threshold than other states\n• Mental health levy for larger practices\n• Active audit program for medical practices\n• Applying Thomas and Naaz principles\n\n**Victorian Audit Focus:**\n• Large multi-site medical groups\n• Allied health practices (significant in VIC)\n• Dental corporate groups\n• Specialist consulting suites\n\n**Grouping Provisions:**\n• Strict grouping rules in Victoria\n• Related entities may be grouped\n• Affects threshold calculations\n\n**Our Victorian Support:**\n• SRO Victoria audit defence\n• Victorian-specific restructuring advice\n• Compliance with mental health levy requirements\n\nDo you operate a Victorian medical practice?",
    requiresDisclaimer: true,
    legalDisclaimer: "Tax thresholds and rates may change. Verify current figures with SRO Victoria.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["vic-compliance-review"],
    xpReward: 25,
    metadata: { state: "Victoria", threshold: "$900K", authority: "SRO Victoria" }
  },

  // 47. Queensland Payroll Tax
  {
    id: "qld-payroll-tax",
    category: "state-specific",
    subcategory: "queensland",
    topic: "qld payroll tax",
    title: "Queensland Payroll Tax for Medical Practices",
    content: "Queensland payroll tax is administered by the Queensland Revenue Office. QLD has the highest threshold nationally at $1.3 million but has been increasing audit activity for medical practices. Regional and rural practices have specific considerations.",
    summary: "Queensland payroll tax rules and compliance for medical practices.",
    keywords: ["queensland", "qld", "queensland revenue", "brisbane", "qld payroll tax", "queensland"],
    intentPatterns: ["queensland payroll", "qld payroll tax", "brisbane practice", "qld compliance", "queensland revenue"],
    responseTemplate: "Queensland Payroll Tax Information:\n\n**Queensland Revenue Office:**\nQLD has been increasing audit focus on medical practices following national trends.\n\n**Current Thresholds (2024-25):**\n• Threshold: $1.3 million\n• Rate: 4.75%\n• Regional discount: 1% for regional employers\n\n**QLD-Specific Considerations:**\n• Highest threshold nationally\n• Regional employer discount available\n• Growing audit activity\n• Large regional medical practice sector\n\n**Queensland Focus Areas:**\n• Regional and rural medical practices\n• Flying doctor and outreach services\n• Queensland Health contractor arrangements\n• Mining industry medical services\n\n**Regional Considerations:**\n• Many QLD practices operate across multiple regional locations\n• Locum arrangements common in regional areas\n• Telehealth services growing\n\n**Our Queensland Support:**\n• QRO audit defence\n• Regional practice structuring\n• Multi-site compliance strategies\n\nIs your practice based in Queensland?",
    requiresDisclaimer: true,
    legalDisclaimer: "Tax thresholds and rates may change. Verify current figures with Queensland Revenue Office.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["qld-compliance-review"],
    xpReward: 25,
    metadata: { state: "Queensland", threshold: "$1.3M", authority: "QRO" }
  },

  // 48. Tasmania Payroll Tax
  {
    id: "tas-payroll-tax",
    category: "state-specific",
    subcategory: "tasmania",
    topic: "tas payroll tax",
    title: "Tasmania Payroll Tax for Medical Practices",
    content: "Tasmania payroll tax is administered by the State Revenue Office Tasmania. TAS has unique considerations for its smaller, more dispersed medical practice sector, with many rural and regional practices. The threshold and rates differ from mainland states.",
    summary: "Tasmanian payroll tax rules and compliance for medical practices.",
    keywords: ["tasmania", "tas", "hobart", "launceston", "tas payroll tax", "tasmanian", "state revenue tasmania"],
    intentPatterns: ["tasmania payroll", "tas payroll tax", "hobart practice", "launceston practice", "tas compliance", "tasmanian"],
    responseTemplate: "Tasmania Payroll Tax Information:\n\n**State Revenue Office Tasmania:**\nTasmania has a smaller but growing medical practice sector with unique compliance considerations.\n\n**Current Thresholds (2024-25):**\n• Threshold: $1.25 million\n• Rate: 4% (up to $2M)\n• Higher rate: 6.1% (above $2M)\n\n**TAS-Specific Considerations:**\n• Smaller market with fewer large practices\n• Significant rural and regional presence\n• Growing telehealth sector\n• Locum arrangements common due to practitioner shortages\n\n**Tasmanian Focus Areas:**\n• Rural medical practices (widespread across TAS)\n• Hospital-affiliated specialist practices\n• Allied health practices in regional areas\n• Locum and visiting practitioner arrangements\n\n**Unique Tasmanian Factors:**\n• Practitioner shortages drive contractor use\n• Many practices serve large geographic areas\n• Ferry and flight access considerations for specialists\n• Strong public health system interaction\n\n**Regional Considerations:**\n• Hobart practices (largest concentration)\n• Launceston and North-West practices\n• Rural and remote area services\n• Visiting specialist arrangements\n\n**Our Tasmanian Support:**\n• State Revenue Office Tasmania audit defence\n• Rural practice structuring\n• Locum and visiting practitioner arrangements\n• Multi-site compliance across TAS regions\n\nIs your practice based in Tasmania?",
    requiresDisclaimer: true,
    legalDisclaimer: "Tax thresholds and rates may change. Verify current figures with State Revenue Office Tasmania.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["tas-compliance-review"],
    xpReward: 25,
    metadata: { state: "Tasmania", threshold: "$1.25M", authority: "State Revenue Office Tasmania" }
  },

  // ============================================
  // NEW KNOWLEDGE: COMMON SCENARIOS
  // ============================================

  // 49. Practice Sale
  {
    id: "practice-sale",
    category: "scenarios",
    subcategory: "transactions",
    topic: "selling a medical practice",
    title: "Selling Your Medical Practice",
    content: "Selling a medical practice involves unique considerations including patient list valuation, practitioner transitions, restrictive covenants, and regulatory compliance during handover. Hamilton Bailey provides end-to-end support for practice sales.",
    summary: "Comprehensive legal support for selling your medical practice.",
    keywords: ["sell practice", "practice sale", "selling", "exit", "retirement", "goodwill", "sale agreement"],
    intentPatterns: ["sell my practice", "selling practice", "practice sale", "exit planning", "retire from practice"],
    responseTemplate: "Selling Your Medical Practice:\n\n**Planning Your Exit:**\nA successful practice sale requires careful planning, typically 2-3 years in advance for optimal outcomes.\n\n**Key Considerations:**\n\n**Valuation:**\n• Goodwill assessment (patient list value)\n• Equipment and fit-out valuation\n• Lease value and assignability\n• Revenue multiples in your specialty\n\n**Legal Documentation:**\n• Sale of business agreement\n• Asset vs share sale structure\n• Restraint of trade clauses\n• Transition arrangements\n\n**Regulatory Compliance:**\n• Patient record transitions\n• Medicare provider number changes\n• AHPRA notification requirements\n• Staff and contractor transitions\n\n**Tax Optimisation:**\n• CGT planning (small business concessions)\n• Rollover relief options\n• Structure for after-tax proceeds\n• Timing considerations\n\n**Practitioner Transitions:**\n• Introducing purchaser to patients\n• Referrer relationship handover\n• Post-sale consulting arrangements\n• Restrictive covenant compliance\n\n**Our Process:**\n1. Initial valuation assessment\n2. Preparation for sale\n3. Buyer due diligence management\n4. Contract negotiation\n5. Settlement and transition\n\nAre you considering selling your practice?",
    requiresDisclaimer: true,
    legalDisclaimer: "Practice sale outcomes depend on individual circumstances. Professional advice is essential.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["practice-sale-package"],
    xpReward: 35,
    metadata: { transaction_type: "sale", planning_horizon: "2-3 years" }
  },

  // 49. Practice Purchase
  {
    id: "practice-purchase",
    category: "scenarios",
    subcategory: "transactions",
    topic: "buying a medical practice",
    title: "Buying a Medical Practice",
    content: "Purchasing a medical practice requires thorough due diligence, proper structuring, and understanding of what you're actually buying. Hamilton Bailey provides comprehensive support for practice acquisitions.",
    summary: "Legal support for purchasing or acquiring a medical practice.",
    keywords: ["buy practice", "purchase practice", "acquisition", "buying", "acquire", "due diligence"],
    intentPatterns: ["buy a practice", "purchase practice", "acquire practice", "buying practice", "practice acquisition"],
    responseTemplate: "Buying a Medical Practice:\n\n**Why Due Diligence Matters:**\nMedical practice purchases involve unique risks that general commercial lawyers often miss.\n\n**What You're Actually Buying:**\n\n**Tangible Assets:**\n• Equipment and fit-out\n• Consumables and stock\n• Lease rights\n\n**Intangible Assets:**\n• Patient list (goodwill)\n• Referrer relationships\n• Practice reputation\n• Systems and processes\n\n**Due Diligence Checklist:**\n✓ Payroll tax compliance history\n✓ Contractor arrangement review\n✓ Lease terms and assignability\n✓ Equipment condition and warranties\n✓ Staff entitlements and contracts\n✓ Medicare compliance history\n✓ Patient retention analysis\n✓ Financial performance verification\n\n**Structure Options:**\n• Asset purchase (most common)\n• Share purchase (existing company)\n• Hybrid arrangements\n\n**Risk Areas We Investigate:**\n• Hidden payroll tax liabilities\n• Practitioner departure risk\n• Lease issues\n• Equipment obsolescence\n• Compliance gaps\n\n**Our Process:**\n1. Preliminary assessment\n2. Due diligence investigation\n3. Negotiation and structuring\n4. Contract documentation\n5. Settlement support\n\nAre you looking at a specific practice to purchase?",
    requiresDisclaimer: true,
    legalDisclaimer: "Practice purchase decisions require thorough professional due diligence.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["due-diligence-package"],
    xpReward: 35,
    metadata: { transaction_type: "purchase", due_diligence: "essential" }
  },

  // 50. New Practice Setup
  {
    id: "new-practice-setup",
    category: "scenarios",
    subcategory: "establishment",
    topic: "starting a new practice",
    title: "Starting a New Medical Practice",
    content: "Starting a new medical practice requires careful planning around entity structure, premises, compliance, and operational setup. Getting the structure right from day one prevents costly restructuring later.",
    summary: "Complete legal support for establishing a new medical practice.",
    keywords: ["new practice", "start practice", "establish", "setup", "opening", "new clinic"],
    intentPatterns: ["start a practice", "new practice", "establish practice", "opening a practice", "setup practice"],
    responseTemplate: "Starting a New Medical Practice:\n\n**Getting Structure Right from Day One:**\nProper setup prevents costly restructuring and compliance issues later.\n\n**Key Setup Decisions:**\n\n**Entity Structure:**\n• Service entity vs operating entity\n• Trust vs company vs hybrid\n• Ownership and profit sharing\n• Tenant Doctor™ compliant structure\n\n**Premises:**\n• Lease negotiation\n• Fit-out requirements\n• Council and planning approvals\n• Medical centre vs standalone\n\n**Compliance Framework:**\n• AHPRA registration\n• Medicare provider registration\n• ABN and business registration\n• Insurance requirements\n\n**Practitioner Arrangements:**\n• Contractor vs employee decision\n• Service agreement templates\n• Payroll tax compliant from start\n• Fair Work compliance\n\n**Operational Setup:**\n• Practice management software\n• Billing and accounting systems\n• Clinical governance frameworks\n• Staff policies and procedures\n\n**Common Mistakes We Prevent:**\n• Wrong entity structure (expensive to fix)\n• Lease terms that restrict growth\n• Non-compliant contractor arrangements\n• Missing insurance coverage\n• Inadequate service agreements\n\n**Our New Practice Package:**\n• Entity establishment\n• Lease review and negotiation\n• Template agreements\n• Compliance framework setup\n• Fixed-fee pricing\n\nAre you planning to start a new practice?",
    requiresDisclaimer: true,
    legalDisclaimer: "New practice setup requires professional advice tailored to your circumstances.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["new-practice-package"],
    xpReward: 30,
    metadata: { scenario: "establishment", importance: "critical" }
  },

  // 51. Practice Restructure
  {
    id: "practice-restructure",
    category: "scenarios",
    subcategory: "restructuring",
    topic: "restructuring practice",
    title: "Restructuring Your Medical Practice",
    content: "Practice restructuring may be necessary for payroll tax compliance, growth, partnership changes, or exit planning. Hamilton Bailey specialises in transitioning existing practices to compliant structures while minimising disruption.",
    summary: "Expert guidance on restructuring your medical practice for compliance and growth.",
    keywords: ["restructure", "restructuring", "change structure", "reorganise", "compliance restructure"],
    intentPatterns: ["restructure practice", "change structure", "reorganise practice", "restructuring for compliance"],
    responseTemplate: "Restructuring Your Medical Practice:\n\n**Why Restructure?**\nCommon triggers for practice restructuring:\n• Payroll tax audit or risk identified\n• Partnership changes or disputes\n• Growth requiring new structure\n• Exit or succession planning\n• Regulatory changes\n\n**Restructuring Options:**\n\n**Tenant Doctor™ Transition:**\n• Convert employee arrangements to compliant contractor model\n• Establish service entity structure\n• Implement compliant documentation\n• Manage practitioner transitions\n\n**Partnership to Corporate:**\n• Convert partnership to company structure\n• Address tax implications\n• Protect personal assets\n• Facilitate future sale or investment\n\n**Growth Restructuring:**\n• Multi-site practice structures\n• Franchise-style arrangements\n• Joint venture models\n• Associate pathways\n\n**Our Restructuring Process:**\n1. Current structure assessment\n2. Risk and compliance review\n3. Target structure design\n4. Transition planning\n5. Documentation and implementation\n6. Ongoing compliance support\n\n**Key Considerations:**\n• Tax implications of restructure\n• Existing contract terminations\n• Practitioner communication\n• Patient continuity\n• Timing for regulatory changes\n\nWhat's prompting your interest in restructuring?",
    requiresDisclaimer: true,
    legalDisclaimer: "Restructuring has significant legal and tax implications. Professional advice is essential.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["restructure-package"],
    xpReward: 35,
    metadata: { scenario: "restructuring", complexity: "high" }
  },

  // 52. Partnership Disputes
  {
    id: "partnership-disputes",
    category: "scenarios",
    subcategory: "disputes",
    topic: "partnership disputes",
    title: "Medical Practice Partnership Disputes",
    content: "Partnership disputes in medical practices can be complex due to intertwined patient relationships, ongoing business operations, and professional obligations. Hamilton Bailey provides dispute resolution and exit strategies for medical partnerships.",
    summary: "Resolving partnership disputes in medical practices.",
    keywords: ["partnership dispute", "partner disagreement", "buyout", "partner exit", "dispute resolution"],
    intentPatterns: ["partnership dispute", "partner disagreement", "partner leaving", "buyout partner", "practice dispute"],
    responseTemplate: "Medical Practice Partnership Disputes:\n\n**Common Dispute Triggers:**\n• Profit sharing disagreements\n• Work contribution imbalances\n• Strategic direction differences\n• New partner integration issues\n• Exit timing and valuation disputes\n\n**Our Dispute Resolution Approach:**\n\n**Assessment:**\n• Review partnership agreement\n• Identify dispute issues\n• Assess legal positions\n• Evaluate options\n\n**Resolution Options:**\n• Negotiated settlement\n• Mediation (confidential, cost-effective)\n• Arbitration (binding decision)\n• Litigation (last resort)\n\n**Exit Strategies:**\n• Buyout arrangements\n• Practice division\n• Gradual transition\n• Forced sale provisions\n\n**Key Considerations:**\n• Patient continuity and care\n• Staff and practitioner impacts\n• Referrer relationship management\n• Confidentiality during dispute\n• Regulatory notification requirements\n\n**Protecting Your Interests:**\n• Document all communications\n• Maintain professional conduct\n• Protect patient relationships\n• Preserve financial records\n• Seek early legal advice\n\n**Our Approach:**\nWe prioritise commercial resolution while protecting your interests and professional reputation.\n\nAre you experiencing a partnership dispute?",
    requiresDisclaimer: true,
    legalDisclaimer: "Dispute resolution requires specific legal advice based on your circumstances.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["dispute-resolution"],
    xpReward: 30,
    metadata: { scenario: "dispute", priority: "urgent" }
  },

  // ============================================
  // NEW KNOWLEDGE: COMPLIANCE TOPICS
  // ============================================

  // 53. Medicare Compliance
  {
    id: "medicare-compliance",
    category: "compliance",
    subcategory: "medicare",
    topic: "medicare compliance",
    title: "Medicare Billing Compliance",
    content: "Medicare compliance is critical for medical practices. Incorrect billing can result in recovery actions, penalties, and professional sanctions. Hamilton Bailey assists with Medicare compliance reviews and audit defence.",
    summary: "Medicare billing compliance and audit defence for medical practices.",
    keywords: ["medicare", "billing", "pbs", "mbs", "medicare audit", "bulk billing", "medicare compliance"],
    intentPatterns: ["medicare compliance", "medicare audit", "billing compliance", "mbs items", "pbs compliance"],
    responseTemplate: "Medicare Billing Compliance:\n\n**Why Medicare Compliance Matters:**\nMedicare non-compliance can result in:\n• Recovery of overpaid benefits\n• Administrative penalties\n• Professional sanctions\n• Criminal prosecution (fraud cases)\n\n**Common Compliance Issues:**\n\n**MBS Billing:**\n• Incorrect item number usage\n• Time-based item requirements\n• Bulk billing vs private billing errors\n• Referred vs non-referred services\n• Chronic disease management items\n\n**PBS Compliance:**\n• Authority prescription requirements\n• Brand substitution rules\n• Quantity and repeat limits\n\n**Our Medicare Services:**\n\n**Compliance Reviews:**\n• MBS billing pattern analysis\n• Item number usage review\n• Documentation adequacy\n• Process improvement recommendations\n\n**Audit Defence:**\n• Response to Medicare audits\n• Negotiation with Department of Health\n• PSR (Professional Services Review) representation\n• Appeal processes\n\n**Prevention:**\n• Staff training on billing compliance\n• Documentation templates\n• Audit-ready processes\n• Ongoing monitoring\n\nAre you facing a Medicare compliance issue or want a preventive review?",
    requiresDisclaimer: true,
    legalDisclaimer: "Medicare rules are complex. Professional advice should be obtained.",
    adviceLevel: "specific",
    confidenceLevel: 9,
    relatedProducts: ["medicare-compliance-review"],
    xpReward: 30,
    metadata: { regulatory_body: "Services Australia", risk_level: "high" }
  },

  // 54. WorkCover Compliance
  {
    id: "workcover-compliance",
    category: "compliance",
    subcategory: "workcover",
    topic: "workcover obligations",
    title: "WorkCover and Workers Compensation",
    content: "Medical practices have WorkCover obligations for employees and may have additional obligations as medical service providers for injured workers. Understanding the distinction between employee and contractor status is critical for WorkCover compliance.",
    summary: "WorkCover compliance for medical practices as employers and service providers.",
    keywords: ["workcover", "workers compensation", "work injury", "workcover audit", "employer obligations"],
    intentPatterns: ["workcover", "workers comp", "work injury", "workcover compliance", "workcover audit"],
    responseTemplate: "WorkCover Compliance for Medical Practices:\n\n**Dual Obligations:**\nMedical practices have WorkCover obligations in two capacities:\n\n**1. As Employers:**\n• Workers compensation insurance\n• Return to work obligations\n• Workplace safety requirements\n• Claims management\n\n**2. As Service Providers:**\n• WorkCover approved provider registration\n• Fee schedules and billing\n• Treatment and reporting requirements\n• Independence and objectivity\n\n**Contractor Classification Impact:**\n• Employees: Full WorkCover coverage required\n• Contractors: Should have own insurance\n• Misclassification: Potential liability exposure\n\n**Common Issues:**\n• Premium classification disputes\n• Contractor vs employee audit\n• Claims for 'contractors' (misclassification)\n• Return to work management\n\n**Our WorkCover Services:**\n• Premium classification review\n• Contractor arrangement assessment\n• Claims management support\n• WorkCover audit defence\n\n**State Variations:**\nWorkCover systems vary by state:\n• SA: ReturnToWorkSA\n• NSW: iCare\n• VIC: WorkSafe Victoria\n• QLD: WorkCover Queensland\n\nDo you have a WorkCover compliance question?",
    requiresDisclaimer: true,
    legalDisclaimer: "WorkCover requirements vary by state. Professional advice should be obtained.",
    adviceLevel: "specific",
    confidenceLevel: 9,
    relatedProducts: ["workcover-review"],
    xpReward: 25,
    metadata: { regulation_type: "state-based", employer_obligation: true }
  },

  // 55. Privacy Compliance
  {
    id: "privacy-compliance",
    category: "compliance",
    subcategory: "privacy",
    topic: "privacy compliance",
    title: "Privacy and Health Records Compliance",
    content: "Medical practices handle sensitive health information and must comply with Privacy Act requirements, Australian Privacy Principles, and state health records legislation. Breaches can result in significant penalties and reputational damage.",
    summary: "Privacy and health records compliance for medical practices.",
    keywords: ["privacy", "health records", "data protection", "privacy breach", "patient records", "confidentiality"],
    intentPatterns: ["privacy compliance", "health records", "data breach", "patient privacy", "privacy policy"],
    responseTemplate: "Privacy and Health Records Compliance:\n\n**Legal Framework:**\n• Privacy Act 1988 (Cth)\n• Australian Privacy Principles (APPs)\n• State Health Records Acts\n• My Health Records Act\n\n**Medical Practice Obligations:**\n\n**Collection:**\n• Collect only necessary information\n• Inform patients about collection\n• Obtain consent where required\n\n**Storage & Security:**\n• Secure physical and electronic records\n• Access controls and audit trails\n• Encryption and backup\n• Retention and destruction policies\n\n**Use & Disclosure:**\n• Primary purpose use only (unless consent)\n• Third party disclosure rules\n• Legal and court requirements\n• Marketing restrictions\n\n**Patient Rights:**\n• Access to records\n• Correction of errors\n• Complaint mechanisms\n\n**Data Breach Requirements:**\n• Notifiable Data Breaches scheme\n• Assessment and notification obligations\n• Penalty framework (up to $50M for serious breaches)\n\n**Our Privacy Services:**\n• Privacy policy development\n• Compliance assessments\n• Breach response support\n• Staff training\n\nDo you need a privacy compliance review?",
    requiresDisclaimer: true,
    legalDisclaimer: "Privacy requirements are complex. Professional advice should be obtained.",
    adviceLevel: "specific",
    confidenceLevel: 9,
    relatedProducts: ["privacy-compliance-review"],
    xpReward: 25,
    metadata: { legislation: "Privacy Act 1988", max_penalty: "$50M" }
  },

  // ============================================
  // NEW KNOWLEDGE: FAQ RESPONSES
  // ============================================

  // 56. Consultation Booking FAQ
  {
    id: "faq-booking",
    category: "faq",
    subcategory: "consultation",
    topic: "booking consultation",
    title: "How to Book a Consultation",
    content: "Hamilton Bailey offers easy online booking for consultations. Choose from initial consultations, urgent advice, follow-up sessions, document reviews, or strategy planning sessions. Book online, by phone, or through Bailey AI.",
    summary: "How to book a consultation with Hamilton Bailey.",
    keywords: ["book", "appointment", "consultation", "schedule", "meeting", "booking"],
    intentPatterns: ["how to book", "book appointment", "schedule consultation", "make booking", "available times"],
    responseTemplate: "How to Book a Consultation:\n\n**Booking Options:**\n\n**1. Online Booking (Recommended)**\nVisit hamiltonbailey.com.au/book-appointment\n• Select consultation type\n• Choose date and time\n• Complete payment\n• Instant confirmation\n\n**2. Phone Booking**\nCall (08) 8121 5167\nMonday-Friday 9AM-5PM ACST\n\n**3. Email Request**\nEmail admin@hamiltonbailey.com.au\n\n**Consultation Types:**\n\n• **Initial Consultation** ($350 + GST, 30 min)\n  Full legal needs assessment\n\n• **Urgent Legal Advice** ($550 + GST, 30 min)\n  Same-day/next-day for urgent matters\n\n• **Follow-up Consultation** ($150 + GST, 15 min)\n  Existing clients only\n\n• **Document Review** ($550 + GST, 60 min)\n  Detailed contract/agreement review\n\n• **Strategy Planning** ($750 + GST, 90 min)\n  Complex matter deep-dive\n\n**Preparation:**\n• Have relevant documents ready\n• Prepare brief summary of your situation\n• List questions you want answered\n\nWould you like me to help you choose the right consultation type?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 10,
    metadata: { action: "booking", phone: "(08) 8121 5167" }
  },

  // 57. What to Expect FAQ
  {
    id: "faq-what-to-expect",
    category: "faq",
    subcategory: "consultation",
    topic: "what to expect in consultation",
    title: "What to Expect in Your Consultation",
    content: "Your consultation with Hamilton Bailey will be focused and productive. We prepare by reviewing any documents you provide, ask targeted questions to understand your situation, and provide clear advice and next steps.",
    summary: "What to expect during your Hamilton Bailey consultation.",
    keywords: ["expect", "consultation process", "what happens", "meeting process", "first meeting"],
    intentPatterns: ["what to expect", "consultation process", "what happens", "how does it work", "first consultation"],
    responseTemplate: "What to Expect in Your Consultation:\n\n**Before Your Consultation:**\n• Complete booking and payment\n• Receive confirmation email\n• Upload relevant documents (if applicable)\n• We review materials in advance\n\n**During Your Consultation:**\n\n**Opening (5 min)**\n• Introductions\n• Confirm your situation and goals\n• Set agenda for discussion\n\n**Assessment (15-20 min)**\n• Targeted questions about your matter\n• Review of key documents\n• Identification of issues and risks\n\n**Advice (10-15 min)**\n• Clear explanation of legal position\n• Options and recommendations\n• Risk assessment\n• Cost estimates for further work\n\n**Closing (5 min)**\n• Summary of key points\n• Agreed next steps\n• Follow-up arrangements\n\n**After Your Consultation:**\n• Written summary email within 24 hours\n• Quote for any further work required\n• Access to client portal (if ongoing)\n\n**Tips for Best Outcomes:**\n• Be honest and complete in information sharing\n• Ask questions if anything is unclear\n• Take notes during the meeting\n• Follow up promptly on action items\n\nReady to book your consultation?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 10,
    metadata: { stage: "pre-consultation", preparation: "recommended" }
  },

  // 58. Why Specialised Lawyer FAQ
  {
    id: "faq-why-specialised",
    category: "faq",
    subcategory: "expertise",
    topic: "why specialised lawyer",
    title: "Why Use a Specialised Medical Practice Lawyer",
    content: "Medical practice law is highly specialised. General commercial lawyers often miss healthcare-specific issues, leading to incomplete advice or compliance gaps. Hamilton Bailey focuses exclusively on medical practice legal matters.",
    summary: "Why you need a specialised medical practice lawyer.",
    keywords: ["why specialised", "specialist lawyer", "general lawyer", "expertise", "difference"],
    intentPatterns: ["why specialised", "why not general lawyer", "what's different", "why specialist", "generalist vs specialist"],
    responseTemplate: "Why Use a Specialised Medical Practice Lawyer:\n\n**The Difference Expertise Makes:**\n\n**General Commercial Lawyer:**\n• May miss healthcare-specific regulations\n• Unfamiliar with medical practice structures\n• Generic templates not fit for purpose\n• No relationship with healthcare regulators\n• May underestimate compliance risks\n\n**Hamilton Bailey (Specialised):**\n• Deep healthcare regulatory knowledge\n• Tenant Doctor™ trademark expertise\n• Medical practice-specific templates\n• Understanding of AHPRA, Medicare, State Revenue\n• Track record with medical clients\n\n**What We Know That Generalists Don't:**\n\n1. **Payroll Tax:** How Thomas and Naaz [2022] specifically affects medical practices\n\n2. **Contractor Tests:** Healthcare-specific application of multi-factor tests\n\n3. **AHPRA Requirements:** Annual declaration and compliance requirements\n\n4. **Medicare Compliance:** MBS billing and PBS requirements\n\n5. **Practice Structures:** What works and what doesn't in medical settings\n\n**Client Experiences:**\n\"Our previous lawyer didn't understand the contractor issues in medical practices. Hamilton Bailey immediately identified the payroll tax risk.\" - GP Practice Owner\n\n**Partnership Advantage:**\nOur Health and Life partnership (1,200+ medical clients) provides integrated legal-accounting expertise.\n\nWould you like to discuss your specific situation?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 15,
    metadata: { differentiator: "specialisation", client_count: "500+" }
  },

  // 59. Confidentiality FAQ
  {
    id: "faq-confidentiality",
    category: "faq",
    subcategory: "process",
    topic: "confidentiality",
    title: "Confidentiality and Legal Privilege",
    content: "All communications with Hamilton Bailey are protected by legal professional privilege. Your information remains confidential and cannot be disclosed without your consent. This protection applies from your first contact.",
    summary: "Understanding confidentiality and legal privilege with Hamilton Bailey.",
    keywords: ["confidentiality", "privilege", "private", "secret", "disclosure", "legal privilege"],
    intentPatterns: ["confidentiality", "is it private", "legal privilege", "who will know", "keep secret"],
    responseTemplate: "Confidentiality and Legal Privilege:\n\n**Your Information Is Protected:**\n\n**Legal Professional Privilege:**\nAll communications with Hamilton Bailey are protected by legal professional privilege. This means:\n• Your information cannot be compelled by courts\n• Regulators cannot access privileged advice\n• Protection applies from first contact\n• Privilege belongs to you (the client)\n\n**What's Protected:**\n✓ All verbal and written communications\n✓ Documents prepared for legal advice\n✓ Your instructions to us\n✓ Our advice to you\n✓ Strategy discussions\n\n**Confidentiality Commitment:**\n• Information shared only with your consent\n• Secure document storage and transmission\n• Staff bound by confidentiality obligations\n• Conflict of interest protocols\n\n**Exceptions (We Must Inform You):**\n• Court orders (we'll fight inappropriate orders)\n• Prevention of imminent harm\n• Money laundering reporting obligations\n• Child protection requirements\n\n**Data Security:**\n• Encrypted communications\n• Secure client portal\n• Australian-based data storage\n• Regular security audits\n\n**Our Promise:**\nYour sensitive business information is safe with us. We understand the importance of confidentiality for medical practice matters.\n\nDo you have specific confidentiality concerns we can address?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 10,
    metadata: { protection: "legal privilege", data_location: "Australia" }
  },

  // 60. Timeline FAQ
  {
    id: "faq-timeline",
    category: "faq",
    subcategory: "process",
    topic: "how long does it take",
    title: "Typical Timelines for Legal Matters",
    content: "Legal matter timelines vary significantly based on complexity, other parties involved, and regulatory processes. Hamilton Bailey provides realistic timeframes and keeps you informed throughout.",
    summary: "Understanding typical timelines for medical practice legal matters.",
    keywords: ["timeline", "how long", "duration", "timeframe", "when", "turnaround"],
    intentPatterns: ["how long", "timeline", "when complete", "how fast", "turnaround time"],
    responseTemplate: "Typical Timelines for Legal Matters:\n\n**Understanding Timeframes:**\nTimelines vary based on matter complexity, other parties, and regulatory processes.\n\n**Typical Timeframes:**\n\n**Document Review:**\n• Simple review: 3-5 business days\n• Complex review: 1-2 weeks\n• Urgent: Same day (with notice)\n\n**New Agreements:**\n• Standard contracts: 1-2 weeks\n• Complex structures: 2-4 weeks\n• Multi-party negotiations: 4-8 weeks\n\n**Practice Transactions:**\n• Sale/purchase: 2-4 months\n• Due diligence: 2-4 weeks\n• Settlement: 30-60 days after contracts\n\n**Compliance Reviews:**\n• Risk assessment: 1-2 weeks\n• Full compliance audit: 2-4 weeks\n• Restructuring implementation: 2-3 months\n\n**Regulatory Matters:**\n• Audit responses: Varies by regulator deadline\n• Appeal processes: 3-12 months\n• Negotiations: Varies significantly\n\n**Factors Affecting Timeline:**\n• Other party responsiveness\n• Document availability\n• Regulatory processing times\n• Complexity of issues\n• Court/tribunal schedules\n\n**Our Commitment:**\n• Realistic timeframes from outset\n• Regular progress updates\n• Proactive communication on delays\n• Urgent matter prioritisation\n\nWhat type of matter are you considering?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 9,
    relatedProducts: [],
    xpReward: 10,
    metadata: { response_type: "timeframes", flexibility: "varies" }
  },

  // ============================================
  // NEW KNOWLEDGE: ADDITIONAL OBJECTION HANDLING
  // ============================================

  // 61. Objection: Location
  {
    id: "objection-location",
    category: "objections",
    subcategory: "location",
    topic: "location concern",
    title: "But You're in Adelaide - I'm in Another State",
    content: "Hamilton Bailey provides services nationally despite being based in Adelaide. Modern legal practice allows effective service delivery through video consultations, secure document sharing, and phone conferences. Medical practice law is consistent nationally.",
    summary: "Addressing concerns about Hamilton Bailey's Adelaide location for interstate clients.",
    keywords: ["location", "interstate", "remote", "not local", "distance", "adelaide only"],
    intentPatterns: ["but you're in adelaide", "not local", "interstate", "can you help remotely", "too far"],
    responseTemplate: "**Addressing Location Concerns:**\n\nWhile Hamilton Bailey is based in Adelaide, we effectively serve clients across Australia:\n\n**How We Work Nationally:**\n\n**Technology:**\n• Secure video consultations\n• Encrypted document sharing\n• Electronic signing\n• Phone conferences\n\n**Why Location Matters Less:**\n• Medical practice law is nationally consistent\n• State payroll tax variations handled through expertise\n• Case law precedents apply nationally\n• Regulators operate similarly across states\n\n**Benefits of Our Approach:**\n• Specialised expertise outweighs local presence\n• No need for travel or parking\n• Convenient scheduling across time zones\n• Same quality advice regardless of location\n\n**State-Specific Knowledge:**\nWe maintain expertise across all states:\n• SA: RevenueSA (our home base)\n• NSW: Revenue NSW (Thomas and Naaz expertise)\n• VIC: SRO Victoria\n• QLD: Queensland Revenue Office\n• WA: Revenue WA\n\n**Our Dubai Office:**\nFor international matters, we also have presence in Dubai for extended hours and cross-border expertise.\n\n**Client Testimonial:**\n\"Despite being in Sydney, working with Hamilton Bailey remotely was seamless. Their specialist expertise was more valuable than having a generalist down the road.\" - NSW GP Practice\n\nWhere is your practice located?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 15,
    metadata: { objection_type: "location", service_area: "national" }
  },

  // 62. Objection: Timing
  {
    id: "objection-timing",
    category: "objections",
    subcategory: "timing",
    topic: "timing concern",
    title: "I'll Deal With It Later / Not Urgent",
    content: "Delaying compliance review increases risk exposure. Payroll tax audits can be retrospective for 5+ years, meaning today's non-compliance creates growing liability. Early action is always more cost-effective.",
    summary: "Addressing timing objections and importance of early action.",
    keywords: ["later", "not urgent", "wait", "next year", "not now", "delay"],
    intentPatterns: ["deal with it later", "not urgent", "maybe next year", "when I have time", "not a priority"],
    responseTemplate: "**Why Waiting Can Be Costly:**\n\nDelaying compliance review seems low-risk, but consider:\n\n**Growing Liability:**\n• Payroll tax audits are retrospective (5+ years)\n• Each month adds to potential liability\n• Interest and penalties compound\n• $250,000+ assessments can become $400,000+\n\n**Recent Audit Activity:**\n• State Revenue Offices actively targeting medical practices\n• Post-Thomas and Naaz [2022] increased scrutiny\n• Audit selection is unpredictable\n• Once selected, options are limited\n\n**Cost of Delay vs Action:**\n\n**Proactive Review:** $X (investment in compliance)\n**Reactive Audit Defence:** 3-5X (fighting assessments)\n**Retrospective Assessment:** 10X+ (paying back-tax + penalties)\n\n**What Early Action Provides:**\n✓ Identify issues before regulators do\n✓ Time to restructure properly\n✓ Documentation trail showing good faith\n✓ Potential for voluntary disclosure (reduced penalties)\n✓ Peace of mind\n\n**Limited Window:**\nRegulatory enforcement is increasing. The window for proactive compliance is narrowing.\n\n**Low-Commitment Start:**\nA quick risk assessment can identify if you have urgent issues requiring attention, without committing to full restructuring.\n\nWould a brief risk assessment be helpful?",
    requiresDisclaimer: true,
    legalDisclaimer: "Risk exposure depends on individual circumstances.",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: ["risk-assessment"],
    xpReward: 20,
    metadata: { objection_type: "timing", urgency: "increasing" }
  },

  // 63. Objection: Accountant Handles This
  {
    id: "objection-accountant",
    category: "objections",
    subcategory: "existing-advisor",
    topic: "accountant handles this",
    title: "My Accountant Already Handles This",
    content: "Accountants provide essential services but legal compliance requires legal expertise. Contractor classification, agreement drafting, and regulatory defence are legal matters. The best outcomes come from integrated legal-accounting collaboration.",
    summary: "Distinguishing legal and accounting roles in medical practice compliance.",
    keywords: ["accountant", "accountant handles", "already have accountant", "bookkeeper", "tax agent"],
    intentPatterns: ["accountant handles", "my accountant", "already have accountant", "accountant said"],
    responseTemplate: "**Accountants and Lawyers: Different Expertise:**\n\nAccountants provide essential services, but legal compliance requires legal expertise.\n\n**What Accountants Do Well:**\n✓ Tax return preparation\n✓ Financial statements\n✓ BAS and GST compliance\n✓ Payroll processing\n✓ Business advice\n\n**What Requires Legal Expertise:**\n✓ Contractor vs employee classification (legal test)\n✓ Agreement drafting and review\n✓ Regulatory audit defence\n✓ Court and tribunal representation\n✓ Legal privilege protection\n\n**The Classification Test:**\nDetermining if someone is a contractor or employee is a **legal** test based on case law (Hollis v Vabu, Thomas and Naaz). Accountants can process either arrangement - but the legal classification decision requires legal expertise.\n\n**Our Health and Life Partnership:**\nWe work collaboratively with accountants. Our partnership with Health and Life (Australia's leading healthcare accountant) shows how legal and accounting expertise complement each other.\n\n**Ask Your Accountant:**\n• \"Have you reviewed our contractor arrangements against Thomas and Naaz?\"\n• \"Can you provide legal advice on our payroll tax position?\"\n• \"Will you represent us in a State Revenue audit?\"\n\nIf they can't, that's where we come in.\n\n**Best Practice:**\nInformed accountants appreciate legal input on compliance matters. We're happy to collaborate with your existing accountant.\n\nWould you like us to work alongside your accountant?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 20,
    metadata: { objection_type: "existing-advisor", collaboration: "recommended" }
  },

  // ============================================
  // NEW KNOWLEDGE: SPECIFIC SERVICES
  // ============================================

  // 64. Employment Contracts
  {
    id: "employment-contracts",
    category: "services",
    subcategory: "employment",
    topic: "employment contracts",
    title: "Employment Contracts for Medical Practices",
    content: "Medical practice employment contracts must comply with Fair Work Act, relevant awards, and industry-specific requirements. Hamilton Bailey drafts and reviews employment contracts for practice managers, nurses, reception staff, and other employees.",
    summary: "Employment contract services for medical practice staff.",
    keywords: ["employment contract", "staff contract", "employee agreement", "award", "fair work"],
    intentPatterns: ["employment contract", "staff contract", "employee agreement", "hiring staff", "award compliance"],
    responseTemplate: "Employment Contracts for Medical Practices:\n\n**Why Proper Contracts Matter:**\n• Fair Work Act compliance\n• Award coverage requirements\n• Clarity on roles and expectations\n• Protection for both parties\n• Dispute prevention\n\n**Staff Types We Cover:**\n\n**Clinical Staff:**\n• Practice nurses\n• Allied health employees\n• Medical assistants\n• Dental nurses/assistants\n\n**Administrative Staff:**\n• Practice managers\n• Reception staff\n• Billing officers\n• Medical secretaries\n\n**Contract Inclusions:**\n✓ Position description and duties\n✓ Remuneration and benefits\n✓ Hours and flexibility arrangements\n✓ Leave entitlements\n✓ Confidentiality obligations\n✓ Termination provisions\n✓ Award compliance where applicable\n\n**Award Coverage:**\n• Health Professionals and Support Services Award\n• Medical Practitioners Award (where applicable)\n• General Retail Industry Award (some roles)\n\n**Common Issues We Address:**\n• Underpayment risk (award compliance)\n• Flexible working arrangements\n• Restraint of trade clauses\n• Professional development obligations\n\nDo you need employment contracts drafted or reviewed?",
    requiresDisclaimer: true,
    legalDisclaimer: "Employment law is complex. Professional advice should be obtained.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["employment-contract-package"],
    xpReward: 25,
    metadata: { service_type: "employment", fair_work_relevant: true }
  },

  // 65. Practice Policies
  {
    id: "practice-policies",
    category: "services",
    subcategory: "governance",
    topic: "practice policies",
    title: "Practice Policies and Procedures",
    content: "Comprehensive practice policies protect both the practice and patients. Hamilton Bailey develops policy frameworks covering clinical governance, privacy, complaints handling, workplace health and safety, and operational procedures.",
    summary: "Policy and procedure development for medical practices.",
    keywords: ["policies", "procedures", "governance", "clinical governance", "workplace policy"],
    intentPatterns: ["practice policies", "need policies", "policy review", "procedures", "governance framework"],
    responseTemplate: "Practice Policies and Procedures:\n\n**Why Policies Matter:**\n• Regulatory compliance evidence\n• Staff clarity and consistency\n• Risk management\n• Quality improvement\n• Accreditation requirements\n\n**Core Policy Areas:**\n\n**Clinical Governance:**\n• Clinical incident management\n• Medication management\n• Infection control\n• Medical records management\n• Quality improvement\n\n**Privacy & Confidentiality:**\n• Privacy policy (APP compliant)\n• Health records handling\n• Data breach response\n• Third party disclosure\n\n**Workplace:**\n• Work health and safety\n• Anti-discrimination and harassment\n• Grievance procedures\n• Return to work\n\n**Operational:**\n• Appointment booking\n• Fee collection\n• After-hours arrangements\n• Emergency procedures\n\n**Compliance & Legal:**\n• Complaints handling\n• Consent processes\n• Contractor engagement\n• Conflict of interest\n\n**Our Policy Services:**\n• Template policy library\n• Customised policy development\n• Policy review and update\n• Implementation support\n• Staff training\n\nWould you like to discuss your policy needs?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 9,
    relatedProducts: ["policy-package"],
    xpReward: 20,
    metadata: { service_type: "governance", accreditation_relevant: true }
  },

  // 66. Restraint of Trade
  {
    id: "restraint-of-trade",
    category: "services",
    subcategory: "commercial",
    topic: "restraint of trade",
    title: "Restraint of Trade Clauses",
    content: "Restraint of trade clauses protect practices from departing practitioners taking patients or setting up nearby. However, restraints must be reasonable to be enforceable. Hamilton Bailey drafts enforceable restraints and advises on existing restraint obligations.",
    summary: "Restraint of trade advice for medical practices and practitioners.",
    keywords: ["restraint", "non-compete", "restrictive covenant", "competition", "leaving practice"],
    intentPatterns: ["restraint of trade", "non-compete", "restrictive covenant", "leaving practice", "competition clause"],
    responseTemplate: "Restraint of Trade in Medical Practice:\n\n**What is Restraint of Trade?**\nClauses restricting practitioners from:\n• Setting up competing practice nearby\n• Taking patients when leaving\n• Soliciting staff\n• Working for competitors\n\n**Enforceability Requirements:**\nRestraints must be \"reasonable\" to be enforceable:\n\n**Factors Courts Consider:**\n• Geographic scope (area)\n• Duration (time period)\n• Activity restricted\n• Legitimate interest protected\n• Impact on practitioner's livelihood\n\n**Medical Practice Considerations:**\n• Patient relationships are personal\n• Geographical limits must reflect actual catchment\n• Time limits typically 1-2 years maximum\n• Must protect legitimate business interest\n\n**Our Restraint Services:**\n\n**For Practices:**\n• Draft enforceable restraint clauses\n• Review existing agreements\n• Advise on breach situations\n• Enforcement actions\n\n**For Practitioners:**\n• Review restraint obligations before signing\n• Advise on restraint implications\n• Challenge unreasonable restraints\n• Exit planning within restraints\n\n**Common Issues:**\n• Restraints that are too broad (unenforceable)\n• Restraints that are too narrow (ineffective)\n• Unclear definitions of restricted area\n• No consideration (restraint added later)\n\nDo you need restraint advice for your situation?",
    requiresDisclaimer: true,
    legalDisclaimer: "Restraint enforceability depends on specific circumstances.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["restraint-review"],
    xpReward: 25,
    metadata: { service_type: "commercial", enforcement: "case-by-case" }
  },

  // 67. Locum Arrangements
  {
    id: "locum-arrangements",
    category: "services",
    subcategory: "practitioner",
    topic: "locum arrangements",
    title: "Locum Doctor Arrangements",
    content: "Locum arrangements enable practices to cover leave, peak periods, and vacancies. Proper locum agreements ensure compliance with contractor requirements while protecting both practice and locum. Hamilton Bailey provides locum agreement templates and advice.",
    summary: "Legal arrangements for locum doctors in medical practices.",
    keywords: ["locum", "relief doctor", "temporary doctor", "cover", "leave cover", "locum agreement"],
    intentPatterns: ["locum", "locum arrangement", "relief doctor", "covering leave", "temporary practitioner"],
    responseTemplate: "Locum Doctor Arrangements:\n\n**What Locums Cover:**\n• Annual leave coverage\n• Sick leave and emergencies\n• Peak period demand\n• Vacancy periods\n• Maternity/paternity leave\n\n**Locum Classification:**\nLocums are typically contractors, but proper documentation is essential to support this classification.\n\n**Key Agreement Elements:**\n\n**Engagement Terms:**\n• Duration and hours\n• Facilities provided\n• Billing arrangements\n• Patient allocation vs own patients\n\n**Financial:**\n• Payment basis (percentage, sessional, daily)\n• Who bills patients\n• Medicare provider number usage\n• Expenses and travel\n\n**Compliance:**\n• Insurance requirements\n• AHPRA registration verification\n• Credentialing where required\n• Medical indemnity confirmation\n\n**Independence Indicators:**\n• Own ABN\n• Own insurance\n• Work at multiple practices\n• Control over clinical decisions\n• Can decline shifts\n\n**Common Mistakes:**\n• Using employment-style arrangements\n• Rostering like employees\n• Practice billing under own provider number\n• Treating locums like staff\n\n**Our Locum Services:**\n• Locum agreement templates\n• Existing agreement review\n• Locum policy development\n• Classification advice\n\nDo you need locum arrangement documentation?",
    requiresDisclaimer: true,
    legalDisclaimer: "Locum classification depends on specific circumstances.",
    adviceLevel: "specific",
    confidenceLevel: 10,
    relatedProducts: ["locum-agreement-template"],
    xpReward: 20,
    metadata: { arrangement_type: "contractor", compliance_risk: "moderate" }
  },

  // ============================================
  // NEW KNOWLEDGE: GREETINGS AND GENERAL
  // ============================================

  // 68. Greeting Response
  {
    id: "greeting-response",
    category: "general",
    subcategory: "greeting",
    topic: "hello greeting",
    title: "Bailey AI Greeting",
    content: "Bailey AI welcomes users and offers to help with medical practice legal questions. The greeting establishes the AI's purpose and capabilities.",
    summary: "Bailey AI greeting and introduction.",
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "greetings"],
    intentPatterns: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
    responseTemplate: "Hello! I'm Bailey, the AI assistant for Hamilton Bailey Law Firm.\n\nI'm here to help with medical practice legal questions including:\n\n• **Tenant Doctor™ arrangements** - compliant contractor structures\n• **Payroll tax compliance** - risk assessment and audit defence\n• **Practice transactions** - buying, selling, or restructuring\n• **Regulatory compliance** - AHPRA, Fair Work, Medicare\n• **Commercial agreements** - leases, partnerships, employment\n\n**How can I help you today?**\n\nYou can ask me questions about your legal situation, or I can help you book a consultation with our team.\n\n💡 *Tip: The more detail you provide, the more helpful I can be!*",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 5,
    metadata: { message_type: "greeting", engagement: "opening" }
  },

  // 69. Thank You Response
  {
    id: "thank-you-response",
    category: "general",
    subcategory: "courtesy",
    topic: "thank you response",
    title: "Response to Thanks",
    content: "Bailey AI responds graciously to thanks and offers continued assistance.",
    summary: "Responding to user thanks.",
    keywords: ["thank you", "thanks", "cheers", "appreciate", "helpful"],
    intentPatterns: ["thank you", "thanks", "cheers", "appreciate it", "that was helpful"],
    responseTemplate: "You're welcome! I'm glad I could help.\n\n**What else can I assist with?**\n\nFeel free to ask more questions, or if you're ready to take the next step:\n\n• **Book a consultation** - discuss your specific situation with our team\n• **Request a callback** - we'll contact you at a convenient time\n• **Get more information** - I can explain any topic in more detail\n\nIs there anything else you'd like to know about medical practice legal matters?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 5,
    metadata: { message_type: "courtesy", engagement: "closing" }
  },

  // 70. Unclear Request
  {
    id: "unclear-request",
    category: "general",
    subcategory: "clarification",
    topic: "unclear request",
    title: "Request for Clarification",
    content: "When Bailey AI doesn't understand a request, it asks for clarification while offering common topics the user might be interested in.",
    summary: "Handling unclear user requests.",
    keywords: ["unclear", "don't understand", "what do you mean", "confused"],
    intentPatterns: [],
    responseTemplate: "I want to make sure I give you the most helpful response. Could you tell me a bit more about what you're looking for?\n\n**Common topics I can help with:**\n\n📋 **Compliance**\n• Payroll tax risks and compliance\n• AHPRA annual declarations\n• Fair Work contractor classification\n\n📄 **Agreements**\n• Tenant Doctor™ arrangements\n• Practice agreements\n• Employment contracts\n\n💼 **Transactions**\n• Buying or selling a practice\n• Practice restructuring\n• Partnership matters\n\n⚖️ **Disputes & Audits**\n• State Revenue audits\n• Partnership disputes\n• Regulatory investigations\n\n**Or simply describe your situation** and I'll point you in the right direction.\n\nWhat aspect of medical practice law can I help you with?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 5,
    metadata: { message_type: "clarification", engagement: "redirect" }
  },

  // 71. Out of Scope
  {
    id: "out-of-scope",
    category: "general",
    subcategory: "limitations",
    topic: "out of scope",
    title: "Out of Scope Request",
    content: "Bailey AI clarifies its scope when asked about topics outside medical practice law, and redirects to relevant Hamilton Bailey services.",
    summary: "Handling requests outside Bailey AI's scope.",
    keywords: ["criminal", "family law", "immigration", "conveyancing", "personal injury"],
    intentPatterns: ["criminal law", "family law", "divorce", "immigration", "visa", "personal injury", "car accident"],
    responseTemplate: "I specialise in **medical practice law** and may not be the best resource for that topic.\n\n**Hamilton Bailey focuses on:**\n• Medical practice compliance and structuring\n• Payroll tax for healthcare businesses\n• Practice sales, purchases, and partnerships\n• Healthcare regulatory matters\n• Commercial agreements for medical practices\n\n**We don't practice in:**\n• Criminal law\n• Family law\n• Immigration\n• Personal injury\n• General conveyancing\n\n**However**, if your question relates to a medical practice (even tangentially), I'm happy to help!\n\n**Need a referral?**\nIf you need a lawyer in another area, we can recommend trusted colleagues. Just let us know.\n\nIs there a medical practice legal matter I can assist with instead?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 5,
    metadata: { message_type: "scope", engagement: "redirect" }
  },

  // 72. Specific Legal Advice Warning
  {
    id: "specific-advice-warning",
    category: "general",
    subcategory: "limitations",
    topic: "cannot provide specific advice",
    title: "Cannot Provide Specific Legal Advice",
    content: "Bailey AI cannot provide specific legal advice tailored to individual circumstances. It provides general information and encourages consultation for specific matters.",
    summary: "Explaining limitations on specific legal advice.",
    keywords: ["specific advice", "my situation", "what should I do", "legal advice"],
    intentPatterns: ["what should I do", "give me advice", "tell me what to do", "advise me"],
    responseTemplate: "I can provide **general information** about medical practice law, but I cannot give **specific legal advice** tailored to your unique situation.\n\n**Why This Matters:**\n• Legal advice must consider all your circumstances\n• Your documents, history, and goals affect the advice\n• Incorrect advice could have serious consequences\n• Only qualified lawyers should provide specific advice\n\n**What I CAN Do:**\n✓ Explain legal concepts and processes\n✓ Describe typical approaches to common issues\n✓ Outline relevant considerations\n✓ Help you prepare questions for a consultation\n✓ Point you to relevant resources\n\n**What I CANNOT Do:**\n✗ Tell you exactly what to do\n✗ Review your specific documents\n✗ Provide advice you should rely on\n✗ Replace a lawyer consultation\n\n**Next Step:**\nFor advice specific to your situation, I recommend booking a consultation with our team. We can then provide tailored advice after understanding your full circumstances.\n\n**Book Now:** hamiltonbailey.com.au/book-appointment\n**Call:** (08) 8121 5167\n\nShall I help you prepare for a consultation?",
    requiresDisclaimer: true,
    legalDisclaimer: "This is general information only and should not be relied upon as legal advice.",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 10,
    metadata: { message_type: "limitation", engagement: "booking" }
  },

  // 73. Crisis/Emergency Detection
  {
    id: "crisis-detection",
    category: "safety",
    subcategory: "crisis",
    topic: "crisis response",
    title: "Crisis and Emergency Response",
    content: "Bailey AI detects crisis language and provides appropriate resources. For legal emergencies, it directs to urgent consultation. For personal crises, it provides mental health resources.",
    summary: "Detecting and responding to crisis situations.",
    keywords: ["crisis", "emergency", "help", "desperate", "urgent help", "suicide", "harm"],
    intentPatterns: ["need help now", "emergency", "desperate", "can't cope", "crisis"],
    responseTemplate: "I understand you may be facing a difficult situation. Let me help direct you to the right support.\n\n**If this is a medical emergency:** Call 000\n\n**If you're experiencing a mental health crisis:**\n• Lifeline: 13 11 14 (24/7)\n• Beyond Blue: 1300 22 4636\n• Suicide Call Back Service: 1300 659 467\n\n**If this is an urgent legal matter:**\nHamilton Bailey provides urgent legal response for:\n• Regulatory investigation notices\n• Audit deadline responses\n• Employment crises\n• Compliance emergencies\n\n**Contact for Urgent Legal Matters:**\n📞 Phone: (08) 8121 5167\n📧 Email: admin@hamiltonbailey.com.au\n\nMention \"urgent\" and we'll prioritise your matter.\n\n**Are you facing:**\n• A regulatory deadline?\n• An urgent business situation?\n• Something else I can help with?\n\nPlease let me know how I can best assist you.",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 0,
    metadata: { message_type: "crisis", priority: "urgent" }
  },

  // 74. Lead Capture - Name Request
  {
    id: "lead-capture-name",
    category: "lead-capture",
    subcategory: "contact",
    topic: "get contact details",
    title: "Contact Information Request",
    content: "Bailey AI requests contact details to enable follow-up and personalised assistance.",
    summary: "Requesting user contact information.",
    keywords: ["contact", "callback", "follow up", "get in touch", "reach me"],
    intentPatterns: ["contact me", "call me", "get in touch", "reach me", "follow up with me"],
    responseTemplate: "I'd be happy to arrange for our team to follow up with you!\n\n**To connect you with the right person, please share:**\n\n📧 **Email address**\n📱 **Phone number** (optional)\n🏥 **Practice type** (e.g., GP, Specialist, Allied Health)\n💬 **Brief description** of what you're looking for help with\n\nOnce I have your details, I can:\n• Have a team member call you back\n• Send you relevant information\n• Set up a consultation\n\n**Your information is protected** by legal professional privilege from first contact.\n\nWhat's the best way to reach you?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 10,
    metadata: { message_type: "lead-capture", action: "contact-request" }
  },

  // 75. Competitor Comparison
  {
    id: "competitor-comparison",
    category: "faq",
    subcategory: "comparison",
    topic: "why hamilton bailey",
    title: "Why Choose Hamilton Bailey Over Competitors",
    content: "Hamilton Bailey differentiates through healthcare specialisation, Tenant Doctor™ exclusivity, Health and Life partnership, and proven track record with medical practices.",
    summary: "Hamilton Bailey's competitive advantages.",
    keywords: ["compare", "competitor", "other lawyers", "why you", "difference", "better"],
    intentPatterns: ["why hamilton bailey", "compare to other", "what makes you different", "why should I choose"],
    responseTemplate: "Why Choose Hamilton Bailey:\n\n**Our Unique Advantages:**\n\n**1. Healthcare Specialisation**\n• 100% focus on medical practice law\n• Not a general commercial firm doing \"some\" healthcare\n• Deep understanding of your industry\n\n**2. Tenant Doctor™ Exclusivity**\n• We are exclusively licensed to use this trademark in legal documents\n• Proven compliant structure framework\n• Based on latest case law\n\n**3. Health and Life Partnership**\n• Integrated legal-accounting solutions\n• Access to 1,200+ medical practice insights\n• Doctors Pay Calculator™ integration\n\n**4. Proven Track Record**\n• 500+ medical practice clients\n• Up to 75% reduction in proposed assessments\n• Successful audit defence outcomes\n\n**5. Fixed-Fee Transparency**\n• No surprise bills\n• Clear quotes upfront\n• Value-based pricing\n\n**6. International Presence**\n• Adelaide headquarters\n• Dubai office for extended hours\n• National service capability\n\n**What Clients Say:**\n\"Unlike generalist lawyers, Hamilton Bailey understood our medical practice immediately. No time wasted explaining basics.\"\n\n**Comparison with Generalist Firms:**\n| | Hamilton Bailey | Generalist |\n|---|---|---|\n| Healthcare focus | 100% | Often <5% |\n| Tenant Doctor™ | Licensed | No |\n| Medical practice templates | Yes | Generic |\n| Regulatory relationships | Established | Limited |\n\nWant to experience the difference?",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: 15,
    metadata: { message_type: "comparison", competitive: true }
  },
];

// Re-export XP rewards from types
export { CHAT_XP_REWARDS };

/**
 * Find relevant knowledge items based on user message
 */
export function findRelevantKnowledge(message: string): KnowledgeItem[] {
  const lowerMessage = message.toLowerCase();
  const words = lowerMessage.split(/\s+/).filter(w => w.length > 3);

  const scored = KNOWLEDGE_BASE.map(item => {
    let score = 0;

    // Check intent patterns (highest weight)
    item.intentPatterns.forEach(pattern => {
      if (lowerMessage.includes(pattern.toLowerCase())) {
        score += 15;
      }
    });

    // Check keywords
    item.keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        score += 8;
      }
    });

    // Check word matches in title and content
    words.forEach(word => {
      if (item.title.toLowerCase().includes(word)) score += 4;
      if (item.content.toLowerCase().includes(word)) score += 2;
      if (item.summary.toLowerCase().includes(word)) score += 3;
    });

    // Boost by confidence level
    score *= (item.confidenceLevel / 10);

    return { item, score };
  });

  return scored
    .filter(({ score }) => score > 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ item }) => item);
}

/**
 * Detect user intent from message
 */
export function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Greeting intent (check early)
  if (/^(hello|hi|hey|good morning|good afternoon|good evening|g'day|howdy)\b/i.test(lowerMessage.trim())) {
    return "greeting";
  }

  // Thank you intent
  if (lowerMessage.includes("thank") || lowerMessage.includes("thanks") || lowerMessage.includes("cheers") || lowerMessage.includes("appreciate")) {
    return "thank_you";
  }

  // Crisis/Emergency detection (check early for safety)
  if (lowerMessage.includes("suicide") || lowerMessage.includes("harm myself") || lowerMessage.includes("can't cope") ||
      lowerMessage.includes("desperate") || lowerMessage.includes("crisis") || lowerMessage.includes("emergency help")) {
    return "crisis";
  }

  // Booking intent
  if (lowerMessage.includes("book") || lowerMessage.includes("appointment") || lowerMessage.includes("consultation") || lowerMessage.includes("schedule")) {
    return "booking";
  }

  // Practice Type intents
  if (lowerMessage.includes("gp") || lowerMessage.includes("general practice") || lowerMessage.includes("general practitioner") || lowerMessage.includes("family doctor")) {
    return "gp_practice";
  }
  if (lowerMessage.includes("specialist") || lowerMessage.includes("surgeon") || lowerMessage.includes("physician") || lowerMessage.includes("psychiatrist")) {
    return "specialist_practice";
  }
  if (lowerMessage.includes("allied health") || lowerMessage.includes("physio") || lowerMessage.includes("psychology") || lowerMessage.includes("ndis")) {
    return "allied_health";
  }
  if (lowerMessage.includes("dental") || lowerMessage.includes("dentist") || lowerMessage.includes("orthodontist")) {
    return "dental_practice";
  }
  if (lowerMessage.includes("vet") || lowerMessage.includes("veterinary") || lowerMessage.includes("animal")) {
    return "veterinary_practice";
  }

  // State-specific intents
  if (lowerMessage.includes("south australia") || lowerMessage.includes(" sa ") || lowerMessage.includes("adelaide") || lowerMessage.includes("revenuesa")) {
    return "sa_specific";
  }
  if (lowerMessage.includes("new south wales") || lowerMessage.includes(" nsw ") || lowerMessage.includes("sydney") || lowerMessage.includes("revenue nsw")) {
    return "nsw_specific";
  }
  if (lowerMessage.includes("victoria") || lowerMessage.includes(" vic ") || lowerMessage.includes("melbourne") || lowerMessage.includes("sro victoria")) {
    return "vic_specific";
  }
  if (lowerMessage.includes("queensland") || lowerMessage.includes(" qld ") || lowerMessage.includes("brisbane")) {
    return "qld_specific";
  }
  if (lowerMessage.includes("tasmania") || lowerMessage.includes(" tas ") || lowerMessage.includes("hobart") || lowerMessage.includes("launceston")) {
    return "tas_specific";
  }

  // Transaction intents
  if (lowerMessage.includes("sell") || lowerMessage.includes("selling") || lowerMessage.includes("exit") || lowerMessage.includes("retire")) {
    return "practice_sale";
  }
  if (lowerMessage.includes("buy") || lowerMessage.includes("purchase") || lowerMessage.includes("acquire") || lowerMessage.includes("acquisition")) {
    return "practice_purchase";
  }
  if (lowerMessage.includes("start") || lowerMessage.includes("new practice") || lowerMessage.includes("establish") || lowerMessage.includes("opening")) {
    return "new_practice";
  }
  if (lowerMessage.includes("restructure") || lowerMessage.includes("reorganise") || lowerMessage.includes("change structure")) {
    return "restructure";
  }
  if (lowerMessage.includes("partnership dispute") || lowerMessage.includes("partner disagreement") || lowerMessage.includes("buyout partner")) {
    return "partnership_dispute";
  }

  // Compliance intents
  if (lowerMessage.includes("medicare") || lowerMessage.includes("mbs") || lowerMessage.includes("pbs") || lowerMessage.includes("bulk billing")) {
    return "medicare";
  }
  if (lowerMessage.includes("workcover") || lowerMessage.includes("workers comp") || lowerMessage.includes("work injury")) {
    return "workcover";
  }
  if (lowerMessage.includes("privacy") || lowerMessage.includes("health records") || lowerMessage.includes("data breach") || lowerMessage.includes("patient records")) {
    return "privacy";
  }

  // Service-specific intents
  if (lowerMessage.includes("employment contract") || lowerMessage.includes("staff contract") || lowerMessage.includes("hiring staff")) {
    return "employment_contract";
  }
  if (lowerMessage.includes("polic") || lowerMessage.includes("procedure") || lowerMessage.includes("governance")) {
    return "policies";
  }
  if (lowerMessage.includes("restraint") || lowerMessage.includes("non-compete") || lowerMessage.includes("restrictive covenant")) {
    return "restraint";
  }
  if (lowerMessage.includes("locum") || lowerMessage.includes("relief doctor") || lowerMessage.includes("covering leave")) {
    return "locum";
  }

  // FAQ intents
  if (lowerMessage.includes("what to expect") || lowerMessage.includes("how does it work") || lowerMessage.includes("consultation process")) {
    return "what_to_expect";
  }
  if (lowerMessage.includes("why speciali") || lowerMessage.includes("why not general lawyer") || lowerMessage.includes("what's different")) {
    return "why_specialised";
  }
  if (lowerMessage.includes("confidential") || lowerMessage.includes("privilege") || lowerMessage.includes("private") || lowerMessage.includes("who will know")) {
    return "confidentiality";
  }
  if (lowerMessage.includes("how long") || lowerMessage.includes("timeline") || lowerMessage.includes("when complete") || lowerMessage.includes("turnaround")) {
    return "timeline";
  }
  if (lowerMessage.includes("why hamilton") || lowerMessage.includes("compare") || lowerMessage.includes("what makes you different")) {
    return "comparison";
  }

  // Lead capture intents
  if (lowerMessage.includes("contact me") || lowerMessage.includes("call me") || lowerMessage.includes("reach me") || lowerMessage.includes("follow up")) {
    return "lead_capture";
  }

  // Pricing intent
  if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("fee") || lowerMessage.includes("how much")) {
    return "pricing";
  }

  // Tenant Doctor
  if (lowerMessage.includes("tenant doctor") || lowerMessage.includes("independent contractor")) {
    return "tenant_doctor";
  }

  // Payroll Tax
  if (lowerMessage.includes("payroll tax") || lowerMessage.includes("state revenue") || lowerMessage.includes("pt21") || lowerMessage.includes("21 requirements")) {
    return "payroll_tax";
  }

  // Fair Work
  if (lowerMessage.includes("fair work") || lowerMessage.includes("employment law")) {
    return "fair_work";
  }

  // AHPRA
  if (lowerMessage.includes("ahpra") || lowerMessage.includes("annual declaration") || lowerMessage.includes("practitioner registration")) {
    return "ahpra";
  }

  // Pathology
  if (lowerMessage.includes("pathology") || lowerMessage.includes("collection room")) {
    return "pathology";
  }

  // Legal Audit
  if (lowerMessage.includes("legal audit") || lowerMessage.includes("document review") || lowerMessage.includes("agreement review")) {
    return "legal_audit";
  }

  // Audit/Investigation (State Revenue)
  if (lowerMessage.includes("audit") || lowerMessage.includes("investigation") || lowerMessage.includes("sro")) {
    return "audit";
  }

  // Case Law
  if (lowerMessage.includes("thomas and naaz") || lowerMessage.includes("optical superstore") || lowerMessage.includes("hollis v vabu") || lowerMessage.includes("case law")) {
    return "case_law";
  }

  // Risk Language
  if (lowerMessage.includes("risk language") || lowerMessage.includes("risky language") || lowerMessage.includes("what to avoid") || lowerMessage.includes("compliance language")) {
    return "risk_language";
  }

  // Compliance
  if (lowerMessage.includes("compliance") || lowerMessage.includes("regulatory") || lowerMessage.includes("triple threat")) {
    return "compliance";
  }

  // Structure
  if (lowerMessage.includes("structure") || lowerMessage.includes("service entity")) {
    return "structure";
  }

  // Property/Lease
  if (lowerMessage.includes("property") || lowerMessage.includes("lease") || lowerMessage.includes("rent")) {
    return "property";
  }

  // Health and Life / Accounting / David Dahm
  if (lowerMessage.includes("health and life") || lowerMessage.includes("accounting") || lowerMessage.includes("accountant") || lowerMessage.includes("david dahm")) {
    return "partnership";
  }

  // Technology
  if (lowerMessage.includes("technology") || lowerMessage.includes("calculator") || lowerMessage.includes("xero") || lowerMessage.includes("doctors pay")) {
    return "technology";
  }

  // Contact
  if (lowerMessage.includes("contact") || lowerMessage.includes("phone") || lowerMessage.includes("email") || lowerMessage.includes("call")) {
    return "contact";
  }

  // Urgent
  if (lowerMessage.includes("urgent") || lowerMessage.includes("emergency") || lowerMessage.includes("immediate")) {
    return "urgent";
  }

  // Copyright/Licensing
  if (lowerMessage.includes("copyright") || lowerMessage.includes("licensing") || lowerMessage.includes("trademark") || lowerMessage.includes("permitted use")) {
    return "copyright";
  }

  // Library/Resources
  if (lowerMessage.includes("library") || lowerMessage.includes("resources") || lowerMessage.includes("templates") || lowerMessage.includes("guides")) {
    return "resources";
  }

  // About/Company
  if (lowerMessage.includes("about") || lowerMessage.includes("who are") || lowerMessage.includes("tell me about")) {
    return "about";
  }

  // Team
  if (lowerMessage.includes("lukasz") || lowerMessage.includes("wyszynski") || lowerMessage.includes("lawyer") || lowerMessage.includes("team")) {
    return "team";
  }

  // Out of scope detection
  if (lowerMessage.includes("criminal") || lowerMessage.includes("family law") || lowerMessage.includes("divorce") ||
      lowerMessage.includes("immigration") || lowerMessage.includes("visa") || lowerMessage.includes("personal injury")) {
    return "out_of_scope";
  }

  return "general_inquiry";
}

/**
 * Handle objections with appropriate responses
 */
export function handleObjection(message: string): { handled: boolean; response: string } {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("expensive") || lowerMessage.includes("too much") || (lowerMessage.includes("cost") && lowerMessage.includes("high"))) {
    return {
      handled: true,
      response: "I understand cost is an important consideration. However, consider that payroll tax liabilities alone can exceed $250,000 - our services are an investment in protecting your practice.\n\n**Cost Comparison:**\n• Potential payroll tax liability: $250,000+\n• Fair Work penalties: Up to $66,600 per breach\n• Our proactive compliance services: Fraction of these amounts\n\nWe also offer fixed-fee pricing so you know exactly what to expect. Would you like a quote for your specific needs?"
    };
  }

  if (lowerMessage.includes("think about it") || lowerMessage.includes("not sure") || lowerMessage.includes("maybe later")) {
    return {
      handled: true,
      response: "Of course, take the time you need. However, if you have any compliance concerns, it's worth knowing that:\n\n• Payroll tax audits are increasing\n• Early intervention significantly improves outcomes\n• Our initial risk assessment can identify exposures\n\nWhile you're considering, I'm happy to answer any questions. Is there specific information that would help with your decision?"
    };
  }

  if (lowerMessage.includes("diy") || lowerMessage.includes("do it myself") || lowerMessage.includes("don't need a lawyer")) {
    return {
      handled: true,
      response: "We appreciate the independent approach! However, medical practice compliance has become increasingly complex:\n\n**Why Specialized Expertise Matters:**\n• Recent cases like Thomas and Naaz [2022] have changed interpretations\n• The 'triple regulatory threat' requires coordinated strategies\n• DIY structures often trigger the very audits you're trying to avoid\n\nMany clients come to us after DIY attempts created problems. A quick review now could prevent significant issues later.\n\nWould you like a confidential assessment of your current arrangements?"
    };
  }

  if (lowerMessage.includes("already have") || lowerMessage.includes("current lawyer") || lowerMessage.includes("accountant handles")) {
    return {
      handled: true,
      response: "That's great you have professional support. However, our specialization in medical practice law offers unique advantages:\n\n**Hamilton Bailey Difference:**\n• Exclusive Tenant Doctor™ trademark owners\n• Partnership with Health and Life (1,200+ medical clients)\n• Specialized expertise vs. generalist practitioners\n• Deep understanding of healthcare-specific regulations\n\nMany clients use us alongside their existing advisors for specialised matters. Would you like to discuss how we complement your current team?"
    };
  }

  return { handled: false, response: "" };
}
