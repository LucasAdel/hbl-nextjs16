/**
 * Email Sequence Templates - Premium Design
 * Visually appealing templates matching Hamilton Bailey brand
 * Primary: #2AAFA2 (Teal) | Secondary: #2D6A6A (Dark Teal)
 * Font: Montserrat
 */

import * as React from "react";

// Brand Colors
const BRAND = {
  primary: "#2AAFA2",
  primaryDark: "#2D6A6A",
  primaryLight: "#89DAD2",
  primaryBg: "rgba(42, 175, 162, 0.1)",
  text: "#2E3338",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  bgWhite: "#FFFFFF",
  bgLight: "#F9FAFB",
  bgGray: "#F3F4F6",
  border: "#E5E7EB",
  warning: "#F59E0B",
  warningBg: "#FEF3C7",
  warningText: "#92400E",
  footer: "#1F2937",
};

// Premium Email Wrapper with gradient header
function PremiumEmailWrapper({
  children,
  previewText
}: {
  children: React.ReactNode;
  previewText?: string;
}) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <title>Hamilton Bailey Law</title>
        {previewText && <meta name="description" content={previewText} />}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
              body { margin: 0; padding: 0; background-color: ${BRAND.bgLight}; }
              * { box-sizing: border-box; }
            `,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: BRAND.bgLight, fontFamily: "'Montserrat', Arial, sans-serif" }}>
        <table role="presentation" cellPadding="0" cellSpacing="0" style={{ width: "100%", backgroundColor: BRAND.bgLight }}>
          <tr>
            <td style={{ padding: "40px 20px" }}>
              <table role="presentation" cellPadding="0" cellSpacing="0" style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}>
                {children}
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

// Premium Header with gradient
function PremiumHeader({ subtitle }: { subtitle?: string }) {
  return (
    <tr>
      <td
        style={{
          background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
          padding: "40px 30px",
          borderRadius: "16px 16px 0 0",
          textAlign: "center",
        }}
      >
        <img
          src="https://hamiltonbailey.com/images/hb-logo-white.png"
          alt="Hamilton Bailey Law"
          style={{ height: "45px", width: "auto", marginBottom: subtitle ? "12px" : 0 }}
        />
        {subtitle && (
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", margin: "0", letterSpacing: "0.5px" }}>
            {subtitle}
          </p>
        )}
      </td>
    </tr>
  );
}

// Premium Footer
function PremiumFooter({ unsubscribeUrl }: { unsubscribeUrl?: string }) {
  const currentYear = new Date().getFullYear();
  return (
    <tr>
      <td
        style={{
          backgroundColor: BRAND.footer,
          padding: "35px 30px",
          borderRadius: "0 0 16px 16px",
          textAlign: "center",
        }}
      >
        <img
          src="https://hamiltonbailey.com/images/hb-logo-white.png"
          alt="Hamilton Bailey Law"
          style={{ height: "30px", width: "auto", marginBottom: "20px", opacity: 0.9 }}
        />
        <p style={{ color: BRAND.textMuted, fontSize: "13px", margin: "0 0 8px 0" }}>
          Hamilton Bailey Law Firm
        </p>
        <p style={{ color: "#6B7280", fontSize: "12px", margin: "0 0 6px 0" }}>
          Level 1, 123 King William Street, Adelaide SA 5000
        </p>
        <p style={{ color: "#6B7280", fontSize: "12px", margin: "0 0 20px 0" }}>
          (08) 8212 8585 &bull; enquiries@hamiltonbailey.com
        </p>
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          marginBottom: "20px"
        }}>
          <a href="https://linkedin.com/company/hamiltonbaileylaw" style={{ color: BRAND.primary, textDecoration: "none", fontSize: "20px" }}>in</a>
          <a href="https://facebook.com/hamiltonbaileylaw" style={{ color: BRAND.primary, textDecoration: "none", fontSize: "20px" }}>f</a>
        </div>
        <div style={{ borderTop: `1px solid #374151`, paddingTop: "20px", marginTop: "10px" }}>
          <p style={{ color: "#6B7280", fontSize: "11px", margin: "0 0 8px 0" }}>
            &copy; {currentYear} Hamilton Bailey Law Firm. All rights reserved.
          </p>
          <p style={{ color: "#6B7280", fontSize: "11px", margin: 0 }}>
            <a href="https://hamiltonbailey.com/privacy-policy" style={{ color: BRAND.primary, textDecoration: "none" }}>Privacy Policy</a>
            {" &bull; "}
            <a href="https://hamiltonbailey.com/terms" style={{ color: BRAND.primary, textDecoration: "none" }}>Terms</a>
            {unsubscribeUrl && (
              <>
                {" &bull; "}
                <a href={unsubscribeUrl} style={{ color: BRAND.textMuted, textDecoration: "none" }}>Unsubscribe</a>
              </>
            )}
          </p>
        </div>
      </td>
    </tr>
  );
}

// Premium Button
function PremiumButton({
  href,
  children,
  variant = "primary",
  fullWidth = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
}) {
  const styles = {
    primary: {
      background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
      color: "#FFFFFF",
      border: "none",
    },
    secondary: {
      backgroundColor: BRAND.bgGray,
      color: BRAND.text,
      border: "none",
    },
    outline: {
      backgroundColor: "transparent",
      color: BRAND.primary,
      border: `2px solid ${BRAND.primary}`,
    },
  }[variant];

  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        padding: "16px 32px",
        borderRadius: "10px",
        textDecoration: "none",
        fontWeight: "600",
        fontSize: "15px",
        textAlign: "center",
        width: fullWidth ? "100%" : "auto",
        ...styles,
      }}
    >
      {children}
    </a>
  );
}

