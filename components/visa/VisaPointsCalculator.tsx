"use client";

import React, { useState, useMemo } from "react";
import { Calculator, Info, CheckCircle, AlertCircle } from "lucide-react";

interface PointsCategory {
  id: string;
  label: string;
  options: { value: number; label: string }[];
  tooltip?: string;
}

const pointsCategories: PointsCategory[] = [
  {
    id: "age",
    label: "Age",
    tooltip: "Points based on your age at the time of invitation",
    options: [
      { value: 25, label: "25-32 years (25 points)" },
      { value: 30, label: "18-24 years (25 points)" },
      { value: 15, label: "33-39 years (15 points)" },
      { value: 0, label: "40-44 years (0 points)" },
      { value: 0, label: "45+ years (0 points - not eligible)" },
    ],
  },
  {
    id: "english",
    label: "English Language Ability",
    tooltip: "Based on IELTS, PTE, or equivalent test scores",
    options: [
      { value: 20, label: "Superior (IELTS 8+ all bands)" },
      { value: 10, label: "Proficient (IELTS 7+ all bands)" },
      { value: 0, label: "Competent (IELTS 6+ all bands)" },
    ],
  },
  {
    id: "overseasExperience",
    label: "Overseas Skilled Employment",
    tooltip: "Work experience outside Australia in your nominated occupation",
    options: [
      { value: 15, label: "8-10 years (15 points)" },
      { value: 10, label: "5-7 years (10 points)" },
      { value: 5, label: "3-4 years (5 points)" },
      { value: 0, label: "Less than 3 years (0 points)" },
    ],
  },
  {
    id: "australianExperience",
    label: "Australian Skilled Employment",
    tooltip: "Work experience in Australia in your nominated occupation",
    options: [
      { value: 20, label: "8-10 years (20 points)" },
      { value: 15, label: "5-7 years (15 points)" },
      { value: 10, label: "3-4 years (10 points)" },
      { value: 5, label: "1-2 years (5 points)" },
      { value: 0, label: "Less than 1 year (0 points)" },
    ],
  },
  {
    id: "education",
    label: "Educational Qualification",
    tooltip: "Your highest relevant qualification",
    options: [
      { value: 20, label: "Doctorate (PhD) (20 points)" },
      { value: 15, label: "Bachelor/Masters degree (15 points)" },
      { value: 10, label: "Diploma or trade qualification (10 points)" },
      { value: 0, label: "Other qualification (0 points)" },
    ],
  },
  {
    id: "australianStudy",
    label: "Australian Study Requirement",
    tooltip: "Completed at least 2 years of full-time study in Australia",
    options: [
      { value: 5, label: "Yes - completed Australian study (5 points)" },
      { value: 0, label: "No (0 points)" },
    ],
  },
  {
    id: "specialistEducation",
    label: "Specialist Education Qualification",
    tooltip: "Masters degree or Doctorate from Australian institution in STEM field",
    options: [
      { value: 10, label: "Masters/Doctorate in STEM (10 points)" },
      { value: 5, label: "Masters/Doctorate (not STEM) (5 points)" },
      { value: 0, label: "Not applicable (0 points)" },
    ],
  },
  {
    id: "professionalYear",
    label: "Professional Year",
    tooltip: "Completed a Professional Year program in Australia",
    options: [
      { value: 5, label: "Yes - completed (5 points)" },
      { value: 0, label: "No (0 points)" },
    ],
  },
  {
    id: "credentialledCommunityLanguage",
    label: "Credentialled Community Language",
    tooltip: "NAATI accredited translator or interpreter",
    options: [
      { value: 5, label: "Yes - NAATI accredited (5 points)" },
      { value: 0, label: "No (0 points)" },
    ],
  },
  {
    id: "partnerSkills",
    label: "Partner Skills",
    tooltip: "Points for partner's qualifications and skills assessment",
    options: [
      { value: 10, label: "Partner meets skills requirements (10 points)" },
      { value: 5, label: "Partner has competent English (5 points)" },
      { value: 10, label: "Single applicant (10 points)" },
      { value: 0, label: "Partner doesn't meet requirements (0 points)" },
    ],
  },
  {
    id: "nomination",
    label: "State/Territory Nomination",
    tooltip: "Points for state or regional nomination",
    options: [
      { value: 15, label: "Regional nomination (Subclass 491) (15 points)" },
      { value: 5, label: "State nomination (Subclass 190) (5 points)" },
      { value: 0, label: "No nomination (Subclass 189) (0 points)" },
    ],
  },
];

export default function VisaPointsCalculator() {
  const [selections, setSelections] = useState<Record<string, number>>({});

  const totalPoints = useMemo(() => {
    return Object.values(selections).reduce((sum, val) => sum + val, 0);
  }, [selections]);

  const handleChange = (categoryId: string, value: number) => {
    setSelections((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  const getEligibilityStatus = () => {
    if (totalPoints >= 85) {
      return {
        status: "excellent",
        message: "Excellent chance of invitation",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    } else if (totalPoints >= 75) {
      return {
        status: "good",
        message: "Good chance with state nomination",
        color: "text-tiffany-dark",
        bgColor: "bg-tiffany/10",
        borderColor: "border-tiffany/30",
      };
    } else if (totalPoints >= 65) {
      return {
        status: "minimum",
        message: "Meets minimum threshold",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      };
    } else {
      return {
        status: "below",
        message: "Below minimum threshold",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
    }
  };

  const eligibility = getEligibilityStatus();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-tiffany to-tiffany-dark p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="h-6 w-6" />
          <h2 className="font-blair text-2xl font-bold">Points Calculator</h2>
        </div>
        <p className="text-white/80 text-sm">
          Estimate your points for skilled migration visas (189, 190, 491)
        </p>
      </div>

      <div className="p-6">
        {/* Points Summary */}
        <div className={`mb-6 p-4 rounded-xl border ${eligibility.bgColor} ${eligibility.borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Your Total Points</p>
              <p className={`text-4xl font-bold ${eligibility.color}`}>{totalPoints}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                {eligibility.status === "excellent" || eligibility.status === "good" ? (
                  <CheckCircle className={`h-5 w-5 ${eligibility.color}`} />
                ) : (
                  <AlertCircle className={`h-5 w-5 ${eligibility.color}`} />
                )}
                <span className={`font-semibold ${eligibility.color}`}>
                  {eligibility.message}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum: 65 | Competitive: 85+
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {pointsCategories.map((category) => (
            <div key={category.id} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <label className="font-semibold text-gray-900 text-sm">
                  {category.label}
                </label>
                {category.tooltip && (
                  <div className="group relative">
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                      {category.tooltip}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                )}
              </div>
              <select
                value={selections[category.id] ?? ""}
                onChange={(e) => handleChange(category.id, parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
              >
                <option value="">Select...</option>
                {category.options.map((option, idx) => (
                  <option key={idx} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p className="font-semibold mb-1">Disclaimer</p>
          <p>
            This calculator provides an estimate only. Actual points may vary based on individual
            circumstances. Immigration requirements change regularly. Consult with a registered
            migration agent for accurate assessment.
          </p>
        </div>
      </div>
    </div>
  );
}
