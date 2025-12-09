"use client";

import React, { useState } from "react";
import {
  User,
  FileText,
  Briefcase,
  Upload,
  Shield,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Check,
} from "lucide-react";

interface ClientData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postcode: string;

  // Professional Information
  occupation: string;
  employer: string;
  businessName: string;
  abn: string;
  practiceType: string;

  // Legal Matter Information
  matterType: string;
  matterDescription: string;
  urgency: string;
  preferredContactMethod: string;

  // Additional Information
  referralSource: string;
  previousLegalIssues: boolean;
  previousLegalDetails: string;
  documentsToReview: boolean;

  // Consent
  privacyConsent: boolean;
  termsAccepted: boolean;
  marketingConsent: boolean;
}

const matterTypes = [
  "Medical Practice Setup",
  "AHPRA Investigation",
  "Employment Contract",
  "Commercial Lease",
  "Partnership Agreement",
  "Business Sale/Purchase",
  "Regulatory Compliance",
  "Property Transaction",
  "Intellectual Property",
  "Litigation",
  "Other",
];

const urgencyLevels = [
  { value: "immediate", label: "Immediate (Within 48 hours)" },
  { value: "week", label: "Within a week" },
  { value: "month", label: "Within a month" },
  { value: "planning", label: "Planning stage" },
];

