"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, Calendar, Users, Clock, DollarSign, CheckCircle, Mail, X, Loader2 } from "lucide-react";
import VisaPointsCalculator from "@/components/visa/VisaPointsCalculator";

export default function HealthcareVisaGuidePage() {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Profession-Specific Pathways",
      description: "Tailored visa options for doctors, nurses, and allied health professionals",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Fast-Track Options",
      description: "Learn about the Skills in Demand visa with target 7-day processing",
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Cost Breakdown",
      description: "Complete fee structure for all visa types and assessment processes",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Timeline Guide",
      description: "Step-by-step timeline from skills assessment to visa grant",
    },
  ];

  const visaTypes = [
    {
      name: "Skills in Demand Visa (Subclass 482)",
      slug: "482",
      description: "Employer-sponsored temporary visa with pathway to permanent residency",
    },
    {
      name: "Employer Nomination Scheme (Subclass 186)",
      slug: "186",
      description: "Direct permanent residency through employer sponsorship",
    },
    {
      name: "Skilled Independent (Subclass 189)",
      slug: "189",
      description: "Points-tested permanent visa without employer or state sponsorship",
    },
    {
      name: "State Nominated (Subclass 190)",
      slug: "190",
      description: "State-sponsored permanent residency with additional points",
    },
    {
      name: "Regional Skilled (Subclass 491)",
      slug: "491",
      description: "Provisional visa for regional Australia with PR pathway",
    },
    {
      name: "Regional Employer Sponsored (Subclass 494)",
      slug: "494",
      description: "Employer-sponsored provisional visa for regional areas",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/visa-guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send guide");
      }

      setSubmitted(true);
      setTimeout(() => {
        setShowEmailModal(false);
        setSubmitted(false);
        setEmail("");
        setName("");
        setError(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-tiffany to-tiffany-dark text-white pt-32 pb-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-blair text-4xl md:text-5xl font-bold mb-6">
              Healthcare Professional Visa Guide
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Your comprehensive guide to Australian immigration pathways for medical professionals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowEmailModal(true)}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-tiffany-dark font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <FileText className="mr-2 h-5 w-5" />
                Download Free Guide
              </button>
              <Link
                href="/book-appointment"
                className="inline-flex items-center justify-center px-8 py-4 bg-tiffany-dark/50 text-white font-semibold rounded-xl shadow-lg hover:bg-tiffany-dark/70 transition-all duration-300"
              >
                Book Consultation
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/80">
              Updated: December 2025 | 8 pages | Free PDF Download
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-blair text-3xl font-bold text-center mb-12">
              What&apos;s Inside the Guide
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="text-tiffany mb-4">{feature.icon}</div>
                  <h3 className="font-blair font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Visa Types */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-12">
              <h3 className="font-blair text-2xl font-semibold mb-6">Visa Options Covered</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {visaTypes.map((visa) => (
                  <Link
                    key={visa.slug}
                    href={`/visa/${visa.slug}`}
                    className="group p-4 rounded-xl border border-gray-200 hover:border-tiffany hover:bg-tiffany/5 transition-all"
                  >
                    <h4 className="font-semibold text-gray-900 group-hover:text-tiffany-dark flex items-center">
                      <CheckCircle className="h-5 w-5 text-tiffany mr-2 flex-shrink-0" />
                      {visa.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 ml-7">{visa.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Content Preview */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="font-blair text-2xl font-semibold mb-6">Guide Contents</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Professional Categories
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-tiffany rounded-full mr-3" />
                      Medical Practitioners & Specialists
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-tiffany rounded-full mr-3" />
                      Registered Nurses & Midwives
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-tiffany rounded-full mr-3" />
                      Allied Health Professionals
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-tiffany rounded-full mr-3" />
                      Dental Practitioners
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-tiffany rounded-full mr-3" />
                      Pharmacists
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-tiffany rounded-full mr-3" />
                      Mental Health Professionals
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Additional Resources Included
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-tiffany rounded-full mr-3" />
                      Skills Assessment Guide
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-tiffany rounded-full mr-3" />
                      Points Calculator
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-tiffany rounded-full mr-3" />
                      Document Checklist
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-tiffany rounded-full mr-3" />
                      Processing Timelines
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-tiffany rounded-full mr-3" />
                      Cost Breakdown
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-tiffany rounded-full mr-3" />
                      Next Steps Action Plan
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Points Calculator Section */}
            <div className="mt-12">
              <h2 className="font-blair text-3xl font-bold text-center mb-4">
                Check Your Eligibility
              </h2>
              <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                Use our points calculator to estimate your eligibility for points-tested skilled visas.
                This tool helps you understand where you stand before starting your application.
              </p>
              <div className="max-w-2xl mx-auto">
                <VisaPointsCalculator />
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center mt-12">
              <h3 className="font-blair text-2xl font-semibold mb-4">
                Ready to Start Your Australian Healthcare Career?
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Download our comprehensive guide and take the first step towards your immigration
                journey. Our expert team at Hamilton Bailey is here to support you every step of
                the way.
              </p>
              <button
                onClick={() => setShowEmailModal(true)}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-tiffany to-tiffany-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <FileText className="mr-2 h-5 w-5" />
                Get Your Free Guide Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-blair text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600">
                  Your guide has been sent to your email. Check your inbox shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-tiffany/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-tiffany" />
                  </div>
                  <h3 className="font-blair text-xl font-bold text-gray-900 mb-2">
                    Download Your Free Guide
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Enter your details below and we&apos;ll send the guide directly to your inbox.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Dr. John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="john@example.com"
                    />
                  </div>
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Me the Guide"
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    By submitting, you agree to receive emails from Hamilton Bailey. You can
                    unsubscribe at any time.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
