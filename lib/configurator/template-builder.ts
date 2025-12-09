/**
 * Document Configurator Template Builder Logic
 * Customizable template configuration with real-time pricing
 * Part of BMAD Phase 2 - Interactive Tools
 */

// Document template definitions
export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  jurisdictions: string[];
  sections: TemplateSection[];
  estimatedTime: number; // Minutes to complete with template
  traditionalTime: number; // Hours without template
}

export interface TemplateSection {
  id: string;
  name: string;
  description: string;
  required: boolean;
  options: SectionOption[];
}

export interface SectionOption {
  id: string;
  label: string;
  description?: string;
  priceModifier: number; // Additional cost
  isDefault: boolean;
  incompatibleWith?: string[]; // Option IDs that can't be selected together
  requires?: string[]; // Option IDs that must also be selected
}

export interface ConfigurationState {
  templateId: string;
  jurisdiction: string;
  practiceType: string;
  selectedOptions: Map<string, string[]>; // sectionId -> optionIds
  customizations: {
    practiceName?: string;
    practitionerName?: string;
    specialty?: string;
    notes?: string;
  };
}

export interface ConfigurationResult {
  configuration: ConfigurationState;
  totalPrice: number;
  priceBreakdown: Array<{
    item: string;
    price: number;
  }>;
  selectedFeatures: string[];
  previewOutline: string[];
  estimatedTime: number;
  timeSaved: number;
  xpReward: number;
  bonusXP: number;
}

// Practice types
export const PRACTICE_TYPES = [
  { id: "gp", label: "General Practice" },
  { id: "specialist", label: "Specialist Practice" },
  { id: "allied", label: "Allied Health" },
  { id: "dental", label: "Dental Practice" },
  { id: "pharmacy", label: "Pharmacy" },
  { id: "mental", label: "Mental Health" },
  { id: "other", label: "Other Healthcare" },
];

// Australian jurisdictions
export const JURISDICTIONS = [
  { id: "nsw", label: "New South Wales" },
  { id: "vic", label: "Victoria" },
  { id: "qld", label: "Queensland" },
  { id: "wa", label: "Western Australia" },
  { id: "sa", label: "South Australia" },
  { id: "tas", label: "Tasmania" },
  { id: "nt", label: "Northern Territory" },
  { id: "act", label: "Australian Capital Territory" },
  { id: "federal", label: "Federal / All States" },
];

