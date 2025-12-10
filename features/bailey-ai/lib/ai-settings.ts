/**
 * Bailey AI Settings Service
 *
 * Manages AI model configuration and settings.
 * Stores settings in Supabase for persistence.
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  AI_MODELS,
  DEFAULT_MODEL,
  getModelConfig,
  validateModelSelection,
  type AIModelConfig,
} from "./ai-models";

// Helper to get untyped table access (for tables not in generated types yet)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTable(supabase: ReturnType<typeof createServiceRoleClient>, name: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(name);
}

export interface BaileyAISettings {
  id: string;
  activeModel: string;
  enableStreaming: boolean;
  enableKnowledgeBase: boolean;
  maxResponseLength: number;
  temperature: number;
  systemPromptVersion: "full" | "short";
  enableEmergencyCheck: boolean;
  enableLegalAdviceGuard: boolean;
  enableObjectionHandling: boolean;
  enableCalendarIntegration: boolean;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_SETTINGS: Omit<BaileyAISettings, "id" | "createdAt" | "updatedAt"> = {
  activeModel: DEFAULT_MODEL, // Start with knowledge base only
  enableStreaming: true,
  enableKnowledgeBase: true,
  maxResponseLength: 500,
  temperature: 0.7,
  systemPromptVersion: "short",
  enableEmergencyCheck: true,
  enableLegalAdviceGuard: true,
  enableObjectionHandling: true,
  enableCalendarIntegration: true,
};

// In-memory cache for settings (to avoid DB calls on every request)
let settingsCache: BaileyAISettings | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 60000; // 1 minute

/**
 * Get current Bailey AI settings
 */
export async function getBaileyAISettings(): Promise<BaileyAISettings> {
  // Check cache first
  if (settingsCache && Date.now() < cacheExpiry) {
    return settingsCache;
  }

  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await getTable(supabase, "bailey_ai_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // Return defaults if no settings exist
      const defaults = {
        id: "default",
        ...DEFAULT_SETTINGS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return defaults;
    }

    // Map database columns to interface
    const settings: BaileyAISettings = {
      id: data.id,
      activeModel: data.active_model || DEFAULT_MODEL,
      enableStreaming: data.enable_streaming ?? true,
      enableKnowledgeBase: data.enable_knowledge_base ?? true,
      maxResponseLength: data.max_response_length || 500,
      temperature: data.temperature || 0.7,
      systemPromptVersion: data.system_prompt_version || "short",
      enableEmergencyCheck: data.enable_emergency_check ?? true,
      enableLegalAdviceGuard: data.enable_legal_advice_guard ?? true,
      enableObjectionHandling: data.enable_objection_handling ?? true,
      enableCalendarIntegration: data.enable_calendar_integration ?? true,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    // Update cache
    settingsCache = settings;
    cacheExpiry = Date.now() + CACHE_TTL;

    return settings;
  } catch (error) {
    console.error("Error fetching Bailey AI settings:", error);
    // Return defaults on error
    return {
      id: "default",
      ...DEFAULT_SETTINGS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Update Bailey AI settings
 */
export async function updateBaileyAISettings(
  updates: Partial<Omit<BaileyAISettings, "id" | "createdAt" | "updatedAt">>
): Promise<BaileyAISettings | null> {
  try {
    const supabase = createServiceRoleClient();

    // Check if settings exist
    const { data: existing } = await getTable(supabase, "bailey_ai_settings")
      .select("id")
      .limit(1)
      .single();

    const now = new Date().toISOString();

    // Map interface to database columns
    const dbUpdates: Record<string, unknown> = {
      updated_at: now,
    };

    if (updates.activeModel !== undefined) {
      // Validate model selection
      const validation = validateModelSelection(updates.activeModel);
      dbUpdates.active_model = validation.modelKey;
    }
    if (updates.enableStreaming !== undefined)
      dbUpdates.enable_streaming = updates.enableStreaming;
    if (updates.enableKnowledgeBase !== undefined)
      dbUpdates.enable_knowledge_base = updates.enableKnowledgeBase;
    if (updates.maxResponseLength !== undefined)
      dbUpdates.max_response_length = updates.maxResponseLength;
    if (updates.temperature !== undefined)
      dbUpdates.temperature = updates.temperature;
    if (updates.systemPromptVersion !== undefined)
      dbUpdates.system_prompt_version = updates.systemPromptVersion;
    if (updates.enableEmergencyCheck !== undefined)
      dbUpdates.enable_emergency_check = updates.enableEmergencyCheck;
    if (updates.enableLegalAdviceGuard !== undefined)
      dbUpdates.enable_legal_advice_guard = updates.enableLegalAdviceGuard;
    if (updates.enableObjectionHandling !== undefined)
      dbUpdates.enable_objection_handling = updates.enableObjectionHandling;
    if (updates.enableCalendarIntegration !== undefined)
      dbUpdates.enable_calendar_integration = updates.enableCalendarIntegration;

    if (existing) {
      // Update existing record
      const { data, error } = await getTable(supabase, "bailey_ai_settings")
        .update(dbUpdates)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      settingsCache = null;

      return getBaileyAISettings();
    } else {
      // Create new record
      const { data, error } = await getTable(supabase, "bailey_ai_settings")
        .insert({
          ...dbUpdates,
          created_at: now,
        })
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      settingsCache = null;

      return getBaileyAISettings();
    }
  } catch (error) {
    console.error("Error updating Bailey AI settings:", error);
    return null;
  }
}

/**
 * Get the currently active AI model configuration
 */
export async function getActiveModelConfig(): Promise<{
  modelKey: string;
  config: AIModelConfig;
  settings: BaileyAISettings;
}> {
  const settings = await getBaileyAISettings();
  const validation = validateModelSelection(settings.activeModel);

  return {
    modelKey: validation.modelKey,
    config: validation.config,
    settings,
  };
}

/**
 * Clear the settings cache (call after updates)
 */
export function clearSettingsCache(): void {
  settingsCache = null;
  cacheExpiry = 0;
}
