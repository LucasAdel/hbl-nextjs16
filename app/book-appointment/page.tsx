"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  Check,
  AlertCircle,
  MapPin,
  Video,
  Zap,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  X,
  Globe,
  Briefcase,
  CreditCard,
  Tag,
  Shield,
} from "lucide-react";

interface ConsultationType {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  bestFor: string[];
  popular?: boolean;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

const consultationTypes: ConsultationType[] = [
  {
    id: "initial",
    name: "Initial Consultation",
    price: 350,
    duration: "30 minutes",
    description: "Comprehensive assessment of your legal needs with actionable next steps",
    features: [
      "Full legal needs assessment",
      "Risk analysis & mitigation strategies",
      "Clear action plan provided",
      "Follow-up email summary",
    ],
    bestFor: ["New practice setup", "First-time legal issues", "General legal health check"],
    popular: true,
  },
  {
    id: "urgent",
    name: "Urgent Legal Advice",
    price: 550,
    duration: "30 minutes",
    description: "Priority consultation for time-sensitive matters requiring immediate attention",
    features: [
      "Same-day or next-day availability",
      "Immediate action items",
      "Crisis management support",
      "Direct lawyer mobile access",
    ],
    bestFor: ["Regulatory investigations", "Employment disputes", "Urgent compliance issues"],
  },
  {
    id: "followup",
    name: "Follow-up Consultation",
    price: 150,
    duration: "15 minutes",
    description: "Quick check-in for existing clients on ongoing matters",
    features: [
      "Progress review",
      "Quick clarifications",
      "Document updates",
      "Next steps planning",
    ],
    bestFor: ["Existing clients only", "Quick questions", "Status updates"],
  },
  {
    id: "document-review",
    name: "Document Review Session",
    price: 550,
    duration: "60 minutes",
    description: "Detailed review of contracts, agreements, or legal documents",
    features: [
      "Line-by-line document review",
      "Risk identification",
      "Negotiation strategies",
      "Marked-up document returned",
    ],
    bestFor: ["Employment contracts", "Partnership agreements", "Property leases"],
  },
  {
    id: "strategy",
    name: "Strategy Planning Session",
    price: 750,
    duration: "90 minutes",
    description: "Comprehensive planning for complex legal matters or business structuring",
    features: [
      "Deep-dive analysis",
      "Multi-scenario planning",
      "Team consultation available",
      "Detailed strategy document",
    ],
    bestFor: ["Practice acquisitions", "Complex restructuring", "Multi-party negotiations"],
  },
];

const practiceTypes = [
  "General Practice",
  "Specialist Practice",
  "Allied Health",
  "Dental Practice",
  "Veterinary Practice",
  "Psychology/Counselling",
  "Medical Imaging",
  "Pathology",
  "Pharmacy",
  "Other Healthcare",
];

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
];

