import { Building, FileCheck, FileText, Users, Scale, Plane, Shield, Briefcase, BookOpen, AlertTriangle } from "lucide-react";

export interface Service {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  icon: typeof Building;
  features: string[];
  benefits: string[];
  faqs: { question: string; answer: string }[];
  relatedServices: string[];
  cta: {
    primary: string;
    secondary: string;
  };
}

export const services: Service[] = [
  {
    id: "practice-setup",
    title: "Practice Setup & Structuring",
    shortDescription:
      "Establish your practice with the optimal legal structure for tax efficiency and asset protection.",
    fullDescription:
      "Starting a medical practice involves complex legal and financial decisions that will impact your business for years to come. Our experienced team guides you through every step of practice establishment, from choosing the right business structure to negotiating your first lease. We understand the unique challenges faced by healthcare professionals and provide tailored advice that protects your interests while positioning your practice for growth.",
    icon: Building,
    features: [
      "Business structure advice (sole trader, partnership, company, trust)",
      "Partnership agreements and shareholder agreements",
      "Corporate structuring for multi-practitioner clinics",
      "Tax efficiency planning and ATO compliance",
      "Asset protection strategies",
      "Medicare provider registration assistance",
      "Practice policy development",
      "Insurance review and recommendations",
    ],
    benefits: [
      "Minimize personal liability exposure",
      "Optimize tax position from day one",
      "Establish clear ownership and profit-sharing arrangements",
      "Avoid costly restructuring down the track",
      "Ensure regulatory compliance from the start",
    ],
    faqs: [
      {
        question: "What's the best structure for a new medical practice?",
        answer:
          "The optimal structure depends on your specific circumstances, including number of practitioners, expected revenue, asset protection needs, and long-term goals. Most medical practices benefit from operating through a company or trust structure, but we'll analyze your situation to recommend the best approach.",
      },
      {
        question: "How long does practice setup typically take?",
        answer:
          "A straightforward setup can be completed in 2-4 weeks. More complex structures involving multiple practitioners or trust arrangements may take 4-8 weeks. We'll provide a clear timeline based on your specific requirements.",
      },
      {
        question: "Do you help with Medicare registration?",
        answer:
          "Yes, we assist with all aspects of Medicare provider registration, including ensuring your practice structure meets Medicare requirements and advising on billing arrangements.",
      },
    ],
    relatedServices: ["regulatory-compliance", "property-leasing", "employment-hr"],
    cta: {
      primary: "Book Practice Setup Consultation",
      secondary: "Download Structure Comparison Guide",
    },
  },
  {
    id: "regulatory-compliance",
    title: "Regulatory Compliance",
    shortDescription:
      "Navigate AHPRA, Medicare, and health department requirements with confidence.",
    fullDescription:
      "Healthcare regulation in Australia is complex and constantly evolving. A compliance breach can result in significant penalties, loss of Medicare billing privileges, or even suspension of your registration. Our regulatory compliance team stays across all changes to healthcare law and provides proactive advice to keep your practice compliant. From AHPRA notifications to Medicare audits, we've handled it all.",
    icon: FileCheck,
    features: [
      "AHPRA compliance and notification responses",
      "Medicare billing compliance reviews",
      "Health department regulations and inspections",
      "Privacy Act and health records compliance",
      "Accreditation support (RACGP, ACRRM, college requirements)",
      "Mandatory reporting obligations",
      "Advertising and social media compliance",
      "Clinical governance frameworks",
    ],
    benefits: [
      "Avoid costly penalties and regulatory action",
      "Protect your professional registration",
      "Maintain Medicare billing privileges",
      "Reduce stress of compliance management",
      "Stay ahead of regulatory changes",
    ],
    faqs: [
      {
        question: "What should I do if I receive an AHPRA notification?",
        answer:
          "Contact us immediately. AHPRA matters are time-sensitive and your response can significantly impact the outcome. We'll review the notification, prepare a comprehensive response, and represent you throughout the process.",
      },
      {
        question: "How often should we review our compliance?",
        answer:
          "We recommend a comprehensive compliance review annually, with ongoing monitoring of regulatory changes. For high-risk practices or those with previous compliance issues, quarterly reviews may be appropriate.",
      },
      {
        question: "Can you help with Medicare audits?",
        answer:
          "Absolutely. We have extensive experience in Medicare compliance reviews and audits. We can conduct pre-audit assessments, represent you during audits, and negotiate outcomes if issues are identified.",
      },
    ],
    relatedServices: ["practice-setup", "dispute-resolution", "risk-management"],
    cta: {
      primary: "Book Compliance Review",
      secondary: "Download Compliance Checklist",
    },
  },
  {
    id: "property-leasing",
    title: "Property & Leasing",
    shortDescription:
      "Expert advice on medical centre leases, tenant doctor agreements, and property transactions.",
    fullDescription:
      "Property decisions are among the most significant financial commitments your practice will make. Whether you're leasing space in a medical centre, negotiating a tenant doctor agreement, or purchasing your own premises, expert legal advice is essential. We understand the unique aspects of medical property transactions and advocate strongly for practitioners' interests.",
    icon: FileText,
    features: [
      "Commercial lease negotiations",
      "Tenant doctor agreement review and drafting",
      "Property purchases and due diligence",
      "Fit-out contracts and builder negotiations",
      "Sublease and licence arrangements",
      "Lease renewals and rent reviews",
      "Make-good obligations",
      "Security of tenure advice",
    ],
    benefits: [
      "Secure favorable lease terms",
      "Avoid hidden costs and unfair clauses",
      "Protect your investment in fit-out",
      "Ensure flexibility for practice growth",
      "Understand your rights and obligations",
    ],
    faqs: [
      {
        question: "What should I look for in a tenant doctor agreement?",
        answer:
          "Key issues include billing arrangements, patient ownership, restrictive covenants, notice periods, and fee structures. We've reviewed hundreds of these agreements and know the common traps to avoid.",
      },
      {
        question: "Should I lease or buy my practice premises?",
        answer:
          "This depends on your financial situation, growth plans, and local property market. We can connect you with financial advisors to model both scenarios and provide legal advice on the implications of each approach.",
      },
      {
        question: "What's a reasonable notice period for leaving a medical centre?",
        answer:
          "This varies significantly, but we generally recommend negotiating for no more than 3-6 months. Some centres try to lock in 12 months or more, which we would advise against.",
      },
    ],
    relatedServices: ["practice-setup", "employment-hr", "healthcare-contracts"],
    cta: {
      primary: "Review My Lease",
      secondary: "Download Lease Checklist",
    },
  },
  {
    id: "employment-hr",
    title: "Employment & HR",
    shortDescription:
      "Manage staff contracts, workplace policies, and employment disputes effectively.",
    fullDescription:
      "Your team is your practice's most valuable asset, but employment relationships also represent significant legal risk. From hiring to termination, every step needs to be handled correctly. Our employment lawyers understand both the legal requirements and the practical realities of running a medical practice. We help you build a compliant, productive workplace.",
    icon: Users,
    features: [
      "Employment contracts for medical and administrative staff",
      "Workplace policies and procedures",
      "Performance management processes",
      "Termination and redundancy advice",
      "Award interpretation and compliance",
      "Unfair dismissal defence",
      "Workplace investigations",
      "Independent contractor arrangements",
    ],
    benefits: [
      "Reduce risk of employment claims",
      "Build a compliant workplace from the start",
      "Handle difficult situations confidently",
      "Understand your obligations as an employer",
      "Protect your practice's reputation",
    ],
    faqs: [
      {
        question: "Do I need written contracts for all staff?",
        answer:
          "While not legally required for all employees, written contracts are strongly recommended. They clarify expectations, protect confidential information, and can include important provisions like restraint of trade clauses.",
      },
      {
        question: "What award covers medical practice staff?",
        answer:
          "Most medical practice staff are covered by the Health Professionals and Support Services Award or the Nurses Award. Correct award classification is essential for compliance.",
      },
      {
        question: "Can I use independent contractors instead of employees?",
        answer:
          "Potentially, but the arrangement must genuinely reflect an independent contractor relationship. Sham contracting carries significant penalties. We can advise on whether your proposed arrangement will be compliant.",
      },
    ],
    relatedServices: ["practice-setup", "dispute-resolution", "regulatory-compliance"],
    cta: {
      primary: "Book HR Consultation",
      secondary: "Download Employment Contract Template",
    },
  },
  {
    id: "dispute-resolution",
    title: "Dispute Resolution",
    shortDescription:
      "Professional representation in practice disputes, partnership disagreements, and regulatory matters.",
    fullDescription:
      "Disputes in healthcare can be professionally and personally devastating. Whether you're facing a partnership breakdown, patient complaint, or regulatory investigation, you need experienced advocates in your corner. We've successfully resolved hundreds of healthcare disputes through negotiation, mediation, and litigation. Our goal is always to achieve the best possible outcome while minimizing stress and disruption to your practice.",
    icon: Scale,
    features: [
      "Partnership and shareholder disputes",
      "Patient complaints and clinical claims",
      "AHPRA and regulatory investigations",
      "Medical board matters",
      "Mediation and negotiation services",
      "VCAT and tribunal representation",
      "Court litigation",
      "Debt recovery",
    ],
    benefits: [
      "Expert representation from healthcare specialists",
      "Strategic approach to dispute resolution",
      "Protection of your professional reputation",
      "Minimize disruption to your practice",
      "Achieve fair outcomes efficiently",
    ],
    faqs: [
      {
        question: "How long do disputes typically take to resolve?",
        answer:
          "This varies significantly depending on the complexity and whether parties are willing to negotiate. Simple matters may resolve in weeks, while complex litigation can take 12-24 months. We'll give you a realistic assessment early on.",
      },
      {
        question: "Should I try to resolve disputes directly first?",
        answer:
          "Sometimes, but be careful. Anything you say or write may be used later. We recommend getting legal advice before engaging in substantive discussions, even if you ultimately handle the matter yourself.",
      },
      {
        question: "What's the difference between mediation and arbitration?",
        answer:
          "Mediation is a facilitated negotiation where you retain control of the outcome. Arbitration is more like private court where an arbitrator makes a binding decision. Both have their place depending on the circumstances.",
      },
    ],
    relatedServices: ["regulatory-compliance", "employment-hr", "risk-management"],
    cta: {
      primary: "Book Urgent Consultation",
      secondary: "Learn About Our Process",
    },
  },
  {
    id: "healthcare-visas",
    title: "Healthcare Visas",
    shortDescription:
      "Specialist immigration support for international medical professionals.",
    fullDescription:
      "Australia's healthcare system relies heavily on international medical graduates and allied health professionals. Navigating the visa system while managing your medical career is challenging. Our healthcare visa team understands both immigration law and the specific requirements of medical registration and practice. We help international practitioners establish themselves in Australia and assist practices in sponsoring overseas talent.",
    icon: Plane,
    features: [
      "Skilled worker visa applications (subclass 482, 494, 186)",
      "Employer sponsorship guidance",
      "Visa condition compliance",
      "Pathway to permanent residency",
      "Family migration support",
      "District of Workforce Shortage placements",
      "Rural and regional visa options",
      "Visa renewals and variations",
    ],
    benefits: [
      "Navigate complex visa requirements confidently",
      "Maximize your pathway options",
      "Maintain compliance with visa conditions",
      "Coordinate visa and medical registration timelines",
      "Support for the whole family",
    ],
    faqs: [
      {
        question: "Can I change employers on a 482 visa?",
        answer:
          "Yes, but your new employer must become your sponsor and lodge a new nomination. You generally have 60 days to find a new sponsor if your employment ends, but the rules are complex and professional advice is essential.",
      },
      {
        question: "How long does employer sponsorship take?",
        answer:
          "Standard Business Sponsorship takes 1-3 months, nomination 3-6 months, and visa 3-12 months depending on the visa subclass. We can expedite urgent cases where possible.",
      },
      {
        question: "Do you help with medical registration as well?",
        answer:
          "While we don't handle medical registration directly, we work closely with registration advisors and ensure your visa timeline aligns with your registration pathway.",
      },
    ],
    relatedServices: ["practice-setup", "employment-hr", "regulatory-compliance"],
    cta: {
      primary: "Book Migration Consultation",
      secondary: "Download Visa Pathway Guide",
    },
  },
  {
    id: "healthcare-contracts",
    title: "Healthcare Contracts",
    shortDescription:
      "Expert drafting and review of contracts for healthcare businesses and practitioners.",
    fullDescription:
      "Contracts govern every aspect of healthcare business relationships. From supplier agreements to joint venture arrangements, getting contracts right protects your interests and prevents costly disputes. Our healthcare contract specialists understand the industry and draft agreements that work in practice. We've reviewed thousands of healthcare contracts and know what works and what creates problems.",
    icon: Briefcase,
    features: [
      "Service agreements with hospitals and health funds",
      "Medical equipment purchase and maintenance contracts",
      "Pathology and radiology referral arrangements",
      "Locum and contractor agreements",
      "Joint venture and collaboration agreements",
      "Consulting and advisory contracts",
      "Software and technology agreements",
      "Supplier and vendor contracts",
    ],
    benefits: [
      "Protect your commercial interests",
      "Reduce risk of disputes",
      "Ensure compliance with healthcare regulations",
      "Clear terms that both parties understand",
      "Flexibility to adapt as circumstances change",
    ],
    faqs: [
      {
        question: "Should I have a lawyer review every contract?",
        answer:
          "For significant contracts (high value, long term, or strategic importance), definitely. For routine agreements, we can provide templates and checklists so you can handle basic review yourself and escalate complex issues.",
      },
      {
        question: "What makes healthcare contracts different?",
        answer:
          "Healthcare contracts must navigate complex regulatory requirements, Medicare and health fund rules, privacy obligations, and professional standards. A general commercial lawyer may miss these nuances.",
      },
      {
        question: "Can you help with contract negotiations?",
        answer:
          "Yes, we regularly assist with contract negotiations. We can advise behind the scenes or participate directly in negotiations, depending on what works best for your situation.",
      },
    ],
    relatedServices: ["practice-setup", "property-leasing", "employment-hr"],
    cta: {
      primary: "Request Contract Review",
      secondary: "Browse Contract Templates",
    },
  },
  {
    id: "medical-practice-compliance",
    title: "Medical Practice Compliance",
    shortDescription:
      "Comprehensive compliance programs for medical practices of all sizes.",
    fullDescription:
      "Maintaining compliance across all aspects of your practice is increasingly complex. From clinical governance to workplace health and safety, privacy to Medicare billing, there's a lot to get right. Our practice compliance programs provide a systematic approach to identifying and managing compliance risks. We work with you to build sustainable compliance systems that integrate with your practice operations.",
    icon: Shield,
    features: [
      "Compliance audits and gap analysis",
      "Policy and procedure development",
      "Staff training programs",
      "Incident management systems",
      "Complaint handling procedures",
      "Quality improvement frameworks",
      "Board and governance support",
      "Ongoing compliance monitoring",
    ],
    benefits: [
      "Systematic approach to compliance management",
      "Reduced risk of regulatory action",
      "Improved patient safety outcomes",
      "Staff confidence in procedures",
      "Evidence of compliance for accreditation",
    ],
    faqs: [
      {
        question: "How often should we conduct compliance audits?",
        answer:
          "We recommend a comprehensive audit annually, with targeted reviews of high-risk areas quarterly. Major changes to your practice or regulations should trigger additional reviews.",
      },
      {
        question: "What's included in a compliance audit?",
        answer:
          "Our audits cover regulatory compliance, clinical governance, workplace health and safety, privacy, Medicare billing, employment, and any area-specific requirements for your specialty.",
      },
      {
        question: "Can you provide staff training?",
        answer:
          "Yes, we offer customized training programs on compliance topics including privacy, mandatory reporting, complaints handling, and workplace safety. Training can be delivered online or in-person.",
      },
    ],
    relatedServices: ["regulatory-compliance", "risk-management", "practice-setup"],
    cta: {
      primary: "Book Compliance Audit",
      secondary: "Download Compliance Guide",
    },
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    shortDescription:
      "Protect your practice's brand, innovations, and proprietary information.",
    fullDescription:
      "Your practice's intellectual property may be more valuable than you realize. From your practice name and branding to clinical protocols and patient databases, these assets need protection. We help healthcare businesses identify, protect, and commercialize their intellectual property. Whether you're defending against infringement or developing new healthcare innovations, we provide strategic IP advice.",
    icon: BookOpen,
    features: [
      "Trademark registration and protection",
      "Brand protection strategies",
      "Confidentiality and non-disclosure agreements",
      "Trade secret protection",
      "Research collaboration agreements",
      "Licensing and commercialization",
      "IP due diligence for acquisitions",
      "Infringement actions",
    ],
    benefits: [
      "Protect your practice's reputation and brand",
      "Secure proprietary information",
      "Create value from innovations",
      "Prevent unauthorized use of your IP",
      "Strategic approach to IP management",
    ],
    faqs: [
      {
        question: "Should I trademark my practice name?",
        answer:
          "If your practice name is distinctive and you've built goodwill in it, trademark registration provides strong protection. We can search existing trademarks and advise on registration.",
      },
      {
        question: "How do I protect my clinical protocols?",
        answer:
          "Clinical protocols can be protected through confidentiality agreements, employment contracts, and careful information management. In some cases, patent protection may be available.",
      },
      {
        question: "What if someone is using a similar name to my practice?",
        answer:
          "This depends on whether you have trademark registration, how similar the names are, and whether there's likely to be confusion. We can assess the situation and advise on your options.",
      },
    ],
    relatedServices: ["healthcare-contracts", "employment-hr", "practice-setup"],
    cta: {
      primary: "Book IP Consultation",
      secondary: "Download Brand Protection Guide",
    },
  },
  {
    id: "risk-management",
    title: "Risk Management",
    shortDescription:
      "Identify, assess, and mitigate legal and operational risks in your practice.",
    fullDescription:
      "Proactive risk management protects your practice, your patients, and your professional reputation. We help healthcare businesses build comprehensive risk management frameworks that identify potential issues before they become problems. From clinical risk to commercial risk, insurance coverage to incident response, we provide practical advice that works in the real world of healthcare.",
    icon: AlertTriangle,
    features: [
      "Risk assessment and mapping",
      "Insurance coverage reviews",
      "Incident response planning",
      "Crisis management support",
      "Clinical governance frameworks",
      "Medico-legal risk reduction",
      "Documentation standards",
      "Training and education",
    ],
    benefits: [
      "Identify risks before they materialize",
      "Ensure adequate insurance protection",
      "Respond effectively to incidents",
      "Reduce liability exposure",
      "Build a culture of safety",
    ],
    faqs: [
      {
        question: "What risks should medical practices prioritize?",
        answer:
          "Key risks include clinical incidents, regulatory compliance, employment issues, data breaches, and financial risks. We tailor our assessment to your practice type and specialty.",
      },
      {
        question: "How does risk management reduce insurance costs?",
        answer:
          "Many insurers offer premium discounts for practices with robust risk management systems. More importantly, good risk management reduces the likelihood of claims, which keeps premiums down over time.",
      },
      {
        question: "What should we do after a clinical incident?",
        answer:
          "Follow your incident response plan, document everything, notify your insurer, and seek legal advice before making any admissions. We can guide you through the process to protect all interests.",
      },
    ],
    relatedServices: ["regulatory-compliance", "dispute-resolution", "medical-practice-compliance"],
    cta: {
      primary: "Book Risk Assessment",
      secondary: "Download Risk Checklist",
    },
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.id === slug);
}

export function getRelatedServices(serviceId: string): Service[] {
  const service = getServiceBySlug(serviceId);
  if (!service) return [];

  return service.relatedServices
    .map((id) => services.find((s) => s.id === id))
    .filter((s): s is Service => s !== undefined);
}

export function getAllServiceSlugs(): string[] {
  return services.map((service) => service.id);
}