// Template library
export const TEMPLATE_LIBRARY: TemplateDefinition[] = [
  {
    id: "employment_contract",
    name: "Healthcare Employment Contract",
    description: "Comprehensive employment agreement for healthcare staff",
    basePrice: 149,
    category: "employment",
    jurisdictions: ["nsw", "vic", "qld", "wa", "sa", "tas", "nt", "act", "federal"],
    estimatedTime: 30,
    traditionalTime: 4,
    sections: [
      {
        id: "employment_type",
        name: "Employment Type",
        description: "Select the type of employment arrangement",
        required: true,
        options: [
          { id: "full_time", label: "Full-time permanent", priceModifier: 0, isDefault: true },
          { id: "part_time", label: "Part-time permanent", priceModifier: 0, isDefault: false },
          { id: "casual", label: "Casual", priceModifier: 20, isDefault: false },
          { id: "fixed_term", label: "Fixed term contract", priceModifier: 30, isDefault: false },
        ],
      },
      {
        id: "role_clauses",
        name: "Role-Specific Clauses",
        description: "Additional clauses based on role",
        required: false,
        options: [
          { id: "clinical", label: "Clinical duties", priceModifier: 0, isDefault: true },
          { id: "admin", label: "Administrative duties", priceModifier: 0, isDefault: false },
          { id: "supervision", label: "Supervision responsibilities", priceModifier: 25, isDefault: false },
          { id: "training", label: "Training requirements", priceModifier: 15, isDefault: false },
        ],
      },
      {
        id: "restrictions",
        name: "Post-Employment Restrictions",
        description: "Covenants and restrictions after employment ends",
        required: false,
        options: [
          { id: "non_compete", label: "Non-compete clause", priceModifier: 40, isDefault: false },
          { id: "non_solicit_patients", label: "Patient non-solicitation", priceModifier: 30, isDefault: false },
          { id: "non_solicit_staff", label: "Staff non-solicitation", priceModifier: 25, isDefault: false },
          { id: "confidentiality", label: "Confidentiality clause", priceModifier: 0, isDefault: true },
        ],
      },
      {
        id: "benefits",
        name: "Benefits & Allowances",
        description: "Additional benefits to include",
        required: false,
        options: [
          { id: "cpd_allowance", label: "CPD allowance", priceModifier: 10, isDefault: false },
          { id: "vehicle", label: "Vehicle allowance", priceModifier: 15, isDefault: false },
          { id: "professional_memberships", label: "Professional memberships", priceModifier: 10, isDefault: false },
          { id: "insurance", label: "Additional insurance coverage", priceModifier: 20, isDefault: false },
        ],
      },
    ],
  },
  {
    id: "telehealth_consent",
    name: "Telehealth Consent & Policy Pack",
    description: "Complete telehealth setup with consent forms and policies",
    basePrice: 179,
    category: "telehealth",
    jurisdictions: ["federal"],
    estimatedTime: 20,
    traditionalTime: 6,
    sections: [
      {
        id: "service_type",
        name: "Telehealth Service Type",
        description: "Types of telehealth services offered",
        required: true,
        options: [
          { id: "video_consult", label: "Video consultations", priceModifier: 0, isDefault: true },
          { id: "phone_consult", label: "Phone consultations", priceModifier: 0, isDefault: true },
          { id: "messaging", label: "Secure messaging", priceModifier: 20, isDefault: false },
          { id: "remote_monitoring", label: "Remote patient monitoring", priceModifier: 40, isDefault: false },
        ],
      },
      {
        id: "consent_elements",
        name: "Consent Elements",
        description: "Specific consent requirements",
        required: true,
        options: [
          { id: "general_consent", label: "General telehealth consent", priceModifier: 0, isDefault: true },
          { id: "recording_consent", label: "Recording consent", priceModifier: 15, isDefault: false },
          { id: "third_party", label: "Third party presence", priceModifier: 10, isDefault: false },
          { id: "minor_consent", label: "Minor/guardian consent", priceModifier: 20, isDefault: false },
        ],
      },
      {
        id: "policies",
        name: "Supporting Policies",
        description: "Additional policy documents",
        required: false,
        options: [
          { id: "privacy_policy", label: "Telehealth privacy policy", priceModifier: 25, isDefault: true },
          { id: "emergency_protocol", label: "Emergency protocol", priceModifier: 20, isDefault: true },
          { id: "technical_requirements", label: "Technical requirements guide", priceModifier: 15, isDefault: false },
          { id: "staff_training", label: "Staff training checklist", priceModifier: 15, isDefault: false },
        ],
      },
    ],
  },
  {
    id: "partnership_agreement",
    name: "Medical Partnership Agreement",
    description: "Comprehensive partnership agreement for medical practices",
    basePrice: 299,
    category: "partnership",
    jurisdictions: ["nsw", "vic", "qld", "wa", "sa", "tas", "nt", "act"],
    estimatedTime: 45,
    traditionalTime: 10,
    sections: [
      {
        id: "partnership_structure",
        name: "Partnership Structure",
        description: "Type of partnership arrangement",
        required: true,
        options: [
          { id: "equal", label: "Equal partnership", priceModifier: 0, isDefault: true },
          { id: "tiered", label: "Tiered equity structure", priceModifier: 40, isDefault: false },
          { id: "incoming", label: "Incoming partner pathway", priceModifier: 50, isDefault: false },
        ],
      },
      {
        id: "governance",
        name: "Governance Provisions",
        description: "Decision-making and management structure",
        required: true,
        options: [
          { id: "voting", label: "Voting procedures", priceModifier: 0, isDefault: true },
          { id: "meetings", label: "Meeting requirements", priceModifier: 0, isDefault: true },
          { id: "deadlock", label: "Deadlock resolution", priceModifier: 30, isDefault: false },
          { id: "external_management", label: "External management provisions", priceModifier: 40, isDefault: false },
        ],
      },
      {
        id: "financial",
        name: "Financial Arrangements",
        description: "Profit sharing and financial matters",
        required: true,
        options: [
          { id: "profit_share", label: "Profit sharing formula", priceModifier: 0, isDefault: true },
          { id: "drawings", label: "Partner drawings", priceModifier: 15, isDefault: true },
          { id: "capital_contributions", label: "Capital contribution provisions", priceModifier: 25, isDefault: false },
          { id: "expense_allocation", label: "Expense allocation rules", priceModifier: 20, isDefault: false },
        ],
      },
      {
        id: "exit",
        name: "Exit Provisions",
        description: "Partner departure and dissolution",
        required: true,
        options: [
          { id: "retirement", label: "Retirement provisions", priceModifier: 0, isDefault: true },
          { id: "buyout", label: "Buy-out mechanisms", priceModifier: 35, isDefault: true },
          { id: "death_disability", label: "Death/disability provisions", priceModifier: 30, isDefault: false },
          { id: "dissolution", label: "Dissolution procedures", priceModifier: 25, isDefault: false },
        ],
      },
    ],
  },
  {
    id: "patient_consent",
    name: "Patient Consent Bundle",
    description: "Comprehensive patient consent and privacy documentation",
    basePrice: 99,
    category: "patient",
    jurisdictions: ["federal"],
    estimatedTime: 15,
    traditionalTime: 2,
    sections: [
      {
        id: "consent_types",
        name: "Consent Types",
        description: "Types of consent forms needed",
        required: true,
        options: [
          { id: "treatment", label: "Treatment consent", priceModifier: 0, isDefault: true },
          { id: "procedure", label: "Procedure-specific consent", priceModifier: 20, isDefault: false },
          { id: "research", label: "Research participation", priceModifier: 30, isDefault: false },
          { id: "photography", label: "Clinical photography", priceModifier: 15, isDefault: false },
        ],
      },
      {
        id: "privacy",
        name: "Privacy Documentation",
        description: "Privacy-related documents",
        required: true,
        options: [
          { id: "privacy_notice", label: "Privacy collection notice", priceModifier: 0, isDefault: true },
          { id: "disclosure_auth", label: "Disclosure authorization", priceModifier: 15, isDefault: true },
          { id: "access_form", label: "Records access form", priceModifier: 10, isDefault: false },
        ],
      },
      {
        id: "special",
        name: "Special Circumstances",
        description: "Additional consent scenarios",
        required: false,
        options: [
          { id: "minor", label: "Minor patient consent", priceModifier: 20, isDefault: false },
          { id: "interpreter", label: "Interpreter consent", priceModifier: 15, isDefault: false },
          { id: "emergency", label: "Emergency treatment", priceModifier: 15, isDefault: false },
        ],
      },
    ],
  },
  {
    id: "compliance_policies",
    name: "AHPRA Compliance Policy Pack",
    description: "Essential compliance policies for AHPRA-registered practitioners",
    basePrice: 199,
    category: "compliance",
    jurisdictions: ["federal"],
    estimatedTime: 25,
    traditionalTime: 8,
    sections: [
      {
        id: "core_policies",
        name: "Core Compliance Policies",
        description: "Essential regulatory policies",
        required: true,
        options: [
          { id: "registration", label: "Registration maintenance", priceModifier: 0, isDefault: true },
          { id: "mandatory_reporting", label: "Mandatory reporting", priceModifier: 0, isDefault: true },
          { id: "advertising", label: "Advertising compliance", priceModifier: 20, isDefault: true },
          { id: "scope", label: "Scope of practice", priceModifier: 25, isDefault: false },
        ],
      },
      {
        id: "cpd",
        name: "CPD Documentation",
        description: "Continuing professional development",
        required: true,
        options: [
          { id: "cpd_policy", label: "CPD policy", priceModifier: 0, isDefault: true },
          { id: "cpd_tracking", label: "CPD tracking templates", priceModifier: 15, isDefault: true },
          { id: "cpd_plan", label: "Annual CPD plan template", priceModifier: 10, isDefault: false },
        ],
      },
      {
        id: "risk",
        name: "Risk Management",
        description: "Risk and incident management",
        required: false,
        options: [
          { id: "incident_reporting", label: "Incident reporting", priceModifier: 25, isDefault: false },
          { id: "complaint_handling", label: "Complaint handling", priceModifier: 30, isDefault: false },
          { id: "clinical_governance", label: "Clinical governance framework", priceModifier: 40, isDefault: false },
        ],
      },
    ],
  },
];

