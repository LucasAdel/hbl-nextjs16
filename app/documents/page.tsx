"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Shield,
  RefreshCw,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Tag,
  FileText,
} from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { toast } from "sonner";
import { DocumentPreviewModal } from "@/components/documents/DocumentPreviewModal";

interface Document {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  practiceArea: string;
  jurisdictions: string[];
  featured?: boolean;
  subscription?: {
    initial: number;
    monthly: number;
  };
}

const allDocuments: Document[] = [
  // Healthcare Law
  {
    id: "tenant-doctor",
    name: "Tenant Doctor Service Agreement",
    description:
      "A comprehensive agreement for medical practitioners operating as tenant doctors within a shared premises, covering fee structures, obligations, and practice arrangements.",
    price: 1500,
    category: "Healthcare Law",
    practiceArea: "Medical Practice",
    jurisdictions: ["All States", "Federal"],
    featured: true,
    subscription: { initial: 1500, monthly: 30 },
  },
  {
    id: "employment-medical",
    name: "Employment Contract for Medical Practitioners",
    description:
      "A comprehensive employment contract template specifically designed for medical practitioners, including provisions for professional obligations, indemnity, and leave entitlements.",
    price: 1799,
    category: "Employment Law",
    practiceArea: "Healthcare",
    jurisdictions: ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"],
  },
  {
    id: "medical-partnership",
    name: "Medical Practice Partnership Agreement",
    description:
      "Detailed partnership agreement for medical practices, covering profit sharing, decision-making, dispute resolution, and exit strategies.",
    price: 2499,
    category: "Business Structures",
    practiceArea: "Medical Practice",
    jurisdictions: ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"],
  },
  {
    id: "practice-purchase",
    name: "Practice Purchase Agreement",
    description:
      "Complete agreement for the purchase or sale of a medical practice, including due diligence schedules and warranty provisions.",
    price: 2799.99,
    category: "Business Transactions",
    practiceArea: "Medical Practice",
    jurisdictions: ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"],
  },
  // Commercial Law
  {
    id: "confidentiality",
    name: "Confidentiality Agreement",
    description:
      "Also known as Non-Disclosure Agreement (NDA), this legal contract creates a confidential relationship between parties, protecting sensitive information shared during business dealings.",
    price: 1023,
    category: "Commercial Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
  },
  {
    id: "services-agreement",
    name: "Services Agreement",
    description:
      "A contract between a service provider and a client that outlines the scope of services, payment terms, and other conditions of the service arrangement.",
    price: 1968,
    category: "Commercial Law",
    practiceArea: "Healthcare",
    jurisdictions: ["Federal", "All States"],
  },
  {
    id: "website-terms",
    name: "Website Terms of Use",
    description:
      "Legal terms governing the use of a website, protecting the owner from liability and establishing rules for user conduct. Essential for any business with an online presence.",
    price: 1245,
    category: "Commercial Law",
    practiceArea: "Digital",
    jurisdictions: ["Federal", "All States"],
  },
  {
    id: "partnership-agreement",
    name: "Partnership Agreement",
    description:
      "A contract that establishes the terms of a partnership, including profit sharing, decision-making procedures, and dispute resolution processes.",
    price: 2499,
    category: "Commercial Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
  },
  // Employment Law
  {
    id: "employment-contract",
    name: "Employment Contract",
    description:
      "A legally binding agreement between an employer and employee, outlining employment terms including duties, compensation, benefits, and termination conditions.",
    price: 1799,
    category: "Employment Law",
    practiceArea: "Healthcare",
    jurisdictions: ["Federal", "All States"],
  },
  {
    id: "contractor-agreement",
    name: "Independent Contractor Agreement",
    description:
      "A contract between a business and an independent contractor that outlines the services to be provided, terms of payment, and clarifies that the relationship is not an employment relationship.",
    price: 1678,
    category: "Employment Law",
    practiceArea: "Healthcare",
    jurisdictions: ["Federal", "All States"],
  },
  {
    id: "esop",
    name: "Employee Share Option Plan",
    description:
      "A scheme that grants employees options to purchase company shares at a predetermined price, serving as an incentive and retention tool.",
    price: 3410,
    category: "Employment Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
  },
  // Property Law
  {
    id: "commercial-lease",
    name: "Commercial Lease",
    description:
      "A legally binding agreement between a landlord and a tenant for the leasing of commercial property, outlining terms such as rent, duration, and maintenance responsibilities.",
    price: 1753,
    category: "Property Law",
    practiceArea: "Business",
    jurisdictions: ["All States"],
  },
  {
    id: "retail-lease",
    name: "Retail Lease",
    description:
      "A specialised lease for retail premises that complies with retail leasing legislation, providing additional protections for retail tenants.",
    price: 1643,
    category: "Property Law",
    practiceArea: "Business",
    jurisdictions: ["All States"],
  },
  {
    id: "conveyancing",
    name: "Conveyancing",
    description:
      "Legal services for the transfer of property ownership, including contract preparation, title searches, and settlement arrangements.",
    price: 1490,
    category: "Property Law",
    practiceArea: "Property",
    jurisdictions: ["All States"],
  },
  {
    id: "put-call-option",
    name: "Put & Call Option Deed",
    description:
      "A legal agreement giving one party the right to buy (call option) and the other party the right to sell (put option) a property at predetermined terms.",
    price: 2212,
    category: "Property Law",
    practiceArea: "Business",
    jurisdictions: ["All States"],
  },
  // Corporate Law
  {
    id: "shareholders-agreement",
    name: "Shareholders' Agreement",
    description:
      "A comprehensive agreement between shareholders that outlines their rights, responsibilities, and obligations to each other and the company. Essential for any business with multiple shareholders.",
    price: 2639,
    category: "Corporate Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
  },
  {
    id: "share-sale",
    name: "Share Sale Agreement",
    description:
      "A legally binding contract for the sale and purchase of shares in a company, detailing the terms, conditions, and warranties associated with the transaction.",
    price: 2693,
    category: "Corporate Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
  },
  {
    id: "sale-of-business",
    name: "Sale of Business Agreement",
    description:
      "A comprehensive agreement governing the sale of a business as a going concern, including assets, liabilities, employees, and contracts.",
    price: 3146,
    category: "Corporate Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
  },
  {
    id: "asset-sale",
    name: "Asset Sale Agreement",
    description:
      "A contract for the sale of specific business assets rather than the entire business entity, outlining the assets being sold and associated terms.",
    price: 2913,
    category: "Corporate Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
  },
  {
    id: "company-constitution",
    name: "Company Constitution",
    description:
      "A document that defines the regulations for a company's operations and defines the purpose, rules, and functions of the organisation as well as the duties of its officers.",
    price: 1517,
    category: "Corporate Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
  },
  {
    id: "unit-trust",
    name: "Unit Trust Deed",
    description:
      "Establishes a unit trust structure where assets are held by a trustee for unit holders. Commonly used for property investments and family investment vehicles.",
    price: 1563,
    category: "Corporate Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
  },
  // Intellectual Property
  {
    id: "ip-assignment",
    name: "Deed of Assignment of IP",
    description:
      "A legal document that transfers ownership of intellectual property rights from one party to another, ensuring clear title to valuable IP assets.",
    price: 1400,
    category: "Intellectual Property Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
  },
  {
    id: "ip-licence",
    name: "IP Licence Agreement",
    description:
      "A contract granting permission to use intellectual property under specific terms and conditions, while the original owner retains ownership.",
    price: 1960,
    category: "Intellectual Property Law",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
  },
  {
    id: "eula",
    name: "End-User Licence Agreement",
    description:
      "A legal contract between a software developer and the user of the software, establishing the user's rights and restrictions.",
    price: 2146,
    category: "Intellectual Property Law",
    practiceArea: "Digital",
    jurisdictions: ["Federal", "All States"],
  },
  // Finance
  {
    id: "loan-agreement",
    name: "Loan Agreement",
    description:
      "A legally binding contract documenting a loan between parties, outlining the amount borrowed, interest rate, repayment terms, and security if applicable.",
    price: 1869,
    category: "Finance",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
  },
  {
    id: "safe",
    name: "Simple Agreement for Future Equity",
    description:
      "Commonly known as SAFE, this is an agreement between an investor and a company, providing rights to the investor for future equity in the company.",
    price: 2047,
    category: "Finance",
    practiceArea: "Business",
    jurisdictions: ["Federal", "All States"],
  },
  // Wills & Estate Planning
  {
    id: "simple-will",
    name: "Simple Will",
    description:
      "A basic will that outlines your wishes for the distribution of your estate and appointment of executors. Suitable for individuals with straightforward financial and family situations.",
    price: 604,
    category: "Wills & Estate Planning",
    practiceArea: "Personal Legal",
    jurisdictions: ["All States", "Federal"],
  },
  {
    id: "mirrored-will",
    name: "Mirrored Will",
    description:
      "Matching wills for couples that mirror each other's provisions. These wills are designed for partners who have similar wishes regarding the distribution of their estates.",
    price: 903,
    category: "Wills & Estate Planning",
    practiceArea: "Personal Legal",
    jurisdictions: ["All States", "Federal"],
  },
  {
    id: "testamentary-trust-will",
    name: "Will with Testamentary Discretionary Trust",
    description:
      "A comprehensive will that includes the establishment of a testamentary discretionary trust, offering tax advantages and asset protection for beneficiaries.",
    price: 1757,
    category: "Wills & Estate Planning",
    practiceArea: "Personal Legal",
    jurisdictions: ["All States", "Federal"],
  },
  {
    id: "power-of-attorney",
    name: "Enduring Power of Attorney",
    description:
      "A legal document that grants someone else the authority to make financial and legal decisions on your behalf if you become unable to do so.",
    price: 448,
    category: "Wills & Estate Planning",
    practiceArea: "Personal Legal",
    jurisdictions: ["All States", "Federal"],
  },
  {
    id: "health-directive",
    name: "Enduring Guardianship/Health Directive",
    description:
      "A document that appoints someone to make personal, lifestyle, and healthcare decisions for you when you are unable to make these decisions yourself.",
    price: 395,
    category: "Wills & Estate Planning",
    practiceArea: "Personal Legal",
    jurisdictions: ["All States", "Federal"],
  },
  {
    id: "family-trust",
    name: "Family Trust Deed",
    description:
      "Establishes a family trust to hold assets for beneficiaries, offering tax advantages and asset protection for family members.",
    price: 1421,
    category: "Wills & Estate Planning",
    practiceArea: "Personal Legal",
    jurisdictions: ["All States", "Federal"],
  },
];

