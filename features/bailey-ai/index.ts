/**
 * Bailey AI Feature - Main Entry Point
 *
 * This feature provides the AI chatbot functionality for Hamilton Bailey Legal.
 * It includes the chat widget, knowledge base, persistence, and calendar integration.
 */

// Components
export { AIChatWidget } from "./components";

// Library exports
export {
  // Knowledge Base
  findRelevantKnowledge,
  detectIntent,
  handleObjection,
  KNOWLEDGE_BASE,
  type KnowledgeItem,
  // Persistence Service
  chatPersistenceService,
  type ChatMessage,
  type ChatConversation,
  type UserPreferences,
  type ChatContext,
  // Calendar Service
  getAvailableSlots,
  getUpcomingAppointments,
  formatAppointmentInfo,
  getConsultationInfo,
  isWithinBusinessHours,
  getNextBusinessDay,
  CONSULTATION_TYPES,
} from "./lib";

// Types
export * from "./types";
