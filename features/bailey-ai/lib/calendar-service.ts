/**
 * Calendar Service for Bailey AI
 * Provides appointment availability and booking information
 * Integrates with Google Calendar when connected
 */

import { isCalendarConnected } from "@/lib/google-calendar";

// Business hours configuration
const BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 17,  // 5 PM
  timezone: "Australia/Adelaide",
  daysOpen: [1, 2, 3, 4, 5], // Monday to Friday
};

// Consultation types and durations
export const CONSULTATION_TYPES = {
  "Initial Consultation": { duration: 30, description: "First-time client consultation" },
  "Urgent Legal Advice": { duration: 30, description: "Time-sensitive legal matters" },
  "Follow-up Consultation": { duration: 15, description: "Continuing discussion on existing matters" },
  "Document Review Session": { duration: 60, description: "Review of contracts or legal documents" },
  "Strategy Planning Session": { duration: 90, description: "Comprehensive planning for complex matters" },
} as const;

/**
 * Get available appointment slots
 * Returns human-readable slot descriptions
 */
export async function getAvailableSlots(): Promise<string[]> {
  try {
    // Check if Google Calendar is connected for real-time availability
    const isConnected = await isCalendarConnected();

    if (!isConnected) {
      // Return general availability information
      return [
        "Monday - Friday, 9:00 AM - 5:00 PM (Adelaide time)",
        "Initial consultations: 30 minutes",
        "Document reviews: 60 minutes",
        "Strategy sessions: 90 minutes",
        "Same-day urgent appointments may be available",
      ];
    }

    // If calendar is connected, we could fetch real slots here
    // For now, return general availability with a note about booking
    const today = new Date();
    const slots: string[] = [];

    // Generate next 5 business days
    for (let i = 1; i <= 7 && slots.length < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const dayOfWeek = date.getDay();
      if (BUSINESS_HOURS.daysOpen.includes(dayOfWeek)) {
        const dayName = date.toLocaleDateString("en-AU", { weekday: "long", month: "short", day: "numeric" });
        slots.push(`${dayName} - Morning or afternoon available`);
      }
    }

    return slots;
  } catch (error) {
    console.error("Error getting available slots:", error);
    return [
      "Please contact us directly for availability",
      "Phone: (08) 8121 5167",
      "Email: admin@hamiltonbailey.com.au",
    ];
  }
}

/**
 * Get upcoming appointments for a user (requires authentication)
 * Note: This is a placeholder - actual implementation requires user auth
 */
export async function getUpcomingAppointments(userEmail?: string): Promise<{ found: boolean; message: string }> {
  if (!userEmail) {
    return {
      found: false,
      message: "Please provide your email address to check your appointments, or contact us directly at (08) 8121 5167.",
    };
  }

  // For privacy and security, we don't expose appointment details through the chatbot
  // Users should check their confirmation email or call the office
  return {
    found: false,
    message: `For appointment details, please check the confirmation email sent to ${userEmail}, or call our office at (08) 8121 5167.`,
  };
}

/**
 * Format appointment details for display
 */
export function formatAppointmentInfo(
  type: keyof typeof CONSULTATION_TYPES,
  date: Date,
  time: string
): string {
  const consultation = CONSULTATION_TYPES[type];
  const dateStr = date.toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `**${type}**\n📅 ${dateStr}\n⏰ ${time}\n⏱️ Duration: ${consultation.duration} minutes\n\n${consultation.description}`;
}

/**
 * Get consultation type information
 */
export function getConsultationInfo(type?: string): string {
  if (type && type in CONSULTATION_TYPES) {
    const consultation = CONSULTATION_TYPES[type as keyof typeof CONSULTATION_TYPES];
    return `**${type}**\nDuration: ${consultation.duration} minutes\n${consultation.description}`;
  }

  // Return all types
  const typesList = Object.entries(CONSULTATION_TYPES)
    .map(([name, info]) => `• **${name}** (${info.duration} mins) - ${info.description}`)
    .join("\n");

  return `**Available Consultation Types:**\n\n${typesList}`;
}

/**
 * Check if a specific time is within business hours
 */
export function isWithinBusinessHours(date: Date): boolean {
  const hours = date.getHours();
  const dayOfWeek = date.getDay();

  return (
    BUSINESS_HOURS.daysOpen.includes(dayOfWeek) &&
    hours >= BUSINESS_HOURS.start &&
    hours < BUSINESS_HOURS.end
  );
}

/**
 * Get next available business day
 */
export function getNextBusinessDay(from: Date = new Date()): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + 1);

  while (!BUSINESS_HOURS.daysOpen.includes(next.getDay())) {
    next.setDate(next.getDate() + 1);
  }

  next.setHours(BUSINESS_HOURS.start, 0, 0, 0);
  return next;
}
