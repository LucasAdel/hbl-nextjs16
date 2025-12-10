"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Smile,
  UserCog,
  HeartPulse,
  Home,
  Brain,
  FlaskConical,
  Scan,
  Pill,
  Activity,
  Clock,
  ChevronRight,
  ArrowRight,
  BookOpen
} from "lucide-react";
import {
  libraryArticles,
  getAllPracticeAreas
} from "@/lib/codex/articles-data";
import type { LibraryArticle, PracticeArea } from "@/lib/codex/types";

// Practice area configuration
const practiceAreaConfig: Record<PracticeArea, {
  icon: React.ElementType;
  color: string;
  gradient: string;
  description: string;
  services: string[];
}> = {
  "General Practice": {
    icon: Stethoscope,
    color: "text-blue-600",
    gradient: "from-blue-500 to-blue-600",
    description: "Comprehensive legal support for general medical practitioners and family doctors.",
    services: ["Practice establishment", "Patient consent", "Medical records management", "Referral agreements"]
  },
  "Medical Practice": {
    icon: Activity,
    color: "text-tiffany-600",
    gradient: "from-tiffany-500 to-teal-600",
    description: "Legal guidance for medical practice owners and healthcare business operators.",
    services: ["Practice acquisitions", "Partnership agreements", "Corporate structures", "Succession planning"]
  },
  "Dental Practice": {
    icon: Smile,
    color: "text-cyan-600",
    gradient: "from-cyan-500 to-cyan-600",
    description: "Tailored legal services for dental practices and oral health professionals.",
    services: ["Associate agreements", "Practice sales", "Equipment leasing", "Cosmetic dentistry regulations"]
  },
  "Specialist Practice": {
    icon: UserCog,
    color: "text-purple-600",
    gradient: "from-purple-500 to-purple-600",
    description: "Specialized legal support for medical specialists across all disciplines.",
    services: ["Consulting agreements", "Hospital privileges", "Research contracts", "Referral networks"]
  },
  "Allied Health": {
    icon: HeartPulse,
    color: "text-rose-600",
    gradient: "from-rose-500 to-rose-600",
    description: "Legal services for physiotherapists, occupational therapists, and other allied health professionals.",
    services: ["Multi-disciplinary practices", "NDIS compliance", "Professional indemnity", "Scope of practice"]
  },
  "Aged Care": {
    icon: Home,
    color: "text-amber-600",
    gradient: "from-amber-500 to-amber-600",
    description: "Comprehensive legal support for aged care facilities and providers.",
    services: ["Residential agreements", "Quality standards compliance", "Workforce management", "Elder abuse prevention"]
  },
  "Mental Health": {
    icon: Brain,
    color: "text-indigo-600",
    gradient: "from-indigo-500 to-indigo-600",
    description: "Legal guidance for mental health practitioners and psychology clinics.",
    services: ["Telehealth compliance", "Patient confidentiality", "Mandatory reporting", "Medicare compliance"]
  },
  "Pathology": {
    icon: FlaskConical,
    color: "text-emerald-600",
    gradient: "from-emerald-500 to-emerald-600",
    description: "Legal services for pathology laboratories and diagnostic services.",
    services: ["Laboratory accreditation", "Quality management", "Data handling", "Third-party testing"]
  },
  "Radiology": {
    icon: Scan,
    color: "text-slate-600",
    gradient: "from-slate-500 to-slate-600",
    description: "Legal support for radiology practices and diagnostic imaging centres.",
    services: ["Equipment regulations", "Radiation safety", "Teleradiology", "Bulk billing compliance"]
  },
  "Pharmacy": {
    icon: Pill,
    color: "text-green-600",
    gradient: "from-green-500 to-green-600",
    description: "Legal guidance for community and hospital pharmacies.",
    services: ["Pharmacy ownership", "PBS compliance", "Medication management", "Compounding regulations"]
  }
};

