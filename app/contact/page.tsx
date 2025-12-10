"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, AlertCircle } from "lucide-react";
import { MapboxMap } from "@/components/contact/MapboxMap";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    service: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit contact form");
      }

      setSubmitted(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
        service: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-32 pb-16">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl bg-tiffany/5 dark:bg-tiffany/10" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-8 bg-tiffany/10 dark:bg-tiffany/20">
              <span className="font-montserrat text-sm font-semibold text-tiffany dark:text-tiffany-light uppercase tracking-wider">
                Get In Touch
              </span>
            </div>
            <h1 className="font-blair text-4xl md:text-5xl font-bold text-text-primary dark:text-white mb-6">
              Contact Our Team
            </h1>
            <p className="font-montserrat text-lg text-text-secondary dark:text-gray-300">
              We&apos;re here to assist Australian medical practitioners with their legal needs.
              Reach out to discuss how we can support your practice.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-blair mb-6 text-gray-900 dark:text-white">Get In Touch</h2>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4 mb-6 rounded-r-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {submitted ? (
                <div className="bg-tiffany/10 dark:bg-tiffany/20 border border-tiffany/20 dark:border-tiffany/30 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-tiffany/20 dark:bg-tiffany/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-tiffany-dark dark:text-tiffany-light"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-blair text-tiffany-dark dark:text-tiffany-light mb-2">Message Sent!</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Thank you for contacting Hamilton Bailey Law Firm. We&apos;ll get back to you
                    shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        First Name *
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Last Name *
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Phone
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="service"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Service of Interest
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
                    >
                      <option value="">Select a service (optional)</option>
                      <option value="Practice Setup & Structuring">Practice Setup & Structuring</option>
                      <option value="Regulatory Compliance">Regulatory Compliance (AHPRA, Medicare, Privacy)</option>
                      <option value="Property & Leasing">Property & Leasing</option>
                      <option value="Employment & HR">Employment & HR</option>
                      <option value="Dispute Resolution">Dispute Resolution</option>
                      <option value="Healthcare Visas">Healthcare Visas</option>
                      <option value="Legal Documents">Legal Document Purchase</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full flex justify-center items-center"
                    >
                      {isSubmitting ? (
                        <span className="inline-flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="inline-flex items-center">
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </span>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      By submitting this form, you agree to our privacy policy.
                    </p>
                  </div>
                </form>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-blair mb-6 text-gray-900 dark:text-white">Our Practice</h2>

              {/* Interactive Map */}
              <MapboxMap className="mb-8 h-72 rounded-xl shadow-lg" />

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-tiffany-lighter dark:bg-tiffany/20 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <MapPin className="h-5 w-5 text-tiffany-dark dark:text-tiffany-light" />
                  </div>
                  <div>
                    <h4 className="font-blair text-lg text-gray-900 dark:text-white">Address</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      147 Pirie Street
                      <br />
                      Adelaide, South Australia 5000
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-tiffany-lighter dark:bg-tiffany/20 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <Mail className="h-5 w-5 text-tiffany-dark dark:text-tiffany-light" />
                  </div>
                  <div>
                    <h4 className="font-blair text-lg text-gray-900 dark:text-white">Contact</h4>
                    <p className="text-gray-600 dark:text-gray-300">Use the contact form to send us a message</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-tiffany-lighter dark:bg-tiffany/20 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <Phone className="h-5 w-5 text-tiffany-dark dark:text-tiffany-light" />
                  </div>
                  <div>
                    <h4 className="font-blair text-lg text-gray-900 dark:text-white">Phone</h4>
                    <p className="text-gray-600 dark:text-gray-300">+61 8 5122 0056</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-tiffany-lighter dark:bg-tiffany/20 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <Clock className="h-5 w-5 text-tiffany-dark dark:text-tiffany-light" />
                  </div>
                  <div>
                    <h4 className="font-blair text-lg text-gray-900 dark:text-white">Business Hours</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Monday - Friday: 9:00 AM - 5:00 PM
                      <br />
                      Saturday & Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-blair mb-4 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Common questions about working with Hamilton Bailey Law Firm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "How quickly can you respond to urgent legal matters?",
                answer:
                  "We prioritise urgent client matters and typically respond within 48 hours. For critical issues, we offer an emergency contact option for existing clients.",
              },
              {
                question: "Do you offer consultations via video conference?",
                answer:
                  "Yes, we provide consultations via secure video conferencing for clients across Australia. In-person meetings are available at our Adelaide practice.",
              },
              {
                question: "How are your legal document purchases delivered?",
                answer:
                  "All purchased documents are delivered via secure link to your verified email address. Documents are provided in PDF formats.",
              },
              {
                question: "Do you offer ongoing legal support packages?",
                answer:
                  "Yes, we offer retainer arrangements and support packages for medical practices that need regular legal assistance and document updates.",
              },
            ].map((faq) => (
              <div key={faq.question} className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md dark:shadow-slate-900/50 border border-transparent dark:border-slate-700">
                <h3 className="text-xl font-blair mb-3 text-gray-900 dark:text-white">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