const categories = [
  "All Categories",
  "Employment Law",
  "Healthcare Law",
  "Business Structures",
  "Business Transactions",
  "Commercial Law",
  "Property Law",
  "Corporate Law",
  "Intellectual Property Law",
  "Finance",
  "Wills & Estate Planning",
];

const practiceAreas = ["All Areas", "Medical Practice", "Healthcare", "Business", "Digital", "Property", "Personal Legal"];

const jurisdictions = ["All Jurisdictions", "Federal", "All States", "NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"];

const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under $500", min: 0, max: 500 },
  { label: "$500 - $1,000", min: 500, max: 1000 },
  { label: "$1,000 - $1,500", min: 1000, max: 1500 },
  { label: "$1,500 - $2,000", min: 1500, max: 2000 },
  { label: "$2,000 - $2,500", min: 2000, max: 2500 },
  { label: "Over $2,500", min: 2500, max: Infinity },
];

const sortOptions = [
  { label: "Default", value: "default" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
  { label: "Name: Z to A", value: "name-desc" },
];

// Document type to search query mapping for footer links (Australian English)
const documentTypeSearchMap: Record<string, string> = {
  "service-agreements": "services agreement",
  "licencing-agreements": "licencing agreement",
  "employment-contracts": "employment contract",
  "practice-management": "practice management",
  "dispute-resolution": "dispute resolution",
};

function DocumentsPageContent() {
  const searchParams = useSearchParams();

  // Get initial values from URL params
  const urlCategory = searchParams.get("category");
  const urlType = searchParams.get("type");
  const urlSearch = searchParams.get("search");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPracticeArea, setSelectedPracticeArea] = useState("All Areas");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("All Jurisdictions");
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(true);

  // Initialize from URL params
  useEffect(() => {
    if (urlCategory) {
      // Map URL category slugs to actual category names
      const categoryMap: Record<string, string> = {
        "healthcare": "Healthcare Law",
        "employment": "Employment Law",
        "commercial": "Commercial Law",
        "corporate": "Corporate Law",
        "property": "Property Law",
        "wills-estate": "Wills & Estate Planning",
        "finance": "Finance",
        "ip": "Intellectual Property Law",
      };
      const mappedCategory = categoryMap[urlCategory.toLowerCase()];
      if (mappedCategory) {
        setSelectedCategory(mappedCategory);
      }
    }
    if (urlType) {
      // Map type to search query
      const searchTerm = documentTypeSearchMap[urlType.toLowerCase()];
      if (searchTerm) {
        setSearchQuery(searchTerm);
      }
    }
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlCategory, urlType, urlSearch]);

  // Preview modal state
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; document: Document | null }>({
    isOpen: false,
    document: null,
  });

  const { addItem, openCart } = useCartStore();

  const filteredDocuments = useMemo(() => {
    let results = allDocuments.filter((doc) => {
      const matchesSearch =
        searchQuery === "" ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Categories" || doc.category === selectedCategory;

      const matchesPracticeArea =
        selectedPracticeArea === "All Areas" || doc.practiceArea === selectedPracticeArea;

      const matchesJurisdiction =
        selectedJurisdiction === "All Jurisdictions" ||
        doc.jurisdictions.includes(selectedJurisdiction) ||
        doc.jurisdictions.includes("All States") ||
        doc.jurisdictions.includes("Federal");

      const matchesPrice =
        doc.price >= selectedPriceRange.min && doc.price < selectedPriceRange.max;

      return matchesSearch && matchesCategory && matchesPracticeArea && matchesJurisdiction && matchesPrice;
    });

    // Sort results
    if (sortBy === "price-asc") {
      results = results.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      results = results.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-asc") {
      results = results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      results = results.sort((a, b) => b.name.localeCompare(a.name));
    }

    return results;
  }, [searchQuery, selectedCategory, selectedPracticeArea, selectedJurisdiction, selectedPriceRange, sortBy]);

  const activeFiltersCount = [
    selectedCategory !== "All Categories",
    selectedPracticeArea !== "All Areas",
    selectedJurisdiction !== "All Jurisdictions",
    selectedPriceRange.label !== "All Prices",
    searchQuery !== "",
  ].filter(Boolean).length;

  const handleAddToCart = (doc: Document) => {
    addItem({
      id: doc.id,
      name: doc.name,
      description: doc.description,
      price: doc.price,
      category: doc.category,
      practiceArea: doc.practiceArea,
      jurisdictions: doc.jurisdictions,
    });
    toast.success(`${doc.name} added to cart`, {
      action: {
        label: "View Cart",
        onClick: () => openCart(),
      },
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedPracticeArea("All Areas");
    setSelectedJurisdiction("All Jurisdictions");
    setSelectedPriceRange(priceRanges[0]);
    setSortBy("default");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 pt-32 pb-16">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl bg-tiffany/5" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl bg-tiffany/3" />

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-8 bg-tiffany/10">
              <span className="font-montserrat text-sm font-semibold text-tiffany uppercase tracking-wider">
                Legal Documents
              </span>
            </div>
            <h1 className="font-blair text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Legal Documents
            </h1>
            <p className="font-montserrat text-lg text-text-secondary max-w-2xl mx-auto">
              Access our comprehensive collection of legal documents specifically designed for
              Australian medical practitioners and healthcare organisations.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Overview */}
      <section className="py-12 bg-white border-b">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <div>
              <span className="text-xs font-semibold text-tiffany uppercase tracking-wider">
                Pricing
              </span>
              <h2 className="font-blair text-2xl">Document Price List</h2>
              <p className="text-gray-600 text-sm">
                Transparent pricing for all our legal documents. All prices include GST and expert
                legal advice.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 text-sm text-tiffany-dark border border-tiffany/30 rounded-lg hover:bg-tiffany/5"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Prices
            </button>
          </div>

          {/* Featured Document */}
          <Link href="/documents/tenant-doctor" className="block">
            <div className="bg-gradient-to-r from-tiffany-lighter/20 to-tiffany/10 rounded-2xl p-6 mb-8 border-2 border-tiffany/20 hover:border-tiffany/40 transition-colors cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-tiffany rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-blair text-xl text-tiffany-dark">
                      Tenant Doctor Service Agreement
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Comprehensive protection for medical practitioners
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Initial Setup</p>
                    <p className="text-xl font-bold text-tiffany-dark">
                      $1,500 <span className="text-sm font-normal">+ GST</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Ongoing Support</p>
                    <p className="text-xl font-bold text-tiffany-dark">
                      $30<span className="text-sm font-normal">/month + GST</span>
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-tiffany-dark">
                    <Eye className="h-5 w-5" />
                    <span className="text-sm font-medium">View Details</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* GST Info */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <p className="font-semibold text-gray-700 mb-1">GST Information</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-gray-600">
              <span>Prices in AUD excluding GST</span>
              <span>10% GST added at checkout</span>
              <span>Tax invoices provided</span>
              <span>Prices subject to change</span>
            </div>
            <p className="text-gray-500 mt-2">
              Contact for bulk pricing or custom requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Filter & Documents Section */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          {/* Filter Header */}
          <div className="bg-white rounded-xl shadow-sm mb-4">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tiffany bg-white cursor-pointer"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    showFilters
                      ? "bg-tiffany text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                      showFilters ? "bg-white/20" : "bg-tiffany text-white"
                    }`}>
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="border-t p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent bg-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Practice Area</label>
                    <select
                      value={selectedPracticeArea}
                      onChange={(e) => setSelectedPracticeArea(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent bg-white"
                    >
                      {practiceAreas.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Jurisdiction</label>
                    <select
                      value={selectedJurisdiction}
                      onChange={(e) => setSelectedJurisdiction(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent bg-white"
                    >
                      {jurisdictions.map((jur) => (
                        <option key={jur} value={jur}>
                          {jur}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Price Range</label>
                    <select
                      value={selectedPriceRange.label}
                      onChange={(e) => {
                        const range = priceRanges.find((r) => r.label === e.target.value);
                        if (range) setSelectedPriceRange(range);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent bg-white"
                    >
                      {priceRanges.map((range) => (
                        <option key={range.label} value={range.label}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Active Filters */}
                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
                    <span className="text-xs text-gray-500">Active filters:</span>
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-tiffany/10 text-tiffany-dark text-xs rounded-full">
                        <Tag className="h-3 w-3" />
                        "{searchQuery}"
                        <button onClick={() => setSearchQuery("")} className="hover:text-tiffany">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedCategory !== "All Categories" && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-tiffany/10 text-tiffany-dark text-xs rounded-full">
                        {selectedCategory}
                        <button onClick={() => setSelectedCategory("All Categories")} className="hover:text-tiffany">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedPracticeArea !== "All Areas" && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-tiffany/10 text-tiffany-dark text-xs rounded-full">
                        {selectedPracticeArea}
                        <button onClick={() => setSelectedPracticeArea("All Areas")} className="hover:text-tiffany">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedJurisdiction !== "All Jurisdictions" && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-tiffany/10 text-tiffany-dark text-xs rounded-full">
                        {selectedJurisdiction}
                        <button onClick={() => setSelectedJurisdiction("All Jurisdictions")} className="hover:text-tiffany">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedPriceRange.label !== "All Prices" && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-tiffany/10 text-tiffany-dark text-xs rounded-full">
                        {selectedPriceRange.label}
                        <button onClick={() => setSelectedPriceRange(priceRanges[0])} className="hover:text-tiffany">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    <button
                      onClick={clearFilters}
                      className="text-xs text-gray-500 hover:text-tiffany ml-2"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredDocuments.length}</span> of{" "}
              <span className="font-semibold">{allDocuments.length}</span> documents
            </p>
            {activeFiltersCount > 0 && !showFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-tiffany hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Document Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="px-2 py-0.5 bg-tiffany/10 text-tiffany-dark text-xs rounded font-medium">
                    {doc.category.split(" ")[0]}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    {doc.practiceArea}
                  </span>
                </div>

                <h3 className="font-blair text-lg mb-2 leading-tight">{doc.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{doc.description}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {doc.jurisdictions.slice(0, 4).map((jur) => (
                    <span
                      key={jur}
                      className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded border"
                    >
                      {jur}
                    </span>
                  ))}
                  {doc.jurisdictions.length > 4 && (
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded border">
                      +{doc.jurisdictions.length - 4}
                    </span>
                  )}
                </div>

                {doc.subscription ? (
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-tiffany-dark">
                        ${doc.subscription.initial.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">+ GST initial</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      + ${doc.subscription.monthly}/month ongoing
                    </div>
                    <p className="text-xs text-gray-400 mt-1 italic">
                      Please note a comprehensive questionnaire and checklist must be completed by
                      the client prior to final product delivery
                    </p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <span className="text-lg font-bold text-tiffany-dark">
                      ${doc.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">plus GST</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewModal({ isOpen: true, document: doc })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleAddToCart(doc)}
                    className="flex-1 px-4 py-2 bg-tiffany text-white rounded-lg text-sm font-medium hover:bg-tiffany-dark transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
                <Link
                  href={`/documents/${doc.id}`}
                  className="mt-2 text-sm text-tiffany hover:underline flex items-center justify-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  View Full Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-tiffany-dark">
        <div className="container-custom text-center">
          <h2 className="font-blair text-3xl md:text-4xl font-bold text-white mb-6">
            Need a Custom Legal Document?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Our team can prepare bespoke legal documents tailored to your specific practice needs
            and circumstances.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-tiffany-dark font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Request a Quote
            </Link>
            <Link
              href="/book-appointment"
              className="inline-flex items-center justify-center px-8 py-4 bg-tiffany text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Document Preview Modal */}
      {previewModal.document && (
        <DocumentPreviewModal
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal({ isOpen: false, document: null })}
          document={{
            name: previewModal.document.name,
            slug: previewModal.document.id,
            description: previewModal.document.description,
            price: previewModal.document.price,
            category: previewModal.document.category,
            totalPages: 8,
          }}
          onAddToCart={() => {
            handleAddToCart(previewModal.document!);
          }}
        />
      )}
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tiffany"></div></div>}>
      <DocumentsPageContent />
    </Suspense>
  );
}
