/**
 * AI Chat Knowledge Base - Hamilton Bailey Law Firm
 *
 * Comprehensive knowledge base containing all Hamilton Bailey-specific information
 * imported from bailey-legal-bloom project (38 entries total)
 *
 * Categories covered:
 * - Company information (overview, principal, contact)
 * - Services (Tenant Doctor™, payroll tax, commercial law, audits, pathology)
 * - Compliance (AHPRA, Fair Work, risk indicators, regulatory)
 * - Expertise (case law: Thomas/Naaz, Optical Superstore, Hollis v Vabu)
 * - Partnerships (Health and Life, David Dahm clarification)
 * - Resources (library, educational, technology)
 */

export interface KnowledgeItem {
  id: string;
  category: string;
  subcategory: string;
  topic: string;
  title: string;
  content: string;
  summary: string;
  keywords: string[];
  intentPatterns: string[];
  responseTemplate: string;
  requiresDisclaimer: boolean;
  legalDisclaimer: string;
  adviceLevel: "general" | "educational" | "specific";
  confidenceLevel: number;
  relatedProducts?: string[];
  xpReward: number;
  metadata?: Record<string, unknown>;
}

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
];

// XP rewards for chat interactions
export const CHAT_XP_REWARDS = {
  askQuestion: 5,
  viewProduct: 10,
  requestCallback: 25,
  bookConsultation: 50,
  completeSurvey: 30,
} as const;

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

  // Booking intent
  if (lowerMessage.includes("book") || lowerMessage.includes("appointment") || lowerMessage.includes("consultation")) {
    return "booking";
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
  if (lowerMessage.includes("fair work") || lowerMessage.includes("employment")) {
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