export default function BookAppointmentPage() {
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"select" | "details" | "payment">("select");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    practiceType: "",
    practiceWebsite: "",
    message: "",
  });

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = useMemo(
    () => getDaysInMonth(currentMonth),
    [currentMonth]
  );

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();
    // Disable weekends (0 = Sunday, 6 = Saturday) and past dates
    return dayOfWeek === 0 || dayOfWeek === 6 || date < today;
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const handleDateSelect = (day: number) => {
    if (isDateDisabled(day)) return;
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-AU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // File upload handlers
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/jpeg",
      "image/png",
    ];

    const newFiles: UploadedFile[] = [];

    Array.from(files).forEach((file) => {
      if (uploadedFiles.length + newFiles.length >= maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds 10MB limit`);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        setError(`File type not allowed: ${file.name}`);
        return;
      }
      newFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      });
    });

    if (newFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setError("");
    }
  }, [uploadedFiles.length]);

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Coupon handling - no active codes by default
  const applyCoupon = () => {
    // No promo codes active - add codes via database/admin when needed
    const validCoupons: Record<string, number> = {};

    const code = couponCode.toUpperCase().trim();
    if (validCoupons[code]) {
      setAppliedCoupon({ code, discount: validCoupons[code] });
      setError("");
    } else {
      setError("Invalid coupon code");
      setAppliedCoupon(null);
    }
  };

  const calculateTotal = () => {
    if (!selectedConsultation) return { subtotal: 0, discount: 0, gst: 0, total: 0 };

    const subtotal = selectedConsultation.price;
    const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
    const afterDiscount = subtotal - discountAmount;
    const gst = afterDiscount * 0.1;
    const total = afterDiscount + gst;

    return { subtotal, discount: discountAmount, gst, total };
  };

  const handleSelectConsultation = (consultation: ConsultationType) => {
    setSelectedConsultation(consultation);
    setStep("details");
  };

  const handleProceedToPayment = () => {
    if (!formData.name || !formData.email || !selectedDate || !selectedTime) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    setStep("payment");
  };

  const handleStripePayment = async () => {
    if (!selectedConsultation || !selectedDate) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Upload files first if any
      let fileUrls: string[] = [];
      if (uploadedFiles.length > 0) {
        const formDataUpload = new FormData();
        uploadedFiles.forEach((file) => {
          formDataUpload.append("files", file.file);
        });
        formDataUpload.append("clientEmail", formData.email);
        formDataUpload.append("clientName", formData.name);
        formDataUpload.append("consultationType", selectedConsultation.name);

        const uploadResponse = await fetch("/api/upload-documents", {
          method: "POST",
          body: formDataUpload,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          fileUrls = uploadData.fileUrls || [];
        }
      }

      // Create booking
      const bookingResponse = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          date: selectedDate.toISOString().split("T")[0],
          time: selectedTime,
          message: formData.message,
          consultationType: selectedConsultation.name,
          practiceType: formData.practiceType,
          practiceWebsite: formData.practiceWebsite,
          uploadedFiles: fileUrls,
        }),
      });

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(bookingData.error || "Failed to create booking");
      }

      // Create Stripe checkout session
      const { total } = calculateTotal();
      const stripeResponse = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "consultation",
          consultationType: selectedConsultation.id,
          consultationName: selectedConsultation.name,
          price: total,
          customerEmail: formData.email,
          customerName: formData.name,
          bookingId: bookingData.booking?.id,
          date: selectedDate.toISOString().split("T")[0],
          time: selectedTime,
          couponCode: appliedCoupon?.code,
        }),
      });

      const stripeData = await stripeResponse.json();

      if (stripeData.url) {
        window.location.href = stripeData.url;
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
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
                Booking Confirmed!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for your booking. You will receive a confirmation email shortly with
                details for your {selectedConsultation?.name}.
              </p>
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-gray-800 mb-3">Booking Details</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Consultation:</strong> {selectedConsultation?.name}</p>
                  <p><strong>Name:</strong> {formData.name}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Date:</strong> {selectedDate && formatDate(selectedDate)}</p>
                  <p><strong>Time:</strong> {selectedTime}</p>
                </div>
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

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 pt-32 pb-12">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl bg-tiffany/5" />
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full mb-4 bg-tiffany/10 text-xs">
              <span className="font-montserrat font-semibold text-tiffany">
                Over 500+ consultations completed this year
              </span>
            </div>
            <h1 className="font-blair text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Book a Legal Consultation
            </h1>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
              <Zap className="h-4 w-4 text-tiffany" />
              <span className="font-semibold">Smart Scheduling Engine</span>
              <span>- Intelligent Appointment Management</span>
            </div>
            <p className="font-montserrat text-lg text-text-secondary max-w-2xl mx-auto">
              Get expert legal advice from specialists in medical practice law. Choose the
              consultation type that best fits your needs.
            </p>
          </div>

          {/* Stats Row */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-tiffany-dark">98%</div>
              <div className="text-sm text-gray-600">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-tiffany-dark">24h</div>
              <div className="text-sm text-gray-600">Average Response</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-tiffany-dark">14+</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-tiffany-dark">500+</div>
              <div className="text-sm text-gray-600">Medical Clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          {error && (
            <div className="max-w-4xl mx-auto mb-6">
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {step === "select" && (
            <>
              {/* Consultation Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {consultationTypes.map((consultation) => (
                  <div
                    key={consultation.id}
                    className={`relative bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-lg ${
                      consultation.popular
                        ? "border-tiffany shadow-md"
                        : "border-gray-200 hover:border-tiffany/50"
                    }`}
                  >
                    {consultation.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-tiffany text-white text-xs font-semibold px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-tiffany-dark">
                        ${consultation.price}
                      </div>
                      <div className="text-sm text-gray-500">plus GST</div>
                    </div>

                    <h3 className="font-blair text-xl text-center mb-2">{consultation.name}</h3>
                    <p className="text-gray-600 text-sm text-center mb-4">
                      {consultation.description}
                    </p>

                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                      <Clock className="h-4 w-4" />
                      <span>{consultation.duration}</span>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {consultation.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <Check className="h-4 w-4 text-tiffany mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mb-6">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Best for:
                      </div>
                      <ul className="space-y-1">
                        {consultation.bestFor.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-600">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectConsultation(consultation)}
                      className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                        consultation.popular
                          ? "bg-tiffany text-white hover:bg-tiffany-dark"
                          : "bg-gray-100 text-gray-800 hover:bg-tiffany hover:text-white"
                      }`}
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>

              {/* Info Cards */}
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <MapPin className="h-5 w-5 text-tiffany-dark mr-2" />
                    <h4 className="font-semibold">Office Location</h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    147 Pirie Street<br />
                    Adelaide, SA 5000
                  </p>
                  <a href="#" className="text-tiffany text-sm font-medium hover:underline mt-2 inline-block">
                    Get directions →
                  </a>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <Video className="h-5 w-5 text-tiffany-dark mr-2" />
                    <h4 className="font-semibold">Virtual Options</h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Can&apos;t make it to the office? We offer secure video consultations via our
                    encrypted platform for your convenience.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <Phone className="h-5 w-5 text-tiffany-dark mr-2" />
                    <h4 className="font-semibold">Need Help?</h4>
                  </div>
                  <p className="text-gray-600 text-sm">Questions about booking?</p>
                  <p className="font-semibold text-tiffany-dark">Call 08 5122 6500</p>
                  <p className="text-xs text-gray-500">Mon-Fri, 9am-5pm ACST</p>
                </div>
              </div>
            </>
          )}

          {step === "details" && selectedConsultation && (
            <div className="max-w-6xl mx-auto">
              <button
                onClick={() => setStep("select")}
                className="text-tiffany hover:underline mb-6 inline-flex items-center"
              >
                ← Back to consultation types
              </button>

              <div className="bg-tiffany/10 rounded-xl p-4 mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-blair text-xl">{selectedConsultation.name}</h3>
                    <p className="text-gray-600">{selectedConsultation.duration}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-tiffany-dark">
                      ${selectedConsultation.price}
                    </div>
                    <div className="text-sm text-gray-500">plus GST</div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Calendar & Time Slots */}
                <div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-blair mb-2">Available Time Slots</h2>
                    <p className="text-gray-600 text-sm mb-6">
                      Select your preferred date and time for your {selectedConsultation.name.toLowerCase()}
                    </p>

                    {/* Calendar Header */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Date
                      </label>
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => navigateMonth("prev")}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <h3 className="font-semibold text-lg">
                          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <button
                          onClick={() => navigateMonth("next")}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map((day) => (
                          <div
                            key={day}
                            className="text-center text-xs font-medium text-gray-500 py-2"
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                        {/* Empty cells for days before the month starts */}
                        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                          <div key={`empty-${index}`} className="aspect-square min-h-[40px] sm:min-h-[44px]" />
                        ))}

                        {/* Days of the month */}
                        {Array.from({ length: daysInMonth }).map((_, index) => {
                          const day = index + 1;
                          const disabled = isDateDisabled(day);
                          const selected = isSelectedDate(day);

                          return (
                            <button
                              key={day}
                              onClick={() => handleDateSelect(day)}
                              disabled={disabled}
                              className={`aspect-square min-h-[40px] sm:min-h-[44px] flex items-center justify-center text-sm rounded-lg transition-all ${
                                selected
                                  ? "bg-tiffany text-white font-semibold shadow-md"
                                  : disabled
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "hover:bg-tiffany/10 active:bg-tiffany/20 text-gray-700"
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Available Times
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => selectedDate && setSelectedTime(time)}
                            disabled={!selectedDate}
                            className={`px-3 py-3.5 sm:px-4 sm:py-3 border rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                              selectedTime === time
                                ? "bg-tiffany text-white border-tiffany shadow-md"
                                : !selectedDate
                                ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                                : "border-gray-300 hover:border-tiffany hover:bg-tiffany/5 text-gray-700 active:bg-tiffany/10"
                            }`}
                          >
                            <span>{time}</span>
                          </button>
                        ))}
                      </div>
                      {!selectedDate && (
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          Please select a date first to view available times
                        </p>
                      )}
                    </div>

                    {selectedDate && selectedTime && (
                      <div className="mt-4 p-3 bg-tiffany/10 rounded-lg">
                        <p className="text-sm text-tiffany-dark">
                          <strong>Selected:</strong> {formatDate(selectedDate)} at {selectedTime}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Form */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-blair mb-6">Your Details</h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="inline h-4 w-4 mr-2" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Dr. Your Name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="inline h-4 w-4 mr-2" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your.email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="inline h-4 w-4 mr-2" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+61 4XX XXX XXX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Briefcase className="inline h-4 w-4 mr-2" />
                          Practice Type
                        </label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                          value={formData.practiceType}
                          onChange={(e) => setFormData({ ...formData, practiceType: e.target.value })}
                        >
                          <option value="">Select Practice Type</option>
                          {practiceTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Globe className="inline h-4 w-4 mr-2" />
                          Practice Website *
                        </label>
                        <input
                          type="url"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                          value={formData.practiceWebsite}
                          onChange={(e) => setFormData({ ...formData, practiceWebsite: e.target.value })}
                          placeholder="https://yourpractice.com.au"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Please add your practice website for our review
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MessageSquare className="inline h-4 w-4 mr-2" />
                          Brief Description of Legal Matter
                        </label>
                        <textarea
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Please provide a brief overview of your legal needs... i.e. What are your concerns and/or stress points regarding your business"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Document Upload Section */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-tiffany" />
                      Upload Documents
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload an example of your current contract/agreement used between your Business and Medical Practitioners
                    </p>

                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                        isDragOver
                          ? "border-tiffany bg-tiffany/5"
                          : "border-gray-300 hover:border-tiffany/50"
                      }`}
                    >
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">
                        <label className="text-tiffany hover:underline cursor-pointer font-medium">
                          Click to upload
                          <input
                            type="file"
                            className="hidden"
                            multiple
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e.target.files)}
                          />
                        </label>
                        {" "}or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        .pdf, .doc, .docx, .txt, .jpg, .png (max 10MB per file)
                      </p>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-tiffany mr-3" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <X className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>IMPORTANT:</strong> Upload any relevant documents for your consultation.
                        This might include contracts, medical practice agreements, or other legal documents
                        you&apos;d like reviewed. Max 5 files, 10MB each.
                      </p>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-tiffany" />
                      Payment & Confirmation
                    </h3>

                    <div className="bg-tiffany/10 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-tiffany-dark">{selectedConsultation.name}</h4>
                          <p className="text-sm text-gray-600">Duration: {selectedConsultation.duration} • Secure payment via Stripe</p>
                        </div>
                        <div className="text-xl font-bold text-tiffany-dark">
                          ${selectedConsultation.price} <span className="text-sm font-normal">plus GST</span>
                        </div>
                      </div>
                    </div>

                    {/* Coupon Code */}
                    <div className="flex gap-2 mb-4">
                      <div className="flex-1 relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent text-sm"
                        />
                      </div>
                      <button
                        onClick={applyCoupon}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                      >
                        Apply
                      </button>
                    </div>

                    {appliedCoupon && (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm text-green-700">
                            Coupon <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.discount}% off)
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCouponCode("");
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={handleProceedToPayment}
                      disabled={!selectedDate || !selectedTime || !formData.name || !formData.email || !formData.phone}
                      className="w-full bg-tiffany text-white py-4 rounded-xl font-semibold hover:bg-tiffany-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                      Confirm Booking & Pay ${calculateTotal().total.toFixed(2)}
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center">
                      <Shield className="h-4 w-4 mr-1" />
                      Secure payment processing • Cancellation available up to 24 hours before appointment
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "payment" && selectedConsultation && (
            <div className="max-w-xl mx-auto">
              <button
                onClick={() => setStep("details")}
                className="text-tiffany hover:underline mb-6 inline-flex items-center"
              >
                ← Back to details
              </button>

              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
                <h2 className="font-blair text-2xl text-center mb-6">Complete Payment</h2>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold mb-4">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultation</span>
                      <span>{selectedConsultation.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date</span>
                      <span>{selectedDate && formatDate(selectedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time</span>
                      <span>{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name</span>
                      <span>{formData.name}</span>
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Documents</span>
                        <span>{uploadedFiles.length} file(s) attached</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span>${calculateTotal().subtotal.toFixed(2)}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({appliedCoupon.discount}%)</span>
                          <span>-${calculateTotal().discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">GST (10%)</span>
                        <span>${calculateTotal().gst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Total</span>
                        <span>${calculateTotal().total.toFixed(2)} AUD</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStripePayment}
                  disabled={isSubmitting}
                  className="w-full bg-tiffany text-white py-4 rounded-xl font-semibold hover:bg-tiffany-dark transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                      Processing...
                    </span>
                  ) : (
                    `Pay $${calculateTotal().total.toFixed(2)} AUD`
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span>Secured by Stripe</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-8 bg-gray-50 border-t">
        <div className="container-custom">
          <p className="text-center text-gray-600 text-sm">
            Trusted by leading medical practitioners across Australia
          </p>
        </div>
      </section>
    </div>
  );
}