// Feature Card
function FeatureCard({
  icon,
  title,
  description
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div style={{
      backgroundColor: BRAND.bgLight,
      padding: "20px",
      borderRadius: "12px",
      marginBottom: "12px",
      display: "flex",
      alignItems: "flex-start",
    }}>
      <span style={{ fontSize: "24px", marginRight: "15px" }}>{icon}</span>
      <div>
        <p style={{ color: BRAND.text, fontSize: "15px", fontWeight: "600", margin: "0 0 4px 0" }}>
          {title}
        </p>
        <p style={{ color: BRAND.textSecondary, fontSize: "13px", margin: 0, lineHeight: "1.5" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

// Highlight Box
function HighlightBox({
  children,
  variant = "info"
}: {
  children: React.ReactNode;
  variant?: "info" | "warning" | "success";
}) {
  const styles = {
    info: { bg: "#F0FDFA", border: BRAND.primary, text: "#115E59" },
    warning: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
    success: { bg: "#ECFDF5", border: "#10B981", text: "#065F46" },
  }[variant];

  return (
    <div style={{
      backgroundColor: styles.bg,
      borderLeft: `4px solid ${styles.border}`,
      padding: "20px 24px",
      borderRadius: "0 12px 12px 0",
      margin: "25px 0",
    }}>
      <div style={{ color: styles.text }}>
        {children}
      </div>
    </div>
  );
}

// ==========================================
// WELCOME SERIES TEMPLATES
// ==========================================

export function WelcomeEmail1Intro({
  subscriberName,
  unsubscribeUrl
}: {
  subscriberName?: string;
  unsubscribeUrl?: string;
}) {
  return (
    <PremiumEmailWrapper previewText="Welcome to Hamilton Bailey Law - Your trusted legal partner for medical practices">
      <PremiumHeader subtitle="Legal Excellence for Medical Practitioners" />
      <tr>
        <td style={{ backgroundColor: BRAND.bgWhite, padding: "45px 35px" }}>
          {/* Welcome Badge */}
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <span style={{
              display: "inline-block",
              backgroundColor: BRAND.primaryBg,
              color: BRAND.primary,
              padding: "8px 20px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "600",
              letterSpacing: "0.5px",
            }}>
              Welcome Aboard
            </span>
          </div>

          <h1 style={{
            color: BRAND.text,
            fontSize: "28px",
            fontWeight: "700",
            margin: "0 0 25px 0",
            textAlign: "center",
            lineHeight: "1.3",
          }}>
            Welcome to Hamilton Bailey Law
          </h1>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 20px 0" }}>
            {subscriberName ? `Hi ${subscriberName},` : "Hi there,"}
          </p>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 25px 0" }}>
            Thank you for joining our community of medical practitioners who trust Hamilton Bailey Law for their legal needs. We&apos;re thrilled to have you with us!
          </p>

          {/* What You'll Get Section */}
          <HighlightBox variant="info">
            <p style={{ fontSize: "15px", fontWeight: "600", margin: "0 0 15px 0" }}>
              Here&apos;s what you&apos;ll receive:
            </p>
            <table style={{ width: "100%" }}>
              {[
                { icon: "📚", text: "Expert legal insights for medical practitioners" },
                { icon: "⚖️", text: "Updates on healthcare regulations & AHPRA compliance" },
                { icon: "📄", text: "Exclusive resources and document templates" },
                { icon: "🎓", text: "Early access to webinars and workshops" },
              ].map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: "6px 0", fontSize: "14px", lineHeight: "1.6" }}>
                    <span style={{ marginRight: "10px" }}>{item.icon}</span>
                    {item.text}
                  </td>
                </tr>
              ))}
            </table>
          </HighlightBox>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 30px 0" }}>
            Over the next few days, I&apos;ll share some of our most valuable resources to help protect your practice. Keep an eye on your inbox!
          </p>

          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <PremiumButton href="https://hamiltonbailey.com/resources">
              Explore Our Resources
            </PremiumButton>
          </div>

          {/* Signature */}
          <div style={{
            borderTop: `1px solid ${BRAND.border}`,
            paddingTop: "25px",
            marginTop: "10px",
            display: "flex",
            alignItems: "center",
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: BRAND.primaryBg,
              marginRight: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: "24px" }}>👩‍⚖️</span>
            </div>
            <div>
              <p style={{ color: BRAND.textSecondary, fontSize: "14px", margin: "0 0 4px 0" }}>
                Best regards,
              </p>
              <p style={{ color: BRAND.text, fontSize: "15px", fontWeight: "600", margin: "0 0 2px 0" }}>
                Leanne Wilkinson
              </p>
              <p style={{ color: BRAND.textSecondary, fontSize: "13px", margin: 0 }}>
                Principal Lawyer, Hamilton Bailey Law
              </p>
            </div>
          </div>
        </td>
      </tr>
      <PremiumFooter unsubscribeUrl={unsubscribeUrl} />
    </PremiumEmailWrapper>
  );
}