/**
 * Calculate configuration result
 */
export function calculateConfiguration(
  state: ConfigurationState
): ConfigurationResult {
  const template = TEMPLATE_LIBRARY.find((t) => t.id === state.templateId);
  if (!template) {
    throw new Error("Template not found");
  }

  let totalPrice = template.basePrice;
  const priceBreakdown: ConfigurationResult["priceBreakdown"] = [
    { item: `${template.name} (base)`, price: template.basePrice },
  ];
  const selectedFeatures: string[] = [];
  const previewOutline: string[] = [template.name];

  // Calculate price based on selected options
  template.sections.forEach((section) => {
    const selectedOptionIds = state.selectedOptions.get(section.id) || [];

    selectedOptionIds.forEach((optionId) => {
      const option = section.options.find((o) => o.id === optionId);
      if (option) {
        if (option.priceModifier > 0) {
          totalPrice += option.priceModifier;
          priceBreakdown.push({
            item: option.label,
            price: option.priceModifier,
          });
        }
        selectedFeatures.push(option.label);
        previewOutline.push(`  • ${option.label}`);
      }
    });
  });

  // Add jurisdiction if specific
  if (state.jurisdiction !== "federal") {
    const jurisdictionLabel = JURISDICTIONS.find((j) => j.id === state.jurisdiction)?.label;
    if (jurisdictionLabel) {
      previewOutline.unshift(`Jurisdiction: ${jurisdictionLabel}`);
    }
  }

  // Calculate XP reward (variable reinforcement)
  const baseXP = 100;
  const bonusChance = Math.random();
  let bonusXP = 0;

  if (bonusChance < 0.01) {
    bonusXP = 500; // 1% jackpot
  } else if (bonusChance < 0.06) {
    bonusXP = 150; // 5% rare
  } else if (bonusChance < 0.26) {
    bonusXP = 50; // 20% bonus
  }

  return {
    configuration: state,
    totalPrice: Math.round(totalPrice),
    priceBreakdown,
    selectedFeatures,
    previewOutline,
    estimatedTime: template.estimatedTime,
    timeSaved: template.traditionalTime * 60 - template.estimatedTime, // In minutes
    xpReward: baseXP,
    bonusXP,
  };
}

