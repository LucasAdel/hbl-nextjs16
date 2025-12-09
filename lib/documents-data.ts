export interface Document {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  category: string;
  practiceArea: string;
  jurisdictions: string[];
  featured?: boolean;
  subscription?: {
    initial: number;
    monthly: number;
    months: number;
  };
  stages?: {
    name: string;
    description: string;
    price: number;
    processingTime: string;
    requiresPrevious?: boolean;
    subscriptionDetails?: string;
  }[];
  targetAudience?: string[];
  features?: string[];
}

export const allDocuments: Document[] = [
  // Healthcare Law
  {
    id: "tenant-doctor",
    name: "Tenant Doctor Service Agreement",
    description:
      "A comprehensive agreement for medical practitioners operating as tenant doctors within a shared premises, covering fee structures, obligations, and practice arrangements.",
    longDescription:
      "This comprehensive service agreement is specifically designed for medical practitioners who operate as tenant doctors within shared medical premises. The document covers all essential aspects including fee structures, service obligations, practice arrangements, and compliance requirements. It ensures both the host practice and tenant doctor have clear expectations and legal protections.",
    price: 1500,
    category: "Healthcare Law",
    practiceArea: "Medical Practice",
    jurisdictions: ["All States", "Federal"],
    featured: true,
    stages: [
      {
        name: "Stage 1: Analysis as to Tenant Doctor Eligibility & Business Structure Review",
        description: "Comprehensive review of eligibility criteria and business structure assessment",
        price: 1500,
        processingTime: "14 days",
      },
      {
        name: "Stage 2: Document Subscription",
        description: "24-month commitment at $30/month - paid in full",
        price: 720,
        processingTime: "7 days",
        requiresPrevious: true,
        subscriptionDetails: "24-month commitment at $30/month - paid in full",
      },
    ],
    targetAudience: [
      "Australian medical practitioners and healthcare organisations",
      "Healthcare facilities needing compliant legal documentation",
      "Medical practices looking to standardise their legal processes",
    ],
    features: ["Document Drafting", "Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "employment-medical",
    name: "Employment Contract for Medical Practitioners",
    description:
      "A comprehensive employment contract template specifically designed for medical practitioners, including provisions for professional obligations, indemnity, and leave entitlements.",
    longDescription:
      "This employment contract is tailored specifically for the medical profession, addressing unique considerations such as professional registration requirements, Medicare billing arrangements, professional indemnity insurance, and continuing professional development obligations. It provides a robust framework for employment relationships in healthcare settings.",
    price: 1799,
    category: "Employment Law",
    practiceArea: "Healthcare",
    jurisdictions: ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"],
    targetAudience: [
      "Medical practices hiring employed doctors",
      "Healthcare organisations",
      "Medical practitioners seeking employment",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "medical-partnership",
    name: "Medical Practice Partnership Agreement",
    description:
      "Detailed partnership agreement for medical practices, covering profit sharing, decision-making, dispute resolution, and exit strategies.",
    longDescription:
      "A comprehensive partnership agreement designed specifically for medical practices. This document addresses the unique considerations of medical partnerships including profit sharing arrangements, decision-making procedures, handling of patient lists, professional indemnity requirements, and succession planning. Essential for any medical practice with multiple partners.",
    price: 2499,
    category: "Business Structures",
    practiceArea: "Medical Practice",
    jurisdictions: ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"],
    targetAudience: [
      "Medical practitioners entering partnerships",
      "Existing medical partnerships seeking updated documentation",
      "Healthcare business advisors",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "practice-purchase",
    name: "Practice Purchase Agreement",
    description:
      "Complete agreement for the purchase or sale of a medical practice, including due diligence schedules and warranty provisions.",
    longDescription:
      "A comprehensive agreement governing the acquisition or sale of a medical practice. This document covers all aspects of the transaction including purchase price mechanics, due diligence requirements, employee transitions, patient record transfers, Medicare provider number considerations, and post-completion obligations.",
    price: 2799.99,
    category: "Business Transactions",
    practiceArea: "Medical Practice",
    jurisdictions: ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"],
    targetAudience: [
      "Medical practitioners purchasing a practice",
      "Practice owners looking to sell",
      "Healthcare business brokers",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  // Commercial Law
  {
    id: "confidentiality",
    name: "Confidentiality Agreement",
    description:
      "Also known as Non-Disclosure Agreement (NDA), this legal contract creates a confidential relationship between parties, protecting sensitive information shared during business dealings.",
    longDescription:
      "A robust confidentiality agreement designed to protect sensitive business information. This document establishes clear obligations regarding the handling, use, and disclosure of confidential information. Suitable for a wide range of business scenarios including employment relationships, business negotiations, and contractor engagements.",
    price: 1023,
    category: "Commercial Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "Businesses sharing sensitive information",
      "Parties entering negotiations",
      "Employers protecting trade secrets",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "services-agreement",
    name: "Services Agreement",
    description:
      "A contract between a service provider and a client that outlines the scope of services, payment terms, and other conditions of the service arrangement.",
    longDescription:
      "A comprehensive services agreement suitable for various professional service arrangements. This document clearly defines the scope of services, payment terms, intellectual property rights, liability limitations, and termination provisions. Customisable for different service types and industries.",
    price: 1968,
    category: "Commercial Law",
    practiceArea: "Healthcare",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "Service providers",
      "Consultants and contractors",
      "Businesses engaging service providers",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "website-terms",
    name: "Website Terms of Use",
    description:
      "Legal terms governing the use of a website, protecting the owner from liability and establishing rules for user conduct. Essential for any business with an online presence.",
    longDescription:
      "Comprehensive website terms of use that protect website owners and establish clear rules for users. This document covers intellectual property rights, user conduct, disclaimers, limitation of liability, and dispute resolution. Essential for any business with an online presence.",
    price: 1245,
    category: "Commercial Law",
    practiceArea: "Digital",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "Website owners",
      "E-commerce businesses",
      "Digital service providers",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "partnership-agreement",
    name: "Partnership Agreement",
    description:
      "A contract that establishes the terms of a partnership, including profit sharing, decision-making procedures, and dispute resolution processes.",
    longDescription:
      "A detailed partnership agreement establishing the framework for business partnerships. This document covers capital contributions, profit and loss sharing, management responsibilities, admission of new partners, departure of existing partners, and dissolution procedures.",
    price: 2499,
    category: "Commercial Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "Business partners",
      "Professional practices",
      "Joint venture participants",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  // Employment Law
  {
    id: "employment-contract",
    name: "Employment Contract",
    description:
      "A legally binding agreement between an employer and employee, outlining employment terms including duties, compensation, benefits, and termination conditions.",
    longDescription:
      "A comprehensive employment contract that clearly defines the employment relationship. This document covers position details, remuneration, leave entitlements, confidentiality obligations, intellectual property rights, and termination procedures. Compliant with the Fair Work Act and applicable modern awards.",
    price: 1799,
    category: "Employment Law",
    practiceArea: "Healthcare",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "Employers hiring staff",
      "HR departments",
      "Small business owners",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "contractor-agreement",
    name: "Independent Contractor Agreement",
    description:
      "A contract between a business and an independent contractor that outlines the services to be provided, terms of payment, and clarifies that the relationship is not an employment relationship.",
    longDescription:
      "A robust contractor agreement that establishes a clear independent contractor relationship. This document addresses service delivery, payment terms, intellectual property ownership, insurance requirements, and the independent nature of the relationship. Designed to minimise the risk of sham contracting claims.",
    price: 1678,
    category: "Employment Law",
    practiceArea: "Healthcare",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "Businesses engaging contractors",
      "Independent contractors",
      "Freelance professionals",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "esop",
    name: "Employee Share Option Plan",
    description:
      "A scheme that grants employees options to purchase company shares at a predetermined price, serving as an incentive and retention tool.",
    longDescription:
      "A comprehensive employee share option plan designed to incentivise and retain key employees. This document covers option grants, vesting schedules, exercise procedures, and tax considerations. Compliant with the Corporations Act and relevant tax legislation.",
    price: 3410,
    category: "Employment Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "Growing companies",
      "Startups attracting talent",
      "Businesses implementing equity incentives",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  // Property Law
  {
    id: "commercial-lease",
    name: "Commercial Lease",
    description:
      "A legally binding agreement between a landlord and a tenant for the leasing of commercial property, outlining terms such as rent, duration, and maintenance responsibilities.",
    longDescription:
      "A comprehensive commercial lease agreement suitable for office, industrial, and other commercial premises. This document covers rent and outgoings, lease term and options, permitted use, maintenance obligations, and default provisions. Designed for use in all Australian states and territories.",
    price: 1753,
    category: "Property Law",
    practiceArea: "Business",
    jurisdictions: ["All States"],
    targetAudience: [
      "Commercial landlords",
      "Business tenants",
      "Property managers",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "retail-lease",
    name: "Retail Lease",
    description:
      "A specialised lease for retail premises that complies with retail leasing legislation, providing additional protections for retail tenants.",
    longDescription:
      "A retail lease agreement that complies with state-specific retail leasing legislation. This document includes all mandatory disclosure requirements and tenant protections required by law. Suitable for shopping centre tenancies, strip retail, and other retail premises.",
    price: 1643,
    category: "Property Law",
    practiceArea: "Business",
    jurisdictions: ["All States"],
    targetAudience: [
      "Retail landlords",
      "Retail business owners",
      "Shopping centre managers",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "conveyancing",
    name: "Conveyancing",
    description:
      "Legal services for the transfer of property ownership, including contract preparation, title searches, and settlement arrangements.",
    longDescription:
      "Complete conveyancing services for property transactions. This service includes preparation and review of contracts, title searches, liaison with financial institutions, stamp duty calculations, and settlement arrangements. Available for residential and commercial properties.",
    price: 1490,
    category: "Property Law",
    practiceArea: "Property",
    jurisdictions: ["All States"],
    targetAudience: [
      "Property buyers",
      "Property sellers",
      "Real estate investors",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "put-call-option",
    name: "Put & Call Option Deed",
    description:
      "A legal agreement giving one party the right to buy (call option) and the other party the right to sell (put option) a property at predetermined terms.",
    longDescription:
      "A put and call option deed for property transactions. This structure is commonly used for property development and investment purposes, providing flexibility in timing while securing the transaction terms. Includes detailed provisions for option exercise and completion.",
    price: 2212,
    category: "Property Law",
    practiceArea: "Business",
    jurisdictions: ["All States"],
    targetAudience: [
      "Property developers",
      "Real estate investors",
      "Commercial property owners",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  // Corporate Law
  {
    id: "shareholders-agreement",
    name: "Shareholders' Agreement",
    description:
      "A comprehensive agreement between shareholders that outlines their rights, responsibilities, and obligations to each other and the company. Essential for any business with multiple shareholders.",
    longDescription:
      "A detailed shareholders' agreement establishing the framework for shareholder relationships. This document covers decision-making processes, dividend policies, share transfer restrictions, dispute resolution, and exit mechanisms. Essential protection for shareholders in any company.",
    price: 2639,
    category: "Corporate Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "Company shareholders",
      "Business partners",
      "Investors",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "share-sale",
    name: "Share Sale Agreement",
    description:
      "A legally binding contract for the sale and purchase of shares in a company, detailing the terms, conditions, and warranties associated with the transaction.",
    longDescription:
      "A comprehensive share sale agreement for the transfer of shares in a company. This document covers purchase price mechanics, warranties and indemnities, completion procedures, and post-completion obligations. Suitable for both majority and minority stake acquisitions.",
    price: 2693,
    category: "Corporate Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "Share buyers",
      "Share sellers",
      "M&A advisors",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "sale-of-business",
    name: "Sale of Business Agreement",
    description:
      "A comprehensive agreement governing the sale of a business as a going concern, including assets, liabilities, employees, and contracts.",
    longDescription:
      "A detailed agreement for the sale of a business as a going concern. This document covers the transfer of assets, assumption of liabilities, employee transitions, assignment of contracts, and ongoing obligations. Includes comprehensive warranties and indemnities.",
    price: 3146,
    category: "Corporate Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "Business sellers",
      "Business buyers",
      "Business brokers",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "asset-sale",
    name: "Asset Sale Agreement",
    description:
      "A contract for the sale of specific business assets rather than the entire business entity, outlining the assets being sold and associated terms.",
    longDescription:
      "A contract for the sale of specific business assets. This document allows parties to cherry-pick assets for sale while excluding unwanted liabilities. Covers asset identification, purchase price allocation, and transfer procedures.",
    price: 2913,
    category: "Corporate Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "Asset sellers",
      "Asset buyers",
      "Restructuring professionals",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "company-constitution",
    name: "Company Constitution",
    description:
      "A document that defines the regulations for a company's operations and defines the purpose, rules, and functions of the organisation as well as the duties of its officers.",
    longDescription:
      "A comprehensive company constitution replacing the replaceable rules in the Corporations Act. This document covers share classes, director powers, general meetings, dividend procedures, and other matters specific to your company's needs.",
    price: 1517,
    category: "Corporate Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "New companies",
      "Companies requiring updated constitutions",
      "Private and public companies",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "unit-trust",
    name: "Unit Trust Deed",
    description:
      "Establishes a unit trust structure where assets are held by a trustee for unit holders. Commonly used for property investments and family investment vehicles.",
    longDescription:
      "A unit trust deed establishing a flexible investment structure. This document covers trust establishment, unit allocation, trustee powers, distribution provisions, and redemption procedures. Suitable for property investments, managed funds, and family investment structures.",
    price: 1563,
    category: "Corporate Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "Property investors",
      "Family groups",
      "Investment managers",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  // Intellectual Property
  {
    id: "ip-assignment",
    name: "Deed of Assignment of IP",
    description:
      "A legal document that transfers ownership of intellectual property rights from one party to another, ensuring clear title to valuable IP assets.",
    longDescription:
      "A deed of assignment transferring intellectual property rights from one party to another. This document covers all forms of intellectual property including patents, trademarks, copyright, and designs. Ensures clear chain of title for valuable IP assets.",
    price: 1400,
    category: "Intellectual Property Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "IP owners",
      "Businesses acquiring IP",
      "Startups and tech companies",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "ip-licence",
    name: "IP Licence Agreement",
    description:
      "A contract granting permission to use intellectual property under specific terms and conditions, while the original owner retains ownership.",
    longDescription:
      "A comprehensive intellectual property licence agreement. This document covers licence scope, territory, duration, royalty arrangements, quality control, and termination provisions. Suitable for various types of intellectual property including trademarks, patents, and copyright.",
    price: 1960,
    category: "Intellectual Property Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "IP owners seeking to licence",
      "Businesses requiring IP licences",
      "Franchisors and franchisees",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "eula",
    name: "End-User Licence Agreement",
    description:
      "A legal contract between a software developer and the user of the software, establishing the user's rights and restrictions.",
    longDescription:
      "An end-user licence agreement for software products. This document establishes the terms under which users may use the software, including licence scope, restrictions, warranty disclaimers, and limitation of liability. Essential for any software product.",
    price: 2146,
    category: "Intellectual Property Law",
    practiceArea: "Digital",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "Software developers",
      "SaaS providers",
      "App developers",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  // Finance
  {
    id: "loan-agreement",
    name: "Loan Agreement",
    description:
      "A legally binding contract documenting a loan between parties, outlining the amount borrowed, interest rate, repayment terms, and security if applicable.",
    longDescription:
      "A comprehensive loan agreement suitable for various lending arrangements. This document covers loan amount, interest calculations, repayment schedule, security provisions, and default procedures. Suitable for commercial and private loans.",
    price: 1869,
    category: "Finance",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "Lenders",
      "Borrowers",
      "Private investors",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "safe",
    name: "Simple Agreement for Future Equity",
    description:
      "A convertible security document commonly used in startup fundraising, providing investors with a right to future equity upon a triggering event.",
    longDescription:
      "A Simple Agreement for Future Equity (SAFE) for startup fundraising. This document provides investors with a right to convert their investment into equity upon a qualifying financing round or other trigger event. Includes various conversion mechanics and investor protections.",
    price: 1256,
    category: "Finance",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "Startups raising capital",
      "Angel investors",
      "Venture capital funds",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "convertible-note",
    name: "Convertible Note Agreement",
    description:
      "A hybrid instrument combining elements of debt and equity, typically used for early-stage startup funding with conversion rights upon future financing.",
    longDescription:
      "A convertible note agreement for startup financing. This debt instrument converts to equity upon a qualifying financing round. Covers principal amount, interest rate, maturity date, conversion mechanics, and valuation caps.",
    price: 1785,
    category: "Finance",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
    targetAudience: [
      "Early-stage startups",
      "Seed investors",
      "Accelerators",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  // Medical Practice Specific
  {
    id: "locum-agreement",
    name: "Locum Agreement",
    description:
      "A contract for the engagement of a locum tenens medical practitioner to provide temporary coverage at a medical practice.",
    longDescription:
      "A comprehensive locum agreement for temporary medical practitioner engagements. This document covers scope of services, remuneration, professional obligations, insurance requirements, and handover procedures. Suitable for short and long-term locum arrangements.",
    price: 1450,
    category: "Healthcare Law",
    practiceArea: "Medical Practice",
    jurisdictions: ["All States", "Federal"],
    targetAudience: [
      "Medical practices requiring locum cover",
      "Locum doctors",
      "Locum agencies",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
  {
    id: "room-licence",
    name: "Medical Room Licence Agreement",
    description:
      "A licence agreement for the use of consulting rooms within a medical facility, suitable for visiting specialists and allied health professionals.",
    longDescription:
      "A room licence agreement for medical consulting rooms. This document establishes a licence (not lease) arrangement for the use of medical rooms, covering access times, shared facilities, fees, and insurance requirements. Ideal for visiting specialists.",
    price: 1250,
    category: "Healthcare Law",
    practiceArea: "Medical Practice",
    jurisdictions: ["All States"],
    targetAudience: [
      "Medical practices with spare rooms",
      "Visiting specialists",
      "Allied health professionals",
    ],
    features: ["Lawyer-Drafted", "Australian Law Compliant", "Questionnaire Required"],
  },
];

export function getDocumentBySlug(slug: string): Document | undefined {
  return allDocuments.find((doc) => doc.id === slug);
}

export function getRelatedDocuments(document: Document, limit: number = 3): Document[] {
  return allDocuments
    .filter((doc) => doc.id !== document.id && (doc.category === document.category || doc.practiceArea === document.practiceArea))
    .slice(0, limit);
}
