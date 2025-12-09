"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote, Star, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  rating: number;
  image?: string;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showDots?: boolean;
  className?: string;
}

export function TestimonialsCarousel({
  testimonials,
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showDots = true,
  className = "",
}: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const goTo = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(next, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPlaying, next, autoPlayInterval]);

  const current = testimonials[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Testimonial Card */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12"
          >
            {/* Quote Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-tiffany/10 rounded-full flex items-center justify-center">
                <Quote className="h-7 w-7 text-tiffany" />
              </div>
            </div>

            {/* Content */}
            <blockquote className="text-center mb-8">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed italic">
                "{current.content}"
              </p>
            </blockquote>

            {/* Rating */}
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < current.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Author */}
            <div className="flex flex-col items-center">
              {current.image && (
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden mb-4">
                  <img
                    src={current.image}
                    alt={current.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="text-center">
                <p className="font-semibold text-gray-900">{current.name}</p>
                <p className="text-sm text-gray-600">
                  {current.role}
                  {current.company && ` • ${current.company}`}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      {showControls && testimonials.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center hover:bg-tiffany/20 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 text-tiffany" />
            ) : (
              <Play className="h-4 w-4 text-tiffany ml-0.5" />
            )}
          </button>

          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      )}

      {/* Dots */}
      {showDots && testimonials.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === currentIndex ? "bg-tiffany" : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Grid layout for multiple testimonials
interface TestimonialsGridProps {
  testimonials: Testimonial[];
  columns?: 1 | 2 | 3;
  className?: string;
}

export function TestimonialsGrid({
  testimonials,
  columns = 3,
  className = "",
}: TestimonialsGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {testimonials.map((testimonial) => (
        <div
          key={testimonial.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
        >
          {/* Rating */}
          <div className="flex gap-0.5 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < testimonial.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <p className="text-gray-700 mb-6 line-clamp-4">"{testimonial.content}"</p>

          {/* Author */}
          <div className="flex items-center gap-3">
            {testimonial.image ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-tiffany">
                  {testimonial.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 text-sm">{testimonial.name}</p>
              <p className="text-xs text-gray-500">{testimonial.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Sample testimonials data
export const sampleTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Dr. Sarah Mitchell",
    role: "General Practitioner",
    company: "Adelaide Medical Centre",
    content:
      "Hamilton Bailey Law Firm provided exceptional guidance during our practice acquisition. Their understanding of healthcare-specific regulations made the entire process seamless. I couldn't have asked for better legal support.",
    rating: 5,
  },
  {
    id: "2",
    name: "Dr. James Chen",
    role: "Specialist Physician",
    company: "Sydney Medical Group",
    content:
      "The team's expertise in medical contracts is unparalleled. They helped us navigate complex employment agreements and AHPRA compliance matters with professionalism and efficiency.",
    rating: 5,
  },
  {
    id: "3",
    name: "Dr. Emily Thompson",
    role: "Practice Owner",
    company: "Brisbane Family Practice",
    content:
      "Outstanding service from start to finish. The tenant doctor agreement they prepared was comprehensive and protected our interests perfectly. Highly recommend their services.",
    rating: 5,
  },
  {
    id: "4",
    name: "Dr. Michael Roberts",
    role: "Surgeon",
    company: "Melbourne Surgical Associates",
    content:
      "Professional, knowledgeable, and responsive. Hamilton Bailey understood our unique needs as a surgical practice and delivered tailored legal solutions that exceeded our expectations.",
    rating: 5,
  },
  {
    id: "5",
    name: "Dr. Lisa Wang",
    role: "Dermatologist",
    company: "Perth Skin Clinic",
    content:
      "Their expertise in healthcare law is evident in every interaction. The commercial lease negotiation they handled saved our practice significant costs and stress.",
    rating: 4,
  },
];