/**
 * Get default configuration for a template
 */
export function getDefaultConfiguration(templateId: string): ConfigurationState {
  const template = TEMPLATE_LIBRARY.find((t) => t.id === templateId);
  if (!template) {
    throw new Error("Template not found");
  }

  const selectedOptions = new Map<string, string[]>();

  template.sections.forEach((section) => {
    const defaultOptions = section.options
      .filter((o) => o.isDefault)
      .map((o) => o.id);
    if (defaultOptions.length > 0) {
      selectedOptions.set(section.id, defaultOptions);
    }
  });

  return {
    templateId,
    jurisdiction: template.jurisdictions.includes("federal") ? "federal" : template.jurisdictions[0],
    practiceType: "gp",
    selectedOptions,
    customizations: {},
  };
}

/**
 * Validate configuration for conflicts
 */
export function validateConfiguration(
  state: ConfigurationState
): { valid: boolean; errors: string[] } {
  const template = TEMPLATE_LIBRARY.find((t) => t.id === state.templateId);
  if (!template) {
    return { valid: false, errors: ["Template not found"] };
  }

  const errors: string[] = [];

  // Check required sections
  template.sections.forEach((section) => {
    if (section.required) {
      const selected = state.selectedOptions.get(section.id) || [];
      if (selected.length === 0) {
        errors.push(`${section.name} is required`);
      }
    }
  });

  // Check incompatibilities
  template.sections.forEach((section) => {
    const selected = state.selectedOptions.get(section.id) || [];
    selected.forEach((optionId) => {
      const option = section.options.find((o) => o.id === optionId);
      if (option?.incompatibleWith) {
        option.incompatibleWith.forEach((incompatibleId) => {
          if (selected.includes(incompatibleId)) {
            const incompatible = section.options.find((o) => o.id === incompatibleId);
            errors.push(`${option.label} cannot be selected with ${incompatible?.label}`);
          }
        });
      }
    });
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format time saved
 */
export function formatTimeSaved(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
  }
  return `${mins} minutes`;
}