export function WelcomeEmail2Value({
  subscriberName,
  unsubscribeUrl
}: {
  subscriberName?: string;
  unsubscribeUrl?: string;
}) {
  const mistakes = [
    { icon: "📋", title: "Inadequate Employment Contracts", desc: "Generic contracts that don't protect your practice from disputes" },
    { icon: "🔍", title: "AHPRA Compliance Gaps", desc: "Missing documentation that can trigger costly audits" },
    { icon: "🏠", title: "Poor Tenant Doctor Agreements", desc: "Unclear terms leading to financial and legal disputes" },
    { icon: "🔒", title: "Insufficient Privacy Policies", desc: "Non-compliant patient data handling risking penalties" },
    { icon: "🤝", title: "Weak Partnership Structures", desc: "Partnerships without proper exit clauses or protections" },
  ];

  return (
    <PremiumEmailWrapper previewText="5 Legal Mistakes Medical Practices Make (And How to Avoid Them)">
      <PremiumHeader subtitle="Expert Legal Insights" />
      <tr>
        <td style={{ backgroundColor: BRAND.bgWhite, padding: "45px 35px" }}>
          {/* Badge */}
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <span style={{
              display: "inline-block",
              backgroundColor: "#FEF3C7",
              color: "#92400E",
              padding: "8px 20px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "600",
            }}>
              Essential Reading
            </span>
          </div>

          <h1 style={{
            color: BRAND.text,
            fontSize: "26px",
            fontWeight: "700",
            margin: "0 0 25px 0",
            textAlign: "center",
            lineHeight: "1.3",
          }}>
            5 Legal Mistakes<br />Medical Practices Make
          </h1>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 20px 0" }}>
            {subscriberName ? `Hi ${subscriberName},` : "Hi there,"}
          </p>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 30px 0" }}>
            After 14+ years working with medical practitioners, I&apos;ve seen the same legal issues arise again and again. Here are the top 5 mistakes&mdash;and how to avoid them:
          </p>

          {/* Mistakes List */}
          {mistakes.map((mistake, index) => (
            <div
              key={index}
              style={{
                backgroundColor: BRAND.bgLight,
                padding: "18px 20px",
                borderRadius: "12px",
                marginBottom: "12px",
                borderLeft: `4px solid ${BRAND.primary}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <span style={{ fontSize: "20px", marginRight: "12px" }}>{mistake.icon}</span>
                <div>
                  <p style={{ color: BRAND.text, fontSize: "15px", fontWeight: "600", margin: "0 0 4px 0" }}>
                    {index + 1}. {mistake.title}
                  </p>
                  <p style={{ color: BRAND.textSecondary, fontSize: "13px", margin: 0, lineHeight: "1.5" }}>
                    {mistake.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Self Assessment */}
          <HighlightBox variant="warning">
            <p style={{ fontSize: "15px", fontWeight: "600", margin: "0 0 8px 0" }}>
              Quick Self-Assessment
            </p>
            <p style={{ fontSize: "14px", margin: 0, lineHeight: "1.6" }}>
              How many of these apply to your practice? If it&apos;s more than one, it might be time for a legal health check.
            </p>
          </HighlightBox>

          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <PremiumButton href="https://hamiltonbailey.com/book-appointment">
              Book a Consultation
            </PremiumButton>
          </div>

          <p style={{ color: BRAND.textMuted, fontSize: "14px", textAlign: "center", margin: 0 }}>
            Tomorrow: I&apos;ll send you a free compliance checklist to audit your own practice.
          </p>
        </td>
      </tr>
      <PremiumFooter unsubscribeUrl={unsubscribeUrl} />
    </PremiumEmailWrapper>
  );
}

export function WelcomeEmail3Resource({
  subscriberName,
  unsubscribeUrl
}: {
  subscriberName?: string;
  unsubscribeUrl?: string;
}) {
  return (
    <PremiumEmailWrapper previewText="Free Resource: Medical Practice Compliance Checklist">
      <PremiumHeader subtitle="Free Resource Inside" />
      <tr>
        <td style={{ backgroundColor: BRAND.bgWhite, padding: "45px 35px" }}>
          {/* Icon */}
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: BRAND.primaryBg,
            }}>
              <span style={{ fontSize: "36px" }}>📋</span>
            </div>
          </div>

          <h1 style={{
            color: BRAND.text,
            fontSize: "26px",
            fontWeight: "700",
            margin: "0 0 25px 0",
            textAlign: "center",
          }}>
            Your Free Compliance Checklist
          </h1>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 20px 0" }}>
            {subscriberName ? `Hi ${subscriberName},` : "Hi there,"}
          </p>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 30px 0" }}>
            As promised, here&apos;s your exclusive <strong>Medical Practice Compliance Checklist</strong>. This is the same framework we use with our clients to ensure their practices are fully protected.
          </p>

          {/* Resource Card */}
          <div style={{
            background: `linear-gradient(135deg, ${BRAND.primary}15 0%, ${BRAND.primaryDark}15 100%)`,
            border: `2px solid ${BRAND.primary}`,
            borderRadius: "16px",
            padding: "30px",
            textAlign: "center",
            marginBottom: "30px",
          }}>
            <p style={{ color: BRAND.primaryDark, fontSize: "16px", fontWeight: "600", margin: "0 0 20px 0" }}>
              What&apos;s Inside:
            </p>
            <table style={{ width: "100%", textAlign: "left" }}>
              {[
                "Employment & contractor compliance checkpoints",
                "AHPRA registration requirements",
                "Privacy and data protection essentials",
                "Lease and property agreement checks",
                "Insurance coverage verification",
              ].map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: "8px 0", color: BRAND.primaryDark, fontSize: "14px" }}>
                    <span style={{ color: BRAND.primary, marginRight: "10px" }}>✓</span>
                    {item}
                  </td>
                </tr>
              ))}
            </table>
            <div style={{ marginTop: "25px" }}>
              <PremiumButton href="https://hamiltonbailey.com/resources/compliance-checklist">
                Download Checklist (PDF)
              </PremiumButton>
            </div>
          </div>

          <HighlightBox variant="success">
            <p style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 8px 0" }}>
              💡 Pro Tip
            </p>
            <p style={{ fontSize: "14px", margin: 0, lineHeight: "1.6" }}>
              Schedule 30 minutes this week to go through the checklist. Note any areas where you&apos;re unsure&mdash;these are exactly the topics we can help clarify.
            </p>
          </HighlightBox>

          <p style={{ color: BRAND.textMuted, fontSize: "14px", textAlign: "center", margin: 0 }}>
            In my next email, I&apos;ll share how we&apos;ve helped practices achieve full compliance.
          </p>
        </td>
      </tr>
      <PremiumFooter unsubscribeUrl={unsubscribeUrl} />
    </PremiumEmailWrapper>
  );
}

export function WelcomeEmail4CTA({
  subscriberName,
  unsubscribeUrl
}: {
  subscriberName?: string;
  unsubscribeUrl?: string;
}) {
  return (
    <PremiumEmailWrapper previewText="Ready for a Legal Health Check? Book Your Consultation">
      <PremiumHeader subtitle="Let's Connect" />
      <tr>
        <td style={{ backgroundColor: BRAND.bgWhite, padding: "45px 35px" }}>
          <h1 style={{
            color: BRAND.text,
            fontSize: "26px",
            fontWeight: "700",
            margin: "0 0 25px 0",
            textAlign: "center",
          }}>
            Ready for Your Legal Health Check?
          </h1>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 20px 0" }}>
            {subscriberName ? `Hi ${subscriberName},` : "Hi there,"}
          </p>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 30px 0" }}>
            Over the past week, you&apos;ve learned about common legal pitfalls and received our compliance checklist. Now, let&apos;s take the next step together.
          </p>

          {/* CTA Card */}
          <div style={{
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
            borderRadius: "16px",
            padding: "35px",
            textAlign: "center",
            marginBottom: "30px",
          }}>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px", fontWeight: "500", margin: "0 0 10px 0", letterSpacing: "1px" }}>
              LET&apos;S CONNECT
            </p>
            <p style={{ color: "#FFFFFF", fontSize: "22px", fontWeight: "700", margin: "0 0 20px 0" }}>
              10-Minute Legal Health Check
            </p>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", margin: "0 0 20px 0", lineHeight: "1.6" }}>
              In this call, we&apos;ll review your concerns, identify compliance gaps, and recommend next steps.
            </p>
            <a
              href="https://hamiltonbailey.com/book-appointment"
              style={{
                display: "inline-block",
                padding: "16px 32px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "15px",
                backgroundColor: "#FFFFFF",
                color: BRAND.primary,
              }}
            >
              Book Your Consultation
            </a>
          </div>

          <HighlightBox variant="warning">
            <p style={{ fontSize: "14px", fontWeight: "600", margin: 0, display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "10px" }}>⚡</span>
              Limited: We only take 5 new consultation bookings per week to ensure quality service.
            </p>
          </HighlightBox>

          <p style={{ color: BRAND.textSecondary, fontSize: "15px", lineHeight: "1.7", margin: 0 }}>
            Even if you&apos;re not ready for a call, feel free to reply to this email with any questions. I personally read every response.
          </p>
        </td>
      </tr>
      <PremiumFooter unsubscribeUrl={unsubscribeUrl} />
    </PremiumEmailWrapper>
  );
}

// ==========================================
// BOOKING REMINDER TEMPLATES
// ==========================================

export function BookingReminder24Hr({
  customerName,
  appointmentDate,
  appointmentTime,
  consultationType,
  meetingLink,
  unsubscribeUrl,
}: {
  customerName: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: string;
  meetingLink?: string;
  unsubscribeUrl?: string;
}) {
  return (
    <PremiumEmailWrapper previewText={`Reminder: Your consultation tomorrow at ${appointmentTime}`}>
      <PremiumHeader subtitle="Appointment Reminder" />
      <tr>
        <td style={{ backgroundColor: BRAND.bgWhite, padding: "45px 35px" }}>
          {/* Calendar Icon */}
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: BRAND.primaryBg,
            }}>
              <span style={{ fontSize: "36px" }}>📅</span>
            </div>
          </div>

          <h1 style={{
            color: BRAND.text,
            fontSize: "26px",
            fontWeight: "700",
            margin: "0 0 25px 0",
            textAlign: "center",
          }}>
            Your Consultation is Tomorrow
          </h1>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 25px 0" }}>
            Hi {customerName}, just a friendly reminder about your upcoming consultation.
          </p>

          {/* Appointment Details Card */}
          <div style={{
            backgroundColor: BRAND.bgLight,
            borderRadius: "16px",
            padding: "25px",
            marginBottom: "25px",
          }}>
            <table style={{ width: "100%" }}>
              <tr>
                <td style={{ padding: "12px 0", borderBottom: `1px solid ${BRAND.border}` }}>
                  <span style={{ color: BRAND.textMuted, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Consultation</span>
                  <p style={{ color: BRAND.text, fontSize: "16px", fontWeight: "600", margin: "4px 0 0 0" }}>{consultationType}</p>
                </td>
              </tr>
              <tr>
                <td style={{ padding: "12px 0", borderBottom: `1px solid ${BRAND.border}` }}>
                  <span style={{ color: BRAND.textMuted, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date</span>
                  <p style={{ color: BRAND.text, fontSize: "16px", fontWeight: "600", margin: "4px 0 0 0" }}>{appointmentDate}</p>
                </td>
              </tr>
              <tr>
                <td style={{ padding: "12px 0" }}>
                  <span style={{ color: BRAND.textMuted, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Time</span>
                  <p style={{ color: BRAND.text, fontSize: "16px", fontWeight: "600", margin: "4px 0 0 0" }}>{appointmentTime} (ACST)</p>
                </td>
              </tr>
            </table>
          </div>

          {meetingLink && (
            <div style={{ textAlign: "center", marginBottom: "25px" }}>
              <PremiumButton href={meetingLink}>
                Join Video Call
              </PremiumButton>
            </div>
          )}

          <HighlightBox variant="warning">
            <p style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 12px 0" }}>
              Before Your Appointment:
            </p>
            <table style={{ width: "100%" }}>
              {[
                "Gather relevant documents",
                "Prepare your questions",
                "Test your audio/video if joining online",
                "Find a quiet, private space",
              ].map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: "4px 0", fontSize: "14px" }}>
                    <span style={{ marginRight: "8px" }}>•</span>{item}
                  </td>
                </tr>
              ))}
            </table>
          </HighlightBox>

          <p style={{ color: BRAND.textMuted, fontSize: "14px", textAlign: "center", margin: 0 }}>
            Need to reschedule? Please let us know at least 24 hours in advance.
          </p>
        </td>
      </tr>
      <PremiumFooter unsubscribeUrl={unsubscribeUrl} />
    </PremiumEmailWrapper>
  );
}

export function BookingReminder1Hr({
  customerName,
  consultationType,
  meetingLink,
  unsubscribeUrl,
}: {
  customerName: string;
  consultationType: string;
  meetingLink?: string;
  unsubscribeUrl?: string;
}) {
  return (
    <PremiumEmailWrapper previewText="Starting Soon: Your consultation in 1 hour">
      <PremiumHeader subtitle="Starting Soon" />
      <tr>
        <td style={{ backgroundColor: BRAND.bgWhite, padding: "45px 35px" }}>
          {/* Urgent Icon */}
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#FEF3C7",
            }}>
              <span style={{ fontSize: "36px" }}>⏰</span>
            </div>
          </div>

          <h1 style={{
            color: BRAND.text,
            fontSize: "26px",
            fontWeight: "700",
            margin: "0 0 25px 0",
            textAlign: "center",
          }}>
            Starting in 1 Hour
          </h1>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 15px 0", textAlign: "center" }}>
            Hi {customerName}, your <strong>{consultationType}</strong> is about to begin.
          </p>
          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 30px 0", textAlign: "center" }}>
            We&apos;re looking forward to speaking with you!
          </p>

          {meetingLink && (
            <div style={{
              background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
              borderRadius: "16px",
              padding: "35px",
              textAlign: "center",
              marginBottom: "30px",
            }}>
              <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "15px", margin: "0 0 20px 0" }}>
                Ready to join?
              </p>
              <a
                href={meetingLink}
                style={{
                  display: "inline-block",
                  padding: "18px 40px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "16px",
                  backgroundColor: "#FFFFFF",
                  color: BRAND.primary,
                }}
              >
                Join Video Call Now
              </a>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", margin: "15px 0 0 0" }}>
                Click when you&apos;re ready to connect
              </p>
            </div>
          )}

          <p style={{ color: BRAND.textMuted, fontSize: "14px", textAlign: "center", margin: 0 }}>
            See you soon!<br />
            <strong>The Hamilton Bailey Law Team</strong>
          </p>
        </td>
      </tr>
      <PremiumFooter unsubscribeUrl={unsubscribeUrl} />
    </PremiumEmailWrapper>
  );
}

// ==========================================
// POST-CONSULTATION TEMPLATES
// ==========================================

export function PostConsultThanks({
  customerName,
  consultationType,
  lawyerName,
  unsubscribeUrl,
}: {
  customerName: string;
  consultationType: string;
  lawyerName: string;
  unsubscribeUrl?: string;
}) {
  return (
    <PremiumEmailWrapper previewText="Thank you for your consultation - Next steps">
      <PremiumHeader subtitle="Thank You" />
      <tr>
        <td style={{ backgroundColor: BRAND.bgWhite, padding: "45px 35px" }}>
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <span style={{ fontSize: "48px" }}>🙏</span>
          </div>

          <h1 style={{
            color: BRAND.text,
            fontSize: "26px",
            fontWeight: "700",
            margin: "0 0 25px 0",
            textAlign: "center",
          }}>
            Thank You for Your Consultation
          </h1>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 20px 0" }}>
            Dear {customerName},
          </p>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 25px 0" }}>
            Thank you for taking the time to meet with us today regarding your <strong>{consultationType}</strong>. It was a pleasure speaking with you.
          </p>

          <HighlightBox variant="info">
            <p style={{ fontSize: "15px", fontWeight: "600", margin: "0 0 12px 0" }}>
              What Happens Next:
            </p>
            <table style={{ width: "100%" }}>
              {[
                { num: "1", text: "We'll review our discussion and prepare recommendations" },
                { num: "2", text: "You'll receive a summary email within 3 business days" },
                { num: "3", text: "We'll outline any suggested next steps" },
              ].map((item) => (
                <tr key={item.num}>
                  <td style={{ padding: "6px 0", fontSize: "14px", lineHeight: "1.6" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: BRAND.primary,
                      color: "#FFF",
                      fontSize: "12px",
                      fontWeight: "600",
                      marginRight: "10px",
                    }}>{item.num}</span>
                    {item.text}
                  </td>
                </tr>
              ))}
            </table>
          </HighlightBox>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 30px 0" }}>
            In the meantime, if you have any questions or remember something you wanted to discuss, please don&apos;t hesitate to reply to this email.
          </p>

          <div style={{ borderTop: `1px solid ${BRAND.border}`, paddingTop: "25px" }}>
            <p style={{ color: BRAND.textSecondary, fontSize: "14px", margin: "0 0 4px 0" }}>
              Best regards,
            </p>
            <p style={{ color: BRAND.text, fontSize: "15px", fontWeight: "600", margin: "0 0 2px 0" }}>
              {lawyerName}
            </p>
            <p style={{ color: BRAND.textSecondary, fontSize: "13px", margin: 0 }}>
              Hamilton Bailey Law
            </p>
          </div>
        </td>
      </tr>
      <PremiumFooter unsubscribeUrl={unsubscribeUrl} />
    </PremiumEmailWrapper>
  );
}

export function PostConsultServices({
  customerName,
  relevantServices,
  unsubscribeUrl,
}: {
  customerName: string;
  relevantServices: { name: string; description: string; price?: string }[];
  unsubscribeUrl?: string;
}) {
  return (
    <PremiumEmailWrapper previewText="How Can We Help Further? Your Options">
      <PremiumHeader subtitle="Recommended Services" />
      <tr>
        <td style={{ backgroundColor: BRAND.bgWhite, padding: "45px 35px" }}>
          <h1 style={{
            color: BRAND.text,
            fontSize: "26px",
            fontWeight: "700",
            margin: "0 0 25px 0",
            textAlign: "center",
          }}>
            How Can We Help Further?
          </h1>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 20px 0" }}>
            Hi {customerName},
          </p>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 30px 0" }}>
            Following our recent consultation, I wanted to share some services that may be relevant to your situation:
          </p>

          {/* Services */}
          {relevantServices.map((service, index) => (
            <div
              key={index}
              style={{
                backgroundColor: BRAND.bgLight,
                padding: "24px",
                borderRadius: "16px",
                marginBottom: "15px",
                borderLeft: `4px solid ${BRAND.primary}`,
              }}
            >
              <p style={{ color: BRAND.text, fontSize: "17px", fontWeight: "600", margin: "0 0 8px 0" }}>
                {service.name}
              </p>
              <p style={{ color: BRAND.textSecondary, fontSize: "14px", margin: "0 0 10px 0", lineHeight: "1.6" }}>
                {service.description}
              </p>
              {service.price && (
                <p style={{ color: BRAND.primary, fontSize: "15px", fontWeight: "600", margin: 0 }}>
                  From {service.price}
                </p>
              )}
            </div>
          ))}

          <div style={{ textAlign: "center", margin: "30px 0" }}>
            <PremiumButton href="https://hamiltonbailey.com/services">
              View All Services
            </PremiumButton>
          </div>

          <p style={{ color: BRAND.textMuted, fontSize: "14px", textAlign: "center", margin: 0 }}>
            No pressure at all—just wanted to ensure you have all the information you need.
          </p>
        </td>
      </tr>
      <PremiumFooter unsubscribeUrl={unsubscribeUrl} />
    </PremiumEmailWrapper>
  );
}

// ==========================================
// POST-PURCHASE TEMPLATES
// ==========================================

export function PurchaseGuide({
  customerName,
  documentNames,
  unsubscribeUrl,
}: {
  customerName: string;
  documentNames: string[];
  unsubscribeUrl?: string;
}) {
  return (
    <PremiumEmailWrapper previewText="How to Customize Your Legal Documents">
      <PremiumHeader subtitle="Getting Started Guide" />
      <tr>
        <td style={{ backgroundColor: BRAND.bgWhite, padding: "45px 35px" }}>
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: BRAND.primaryBg,
            }}>
              <span style={{ fontSize: "36px" }}>📄</span>
            </div>
          </div>

          <h1 style={{
            color: BRAND.text,
            fontSize: "26px",
            fontWeight: "700",
            margin: "0 0 25px 0",
            textAlign: "center",
          }}>
            Getting Started with Your Documents
          </h1>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 20px 0" }}>
            Hi {customerName},
          </p>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 30px 0" }}>
            Now that you have your {documentNames.length > 1 ? "documents" : "document"} (<strong>{documentNames.join(", ")}</strong>), here&apos;s how to get the most out of {documentNames.length > 1 ? "them" : "it"}:
          </p>

          {/* Steps */}
          <div style={{ backgroundColor: BRAND.bgLight, borderRadius: "16px", padding: "25px", marginBottom: "25px" }}>
            <p style={{ color: BRAND.text, fontSize: "16px", fontWeight: "600", margin: "0 0 20px 0" }}>
              Step-by-Step Customization:
            </p>
            {[
              { num: "1", title: "Review the Instructions", desc: "Each document includes guidance notes highlighted in yellow" },
              { num: "2", title: "Fill in Your Details", desc: "Replace all [BRACKETED TEXT] with your information" },
              { num: "3", title: "Customize Schedules", desc: "Adjust any schedules or appendices to your specific situation" },
              { num: "4", title: "Review Key Clauses", desc: "Pay special attention to clauses marked as \"Important\"" },
              { num: "5", title: "Get Professional Review", desc: "Consider having us review your completed document" },
            ].map((step) => (
              <div key={step.num} style={{ display: "flex", marginBottom: "15px" }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: BRAND.primary,
                  color: "#FFF",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginRight: "15px",
                }}>{step.num}</span>
                <div>
                  <p style={{ color: BRAND.text, fontSize: "14px", fontWeight: "600", margin: "0 0 4px 0" }}>
                    {step.title}
                  </p>
                  <p style={{ color: BRAND.textSecondary, fontSize: "13px", margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <HighlightBox variant="warning">
            <p style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 6px 0" }}>
              💡 Pro Tip
            </p>
            <p style={{ fontSize: "14px", margin: 0, lineHeight: "1.5" }}>
              Save a copy of the original template before making changes. This way, you can always start fresh if needed.
            </p>
          </HighlightBox>

          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <PremiumButton href="https://hamiltonbailey.com/client-portal">
              Access Your Documents
            </PremiumButton>
          </div>

          <p style={{ color: BRAND.textMuted, fontSize: "14px", textAlign: "center", margin: 0 }}>
            Questions about customization? Reply to this email—we&apos;re here to help!
          </p>
        </td>
      </tr>
      <PremiumFooter unsubscribeUrl={unsubscribeUrl} />
    </PremiumEmailWrapper>
  );
}

export function PurchaseFeedback({
  customerName,
  feedbackUrl,
  unsubscribeUrl,
}: {
  customerName: string;
  feedbackUrl: string;
  unsubscribeUrl?: string;
}) {
  return (
    <PremiumEmailWrapper previewText="Quick Feedback Request - How Did We Do?">
      <PremiumHeader subtitle="Your Feedback Matters" />
      <tr>
        <td style={{ backgroundColor: BRAND.bgWhite, padding: "45px 35px" }}>
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <div style={{ fontSize: "36px" }}>⭐⭐⭐⭐⭐</div>
          </div>

          <h1 style={{
            color: BRAND.text,
            fontSize: "26px",
            fontWeight: "700",
            margin: "0 0 25px 0",
            textAlign: "center",
          }}>
            How Did We Do?
          </h1>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 20px 0" }}>
            Hi {customerName},
          </p>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 25px 0" }}>
            It&apos;s been a couple of weeks since your purchase. We&apos;d love to hear how everything worked out!
          </p>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 30px 0" }}>
            Your feedback helps us improve our documents and service for other medical practitioners like yourself.
          </p>

          <div style={{ textAlign: "center", margin: "35px 0" }}>
            <PremiumButton href={feedbackUrl}>
              Share Your Feedback (2 min)
            </PremiumButton>
          </div>

          <div style={{
            backgroundColor: BRAND.bgLight,
            borderRadius: "16px",
            padding: "20px",
            textAlign: "center",
            marginBottom: "25px",
          }}>
            <p style={{ color: BRAND.textSecondary, fontSize: "14px", margin: 0 }}>
              As a thank you, we&apos;ll send you a <strong style={{ color: BRAND.primary }}>10% discount code</strong> for your next purchase.
            </p>
          </div>

          <p style={{ color: BRAND.textMuted, fontSize: "14px", textAlign: "center", margin: 0 }}>
            Thank you for choosing Hamilton Bailey Law. We truly appreciate your business!
          </p>
        </td>
      </tr>
      <PremiumFooter unsubscribeUrl={unsubscribeUrl} />
    </PremiumEmailWrapper>
  );
}

// ==========================================
// CART ABANDONMENT TEMPLATES
// ==========================================

export function CartReminder({
  customerName,
  cartItems,
  cartTotal,
  cartUrl,
  unsubscribeUrl,
}: {
  customerName?: string;
  cartItems: { name: string; price: number }[];
  cartTotal: number;
  cartUrl: string;
  unsubscribeUrl?: string;
}) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount);

  return (
    <PremiumEmailWrapper previewText="You left something behind - Your cart is waiting">
      <PremiumHeader subtitle="Don't Forget!" />
      <tr>
        <td style={{ backgroundColor: BRAND.bgWhite, padding: "45px 35px" }}>
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#FEF3C7",
            }}>
              <span style={{ fontSize: "36px" }}>🛒</span>
            </div>
          </div>

          <h1 style={{
            color: BRAND.text,
            fontSize: "26px",
            fontWeight: "700",
            margin: "0 0 25px 0",
            textAlign: "center",
          }}>
            You Left Something Behind
          </h1>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 25px 0" }}>
            {customerName ? `Hi ${customerName},` : "Hi there,"}
          </p>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 30px 0" }}>
            We noticed you didn&apos;t complete your purchase. Your cart is still waiting for you:
          </p>

          {/* Cart Items */}
          <div style={{ backgroundColor: BRAND.bgLight, borderRadius: "16px", padding: "25px", marginBottom: "25px" }}>
            {cartItems.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: index < cartItems.length - 1 ? `1px solid ${BRAND.border}` : "none",
                }}
              >
                <span style={{ color: BRAND.text, fontSize: "14px" }}>{item.name}</span>
                <span style={{ color: BRAND.text, fontSize: "14px", fontWeight: "600" }}>{formatCurrency(item.price)}</span>
              </div>
            ))}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "15px",
              marginTop: "10px",
              borderTop: `2px solid ${BRAND.border}`,
            }}>
              <span style={{ color: BRAND.text, fontSize: "16px", fontWeight: "600" }}>Total</span>
              <span style={{ color: BRAND.primary, fontSize: "18px", fontWeight: "700" }}>{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <PremiumButton href={cartUrl}>
              Complete Your Purchase
            </PremiumButton>
          </div>

          <p style={{ color: BRAND.textMuted, fontSize: "14px", textAlign: "center", margin: 0 }}>
            Questions? Simply reply to this email and we&apos;ll be happy to help.
          </p>
        </td>
      </tr>
      <PremiumFooter unsubscribeUrl={unsubscribeUrl} />
    </PremiumEmailWrapper>
  );
}

export function CartSocialProof({
  customerName,
  cartUrl,
  unsubscribeUrl,
}: {
  customerName?: string;
  cartUrl: string;
  unsubscribeUrl?: string;
}) {
  const testimonials = [
    { name: "Dr. Sarah M.", role: "GP Practice Owner", quote: "The Tenant Doctor Agreement saved us hours of legal fees and potential disputes." },
    { name: "Dr. James L.", role: "Specialist", quote: "Professional, comprehensive documents. Exactly what my practice needed." },
  ];

  return (
    <PremiumEmailWrapper previewText="Still thinking about it? Here's why our clients trust us">
      <PremiumHeader subtitle="What Others Say" />
      <tr>
        <td style={{ backgroundColor: BRAND.bgWhite, padding: "45px 35px" }}>
          <h1 style={{
            color: BRAND.text,
            fontSize: "26px",
            fontWeight: "700",
            margin: "0 0 25px 0",
            textAlign: "center",
          }}>
            Still Thinking About It?
          </h1>

          <p style={{ color: BRAND.textSecondary, fontSize: "16px", lineHeight: "1.7", margin: "0 0 30px 0" }}>
            {customerName ? `Hi ${customerName},` : "Hi there,"}
            {" "}We understand that legal documents are an important decision. Here&apos;s what other medical practitioners say about working with us:
          </p>

          {/* Testimonials */}
          {testimonials.map((t, index) => (
            <div
              key={index}
              style={{
                backgroundColor: BRAND.bgLight,
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "15px",
              }}
            >
              <p style={{ color: BRAND.text, fontSize: "15px", fontStyle: "italic", margin: "0 0 15px 0", lineHeight: "1.6" }}>
                &quot;{t.quote}&quot;
              </p>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: BRAND.primaryBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "12px",
                }}>
                  <span style={{ fontSize: "18px" }}>👨‍⚕️</span>
                </div>
                <div>
                  <p style={{ color: BRAND.text, fontSize: "14px", fontWeight: "600", margin: 0 }}>{t.name}</p>
                  <p style={{ color: BRAND.textMuted, fontSize: "13px", margin: 0 }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Trust Badges */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            margin: "30px 0",
            padding: "20px",
            backgroundColor: BRAND.bgLight,
            borderRadius: "12px",
          }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: BRAND.primary, fontSize: "24px", fontWeight: "700", margin: 0 }}>500+</p>
              <p style={{ color: BRAND.textMuted, fontSize: "12px", margin: 0 }}>Practices Served</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: BRAND.primary, fontSize: "24px", fontWeight: "700", margin: 0 }}>14+</p>
              <p style={{ color: BRAND.textMuted, fontSize: "12px", margin: 0 }}>Years Experience</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: BRAND.primary, fontSize: "24px", fontWeight: "700", margin: 0 }}>4.9</p>
              <p style={{ color: BRAND.textMuted, fontSize: "12px", margin: 0 }}>Client Rating</p>
            </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <PremiumButton href={cartUrl}>
              Complete Your Purchase
            </PremiumButton>
          </div>

          <p style={{ color: BRAND.textMuted, fontSize: "14px", textAlign: "center", margin: 0 }}>
            Still have questions? Reply to this email—we&apos;re here to help.
          </p>
        </td>
      </tr>
      <PremiumFooter unsubscribeUrl={unsubscribeUrl} />
    </PremiumEmailWrapper>
  );
}

// Template registry for dynamic rendering
export const sequenceTemplates: Record<string, React.ComponentType<Record<string, unknown>>> = {
  // Welcome series
  welcome_1_intro: WelcomeEmail1Intro as React.ComponentType<Record<string, unknown>>,
  welcome_2_value: WelcomeEmail2Value as React.ComponentType<Record<string, unknown>>,
  welcome_3_resource: WelcomeEmail3Resource as React.ComponentType<Record<string, unknown>>,
  welcome_4_cta: WelcomeEmail4CTA as React.ComponentType<Record<string, unknown>>,

  // Booking reminders
  reminder_24hr: BookingReminder24Hr as React.ComponentType<Record<string, unknown>>,
  reminder_1hr: BookingReminder1Hr as React.ComponentType<Record<string, unknown>>,

  // Post-consultation
  post_consult_1_thanks: PostConsultThanks as React.ComponentType<Record<string, unknown>>,
  post_consult_3_services: PostConsultServices as React.ComponentType<Record<string, unknown>>,

  // Post-purchase
  purchase_2_guide: PurchaseGuide as React.ComponentType<Record<string, unknown>>,
  purchase_5_feedback: PurchaseFeedback as React.ComponentType<Record<string, unknown>>,

  // Cart abandonment
  cart_1_reminder: CartReminder as React.ComponentType<Record<string, unknown>>,
  cart_2_social_proof: CartSocialProof as React.ComponentType<Record<string, unknown>>,
};
