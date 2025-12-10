/**
 * Bailey AI - Model Configuration System
 *
 * Supports switching between AI models:
 * - OpenAI GPT-4o mini (default)
 * - Anthropic Claude
 * - Google Gemini
 * - Knowledge Base Only (no AI model)
 */

export type AIModelProvider = "openai" | "anthropic" | "google" | "none";

export interface AIModelConfig {
  provider: AIModelProvider;
  model: string;
  displayName: string;
  description: string;
  maxTokens: number;
  temperature: number;
  costPer1kTokens: number; // In USD
  supportsStreaming: boolean;
}

export const AI_MODELS: Record<string, AIModelConfig> = {
  // OpenAI Models
  "gpt-4o-mini": {
    provider: "openai",
    model: "gpt-4o-mini",
    displayName: "GPT-4o Mini",
    description: "Fast, cost-effective model from OpenAI. Best for simple queries.",
    maxTokens: 500,
    temperature: 0.7,
    costPer1kTokens: 0.00015,
    supportsStreaming: true,
  },
  "gpt-4o": {
    provider: "openai",
    model: "gpt-4o",
    displayName: "GPT-4o",
    description: "Most capable OpenAI model. Better reasoning and accuracy.",
    maxTokens: 1000,
    temperature: 0.7,
    costPer1kTokens: 0.005,
    supportsStreaming: true,
  },

  // Anthropic Models
  "claude-3-haiku": {
    provider: "anthropic",
    model: "claude-3-haiku-20240307",
    displayName: "Claude 3 Haiku",
    description: "Fast and efficient Anthropic model. Great balance of speed and quality.",
    maxTokens: 500,
    temperature: 0.7,
    costPer1kTokens: 0.00025,
    supportsStreaming: true,
  },
  "claude-3-sonnet": {
    provider: "anthropic",
    model: "claude-3-sonnet-20240229",
    displayName: "Claude 3 Sonnet",
    description: "Balanced Anthropic model. Better for nuanced responses.",
    maxTokens: 1000,
    temperature: 0.7,
    costPer1kTokens: 0.003,
    supportsStreaming: true,
  },

  // Google Models
  "gemini-1.5-flash": {
    provider: "google",
    model: "gemini-1.5-flash",
    displayName: "Gemini 1.5 Flash",
    description: "Fast Google model. Good for quick responses.",
    maxTokens: 500,
    temperature: 0.7,
    costPer1kTokens: 0.000075,
    supportsStreaming: true,
  },
  "gemini-1.5-pro": {
    provider: "google",
    model: "gemini-1.5-pro",
    displayName: "Gemini 1.5 Pro",
    description: "Most capable Google model. Excellent for complex queries.",
    maxTokens: 1000,
    temperature: 0.7,
    costPer1kTokens: 0.00125,
    supportsStreaming: true,
  },

  // No AI - Knowledge Base Only
  "none": {
    provider: "none",
    model: "knowledge-base",
    displayName: "Knowledge Base Only",
    description: "Use only the internal knowledge base. No AI model required. Zero API costs.",
    maxTokens: 0,
    temperature: 0,
    costPer1kTokens: 0,
    supportsStreaming: false,
  },
};

// Default model when nothing is configured
export const DEFAULT_MODEL = "none";

// Get all available models grouped by provider
export function getModelsByProvider(): Record<AIModelProvider, AIModelConfig[]> {
  const grouped: Record<AIModelProvider, AIModelConfig[]> = {
    none: [],
    openai: [],
    anthropic: [],
    google: [],
  };

  Object.values(AI_MODELS).forEach((config) => {
    grouped[config.provider].push(config);
  });

  return grouped;
}

// Get model configuration by key
export function getModelConfig(modelKey: string): AIModelConfig | null {
  return AI_MODELS[modelKey] || null;
}

// Check if API key is configured for a provider
export function isProviderConfigured(provider: AIModelProvider): boolean {
  switch (provider) {
    case "openai":
      return !!process.env.OPENAI_API_KEY;
    case "anthropic":
      return !!process.env.ANTHROPIC_API_KEY;
    case "google":
      return !!process.env.GOOGLE_AI_API_KEY;
    case "none":
      return true; // Knowledge base is always available
    default:
      return false;
  }
}

// Get available models (only those with configured API keys)
export function getAvailableModels(): AIModelConfig[] {
  return Object.values(AI_MODELS).filter((config) =>
    isProviderConfigured(config.provider)
  );
}

// Model selection helper
export interface ModelSelection {
  modelKey: string;
  config: AIModelConfig;
  isAvailable: boolean;
  reason?: string;
}

export function validateModelSelection(modelKey: string): ModelSelection {
  const config = getModelConfig(modelKey);

  if (!config) {
    return {
      modelKey: DEFAULT_MODEL,
      config: AI_MODELS[DEFAULT_MODEL],
      isAvailable: true,
      reason: `Model "${modelKey}" not found. Using knowledge base only.`,
    };
  }

  if (!isProviderConfigured(config.provider)) {
    return {
      modelKey: DEFAULT_MODEL,
      config: AI_MODELS[DEFAULT_MODEL],
      isAvailable: false,
      reason: `API key not configured for ${config.provider}. Using knowledge base only.`,
    };
  }

  return {
    modelKey,
    config,
    isAvailable: true,
  };
}
