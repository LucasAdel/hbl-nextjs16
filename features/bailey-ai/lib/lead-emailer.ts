/**
 * Lead Emailer Service for Bailey AI
 *
 * Detects when potential clients share contact information in chat
 * and sends instant email alerts to the team for quick follow-up.
 *
 * Response within 5 minutes = 21x more likely to convert
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Email recipients for lead alerts
const LEAD_ALERT_RECIPIENTS = [
  "admin@hamiltonbailey.com.au",
  "lw@hamiltonbailey.com",
];

// Regex patterns for Australian phone numbers and emails
const PHONE_PATTERNS = [
  /(?:(?:\+?61|0)[ -]?)?(?:4\d{2}|[2-9]\d{2})[ -]?\d{3}[ -]?\d{3}/g, // Mobile & landline
  /\b0[2-9]\d{8}\b/g, // 10-digit landline
  /\b04\d{8}\b/g, // 10-digit mobile
  /\b(?:\+61|61)[ -]?4\d{8}\b/g, // International mobile
];

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Name patterns (looking for "my name is X" or "I'm X" patterns)
const NAME_PATTERNS = [
  /(?:my name is|i'?m|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
  /(?:name[:\s]+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
];

export interface ExtractedContactInfo {
  phone: string | null;
  email: string | null;
  name: string | null;
  hasContactInfo: boolean;
}

/**
 * Extract contact information from a message
 */
export function extractContactInfo(message: string): ExtractedContactInfo {
  let phone: string | null = null;
  let email: string | null = null;
  let name: string | null = null;

  // Extract phone number
  for (const pattern of PHONE_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      phone = match[0].replace(/\s|-/g, "");
      break;
    }
  }

  // Extract email
  const emailMatch = message.match(EMAIL_PATTERN);
  if (emailMatch) {
    email = emailMatch[0].toLowerCase();
  }

  // Extract name
  for (const pattern of NAME_PATTERNS) {
    const match = pattern.exec(message);
    if (match && match[1]) {
      name = match[1].trim();
      break;
    }
  }

  return {
    phone,
    email,
    name,
    hasContactInfo: !!(phone || email),
  };
}

export interface LeadEmailData {
  contactInfo: ExtractedContactInfo;
  conversationId: string;
  sessionId: string;
  recentMessages: Array<{ role: string; content: string }>;
  userEmail?: string;
  detectedIntent?: string;
}

/**
 * Send lead notification email to the team
 */
export async function sendLeadNotificationEmail(data: LeadEmailData): Promise<boolean> {
  const { contactInfo, conversationId, sessionId, recentMessages, userEmail, detectedIntent } = data;

  if (!contactInfo.hasContactInfo) {
    return false;
  }

  // Build conversation summary (last 6 messages)
  const conversationSummary = recentMessages
    .slice(-6)
    .map((msg) => `${msg.role === "user" ? "Visitor" : "Bailey"}: ${msg.content}`)
    .join("\n\n");

  // Determine lead priority
  const hasPhone = !!contactInfo.phone;
  const hasEmail = !!contactInfo.email || !!userEmail;
  const priority = hasPhone ? "HOT" : hasEmail ? "WARM" : "COLD";
  const priorityEmoji = hasPhone ? "🔥" : hasEmail ? "🌡️" : "❄️";

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .priority { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 14px; }
    .priority-hot { background: #fee2e2; color: #dc2626; }
    .priority-warm { background: #fef3c7; color: #d97706; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .contact-box { background: white; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #0d9488; }
    .contact-item { margin: 8px 0; }
    .label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; }
    .value { font-size: 18px; color: #111827; }
    .conversation { background: white; padding: 16px; border-radius: 8px; margin-top: 16px; font-size: 14px; white-space: pre-wrap; }
    .cta { display: inline-block; background: #0d9488; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px; }
    .footer { text-align: center; padding: 16px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎯 New Lead from Bailey AI</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">A potential client just shared their contact details</p>
    </div>

    <div class="content">
      <div style="margin-bottom: 16px;">
        <span class="priority priority-${priority.toLowerCase()}">${priorityEmoji} ${priority} LEAD</span>
        ${detectedIntent ? `<span style="margin-left: 8px; color: #6b7280;">Intent: ${detectedIntent}</span>` : ""}
      </div>

      <div class="contact-box">
        ${contactInfo.name ? `
        <div class="contact-item">
          <div class="label">Name</div>
          <div class="value">${contactInfo.name}</div>
        </div>
        ` : ""}

        ${contactInfo.phone ? `
        <div class="contact-item">
          <div class="label">Phone</div>
          <div class="value">
            <a href="tel:${contactInfo.phone}" style="color: #0d9488; text-decoration: none;">${contactInfo.phone}</a>
          </div>
        </div>
        ` : ""}

        ${contactInfo.email || userEmail ? `
        <div class="contact-item">
          <div class="label">Email</div>
          <div class="value">
            <a href="mailto:${contactInfo.email || userEmail}" style="color: #0d9488; text-decoration: none;">${contactInfo.email || userEmail}</a>
          </div>
        </div>
        ` : ""}
      </div>

      <h3 style="margin-bottom: 8px;">💬 Recent Conversation</h3>
      <div class="conversation">${conversationSummary}</div>

      <a href="https://hbl-law-staging.netlify.app/admin/bailey-ai" class="cta">
        View Full Conversation →
      </a>

      <div style="margin-top: 20px; padding: 12px; background: #fef3c7; border-radius: 6px; font-size: 13px;">
        <strong>⚡ Quick Tip:</strong> Responding within 5 minutes increases conversion by 21x. Call them now while they're still thinking about their legal matter!
      </div>
    </div>

    <div class="footer">
      <p>Session ID: ${sessionId}</p>
      <p>Conversation ID: ${conversationId}</p>
      <p>Bailey AI Lead Notification • Hamilton Bailey Legal</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const { error } = await resend.emails.send({
      from: "Bailey AI <bailey@hamiltonbailey.com.au>",
      to: LEAD_ALERT_RECIPIENTS,
      subject: `${priorityEmoji} ${priority} Lead: ${contactInfo.name || "New visitor"} shared ${hasPhone ? "phone number" : "email"}`,
      html: emailHtml,
      tags: [
        { name: "type", value: "lead-alert" },
        { name: "priority", value: priority.toLowerCase() },
      ],
    });

    if (error) {
      console.error("Failed to send lead notification email:", error);
      return false;
    }

    console.log(`✅ Lead notification sent for ${priority} lead: ${contactInfo.phone || contactInfo.email}`);
    return true;
  } catch (error) {
    console.error("Error sending lead notification:", error);
    return false;
  }
}

/**
 * Check message for contact info and send alert if found
 * Returns true if an alert was sent
 */
export async function checkAndAlertLead(
  message: string,
  conversationId: string,
  sessionId: string,
  recentMessages: Array<{ role: string; content: string }>,
  userEmail?: string,
  detectedIntent?: string
): Promise<boolean> {
  const contactInfo = extractContactInfo(message);

  if (!contactInfo.hasContactInfo) {
    return false;
  }

  return sendLeadNotificationEmail({
    contactInfo,
    conversationId,
    sessionId,
    recentMessages,
    userEmail,
    detectedIntent,
  });
}
