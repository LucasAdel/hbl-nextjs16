"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
  title?: string;
  className?: string;
}

// Generate JSON-LD structured data for FAQs
function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function FAQSchema({ faqs, title, className = "" }: FAQSchemaProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const schema = generateFAQSchema(faqs);

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Visual FAQ Section */}
      <section className={`${className}`}>
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {title}
          </h2>
        )}

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all duration-200 hover:border-tiffany/50"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 md:p-5 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-medium text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-tiffany flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                <div
                  id={`faq-answer-${index}`}
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="p-4 md:p-5 pt-0 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

// Inline FAQ schema without visual component (for pages with custom FAQ UI)
export function FAQSchemaOnly({ faqs }: { faqs: FAQItem[] }) {
  if (!faqs || faqs.length === 0) return null;

  const schema = generateFAQSchema(faqs);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Common legal service FAQs for reuse
export const LEGAL_SERVICE_FAQS: FAQItem[] = [
  {
    question: "What areas of law does Hamilton Bailey Law specialize in?",
    answer:
      "Hamilton Bailey Law specializes in healthcare law, medical practice setup, regulatory compliance (AHPRA, Medicare), employment contracts for medical professionals, commercial leasing for medical practices, and business structuring for healthcare providers.",
  },
  {
    question: "How much does a legal consultation cost?",
    answer:
      "Initial consultations start from $350 AUD including GST. Complex matters may require extended consultations. We provide transparent pricing and will discuss fees upfront before commencing any work.",
  },
  {
    question: "Do you offer services Australia-wide?",
    answer:
      "Yes, we provide legal services to clients throughout Australia. Many of our services can be delivered remotely via video conference, email, and secure document sharing. We also offer in-person consultations in major cities.",
  },
  {
    question: "How long does it take to set up a medical practice?",
    answer:
      "Timeline varies based on complexity. Simple sole practitioner setups can be completed in 2-4 weeks. More complex arrangements involving partnerships, company structures, or multiple locations typically take 4-8 weeks. We'll provide a realistic timeline during your initial consultation.",
  },
  {
    question: "Can I purchase legal documents without a consultation?",
    answer:
      "Yes, our legal document store offers professionally drafted templates that you can purchase and use immediately. However, for complex situations or customization needs, we recommend a consultation to ensure the documents meet your specific requirements.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), direct bank transfer, and PayPal. Document purchases can be completed instantly via our secure online checkout. For ongoing legal services, we offer flexible payment arrangements.",
  },
];

// Medical practice FAQs
export const MEDICAL_PRACTICE_FAQS: FAQItem[] = [
  {
    question: "What's the difference between a service agreement and an employment contract for doctors?",
    answer:
      "A service agreement is used when a doctor works as an independent contractor, maintaining their own ABN and controlling how they deliver services. An employment contract creates an employer-employee relationship with PAYG tax, leave entitlements, and superannuation obligations. The correct structure depends on the nature of the working arrangement and has significant tax and liability implications.",
  },
  {
    question: "Do I need AHPRA approval to open a medical practice?",
    answer:
      "AHPRA registration is required for individual practitioners, not practices. However, your practice must comply with AHPRA's advertising guidelines, and any business name must not mislead patients about services offered. We can help ensure your practice setup meets all regulatory requirements.",
  },
  {
    question: "What insurances do I need for a medical practice?",
    answer:
      "Essential insurances include professional indemnity insurance (required by AHPRA), public liability insurance, workers compensation (if you have employees), and business insurance covering equipment and premises. We can advise on appropriate coverage levels for your specific situation.",
  },
  {
    question: "How do I structure a medical partnership?",
    answer:
      "Medical partnerships can be structured as traditional partnerships, incorporated practices, or through unit trusts. Each has different tax implications, liability protection, and succession planning considerations. We recommend a consultation to determine the optimal structure for your circumstances.",
  },
];

export default FAQSchema;
