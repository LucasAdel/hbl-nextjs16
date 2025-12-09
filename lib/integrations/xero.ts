/**
 * Xero Accounting Integration Service
 * Handles invoicing, payments, and financial sync with Xero
 *
 * Required environment variables:
 * - XERO_CLIENT_ID
 * - XERO_CLIENT_SECRET
 * - XERO_REDIRECT_URI
 */

import {
  saveIntegrationTokens,
  getIntegrationTokens,
  updateAccessToken,
  tokensNeedRefresh as dbTokensNeedRefresh,
} from "@/lib/db/integrations";

export interface XeroTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tenantId: string;
}

export interface XeroContact {
  contactID?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  phones?: Array<{
    phoneType: "DEFAULT" | "MOBILE" | "FAX";
    phoneNumber: string;
  }>;
  addresses?: Array<{
    addressType: "STREET" | "POBOX";
    addressLine1?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  }>;
}

export interface XeroInvoice {
  invoiceID?: string;
  type: "ACCREC" | "ACCPAY";
  contact: { contactID: string };
  lineItems: Array<{
    description: string;
    quantity: number;
    unitAmount: number;
    accountCode?: string;
    taxType?: string;
  }>;
  date?: string;
  dueDate?: string;
  reference?: string;
  status?: "DRAFT" | "SUBMITTED" | "AUTHORISED" | "PAID" | "VOIDED";
  currencyCode?: string;
}

export interface XeroPayment {
  paymentID?: string;
  invoice: { invoiceID: string };
  account: { code: string };
  date: string;
  amount: number;
  reference?: string;
}

export interface XeroResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// OAuth configuration
const XERO_AUTH_URL = "https://login.xero.com/identity/connect/authorize";
const XERO_TOKEN_URL = "https://identity.xero.com/connect/token";
const XERO_API_URL = "https://api.xero.com/api.xro/2.0";
const XERO_CONNECTIONS_URL = "https://api.xero.com/connections";

const SCOPES = [
  "openid",
  "profile",
  "email",
  "accounting.transactions",
  "accounting.contacts",
  "accounting.settings",
  "offline_access",
];

/**
 * Generate OAuth authorization URL for Xero
 */
