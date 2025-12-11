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
  const priority = hasPhone ? "HIGH PRIORITY" : hasEmail ? "PRIORITY" : "NEW";
  const priorityColor = hasPhone ? "#DC2626" : hasEmail ? "#D97706" : "#2AAFA2";
  const priorityBg = hasPhone ? "#FEF2F2" : hasEmail ? "#FFFBEB" : "#F0FDFA";

  // Format phone number for display (e.g., 0412 345 678)
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  };

  // Format phone number for tel: href (E.164 international format for macOS/FaceTime compatibility)
  const formatPhoneForTel = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    // Convert Australian numbers to international format
    if (cleaned.startsWith("0") && cleaned.length === 10) {
      return `+61${cleaned.slice(1)}`; // 0412345678 -> +61412345678
    }
    if (cleaned.startsWith("61") && cleaned.length === 11) {
      return `+${cleaned}`; // 61412345678 -> +61412345678
    }
    return cleaned;
  };

  // Get current timestamp
  const timestamp = new Date().toLocaleString("en-AU", {
    timeZone: "Australia/Adelaide",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <title>New Lead Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F9FAFB;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">

          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #2AAFA2 0%, #2D6A6A 100%); padding: 32px 40px; border-radius: 12px 12px 0 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px;">
                      Hamilton Bailey Legal
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 500;">
                      Bailey AI Lead Notification
                    </p>
                  </td>
                  <td style="text-align: right; vertical-align: middle;">
                    <div style="background: rgba(255,255,255,0.2); border-radius: 50%; width: 48px; height: 48px; display: inline-block; text-align: center; line-height: 48px;">
                      <span style="font-size: 24px; color: #FFFFFF;">B</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 0; border-left: 1px solid #E5E7EB; border-right: 1px solid #E5E7EB;">

              <!-- Priority Banner -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="background-color: ${priorityBg}; padding: 16px 40px; border-bottom: 1px solid #E5E7EB;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td>
                          <span style="display: inline-block; background-color: ${priorityColor}; color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                            ${priority}
                          </span>
                          ${detectedIntent ? `<span style="margin-left: 12px; color: #6B7280; font-size: 13px;">Intent: ${detectedIntent}</span>` : ""}
                        </td>
                        <td style="text-align: right;">
                          <span style="color: #6B7280; font-size: 12px;">${timestamp}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Lead Information -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 32px 40px;">
                    <h2 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 700; color: #2E3338;">
                      New Lead Captured
                    </h2>

                    <!-- Contact Card -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB;">
                      <tr>
                        <td style="padding: 24px;">
                          ${contactInfo.name ? `
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 16px;">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #2AAFA2; border-radius: 50%; text-align: center; line-height: 32px;">
                                  <span style="color: #FFFFFF; font-size: 14px; font-weight: 600;">${contactInfo.name.charAt(0).toUpperCase()}</span>
                                </div>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 2px 0; font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Name</p>
                                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #2E3338;">${contactInfo.name}</p>
                              </td>
                            </tr>
                          </table>
                          ` : ""}

                          ${contactInfo.phone ? `
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: ${contactInfo.email || userEmail ? "16px" : "0"};">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: rgba(42, 175, 162, 0.1); border-radius: 50%; text-align: center; line-height: 32px;">
                                  <span style="color: #2AAFA2; font-size: 16px;">&#9742;</span>
                                </div>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 2px 0; font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Phone</p>
                                <a href="tel:${formatPhoneForTel(contactInfo.phone)}" style="font-size: 18px; font-weight: 600; color: #2AAFA2; text-decoration: none;">${formatPhone(contactInfo.phone)}</a>
                              </td>
                            </tr>
                          </table>
                          ` : ""}

                          ${contactInfo.email || userEmail ? `
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: rgba(42, 175, 162, 0.1); border-radius: 50%; text-align: center; line-height: 32px;">
                                  <span style="color: #2AAFA2; font-size: 14px;">&#9993;</span>
                                </div>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 2px 0; font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                                <a href="mailto:${contactInfo.email || userEmail}" style="font-size: 16px; font-weight: 600; color: #2AAFA2; text-decoration: none;">${contactInfo.email || userEmail}</a>
                              </td>
                            </tr>
                          </table>
                          ` : ""}
                        </td>
                      </tr>
                    </table>

                    <!-- Call to Action -->
                    ${contactInfo.phone ? `
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px;">
                      <tr>
                        <td>
                          <a href="tel:${formatPhoneForTel(contactInfo.phone)}" style="display: inline-block; background: linear-gradient(135deg, #2AAFA2 0%, #2D6A6A 100%); color: #FFFFFF; font-size: 14px; font-weight: 600; padding: 14px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 6px rgba(42, 175, 162, 0.25);">
                            Call Now
                          </a>
                          <a href="https://hbl-law-staging.netlify.app/admin/bailey-ai" style="display: inline-block; margin-left: 12px; background-color: #FFFFFF; color: #2D6A6A; font-size: 14px; font-weight: 600; padding: 14px 28px; border-radius: 8px; text-decoration: none; border: 2px solid #E5E7EB;">
                            View Conversation
                          </a>
                        </td>
                      </tr>
                    </table>
                    ` : `
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px;">
                      <tr>
                        <td>
                          <a href="https://hbl-law-staging.netlify.app/admin/bailey-ai" style="display: inline-block; background: linear-gradient(135deg, #2AAFA2 0%, #2D6A6A 100%); color: #FFFFFF; font-size: 14px; font-weight: 600; padding: 14px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 6px rgba(42, 175, 162, 0.25);">
                            View Full Conversation
                          </a>
                        </td>
                      </tr>
                    </table>
                    `}
                  </td>
                </tr>
              </table>

              <!-- Conversation Preview -->
              ${conversationSummary ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 40px 32px 40px;">
                    <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">
                      Recent Conversation
                    </p>
                    <div style="background-color: #F9FAFB; border-radius: 8px; padding: 16px; border: 1px solid #E5E7EB; font-size: 13px; color: #4B5563; line-height: 1.6; white-space: pre-wrap; max-height: 200px; overflow: hidden;">${conversationSummary}</div>
                  </td>
                </tr>
              </table>
              ` : ""}

              <!-- Tip Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 40px 32px 40px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, rgba(42, 175, 162, 0.08) 0%, rgba(45, 106, 106, 0.08) 100%); border-radius: 8px; border-left: 4px solid #2AAFA2;">
                      <tr>
                        <td style="padding: 16px 20px;">
                          <p style="margin: 0; font-size: 13px; color: #2D6A6A; line-height: 1.5;">
                            <strong style="color: #2E3338;">Quick Response Tip:</strong> Responding within 5 minutes increases conversion likelihood by 21x. Contact this lead while they're still engaged with their legal matter.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #2E3338; padding: 24px 40px; border-radius: 0 0 12px 12px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #FFFFFF;">Hamilton Bailey Legal</p>
                    <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7);">Level 3, 15 Hutt Street, Adelaide SA 5000</p>
                  </td>
                  <td style="text-align: right; vertical-align: top;">
                    <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.5);">
                      Session: ${sessionId.substring(0, 8)}...
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const { error } = await resend.emails.send({
      from: "Bailey AI <noreply@hamiltonbailey.com>",
      to: LEAD_ALERT_RECIPIENTS,
      subject: `[${priority}] New Lead: ${contactInfo.name || "Potential Client"} - ${hasPhone ? "Phone Provided" : "Email Provided"}`,
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