export default function ClientIntakePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [clientData, setClientData] = useState<ClientData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "SA",
    postcode: "",
    occupation: "",
    employer: "",
    businessName: "",
    abn: "",
    practiceType: "",
    matterType: "",
    matterDescription: "",
    urgency: "month",
    preferredContactMethod: "email",
    referralSource: "",
    previousLegalIssues: false,
    previousLegalDetails: "",
    documentsToReview: false,
    privacyConsent: false,
    termsAccepted: false,
    marketingConsent: false,
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const updateClientData = (field: keyof ClientData, value: string | boolean) => {
    setClientData((prev) => ({ ...prev, [field]: value }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateStep = (step: number): string[] => {
    const stepErrors: string[] = [];

    switch (step) {
      case 1:
        if (!clientData.firstName.trim()) stepErrors.push("First name is required");
        if (!clientData.lastName.trim()) stepErrors.push("Last name is required");
        if (!clientData.email.trim()) stepErrors.push("Email is required");
        if (!clientData.phone.trim()) stepErrors.push("Phone number is required");
        break;
      case 2:
        if (!clientData.occupation.trim()) stepErrors.push("Occupation is required");
        break;
      case 3:
        if (!clientData.matterType) stepErrors.push("Matter type is required");
        if (!clientData.matterDescription.trim())
          stepErrors.push("Matter description is required");
        break;
      case 4:
        if (!clientData.referralSource.trim())
          stepErrors.push("Please tell us how you heard about us");
        break;
      case 5:
        if (!clientData.privacyConsent) stepErrors.push("Privacy consent is required");
        if (!clientData.termsAccepted) stepErrors.push("Terms acceptance is required");
        break;
    }

    return stepErrors;
  };

  const nextStep = () => {
    const stepErrors = validateStep(currentStep);
    if (stepErrors.length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors([]);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors([]);
    }
  };

  const submitIntake = async () => {
    const finalErrors = validateStep(5);
    if (finalErrors.length > 0) {
      setErrors(finalErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: clientData.firstName,
          lastName: clientData.lastName,
          email: clientData.email,
          phone: clientData.phone,
          occupation: clientData.occupation,
          businessName: clientData.businessName,
          practiceType: clientData.practiceType,
          matterType: clientData.matterType,
          matterDescription: clientData.matterDescription,
          preferredContactMethod: clientData.preferredContactMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit intake form");
      }

      setSubmitted(true);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "An error occurred. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <section className="flex-grow flex items-center justify-center py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container-custom">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-20 h-20 bg-tiffany/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-tiffany-dark" />
              </div>
              <h1 className="font-blair text-3xl md:text-4xl text-text-primary mb-4">
                Intake Form Submitted!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for completing our client intake form. We&apos;ll contact you within 24
                hours to schedule your consultation.
              </p>
              <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-semibold text-gray-800 mb-3 text-center">What Happens Next</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-tiffany text-white rounded-full flex items-center justify-center text-sm mr-3 flex-shrink-0">
                      1
                    </span>
                    <span>Our team will review your information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-tiffany text-white rounded-full flex items-center justify-center text-sm mr-3 flex-shrink-0">
                      2
                    </span>
                    <span>We&apos;ll conduct a conflict check</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-tiffany text-white rounded-full flex items-center justify-center text-sm mr-3 flex-shrink-0">
                      3
                    </span>
                    <span>A solicitor will contact you to schedule a consultation</span>
                  </li>
                </ul>
              </div>
              <a
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-tiffany text-white font-semibold rounded-xl hover:bg-tiffany-dark transition-colors"
              >
                Return to Home
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-tiffany/20 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-tiffany-dark" />
              </div>
              <div>
                <h2 className="text-xl font-blair">Personal Information</h2>
                <p className="text-sm text-gray-500">Please provide your basic contact details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={clientData.firstName}
                    onChange={(e) => updateClientData("firstName", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={clientData.lastName}
                    onChange={(e) => updateClientData("lastName", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={clientData.email}
                    onChange={(e) => updateClientData("email", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                    placeholder="john.smith@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={clientData.phone}
                    onChange={(e) => updateClientData("phone", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                    placeholder="08 1234 5678"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  id="address"
                  type="text"
                  value={clientData.address}
                  onChange={(e) => updateClientData("address", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={clientData.city}
                    onChange={(e) => updateClientData("city", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                    placeholder="Adelaide"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    id="state"
                    value={clientData.state}
                    onChange={(e) => updateClientData("state", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                  >
                    <option value="SA">South Australia</option>
                    <option value="NSW">New South Wales</option>
                    <option value="VIC">Victoria</option>
                    <option value="QLD">Queensland</option>
                    <option value="WA">Western Australia</option>
                    <option value="TAS">Tasmania</option>
                    <option value="NT">Northern Territory</option>
                    <option value="ACT">Australian Capital Territory</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
                    Postcode
                  </label>
                  <input
                    id="postcode"
                    type="text"
                    value={clientData.postcode}
                    onChange={(e) => updateClientData("postcode", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                    placeholder="5000"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-tiffany/20 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-tiffany-dark" />
              </div>
              <div>
                <h2 className="text-xl font-blair">Professional Information</h2>
                <p className="text-sm text-gray-500">Tell us about your professional background</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation *
                </label>
                <input
                  id="occupation"
                  type="text"
                  value={clientData.occupation}
                  onChange={(e) => updateClientData("occupation", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                  placeholder="General Practitioner"
                />
              </div>

              <div>
                <label htmlFor="employer" className="block text-sm font-medium text-gray-700 mb-1">
                  Employer/Practice Name
                </label>
                <input
                  id="employer"
                  type="text"
                  value={clientData.employer}
                  onChange={(e) => updateClientData("employer", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                  placeholder="Adelaide Medical Centre"
                />
              </div>

              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name (if applicable)
                </label>
                <input
                  id="businessName"
                  type="text"
                  value={clientData.businessName}
                  onChange={(e) => updateClientData("businessName", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                  placeholder="Smith Medical Services Pty Ltd"
                />
              </div>

              <div>
                <label htmlFor="abn" className="block text-sm font-medium text-gray-700 mb-1">
                  ABN (if applicable)
                </label>
                <input
                  id="abn"
                  type="text"
                  value={clientData.abn}
                  onChange={(e) => updateClientData("abn", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                  placeholder="12 345 678 901"
                />
              </div>

              <div>
                <label htmlFor="practiceType" className="block text-sm font-medium text-gray-700 mb-1">
                  Type of Medical Practice (if applicable)
                </label>
                <select
                  id="practiceType"
                  value={clientData.practiceType}
                  onChange={(e) => updateClientData("practiceType", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                >
                  <option value="">Select practice type</option>
                  <option value="general_practice">General Practice</option>
                  <option value="specialist">Specialist Practice</option>
                  <option value="pathology">Pathology</option>
                  <option value="radiology">Radiology</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="allied_health">Allied Health</option>
                  <option value="other">Other Healthcare</option>
                  <option value="non_medical">Non-Medical</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-tiffany/20 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-tiffany-dark" />
              </div>
              <div>
                <h2 className="text-xl font-blair">Legal Matter Information</h2>
                <p className="text-sm text-gray-500">Describe the legal assistance you need</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="matterType" className="block text-sm font-medium text-gray-700 mb-1">
                  Type of Legal Matter *
                </label>
                <select
                  id="matterType"
                  value={clientData.matterType}
                  onChange={(e) => updateClientData("matterType", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                >
                  <option value="">Select matter type</option>
                  {matterTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="matterDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description of Legal Matter *
                </label>
                <textarea
                  id="matterDescription"
                  value={clientData.matterDescription}
                  onChange={(e) => updateClientData("matterDescription", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                  placeholder="Please provide a detailed description of your legal matter..."
                />
              </div>

              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
                  Urgency Level
                </label>
                <select
                  id="urgency"
                  value={clientData.urgency}
                  onChange={(e) => updateClientData("urgency", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                >
                  {urgencyLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Contact Method
                </label>
                <select
                  id="preferredContactMethod"
                  value={clientData.preferredContactMethod}
                  onChange={(e) => updateClientData("preferredContactMethod", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-tiffany/20 rounded-lg flex items-center justify-center">
                <Upload className="h-5 w-5 text-tiffany-dark" />
              </div>
              <div>
                <h2 className="text-xl font-blair">Additional Information</h2>
                <p className="text-sm text-gray-500">
                  Provide any additional context
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="referralSource" className="block text-sm font-medium text-gray-700 mb-1">
                  How did you hear about us? *
                </label>
                <input
                  id="referralSource"
                  type="text"
                  value={clientData.referralSource}
                  onChange={(e) => updateClientData("referralSource", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                  placeholder="Google search, referral from Dr. Smith, etc."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    id="previousLegalIssues"
                    type="checkbox"
                    checked={clientData.previousLegalIssues}
                    onChange={(e) => updateClientData("previousLegalIssues", e.target.checked)}
                    className="h-4 w-4 text-tiffany focus:ring-tiffany border-gray-300 rounded"
                  />
                  <label htmlFor="previousLegalIssues" className="text-sm text-gray-700">
                    Have you had previous legal issues related to this matter?
                  </label>
                </div>

                {clientData.previousLegalIssues && (
                  <textarea
                    value={clientData.previousLegalDetails}
                    onChange={(e) => updateClientData("previousLegalDetails", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                    placeholder="Please provide details about previous legal issues..."
                  />
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="documentsToReview"
                  type="checkbox"
                  checked={clientData.documentsToReview}
                  onChange={(e) => updateClientData("documentsToReview", e.target.checked)}
                  className="h-4 w-4 text-tiffany focus:ring-tiffany border-gray-300 rounded"
                />
                <label htmlFor="documentsToReview" className="text-sm text-gray-700">
                  I have documents related to this matter to provide
                </label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-tiffany/20 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-tiffany-dark" />
              </div>
              <div>
                <h2 className="text-xl font-blair">Consent & Agreement</h2>
                <p className="text-sm text-gray-500">
                  Please review and accept our terms and privacy policy
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <input
                  id="privacyConsent"
                  type="checkbox"
                  checked={clientData.privacyConsent}
                  onChange={(e) => updateClientData("privacyConsent", e.target.checked)}
                  className="h-4 w-4 text-tiffany focus:ring-tiffany border-gray-300 rounded mt-1"
                />
                <label htmlFor="privacyConsent" className="text-sm text-gray-700 leading-relaxed">
                  I consent to Hamilton Bailey Law Firm collecting, using, and storing my personal
                  information for the purpose of providing legal services. I understand my
                  information will be kept confidential and used only for legitimate legal
                  purposes. *
                </label>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  id="termsAccepted"
                  type="checkbox"
                  checked={clientData.termsAccepted}
                  onChange={(e) => updateClientData("termsAccepted", e.target.checked)}
                  className="h-4 w-4 text-tiffany focus:ring-tiffany border-gray-300 rounded mt-1"
                />
                <label htmlFor="termsAccepted" className="text-sm text-gray-700 leading-relaxed">
                  I acknowledge that completion of this form does not create a solicitor-client
                  relationship. A formal retainer agreement will be required before legal services
                  commence. *
                </label>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  id="marketingConsent"
                  type="checkbox"
                  checked={clientData.marketingConsent}
                  onChange={(e) => updateClientData("marketingConsent", e.target.checked)}
                  className="h-4 w-4 text-tiffany focus:ring-tiffany border-gray-300 rounded mt-1"
                />
                <label htmlFor="marketingConsent" className="text-sm text-gray-700 leading-relaxed">
                  I consent to receive marketing communications and legal updates from Hamilton
                  Bailey Law Firm. I can unsubscribe at any time.
                </label>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mt-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    By submitting this form, you authorise us to contact you regarding your legal
                    matter. We will respond within 24 hours to schedule your initial consultation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 pt-32 pb-12">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl bg-tiffany/5" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-8 bg-tiffany/10">
              <span className="font-montserrat text-sm font-semibold text-tiffany uppercase tracking-wider">
                New Client
              </span>
            </div>
            <h1 className="font-blair text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Client Intake Form
            </h1>
            <p className="font-montserrat text-lg text-text-secondary">
              Help us understand your legal needs by completing this comprehensive intake form.
              This information will ensure we can provide you with the most effective legal
              assistance.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  Step {currentStep} of {totalSteps}
                </span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-tiffany transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Error Display */}
            {errors.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-800 text-sm">
                      Please correct the following:
                    </p>
                    <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Step Content */}
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center px-6 py-3 bg-tiffany text-white rounded-lg font-medium hover:bg-tiffany-dark transition-colors"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitIntake}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-3 bg-tiffany text-white rounded-lg font-medium hover:bg-tiffany-dark transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
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
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Intake Form
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
