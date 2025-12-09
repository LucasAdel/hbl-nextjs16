import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  Users,
  Calendar,
  Home,
  Globe,
  GraduationCap,
  Briefcase,
  ExternalLink,
} from "lucide-react";

interface VisaInfo {
  subclass: string;
  name: string;
  officialName: string;
  type: "temporary" | "permanent";
  duration: string;
  pathToPR?: boolean;
  overview: string;
  keyBenefits: string[];
  eligibilityCriteria: string[];
  processSteps: { step: string; description: string }[];
  processingTime: string;
  costs: { item: string; amount: string }[];
  occupationLists?: string[];
  englishRequirement: string;
  ageRequirement?: string;
  salaryRequirement?: string;
  workExperience?: string;
  skillsAssessment: boolean;
  healthInsurance?: string;
  familyIncluded: boolean;
  workRights: string;
  studyRights?: string;
  travelRights: string;
  pathwayDetails?: string;
  regionalRequirement?: string;
  stateNomination?: string;
  pointsRequirement?: string;
  officialUrl: string;
}

const visaDatabase: Record<string, VisaInfo> = {
  "482": {
    subclass: "482",
    name: "Skills in Demand Visa",
    officialName: "Skills in Demand visa (subclass 482)",
    type: "temporary",
    duration: "Up to 4 years",
    pathToPR: true,
    overview:
      "The Skills in Demand visa (subclass 482) allows Australian employers to sponsor skilled workers for positions they cannot fill locally. Healthcare professionals are a priority for processing with clear pathways to permanent residency.",
    keyBenefits: [
      "Priority processing for healthcare and other key occupations",
      "Clear pathway to permanent residency after two or three years",
      "Include eligible family members in your application",
      "Work for your sponsor in your nominated skilled occupation",
      "Travel to and from Australia multiple times while the visa is valid",
      "Potential access to Medicare if from a Reciprocal Health Care Agreement country",
    ],
    eligibilityCriteria: [
      "Have a job offer and sponsorship from an approved Australian employer",
      "Your nominated occupation must be on the relevant skilled occupation list",
      "Meet the skills, qualifications, and work experience requirements",
      "Meet the relevant English language requirements for your visa stream",
      "Satisfy the health and character requirements",
      "The salary offered must meet the threshold for your stream",
    ],
    processSteps: [
      { step: "Employer Sponsorship", description: "Your employer must be an approved Standard Business Sponsor" },
      { step: "Nomination", description: "The employer nominates you for a specific position" },
      { step: "Skills Assessment", description: "Obtain a positive skills assessment if required" },
      { step: "Visa Application", description: "Lodge your visa application with all required documents" },
      { step: "Health & Character", description: "Complete health examinations and provide police clearances" },
      { step: "Visa Decision", description: "Receive a decision from the Department of Home Affairs" },
    ],
    processingTime: "Varies by stream - processing times are estimates only",
    costs: [
      { item: "Skills in Demand (482) visa", amount: "From AUD $3,115" },
      { item: "Additional applicant 18+", amount: "From AUD $1,555" },
      { item: "Additional applicant <18", amount: "From AUD $780" },
    ],
    occupationLists: ["Core Skills Occupation List (CSOL)", "Specialist Skills Occupation List (SSOL)"],
    englishRequirement: "IELTS 6.0 (or equivalent) with minimum scores in each band",
    salaryRequirement: "Specialist Skills Stream: AUD $135,000+. Core Skills Stream: TSMIT of AUD $73,150+",
    skillsAssessment: true,
    healthInsurance: "Required unless eligible for Medicare",
    familyIncluded: true,
    workRights: "Work only for your sponsoring employer in your nominated occupation",
    studyRights: "Yes, unrestricted",
    travelRights: "Multiple entry while visa is valid",
    pathwayDetails: "Eligible for PR (e.g., via subclass 186) after 2-3 years with sponsor",
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand",
  },
  "186": {
    subclass: "186",
    name: "Employer Nomination Scheme (ENS)",
    officialName: "Employer Nomination Scheme (ENS) visa (subclass 186)",
    type: "permanent",
    duration: "Permanent",
    pathToPR: false,
    overview:
      "The ENS visa (subclass 186) allows skilled workers nominated by an Australian employer to live and work in Australia permanently. It is a primary pathway to permanent residency for healthcare professionals.",
    keyBenefits: [
      "Permanent Residency from grant date",
      "Live, work, and study anywhere in Australia",
      "Access to Medicare",
      "Eligible for HECS-HELP loans (subject to residency criteria)",
      "Sponsor eligible relatives for permanent residency",
      "Pathway to Australian citizenship",
    ],
    eligibilityCriteria: [
      "Be nominated by an approved Australian employer",
      "Be under 45 years of age (exemptions available)",
      "Direct Entry: Positive skills assessment + 3 years relevant experience",
      "TRT stream: Worked for employer on 482 visa for set period",
      "Meet Competent English requirement",
      "Meet health and character requirements",
    ],
    processSteps: [
      { step: "Skills Assessment", description: "Get positive assessment (Direct Entry stream)" },
      { step: "Find Employer", description: "Secure job offer from Australian employer" },
      { step: "Employer Nomination", description: "Employer lodges nomination application" },
      { step: "Visa Application", description: "Lodge visa application within 6 months of nomination" },
      { step: "Document Submission", description: "Provide all required documents" },
      { step: "Health & Character", description: "Complete health examinations and police checks" },
      { step: "Visa Grant", description: "Receive permanent residency" },
    ],
    processingTime: "5 to 9 months (varies by stream)",
    costs: [
      { item: "Visa application", amount: "From $4,640" },
      { item: "Additional applicant 18+", amount: "From $2,320" },
      { item: "Additional applicant <18", amount: "From $1,160" },
      { item: "Nomination fee (employer)", amount: "From $540" },
      { item: "SAF levy (employer)", amount: "From $5,000-$7,000" },
    ],
    englishRequirement: "Competent English (IELTS 6.0 in all components)",
    ageRequirement: "Under 45 (exemptions for high-income earners, academics, regional medical practitioners)",
    workExperience: "Direct Entry: 3 years; TRT: work history with sponsor",
    skillsAssessment: true,
    familyIncluded: true,
    workRights: "Unrestricted work rights",
    studyRights: "Yes, with government support",
    travelRights: "5 years multiple entry from grant",
    pathwayDetails: "Grants permanent residency from approval date",
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/employer-nomination-scheme-186",
  },
  "189": {
    subclass: "189",
    name: "Skilled Independent Visa",
    officialName: "Skilled Independent visa (subclass 189) - Points-Tested Stream",
    type: "permanent",
    duration: "Permanent",
    pathToPR: false,
    overview:
      "The subclass 189 visa is a permanent visa for points-tested skilled workers who are not sponsored. It provides complete freedom to live and work anywhere in Australia.",
    keyBenefits: [
      "No sponsorship or nomination required",
      "Permanent Residency from grant date",
      "Unrestricted work, study, and residence rights",
      "Medicare access",
      "Pathway to Australian citizenship",
    ],
    eligibilityCriteria: [
      "Submit EOI through SkillSelect and be invited",
      "Occupation on relevant skilled occupation list",
      "Positive skills assessment",
      "Under 45 years at invitation",
      "Minimum 65 points (typically need 85-90+)",
      "Meet English, health, and character requirements",
    ],
    processSteps: [
      { step: "Skills Assessment", description: "Complete assessment with relevant authority" },
      { step: "English Test", description: "Take IELTS, PTE or other approved test" },
      { step: "EOI Submission", description: "Submit Expression of Interest in SkillSelect" },
      { step: "Wait for Invitation", description: "Monitor monthly invitation rounds" },
      { step: "Visa Application", description: "Apply within 60 days of invitation" },
      { step: "Document Upload", description: "Provide all supporting documents" },
      { step: "Health & Character", description: "Complete medical and police checks" },
      { step: "Visa Decision", description: "Receive permanent visa" },
    ],
    processingTime: "8 to 14 months after invitation",
    costs: [
      { item: "Visa application", amount: "From $4,640" },
      { item: "Additional applicant 18+", amount: "From $2,320" },
      { item: "Additional applicant <18", amount: "From $1,160" },
      { item: "Skills assessment", amount: "$500-$3,000" },
      { item: "English test", amount: "$400-$500" },
    ],
    pointsRequirement: "Minimum 65 points; competitive scores typically 85-90+",
    englishRequirement: "Competent English minimum; higher scores for more points",
    ageRequirement: "Maximum 30 points for ages 25-32; no points for 45+",
    skillsAssessment: true,
    familyIncluded: true,
    workRights: "Unrestricted work rights",
    studyRights: "Yes, with government support",
    travelRights: "5 years multiple entry from grant",
    pathwayDetails: "Grants permanent residency from approval date",
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189",
  },
  "190": {
    subclass: "190",
    name: "Skilled Nominated Visa",
    officialName: "Skilled Nominated visa (subclass 190)",
    type: "permanent",
    duration: "Permanent",
    pathToPR: false,
    overview:
      "The subclass 190 visa is for skilled workers nominated by an Australian state or territory. State nomination provides 5 additional points, making it excellent for healthcare professionals in demand.",
    keyBenefits: [
      "5 crucial points from state nomination",
      "Permanent Residency from grant date",
      "Full work, study, and residence rights",
      "Medicare access",
      "Pathway to Australian citizenship",
    ],
    eligibilityCriteria: [
      "Be nominated by state/territory government",
      "Submit EOI and receive invitation",
      "Occupation on state skilled list",
      "Positive skills assessment",
      "Under 45 years at invitation",
      "Minimum 65 points (including 5 from nomination)",
      "Commit to living in nominating state for 2 years",
    ],
    processSteps: [
      { step: "Check State Lists", description: "Verify occupation on state skilled list" },
      { step: "Skills Assessment", description: "Get positive assessment" },
      { step: "Submit EOI", description: "Select states of interest in SkillSelect" },
      { step: "State Nomination", description: "Apply for or receive state nomination" },
      { step: "Receive Invitation", description: "Get invited through SkillSelect" },
      { step: "Visa Application", description: "Lodge application within 60 days" },
      { step: "Health & Character", description: "Complete all checks" },
      { step: "Visa Grant", description: "Receive permanent residency" },
    ],
    processingTime: "6 to 12 months after invitation",
    costs: [
      { item: "Visa application", amount: "From $4,640" },
      { item: "Additional applicant 18+", amount: "From $2,320" },
      { item: "Additional applicant <18", amount: "From $1,160" },
      { item: "State nomination", amount: "$200-$800" },
      { item: "Skills assessment", amount: "$500-$3,000" },
    ],
    stateNomination: "Commitment to live and work in nominating state for 2 years",
    pointsRequirement: "Minimum 65 points (includes 5 from state nomination)",
    englishRequirement: "Competent English (IELTS 6.0 in all bands)",
    ageRequirement: "Under 45 years",
    skillsAssessment: true,
    familyIncluded: true,
    workRights: "Unrestricted (subject to state commitment)",
    studyRights: "Yes, with government support",
    travelRights: "5 years multiple entry from grant",
    regionalRequirement: "Must live in nominating state for first 2 years",
    pathwayDetails: "Grants permanent residency from approval date",
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-nominated-190",
  },
  "491": {
    subclass: "491",
    name: "Skilled Work Regional",
    officialName: "Skilled Work Regional (Provisional) visa (subclass 491)",
    type: "temporary",
    duration: "5 years",
    pathToPR: true,
    overview:
      "The subclass 491 visa is for skilled workers who want to live and work in regional Australia. Healthcare workers are priority occupations with excellent support.",
    keyBenefits: [
      "15 points for regional nomination",
      "Priority processing for healthcare",
      "Access to Medicare",
      "Path to permanent residency (subclass 191)",
      "Include family members",
      "Work and study in regional areas",
    ],
    eligibilityCriteria: [
      "Nominated by state/territory or sponsored by family",
      "Occupation on regional occupation list",
      "Positive skills assessment",
      "Score minimum 65 points",
      "Under 45 years of age",
      "Competent English minimum",
      "Commit to regional area",
      "Meet health and character requirements",
    ],
    processSteps: [
      { step: "Check Regional Lists", description: "Verify occupation eligibility" },
      { step: "Skills Assessment", description: "Complete relevant assessment" },
      { step: "Submit EOI", description: "Include regional preferences" },
      { step: "State Nomination", description: "Apply for regional nomination" },
      { step: "Receive Invitation", description: "Get invited to apply" },
      { step: "Visa Application", description: "Lodge within 60 days" },
      { step: "Health & Character", description: "Complete all requirements" },
      { step: "Visa Grant", description: "Receive 5-year provisional visa" },
    ],
    processingTime: "4 to 7 months from invitation",
    costs: [
      { item: "Visa application", amount: "$4,640" },
      { item: "Additional applicant 18+", amount: "$2,320" },
      { item: "Additional applicant <18", amount: "$1,160" },
      { item: "State nomination", amount: "$200-$800" },
      { item: "Skills assessment", amount: "$500-$3,000" },
    ],
    regionalRequirement: "Must live, work and study in regional Australia only",
    pointsRequirement: "Minimum 65 points (including 15 for regional nomination)",
    englishRequirement: "Competent English minimum",
    ageRequirement: "Under 45 years",
    skillsAssessment: true,
    familyIncluded: true,
    workRights: "Can work in regional Australia only",
    studyRights: "Can study in regional Australia only",
    travelRights: "Multiple entry for 5 years",
    pathwayDetails: "After 3 years in regional area, eligible for subclass 191 permanent visa",
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-work-regional-provisional-491",
  },
  "494": {
    subclass: "494",
    name: "Skilled Employer Sponsored Regional",
    officialName: "Skilled Employer Sponsored Regional (Provisional) visa (subclass 494)",
    type: "temporary",
    duration: "5 years",
    pathToPR: true,
    overview:
      "The subclass 494 visa allows regional employers to sponsor skilled workers. Healthcare positions are a priority with a pathway to permanent residency.",
    keyBenefits: [
      "Secure sponsored position in regional Australia",
      "Direct pathway to permanent residency (subclass 191)",
      "Include family members",
      "Medicare eligibility",
      "Travel to and from Australia freely",
    ],
    eligibilityCriteria: [
      "Be nominated by approved employer in regional area",
      "Occupation on relevant skilled list",
      "Suitable skills assessment",
      "At least 3 years relevant work experience",
      "Under 45 years (exemptions may apply)",
      "Competent English",
      "Meet health and character requirements",
    ],
    processSteps: [
      { step: "Find Regional Employer", description: "Secure job offer in regional area" },
      { step: "Employer Sponsorship", description: "Employer becomes approved sponsor" },
      { step: "Skills Assessment", description: "Complete assessment if required" },
      { step: "Employer Nomination", description: "Employer nominates position" },
      { step: "Visa Application", description: "Apply within 6 months" },
      { step: "Health & Character", description: "Complete all checks" },
      { step: "Visa Grant", description: "Receive 5-year visa" },
    ],
    processingTime: "6 to 11 months",
    costs: [
      { item: "Visa application", amount: "From $4,640" },
      { item: "Additional applicant 18+", amount: "From $2,320" },
      { item: "Additional applicant <18", amount: "From $1,160" },
      { item: "Nomination fee", amount: "From $540" },
      { item: "SAF levy (employer)", amount: "From $5,000 per year" },
    ],
    regionalRequirement: "Must live, work, and study in designated regional area",
    englishRequirement: "Competent English (IELTS 6.0 in all bands)",
    ageRequirement: "Under 45 years (exemptions may apply)",
    salaryRequirement: "TSMIT of $73,150+ and Annual Market Salary Rate",
    workExperience: "At least 3 years in nominated occupation",
    skillsAssessment: true,
    familyIncluded: true,
    workRights: "Work for sponsoring employer in regional location",
    studyRights: "Yes, unrestricted",
    travelRights: "Multiple entry for 5 years",
    pathwayDetails: "After 3 years, eligible for subclass 191 permanent visa",
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-employer-sponsored-regional-494",
  },
};

