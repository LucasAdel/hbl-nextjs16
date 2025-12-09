/**
 * Twilio SMS Notification Service
 * Handles sending SMS notifications for appointments and updates
 *
 * Required environment variables:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 */

export interface SMSMessage {
  to: string;
  body: string;
  from?: string;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  status?: string;
}

export interface SMSTemplate {
  type: string;
  template: string;
  variables: string[];
}

// Pre-defined SMS templates
export const SMS_TEMPLATES: Record<string, SMSTemplate> = {
  APPOINTMENT_CONFIRMATION: {
    type: "appointment_confirmation",
    template:
      "Hi {{clientName}}, your appointment with Hamilton Bailey Legal is confirmed for {{date}} at {{time}}. Reply HELP for assistance or STOP to unsubscribe.",
    variables: ["clientName", "date", "time"],
  },
  APPOINTMENT_REMINDER: {
    type: "appointment_reminder",
    template:
      "Reminder: You have an appointment with Hamilton Bailey Legal tomorrow ({{date}}) at {{time}}. Location: {{location}}. Reply CONFIRM to confirm or CANCEL to cancel.",
    variables: ["date", "time", "location"],
  },
  APPOINTMENT_CANCELLED: {
    type: "appointment_cancelled",
    template:
      "Your appointment with Hamilton Bailey Legal on {{date}} at {{time}} has been cancelled. Please call us on 07 3000 0000 to reschedule.",
    variables: ["date", "time"],
  },
  DOCUMENT_READY: {
    type: "document_ready",
    template:
      "Hi {{clientName}}, your documents are ready for review. Please log into your client portal at {{portalUrl}} to access them.",
    variables: ["clientName", "portalUrl"],
  },
  PAYMENT_RECEIVED: {
    type: "payment_received",
    template:
      "Thank you {{clientName}}! We've received your payment of {{amount}}. Receipt has been sent to your email.",
    variables: ["clientName", "amount"],
  },
  CASE_UPDATE: {
    type: "case_update",
    template:
      "Hi {{clientName}}, there's an update on your case. Please check your client portal or call us for details.",
    variables: ["clientName"],
  },
};

/**
 * Format Australian phone number to E.164 format
 */
export function formatAustralianPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");

  // Handle different formats
  if (digits.startsWith("61")) {
    // Already has country code
    return `+${digits}`;
  } else if (digits.startsWith("0")) {
    // Local format starting with 0
    return `+61${digits.substring(1)}`;
  } else if (digits.length === 9) {
    // Missing leading 0
    return `+61${digits}`;
  }

  // Return with + prefix if not already
  return phone.startsWith("+") ? phone : `+${digits}`;
}

/**
 * Validate Australian mobile number
 */
export function isValidAustralianMobile(phone: string): boolean {
  const formatted = formatAustralianPhone(phone);
  // Australian mobile numbers start with +614
  return /^\+614[0-9]{8}$/.test(formatted);
}

/**
 * Send SMS via Twilio
 */
export async function sendSMS(message: SMSMessage): Promise<SMSResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = message.from || process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    // Return mock response in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Twilio Mock] Would send SMS:", message);
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
        status: "mock",
      };
    }
    return {
      success: false,
      error: "Twilio credentials not configured",
    };
  }

  try {
    // Validate and format phone number
    if (!isValidAustralianMobile(message.to)) {
      return {
        success: false,
        error: "Invalid Australian mobile number",
      };
    }

    const formattedTo = formatAustralianPhone(message.to);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: fromNumber,
          Body: message.body,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Failed to send SMS",
      };
    }

    return {
      success: true,
      messageId: data.sid,
      status: data.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send SMS using a template
 */
export async function sendTemplatedSMS(
  templateType: keyof typeof SMS_TEMPLATES,
  to: string,
  variables: Record<string, string>
): Promise<SMSResult> {
  const template = SMS_TEMPLATES[templateType];

  if (!template) {
    return {
      success: false,
      error: `Unknown template: ${templateType}`,
    };
  }

  // Replace template variables
  let body = template.template;
  for (const [key, value] of Object.entries(variables)) {
    body = body.replace(new RegExp(`{{${key}}}`, "g"), value);
  }

  // Check for unreplaced variables
  const unreplaced = body.match(/{{[^}]+}}/g);
  if (unreplaced) {
    return {
      success: false,
      error: `Missing template variables: ${unreplaced.join(", ")}`,
    };
  }

  return sendSMS({ to, body });
}