export function getXeroAuthUrl(state?: string): string {
  const clientId = process.env.XERO_CLIENT_ID;
  const redirectUri = process.env.XERO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("Xero OAuth credentials not configured");
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPES.join(" "),
    ...(state && { state }),
  });

  return `${XERO_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string
): Promise<XeroTokens> {
  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;
  const redirectUri = process.env.XERO_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Xero OAuth credentials not configured");
  }

  // Get tokens
  const tokenResponse = await fetch(XERO_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.json();
    throw new Error(error.error_description || "Failed to exchange code");
  }

  const tokenData = await tokenResponse.json();

  // Get tenant ID (organisation)
  const connectionsResponse = await fetch(XERO_CONNECTIONS_URL, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (!connectionsResponse.ok) {
    throw new Error("Failed to get Xero connections");
  }

  const connections = await connectionsResponse.json();

  if (!connections.length) {
    throw new Error("No Xero organisations connected");
  }

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: Date.now() + tokenData.expires_in * 1000,
    tenantId: connections[0].tenantId,
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; expiresAt: number }> {
  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Xero OAuth credentials not configured");
  }

  const response = await fetch(XERO_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || "Failed to refresh token");
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Make authenticated API request to Xero
 */
async function xeroRequest<T>(
  accessToken: string,
  tenantId: string,
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: object
): Promise<XeroResult<T>> {
  try {
    const response = await fetch(`${XERO_API_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Xero-Tenant-Id": tenantId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error:
          error.Message ||
          error.Detail ||
          `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create or update a contact in Xero
 */
export async function upsertContact(
  accessToken: string,
  tenantId: string,
  contact: XeroContact
): Promise<XeroResult<XeroContact>> {
  const result = await xeroRequest<{ Contacts: XeroContact[] }>(
    accessToken,
    tenantId,
    "/Contacts",
    "POST",
    { Contacts: [contact] }
  );

  if (result.success && result.data?.Contacts?.[0]) {
    return { success: true, data: result.data.Contacts[0] };
  }

  return { success: false, error: result.error };
}

/**
 * Find contact by email
 */
export async function findContactByEmail(
  accessToken: string,
  tenantId: string,
  email: string
): Promise<XeroResult<XeroContact | null>> {
  const result = await xeroRequest<{ Contacts: XeroContact[] }>(
    accessToken,
    tenantId,
    `/Contacts?where=EmailAddress=="${encodeURIComponent(email)}"`
  );

  if (result.success) {
    return {
      success: true,
      data: result.data?.Contacts?.[0] || null,
    };
  }

  return { success: false, error: result.error };
}

/**
 * Create an invoice in Xero
 */
export async function createInvoice(
  accessToken: string,
  tenantId: string,
  invoice: XeroInvoice
): Promise<XeroResult<XeroInvoice>> {
  const result = await xeroRequest<{ Invoices: XeroInvoice[] }>(
    accessToken,
    tenantId,
    "/Invoices",
    "POST",
    { Invoices: [invoice] }
  );

  if (result.success && result.data?.Invoices?.[0]) {
    return { success: true, data: result.data.Invoices[0] };
  }

  return { success: false, error: result.error };
}

/**
 * Get invoice by ID
 */
export async function getInvoice(
  accessToken: string,
  tenantId: string,
  invoiceId: string
): Promise<XeroResult<XeroInvoice>> {
  const result = await xeroRequest<{ Invoices: XeroInvoice[] }>(
    accessToken,
    tenantId,
    `/Invoices/${invoiceId}`
  );

  if (result.success && result.data?.Invoices?.[0]) {
    return { success: true, data: result.data.Invoices[0] };
  }

  return { success: false, error: result.error };
}

/**
 * Record a payment against an invoice
 */
export async function recordPayment(
  accessToken: string,
  tenantId: string,
  payment: XeroPayment
): Promise<XeroResult<XeroPayment>> {
  const result = await xeroRequest<{ Payments: XeroPayment[] }>(
    accessToken,
    tenantId,
    "/Payments",
    "POST",
    { Payments: [payment] }
  );

  if (result.success && result.data?.Payments?.[0]) {
    return { success: true, data: result.data.Payments[0] };
  }

  return { success: false, error: result.error };
}

/**
 * Get account codes (for invoice line items)
 */
export async function getAccounts(
  accessToken: string,
  tenantId: string
): Promise<XeroResult<Array<{ code: string; name: string; type: string }>>> {
  const result = await xeroRequest<{
    Accounts: Array<{ Code: string; Name: string; Type: string }>;
  }>(accessToken, tenantId, "/Accounts?where=Status==\"ACTIVE\"");

  if (result.success && result.data?.Accounts) {
    return {
      success: true,
      data: result.data.Accounts.map((a) => ({
        code: a.Code,
        name: a.Name,
        type: a.Type,
      })),
    };
  }

  return { success: false, error: result.error };
}

/**
 * Helper: Create invoice from appointment booking
 */
export async function createInvoiceFromBooking(
  accessToken: string,
  tenantId: string,
  booking: {
    clientEmail: string;
    clientName: string;
    service: string;
    amount: number;
    reference?: string;
    dueDate?: string;
  }
): Promise<XeroResult<XeroInvoice>> {
  // First, find or create contact
  let contactResult = await findContactByEmail(
    accessToken,
    tenantId,
    booking.clientEmail
  );

  if (!contactResult.success) {
    return { success: false, error: contactResult.error };
  }

  let contactId = contactResult.data?.contactID;

  if (!contactId) {
    // Create new contact
    const newContact = await upsertContact(accessToken, tenantId, {
      name: booking.clientName,
      emailAddress: booking.clientEmail,
    });

    if (!newContact.success || !newContact.data?.contactID) {
      return { success: false, error: newContact.error || "Failed to create contact" };
    }

    contactId = newContact.data.contactID;
  }

  // Create invoice
  const today = new Date().toISOString().split("T")[0];
  const dueDate =
    booking.dueDate ||
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  return createInvoice(accessToken, tenantId, {
    type: "ACCREC",
    contact: { contactID: contactId },
    date: today,
    dueDate,
    reference: booking.reference,
    status: "AUTHORISED",
    currencyCode: "AUD",
    lineItems: [
      {
        description: booking.service,
        quantity: 1,
        unitAmount: booking.amount,
        accountCode: "200", // Default revenue account - adjust as needed
        taxType: "OUTPUT", // GST on income
      },
    ],
  });
}

/**
 * Check if tokens need refresh
 */
export function tokensNeedRefresh(expiresAt: number): boolean {
  // Refresh if less than 5 minutes remaining
  return Date.now() > expiresAt - 5 * 60 * 1000;
}

/**
 * Save Xero tokens to database for a user
 */
export async function saveXeroTokens(
  userEmail: string,
  tokens: XeroTokens
): Promise<void> {
  await saveIntegrationTokens(userEmail, "xero", {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    token_expiry: new Date(tokens.expiresAt).toISOString(),
    tenant_id: tokens.tenantId,
    scopes: SCOPES,
  });
}

/**
 * Get Xero tokens from database for a user
 */
export async function getXeroTokens(
  userEmail: string
): Promise<XeroTokens | null> {
  const integration = await getIntegrationTokens(userEmail, "xero");

  if (!integration) {
    return null;
  }

  return {
    accessToken: integration.access_token,
    refreshToken: integration.refresh_token || "",
    expiresAt: integration.token_expiry ? new Date(integration.token_expiry).getTime() : Date.now(),
    tenantId: integration.tenant_id || "",
  };
}

/**
 * Get valid Xero tokens, refreshing if needed
 * Returns null if no tokens exist or refresh fails
 */
export async function getValidXeroTokens(
  userEmail: string
): Promise<XeroTokens | null> {
  const tokens = await getXeroTokens(userEmail);

  if (!tokens) {
    return null;
  }

  // Check if tokens need refresh
  if (tokensNeedRefresh(tokens.expiresAt)) {
    try {
      const refreshed = await refreshAccessToken(tokens.refreshToken);

      // Update tokens in database
      await updateAccessToken(
        userEmail,
        "xero",
        refreshed.accessToken,
        new Date(refreshed.expiresAt).toISOString(),
        refreshed.refreshToken
      );

      return {
        ...tokens,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        expiresAt: refreshed.expiresAt,
      };
    } catch (error) {
      console.error("Failed to refresh Xero tokens:", error);
      return null;
    }
  }

  return tokens;
}

/**
 * Check if user has valid Xero integration
 */
export async function hasXeroIntegration(userEmail: string): Promise<boolean> {
  const tokens = await getXeroTokens(userEmail);
  return tokens !== null;
}

/**
 * Get organisation info
 */
export async function getOrganisation(
  accessToken: string,
  tenantId: string
): Promise<
  XeroResult<{ name: string; countryCode: string; baseCurrency: string }>
> {
  const result = await xeroRequest<{
    Organisations: Array<{
      Name: string;
      CountryCode: string;
      BaseCurrency: string;
    }>;
  }>(accessToken, tenantId, "/Organisation");

  if (result.success && result.data?.Organisations?.[0]) {
    const org = result.data.Organisations[0];
    return {
      success: true,
      data: {
        name: org.Name,
        countryCode: org.CountryCode,
        baseCurrency: org.BaseCurrency,
      },
    };
  }

  return { success: false, error: result.error };
}
