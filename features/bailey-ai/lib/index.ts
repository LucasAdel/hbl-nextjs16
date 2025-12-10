/**
 * Bailey AI Library - Public Exports
 */

// Knowledge Base
export {
  findRelevantKnowledge,
  detectIntent,
  handleObjection,
  KNOWLEDGE_BASE,
  type KnowledgeItem,
} from "./knowledge-base";

// Persistence Service
export {
  chatPersistenceService,
  type ChatMessage,
  type ChatConversation,
  type UserPreferences,
  type ChatContext,
} from "./persistence-service";

// Calendar Service
export {
  getAvailableSlots,
  getUpcomingAppointments,
  formatAppointmentInfo,
  getConsultationInfo,
  isWithinBusinessHours,
  getNextBusinessDay,
  CONSULTATION_TYPES,
} from "./calendar-service";

// System Prompt (GPT-4o mini / Intake Assistant)
export {
  INTAKE_ASSISTANT_PROMPT,
  INTAKE_ASSISTANT_PROMPT_SHORT,
  PRACTICE_AREAS,
  CONTACT_DETAILS,
  BOOKING_LINK,
} from "./system-prompt";

// AI Model Configuration
export {
  AI_MODELS,
  DEFAULT_MODEL,
  getModelsByProvider,
  getModelConfig,
  isProviderConfigured,
  getAvailableModels,
  validateModelSelection,
  type AIModelProvider,
  type AIModelConfig,
  type ModelSelection,
} from "./ai-models";

// AI Settings Service
export {
  getBaileyAISettings,
  updateBaileyAISettings,
  getActiveModelConfig,
  clearSettingsCache,
  type BaileyAISettings,
} from "./ai-settings";

// AI Response Generator
export {
  generateResponse,
  generateStreamingResponse,
  type GeneratedResponse,
  type ResponseAction,
  type StreamChunk,
} from "./ai-response-generator";