export function generateStaticParams() {
  return Object.keys(visaDatabase).map((visaType) => ({
    visaType,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ visaType: string }> }): Promise<Metadata> {
  const { visaType } = await params;
  const visa = visaDatabase[visaType];

  if (!visa) {
    return {
      title: "Visa Not Found",
    };
  }

  return {
    title: `${visa.name} (Subclass ${visa.subclass}) - Healthcare Immigration`,
    description: visa.overview,
  };
}

export default async function VisaDetailPage({ params }: { params: Promise<{ visaType: string }> }) {
  const { visaType } = await params;
  const visa = visaDatabase[visaType];

  if (!visa) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white pt-32 pb-12">
        <div className="container-custom">
          <Link
            href="/healthcare-visa-guide"
            className="inline-flex items-center text-tiffany-dark hover:text-tiffany mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Visa Guide
          </Link>

          <div className="flex items-start gap-4 mb-4 flex-wrap">
            <h1 className="font-blair text-3xl lg:text-4xl font-bold">{visa.name}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                visa.type === "permanent"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {visa.type === "permanent" ? "Permanent" : "Temporary"}
            </span>
          </div>
          <p className="text-gray-600">{visa.officialName}</p>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="bg-tiffany-dark text-white py-6">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p className="font-semibold">Duration</p>
              <p className="text-tiffany-lighter text-sm">{visa.duration}</p>
            </div>
            <div>
              <Calendar className="h-8 w-8 mx-auto mb-2" />
              <p className="font-semibold">Processing</p>
              <p className="text-tiffany-lighter text-sm">{visa.processingTime}</p>
            </div>
            <div>
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p className="font-semibold">Family</p>
              <p className="text-tiffany-lighter text-sm">{visa.familyIncluded ? "Included" : "Not Included"}</p>
            </div>
            <div>
              <Home className="h-8 w-8 mx-auto mb-2" />
              <p className="font-semibold">PR Pathway</p>
              <p className="text-tiffany-lighter text-sm">{visa.pathToPR ? "Yes" : "Direct PR"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-blair text-2xl mb-4">Overview</h2>
                <p className="text-gray-700 leading-relaxed">{visa.overview}</p>
              </div>

              {/* Key Benefits */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-blair text-2xl mb-4">Key Benefits</h2>
                <ul className="space-y-3">
                  {visa.keyBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Eligibility */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-blair text-2xl mb-4">Eligibility Criteria</h2>
                <ul className="space-y-3">
                  {visa.eligibilityCriteria.map((criteria, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-6 h-6 bg-tiffany/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-tiffany font-semibold text-sm">{index + 1}</span>
                      </span>
                      <span className="text-gray-700">{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Process Steps */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-blair text-2xl mb-6">Application Process</h2>
                <div className="space-y-4">
                  {visa.processSteps.map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-8 h-8 bg-tiffany rounded-full flex items-center justify-center mr-4 flex-shrink-0 text-white font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{step.step}</h3>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Costs */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-blair text-xl mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-tiffany" />
                  Estimated Costs
                </h3>
                <ul className="space-y-3">
                  {visa.costs.map((cost, index) => (
                    <li key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{cost.item}</span>
                      <span className="font-semibold">{cost.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-blair text-xl mb-4">Requirements</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-tiffany" />
                      English
                    </p>
                    <p className="text-gray-600 mt-1">{visa.englishRequirement}</p>
                  </div>
                  {visa.ageRequirement && (
                    <div>
                      <p className="font-semibold flex items-center">
                        <Users className="h-4 w-4 mr-2 text-tiffany" />
                        Age
                      </p>
                      <p className="text-gray-600 mt-1">{visa.ageRequirement}</p>
                    </div>
                  )}
                  {visa.pointsRequirement && (
                    <div>
                      <p className="font-semibold flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-tiffany" />
                        Points
                      </p>
                      <p className="text-gray-600 mt-1">{visa.pointsRequirement}</p>
                    </div>
                  )}
                  {visa.salaryRequirement && (
                    <div>
                      <p className="font-semibold flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-tiffany" />
                        Salary
                      </p>
                      <p className="text-gray-600 mt-1">{visa.salaryRequirement}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Rights */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-blair text-xl mb-4">Your Rights</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <Briefcase className="h-4 w-4 mr-2 text-tiffany flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Work</p>
                      <p className="text-gray-600">{visa.workRights}</p>
                    </div>
                  </div>
                  {visa.studyRights && (
                    <div className="flex items-start">
                      <GraduationCap className="h-4 w-4 mr-2 text-tiffany flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold">Study</p>
                        <p className="text-gray-600">{visa.studyRights}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start">
                    <Globe className="h-4 w-4 mr-2 text-tiffany flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Travel</p>
                      <p className="text-gray-600">{visa.travelRights}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-tiffany/10 rounded-2xl p-6 border border-tiffany/20">
                <h3 className="font-blair text-lg mb-3">Need Help with Your Application?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Our team specialises in healthcare professional immigration.
                </p>
                <Link
                  href="/book-appointment"
                  className="block w-full py-3 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-lg text-center transition-colors"
                >
                  Book a Consultation
                </Link>
                <a
                  href={visa.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 mt-3 text-tiffany-dark hover:text-tiffany text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  Official Government Info
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
