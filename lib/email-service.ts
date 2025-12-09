import { renderToStaticMarkup } from "react-dom/server";
import {
  BookingConfirmationEmail,
  DocumentPurchaseEmail,
  NewsletterWelcomeEmail,
  ContactFormNotificationEmail,
} from "./email-templates";

// Email service types
interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Render React email template to HTML string
export function renderEmailTemplate(template: React.ReactElement): string {
  return `<!DOCTYPE html>${renderToStaticMarkup(template)}`;
}

// Email configuration
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || "Hamilton Bailey Law <noreply@hamiltonbailey.com>",
  replyTo: process.env.EMAIL_REPLY_TO || "enquiries@hamiltonbailey.com",
};

// Send email using configured provider
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const { to, subject, html, from = EMAIL_CONFIG.from, replyTo = EMAIL_CONFIG.replyTo } = options;

  // Check for email provider configuration
  const resendApiKey = process.env.RESEND_API_KEY;
  const sendgridApiKey = process.env.SENDGRID_API_KEY;

  try {
    if (resendApiKey) {
      return await sendViaResend({ to, subject, html, from, replyTo }, resendApiKey);
    } else if (sendgridApiKey) {
      return await sendViaSendGrid({ to, subject, html, from, replyTo }, sendgridApiKey);
    } else {
      // Log email in development
      console.log("📧 Email would be sent:", { to, subject, from });
      console.log("HTML Preview:", html.substring(0, 500) + "...");
      return { success: true, messageId: `dev-${Date.now()}` };
    }
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

// Send via Resend
async function sendViaResend(
  options: SendEmailOptions,
  apiKey: string
): Promise<EmailResult> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: options.from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      reply_to: options.replyTo,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Resend API error");
  }

  const data = await response.json();
  return { success: true, messageId: data.id };
}

// Send via SendGrid
async function sendViaSendGrid(
  options: SendEmailOptions,
  apiKey: string
): Promise<EmailResult> {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: Array.isArray(options.to)
            ? options.to.map((email) => ({ email }))
            : [{ email: options.to }],
        },
      ],
      from: { email: options.from?.match(/<(.+)>/)?.[1] || options.from },
      reply_to: { email: options.replyTo },
      subject: options.subject,
      content: [{ type: "text/html", value: options.html }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "SendGrid API error");
  }

  const messageId = response.headers.get("x-message-id");
  return { success: true, messageId: messageId || undefined };
}

// Pre-built email sending functions
export async function sendBookingConfirmation(data: {
  to: string;
  customerName: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: string;
  meetingLink?: string;
  meetingAddress?: string;
  confirmationNumber: string;
}): Promise<EmailResult> {
  const html = renderEmailTemplate(
    BookingConfirmationEmail({
      customerName: data.customerName,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      consultationType: data.consultationType,
      meetingLink: data.meetingLink,
      meetingAddress: data.meetingAddress,
      confirmationNumber: data.confirmationNumber,
    })
  );

  return sendEmail({
    to: data.to,
    subject: `Booking Confirmation - ${data.appointmentDate}`,
    html,
  });
}

export async function sendDocumentPurchaseReceipt(data: {
  to: string;
  customerName: string;
  orderNumber: string;
  documents: { name: string; price: number }[];
  totalAmount: number;
  downloadLinks: { name: string; url: string }[];
}): Promise<EmailResult> {
  const html = renderEmailTemplate(
    DocumentPurchaseEmail({
      customerName: data.customerName,
      orderNumber: data.orderNumber,
      documents: data.documents,
      totalAmount: data.totalAmount,
      downloadLinks: data.downloadLinks,
    })
  );

  return sendEmail({
    to: data.to,
    subject: `Your Document Purchase - Order #${data.orderNumber}`,
    html,
  });
}

export async function sendNewsletterWelcome(data: {
  to: string;
  subscriberName?: string;
}): Promise<EmailResult> {
  const html = renderEmailTemplate(
    NewsletterWelcomeEmail({
      subscriberName: data.subscriberName,
    })
  );

  return sendEmail({
    to: data.to,
    subject: "Welcome to Hamilton Bailey Law Newsletter",
    html,
  });
}

export async function sendContactFormNotification(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<EmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL || "enquiries@hamiltonbailey.com";
  const submittedAt = new Date().toLocaleString("en-AU", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const html = renderEmailTemplate(
    ContactFormNotificationEmail({
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      submittedAt,
    })
  );

  return sendEmail({
    to: adminEmail,
    subject: `New Contact: ${data.subject}`,
    html,
    replyTo: data.email,
  });
}
