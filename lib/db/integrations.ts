/**
 * Integration Token Storage
 * Handles OAuth tokens for Xero, Google Calendar, etc.
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDb(supabase: SupabaseClient): any {
  return supabase;
}

export type IntegrationProvider = "xero" | "google_calendar" | "google_drive" | "outlook";

export interface IntegrationTokens {
  access_token: string;
  refresh_token?: string;
  token_expiry?: string;
  tenant_id?: string;
  scopes?: string[];
  metadata?: Record<string, unknown>;
}

export interface Integration {
  id: string;
  user_email: string;
  provider: IntegrationProvider;
  access_token: string;
  refresh_token?: string;
  token_expiry?: string;
  tenant_id?: string;
  scopes?: string[];
  metadata?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Save or update integration tokens
 */
export async function saveIntegrationTokens(
  email: string,
  provider: IntegrationProvider,
  tokens: IntegrationTokens
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { error } = await db
    .from("user_integrations")
    .upsert(
      {
        user_email: email,
        provider,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: tokens.token_expiry,
        tenant_id: tokens.tenant_id,
        scopes: tokens.scopes,
        metadata: tokens.metadata,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_email,provider",
      }
    );

  if (error) {
    console.error("Error saving integration tokens:", error);
    return false;
  }

  return true;
}

/**
 * Get integration tokens for a user and provider
 */
export async function getIntegrationTokens(
  email: string,
  provider: IntegrationProvider
): Promise<IntegrationTokens | null> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("user_integrations")
    .select("*")
    .eq("user_email", email)
    .eq("provider", provider)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    token_expiry: data.token_expiry,
    tenant_id: data.tenant_id,
    scopes: data.scopes,
    metadata: data.metadata,
  };
}

/**
 * Check if tokens need refresh (within 5 minutes of expiry)
 */
export function tokensNeedRefresh(tokenExpiry?: string): boolean {
  if (!tokenExpiry) return false;

  const expiryTime = new Date(tokenExpiry).getTime();
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  return expiryTime - now < fiveMinutes;
}

/**
 * Update access token after refresh
 */
export async function updateAccessToken(
  email: string,
  provider: IntegrationProvider,
  accessToken: string,
  tokenExpiry?: string,
  refreshToken?: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const updateData: Record<string, unknown> = {
    access_token: accessToken,
    updated_at: new Date().toISOString(),
  };

  if (tokenExpiry) {
    updateData.token_expiry = tokenExpiry;
  }

  if (refreshToken) {
    updateData.refresh_token = refreshToken;
  }

  const { error } = await db
    .from("user_integrations")
    .update(updateData)
    .eq("user_email", email)
    .eq("provider", provider);

  if (error) {
    console.error("Error updating access token:", error);
    return false;
  }

  return true;
}

/**
 * Deactivate integration
 */
export async function deactivateIntegration(
  email: string,
  provider: IntegrationProvider
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { error } = await db
    .from("user_integrations")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_email", email)
    .eq("provider", provider);

  if (error) {
    console.error("Error deactivating integration:", error);
    return false;
  }

  return true;
}

/**
 * Get all active integrations for a user
 */
export async function getUserIntegrations(email: string): Promise<Integration[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("user_integrations")
    .select("*")
    .eq("user_email", email)
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching integrations:", error);
    return [];
  }

  return data || [];
}

/**
 * Check if user has active integration
 */
export async function hasActiveIntegration(
  email: string,
  provider: IntegrationProvider
): Promise<boolean> {
  const tokens = await getIntegrationTokens(email, provider);
  return tokens !== null;
}

// ============================================
// App-level token storage (for shared tokens like Google Calendar admin)
// ============================================

/**
 * Get app-level integration tokens (stored with email 'app@system')
 */
export async function getAppIntegrationTokens(
  provider: IntegrationProvider
): Promise<IntegrationTokens | null> {
  return getIntegrationTokens("app@system", provider);
}

/**
 * Save app-level integration tokens
 */
export async function saveAppIntegrationTokens(
  provider: IntegrationProvider,
  tokens: IntegrationTokens
): Promise<boolean> {
  return saveIntegrationTokens("app@system", provider, tokens);
}

/**
 * Update app-level access token
 */
export async function updateAppAccessToken(
  provider: IntegrationProvider,
  accessToken: string,
  tokenExpiry?: string
): Promise<boolean> {
  return updateAccessToken("app@system", provider, accessToken, tokenExpiry);
}