export default function PracticeAreasPage() {
  const [selectedArea, setSelectedArea] = useState<PracticeArea | null>(null);

  const practiceAreas = getAllPracticeAreas();

  // Get articles for selected practice area
  const areaArticles = useMemo(() => {
    if (!selectedArea) return [];
    return libraryArticles
      .filter(a => a.status === "published" && a.practiceAreas.includes(selectedArea))
      .slice(0, 6);
  }, [selectedArea]);

  // Get article count for each area
  const areaCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    practiceAreas.forEach((area) => {
      counts[area] = libraryArticles.filter(
        a => a.status === "published" && a.practiceAreas.includes(area)
      ).length;
    });
    return counts;
  }, [practiceAreas]);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
          Legal Resources by Practice Area
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Explore legal guides and resources tailored specifically for your healthcare specialty.
        </p>
      </section>

      {/* Practice Areas Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {practiceAreas.map((area) => {
          const config = practiceAreaConfig[area];
          const Icon = config.icon;
          const isSelected = selectedArea === area;
          const count = areaCounts[area] || 0;

          return (
            <button
              key={area}
              onClick={() => setSelectedArea(isSelected ? null : area)}
              className={`
                text-left rounded-xl border transition-all duration-300 overflow-hidden
                ${isSelected
                  ? "ring-2 ring-tiffany-500 border-transparent shadow-lg"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-tiffany-400 dark:hover:border-tiffany-600"
                }
              `}
            >
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${config.gradient} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {count} article{count !== 1 ? "s" : ""}
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-4">{area}</h3>
              </div>

              {/* Content */}
              <div className={`p-6 ${isSelected ? "bg-tiffany-50 dark:bg-tiffany-900/20" : "bg-white dark:bg-slate-800"}`}>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {config.description}
                </p>

                {/* Services */}
                <div className="space-y-2">
                  {config.services.slice(0, 3).map((service, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <ChevronRight className={`h-4 w-4 ${config.color}`} />
                      {service}
                    </div>
                  ))}
                  {config.services.length > 3 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 pl-6">
                      +{config.services.length - 3} more services
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* Selected Area Articles */}
      {selectedArea && (
        <section className="pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {(() => {
                const config = practiceAreaConfig[selectedArea];
                const Icon = config.icon;
                return <Icon className={`h-5 w-5 ${config.color}`} />;
              })()}
              Resources for {selectedArea}
            </h3>
            <button
              onClick={() => setSelectedArea(null)}
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Clear selection
            </button>
          </div>

          {areaArticles.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {areaArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              <div className="text-center">
                <Link
                  href={`/codex/search?practiceArea=${encodeURIComponent(selectedArea)}`}
                  className="inline-flex items-center gap-2 text-tiffany-600 hover:text-tiffany-700 font-medium"
                >
                  View all {selectedArea} resources
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
              <BookOpen className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No articles yet
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                We&apos;re working on adding resources for {selectedArea}
              </p>
            </div>
          )}
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-tiffany-600 to-teal-700 rounded-2xl p-8 md:p-12 text-center text-white">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          Can&apos;t Find What You&apos;re Looking For?
        </h3>
        <p className="text-tiffany-100 mb-6 max-w-2xl mx-auto">
          Our legal team specialises in healthcare law across all practice areas.
          Contact us for personalised guidance on your specific situation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="px-6 py-3 bg-white text-tiffany-600 rounded-lg font-semibold hover:bg-tiffany-50 transition-colors"
          >
            Contact Our Team
          </Link>
          <Link
            href="/services"
            className="px-6 py-3 bg-white/10 text-white border border-white/30 rounded-lg font-semibold hover:bg-white/20 transition-colors"
          >
            View All Services
          </Link>
        </div>
      </section>
    </div>
  );
}

function ArticleCard({ article }: { article: LibraryArticle }) {
  return (
    <Link
      href={`/codex/${article.slug}`}
      className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 hover:shadow-lg hover:border-tiffany-400 dark:hover:border-tiffany-600 transition-all duration-300"
    >
      <span className="inline-block px-2 py-1 bg-tiffany-100 dark:bg-tiffany-900/30 text-tiffany-700 dark:text-tiffany-300 rounded text-xs font-medium mb-3">
        {article.category}
      </span>

      <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-tiffany-600 dark:group-hover:text-tiffany-400 transition-colors line-clamp-2 mb-2">
        {article.title}
      </h4>

      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
        {article.description}
      </p>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {article.readingTime} min read
        </span>
        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
