"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  title?: string;
  description?: string;
  showCategories?: boolean;
  className?: string;
}

export function FAQAccordion({
  items,
  title = "Frequently Asked Questions",
  description,
  showCategories = false,
  className = "",
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(items.map((item) => item.category).filter(Boolean)))];

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  return (
    <div className={className}>
      {/* Header */}
      {(title || description) && (
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tiffany/10 mb-4">
            <HelpCircle className="h-4 w-4 text-tiffany" />
            <span className="text-sm font-semibold text-tiffany uppercase tracking-wider">FAQ</span>
          </div>
          {title && (
            <h2 className="font-blair text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
          )}
        </div>
      )}

      {/* Category Filter */}
      {showCategories && categories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as string)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-tiffany text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Accordion Items */}
      <div className="max-w-3xl mx-auto space-y-3">
        {filteredItems.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-5 pb-5">
                    <div className="pt-2 border-t">
                      <p className="text-gray-600 leading-relaxed pt-3">{item.answer}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple standalone accordion item for use in other components
interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AccordionItem({ question, answer, isOpen = false, onToggle }: AccordionItemProps) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const open = onToggle ? isOpen : internalOpen;
  const toggle = onToggle || (() => setInternalOpen(!internalOpen));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 pr-4">{question}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5">
              <div className="pt-2 border-t">
                <p className="text-gray-600 leading-relaxed pt-3">{answer}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Pre-built FAQ sections for common use cases
export const generalFAQs: FAQItem[] = [
  {
    question: "What areas of law does Hamilton Bailey Law Firm specialise in?",
    answer:
      "We specialise in legal services for medical practitioners and healthcare organisations, including practice compliance, commercial contracts, property law, employment law, and regulatory matters with AHPRA and other health bodies.",
    category: "General",
  },
  {
    question: "Do you offer consultations for clients outside of Adelaide?",
    answer:
      "Yes, we provide legal services to clients across Australia. We offer virtual consultations via video call for clients who cannot meet in person, making our services accessible regardless of location.",
    category: "General",
  },
  {
    question: "How long does a typical legal matter take to resolve?",
    answer:
      "The timeline varies depending on the complexity of the matter. Simple document reviews may take a few days, while more complex transactions or disputes can take several weeks or months. We always provide an estimated timeline during our initial consultation.",
    category: "General",
  },
  {
    question: "What are your fees and payment options?",
    answer:
      "Our fees vary based on the type and complexity of work. We offer fixed-fee arrangements for many services and can discuss payment plans for larger matters. We provide a detailed cost estimate before commencing any work.",
    category: "Billing",
  },
  {
    question: "Can you help with AHPRA compliance matters?",
    answer:
      "Yes, we have extensive experience helping medical practitioners navigate AHPRA compliance requirements, investigations, and notifications. We can assist with responding to complaints and ensuring your practice meets all regulatory requirements.",
    category: "Services",
  },
  {
    question: "What documents do I need for my initial consultation?",
    answer:
      "This depends on your matter, but generally it's helpful to bring any relevant contracts, correspondence, and a summary of your situation. We'll advise on any specific documents needed when you book your appointment.",
    category: "General",
  },
];