/**
 * Send appointment confirmation SMS
 */
export async function sendAppointmentConfirmation(
  phone: string,
  clientName: string,
  date: string,
  time: string
): Promise<SMSResult> {
  return sendTemplatedSMS("APPOINTMENT_CONFIRMATION", phone, {
    clientName,
    date,
    time,
  });
}

/**
 * Send appointment reminder SMS
 */
export async function sendAppointmentReminder(
  phone: string,
  date: string,
  time: string,
  location: string
): Promise<SMSResult> {
  return sendTemplatedSMS("APPOINTMENT_REMINDER", phone, {
    date,
    time,
    location,
  });
}

/**
 * Send appointment cancellation SMS
 */
export async function sendAppointmentCancellation(
  phone: string,
  date: string,
  time: string
): Promise<SMSResult> {
  return sendTemplatedSMS("APPOINTMENT_CANCELLED", phone, {
    date,
    time,
  });
}

/**
 * Send document ready notification
 */
export async function sendDocumentReadyNotification(
  phone: string,
  clientName: string,
  portalUrl: string = "https://hamiltonbaileylegal.com.au/portal"
): Promise<SMSResult> {
  return sendTemplatedSMS("DOCUMENT_READY", phone, {
    clientName,
    portalUrl,
  });
}

/**
 * Send payment received confirmation
 */
export async function sendPaymentConfirmation(
  phone: string,
  clientName: string,
  amount: string
): Promise<SMSResult> {
  return sendTemplatedSMS("PAYMENT_RECEIVED", phone, {
    clientName,
    amount,
  });
}

/**
 * Send bulk SMS (for announcements, etc.)
 * Note: Rate limiting applies
 */
export async function sendBulkSMS(
  messages: SMSMessage[],
  delayMs: number = 100
): Promise<{ results: SMSResult[]; successCount: number; failCount: number }> {
  const results: SMSResult[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const message of messages) {
    const result = await sendSMS(message);
    results.push(result);

    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }

    // Rate limiting delay
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { results, successCount, failCount };
}

/**
 * Get SMS delivery status
 */
export async function getMessageStatus(
  messageId: string
): Promise<{ status: string; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return { status: "unknown", error: "Twilio credentials not configured" };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages/${messageId}.json`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
      }
    );

    if (!response.ok) {
      return { status: "unknown", error: "Failed to fetch message status" };
    }

    const data = await response.json();
    return { status: data.status };
  } catch (error) {
    return {
      status: "unknown",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Handle incoming SMS webhook (for replies like CONFIRM, CANCEL)
 */
export function parseIncomingSMS(body: {
  From: string;
  Body: string;
  MessageSid: string;
}): {
  from: string;
  message: string;
  messageId: string;
  action?: "confirm" | "cancel" | "help" | "stop";
} {
  const message = body.Body.trim().toUpperCase();

  let action: "confirm" | "cancel" | "help" | "stop" | undefined;

  if (message === "CONFIRM" || message === "YES" || message === "Y") {
    action = "confirm";
  } else if (message === "CANCEL" || message === "NO" || message === "N") {
    action = "cancel";
  } else if (message === "HELP" || message === "?") {
    action = "help";
  } else if (message === "STOP" || message === "UNSUBSCRIBE") {
    action = "stop";
  }

  return {
    from: body.From,
    message: body.Body,
    messageId: body.MessageSid,
    action,
  };
}
