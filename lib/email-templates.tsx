import * as React from "react";

// Base email wrapper with consistent styling
interface EmailWrapperProps {
  children: React.ReactNode;
  previewText?: string;
}

export function EmailWrapper({ children, previewText }: EmailWrapperProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <title>Hamilton Bailey Law</title>
        {previewText && (
          <meta name="description" content={previewText} />
        )}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
              body { margin: 0; padding: 0; background-color: #f9fafb; }
              .email-container { max-width: 600px; margin: 0 auto; }
            `,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f9fafb", fontFamily: "'Montserrat', Arial, sans-serif" }}>
        <table
          role="presentation"
          cellPadding="0"
          cellSpacing="0"
          style={{ width: "100%", backgroundColor: "#f9fafb" }}
        >
          <tr>
            <td style={{ padding: "40px 20px" }}>
              <table
                role="presentation"
                cellPadding="0"
                cellSpacing="0"
                style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}
              >
                {children}
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

// Header component
function EmailHeader() {
  return (
    <tr>
      <td
        style={{
          backgroundColor: "#2AAFA2",
          padding: "30px",
          borderRadius: "12px 12px 0 0",
          textAlign: "center",
        }}
      >
        <img
          src="https://hamiltonbailey.com/images/hb-logo-white.png"
          alt="Hamilton Bailey Law"
          style={{ height: "40px", width: "auto" }}
        />
      </td>
    </tr>
  );
}

// Footer component
function EmailFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <tr>
      <td
        style={{
          backgroundColor: "#1f2937",
          padding: "30px",
          borderRadius: "0 0 12px 12px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#9ca3af", fontSize: "14px", margin: "0 0 15px 0" }}>
          Hamilton Bailey Law Firm
        </p>
        <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 10px 0" }}>
          Level 1, 123 King William Street, Adelaide SA 5000
        </p>
        <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 15px 0" }}>
          Phone: (08) 8212 8585 | Email: enquiries@hamiltonbailey.com
        </p>
        <div style={{ borderTop: "1px solid #374151", paddingTop: "15px", marginTop: "15px" }}>
          <p style={{ color: "#6b7280", fontSize: "11px", margin: 0 }}>
            &copy; {currentYear} Hamilton Bailey Law Firm. All rights reserved.
          </p>
          <p style={{ color: "#6b7280", fontSize: "11px", margin: "10px 0 0 0" }}>
            <a href="https://hamiltonbailey.com/privacy-policy" style={{ color: "#2AAFA2", textDecoration: "none" }}>
              Privacy Policy
            </a>
            {" | "}
            <a href="https://hamiltonbailey.com/terms" style={{ color: "#2AAFA2", textDecoration: "none" }}>
              Terms of Service
            </a>
            {" | "}
            <a href="{{unsubscribe_url}}" style={{ color: "#2AAFA2", textDecoration: "none" }}>
              Unsubscribe
            </a>
          </p>
        </div>
      </td>
    </tr>
  );
}

// Button component
interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function EmailButton({ href, children, variant = "primary" }: EmailButtonProps) {
  const styles =
    variant === "primary"
      ? { backgroundColor: "#2AAFA2", color: "#ffffff" }
      : { backgroundColor: "#f3f4f6", color: "#374151" };

  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        padding: "14px 28px",
        borderRadius: "8px",
        textDecoration: "none",
        fontWeight: "600",
        fontSize: "14px",
        ...styles,
      }}
    >
      {children}
    </a>
  );
}

// Booking Confirmation Email
interface BookingConfirmationProps {
  customerName: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: string;
  meetingLink?: string;
  meetingAddress?: string;
  confirmationNumber: string;
}

export function BookingConfirmationEmail({
  customerName,
  appointmentDate,
  appointmentTime,
  consultationType,
  meetingLink,
  meetingAddress,
  confirmationNumber,
}: BookingConfirmationProps) {
  return (
    <EmailWrapper previewText={`Your consultation on ${appointmentDate} is confirmed`}>
      <EmailHeader />
      <tr>
        <td
          style={{
            backgroundColor: "#ffffff",
            padding: "40px 30px",
          }}
        >
          <h1
            style={{
              color: "#111827",
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 20px 0",
              textAlign: "center",
            }}
          >
            Booking Confirmed
          </h1>

          <p style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.6", margin: "0 0 25px 0" }}>
            Dear {customerName},
          </p>

          <p style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.6", margin: "0 0 25px 0" }}>
            Your consultation has been successfully booked. Here are your appointment details:
          </p>

          {/* Appointment Details Card */}
          <table
            role="presentation"
            cellPadding="0"
            cellSpacing="0"
            style={{
              width: "100%",
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              marginBottom: "25px",
            }}
          >
            <tr>
              <td style={{ padding: "20px" }}>
                <table role="presentation" cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
                  <tr>
                    <td style={{ paddingBottom: "15px" }}>
                      <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 5px 0", textTransform: "uppercase" }}>
                        Confirmation Number
                      </p>
                      <p style={{ color: "#111827", fontSize: "16px", fontWeight: "600", margin: 0 }}>
                        {confirmationNumber}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: "15px" }}>
                      <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 5px 0", textTransform: "uppercase" }}>
                        Consultation Type
                      </p>
                      <p style={{ color: "#111827", fontSize: "16px", fontWeight: "600", margin: 0 }}>
                        {consultationType}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: "15px" }}>
                      <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 5px 0", textTransform: "uppercase" }}>
                        Date & Time
                      </p>
                      <p style={{ color: "#111827", fontSize: "16px", fontWeight: "600", margin: 0 }}>
                        {appointmentDate} at {appointmentTime}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 5px 0", textTransform: "uppercase" }}>
                        {meetingLink ? "Meeting Link" : "Location"}
                      </p>
                      {meetingLink ? (
                        <a href={meetingLink} style={{ color: "#2AAFA2", fontSize: "16px", fontWeight: "600", textDecoration: "none" }}>
                          Join Video Call
                        </a>
                      ) : (
                        <p style={{ color: "#111827", fontSize: "16px", fontWeight: "600", margin: 0 }}>
                          {meetingAddress}
                        </p>
                      )}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <EmailButton href="https://hamiltonbailey.com/client-portal">
              View Booking Details
            </EmailButton>
          </div>

          <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.6", margin: "0 0 15px 0" }}>
            <strong>Before your appointment:</strong>
          </p>
          <ul style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.8", margin: "0 0 25px 0", paddingLeft: "20px" }}>
            <li>Gather any relevant documents or correspondence</li>
            <li>Prepare a list of questions you&apos;d like to discuss</li>
            <li>Test your video/audio if joining via video call</li>
          </ul>

          <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
            If you need to reschedule or cancel, please contact us at least 24 hours in advance.
          </p>
        </td>
      </tr>
      <EmailFooter />
    </EmailWrapper>
  );
}

// Document Purchase Email
interface DocumentPurchaseProps {
  customerName: string;
  orderNumber: string;
  documents: { name: string; price: number }[];
  totalAmount: number;
  downloadLinks: { name: string; url: string }[];
}

export function DocumentPurchaseEmail({
  customerName,
  orderNumber,
  documents,
  totalAmount,
  downloadLinks,
}: DocumentPurchaseProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount);

  return (
    <EmailWrapper previewText={`Your document purchase - Order #${orderNumber}`}>
      <EmailHeader />
      <tr>
        <td style={{ backgroundColor: "#ffffff", padding: "40px 30px" }}>
          <h1
            style={{
              color: "#111827",
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 20px 0",
              textAlign: "center",
            }}
          >
            Thank You for Your Purchase
          </h1>

          <p style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.6", margin: "0 0 25px 0" }}>
            Dear {customerName},
          </p>

          <p style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.6", margin: "0 0 25px 0" }}>
            Your document purchase has been completed successfully. Your order number is{" "}
            <strong>{orderNumber}</strong>.
          </p>

          {/* Order Summary */}
          <table
            role="presentation"
            cellPadding="0"
            cellSpacing="0"
            style={{
              width: "100%",
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              marginBottom: "25px",
            }}
          >
            <tr>
              <td style={{ padding: "20px" }}>
                <p style={{ color: "#111827", fontSize: "16px", fontWeight: "600", margin: "0 0 15px 0" }}>
                  Order Summary
                </p>
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: index < documents.length - 1 ? "1px solid #e5e7eb" : "none",
                      paddingBottom: index < documents.length - 1 ? "10px" : 0,
                      marginBottom: index < documents.length - 1 ? "10px" : 0,
                    }}
                  >
                    <span style={{ color: "#4b5563", fontSize: "14px" }}>{doc.name}</span>
                    <span style={{ color: "#111827", fontSize: "14px", fontWeight: "500" }}>
                      {formatCurrency(doc.price)}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "2px solid #e5e7eb",
                    paddingTop: "15px",
                    marginTop: "15px",
                  }}
                >
                  <span style={{ color: "#111827", fontSize: "16px", fontWeight: "600" }}>Total</span>
                  <span style={{ color: "#2AAFA2", fontSize: "16px", fontWeight: "700" }}>
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </td>
            </tr>
          </table>

          {/* Download Links */}
          <p style={{ color: "#111827", fontSize: "16px", fontWeight: "600", margin: "0 0 15px 0" }}>
            Download Your Documents
          </p>
          <table
            role="presentation"
            cellPadding="0"
            cellSpacing="0"
            style={{ width: "100%", marginBottom: "25px" }}
          >
            {downloadLinks.map((link, index) => (
              <tr key={index}>
                <td
                  style={{
                    backgroundColor: "#f9fafb",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "10px",
                  }}
                >
                  <a
                    href={link.url}
                    style={{
                      color: "#2AAFA2",
                      fontSize: "14px",
                      fontWeight: "500",
                      textDecoration: "none",
                    }}
                  >
                    📄 {link.name}
                  </a>
                </td>
              </tr>
            ))}
          </table>

          <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
            Your download links will expire in 30 days. Please save your documents to a secure location.
            If you have any questions about using these documents, don&apos;t hesitate to contact us.
          </p>
        </td>
      </tr>
      <EmailFooter />
    </EmailWrapper>
  );
}

// Newsletter Welcome Email
interface NewsletterWelcomeProps {
  subscriberName?: string;
}

export function NewsletterWelcomeEmail({ subscriberName }: NewsletterWelcomeProps) {
  return (
    <EmailWrapper previewText="Welcome to Hamilton Bailey Law Newsletter">
      <EmailHeader />
      <tr>
        <td style={{ backgroundColor: "#ffffff", padding: "40px 30px" }}>
          <h1
            style={{
              color: "#111827",
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 20px 0",
              textAlign: "center",
            }}
          >
            Welcome to Our Newsletter
          </h1>

          <p style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.6", margin: "0 0 25px 0" }}>
            {subscriberName ? `Dear ${subscriberName},` : "Hello,"}
          </p>

          <p style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.6", margin: "0 0 25px 0" }}>
            Thank you for subscribing to the Hamilton Bailey Law newsletter. You&apos;ll now receive:
          </p>

          <ul style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.8", margin: "0 0 25px 0", paddingLeft: "20px" }}>
            <li>Expert legal insights for medical practitioners</li>
            <li>Updates on healthcare regulations and compliance</li>
            <li>Industry news and best practices</li>
            <li>Exclusive subscriber offers and resources</li>
          </ul>

          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <EmailButton href="https://hamiltonbailey.com/resources">
              Browse Our Resources
            </EmailButton>
          </div>

          <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
            If you have any questions, feel free to reach out to us at{" "}
            <a href="mailto:enquiries@hamiltonbailey.com" style={{ color: "#2AAFA2", textDecoration: "none" }}>
              enquiries@hamiltonbailey.com
            </a>
          </p>
        </td>
      </tr>
      <EmailFooter />
    </EmailWrapper>
  );
}

// Contact Form Notification (for admin)
interface ContactFormNotificationProps {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export function ContactFormNotificationEmail({
  name,
  email,
  phone,
  subject,
  message,
  submittedAt,
}: ContactFormNotificationProps) {
  return (
    <EmailWrapper previewText={`New contact form submission from ${name}`}>
      <EmailHeader />
      <tr>
        <td style={{ backgroundColor: "#ffffff", padding: "40px 30px" }}>
          <h1
            style={{
              color: "#111827",
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 20px 0",
              textAlign: "center",
            }}
          >
            New Contact Form Submission
          </h1>

          <table
            role="presentation"
            cellPadding="0"
            cellSpacing="0"
            style={{
              width: "100%",
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              marginBottom: "25px",
            }}
          >
            <tr>
              <td style={{ padding: "20px" }}>
                <table role="presentation" cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
                  <tr>
                    <td style={{ paddingBottom: "15px" }}>
                      <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 5px 0", textTransform: "uppercase" }}>
                        From
                      </p>
                      <p style={{ color: "#111827", fontSize: "16px", fontWeight: "600", margin: 0 }}>
                        {name}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: "15px" }}>
                      <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 5px 0", textTransform: "uppercase" }}>
                        Email
                      </p>
                      <a href={`mailto:${email}`} style={{ color: "#2AAFA2", fontSize: "16px", textDecoration: "none" }}>
                        {email}
                      </a>
                    </td>
                  </tr>
                  {phone && (
                    <tr>
                      <td style={{ paddingBottom: "15px" }}>
                        <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 5px 0", textTransform: "uppercase" }}>
                          Phone
                        </p>
                        <p style={{ color: "#111827", fontSize: "16px", margin: 0 }}>{phone}</p>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ paddingBottom: "15px" }}>
                      <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 5px 0", textTransform: "uppercase" }}>
                        Subject
                      </p>
                      <p style={{ color: "#111827", fontSize: "16px", fontWeight: "600", margin: 0 }}>
                        {subject}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: "15px" }}>
                      <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 5px 0", textTransform: "uppercase" }}>
                        Message
                      </p>
                      <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.6", margin: 0, whiteSpace: "pre-wrap" }}>
                        {message}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 5px 0", textTransform: "uppercase" }}>
                        Submitted At
                      </p>
                      <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>{submittedAt}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <div style={{ textAlign: "center" }}>
            <EmailButton href={`mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`}>
              Reply to {name}
            </EmailButton>
          </div>
        </td>
      </tr>
      <EmailFooter />
    </EmailWrapper>
  );
}

// ============================================================================
// Cart Recovery Email Templates
// 3-email sequence for abandoned cart recovery
// ============================================================================

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartRecoveryBaseProps {
  customerName?: string;
  cartItems: CartItem[];
  cartTotal: number;
  recoveryUrl: string;
}

// Email 1: "You left something behind" (sent after 1 hour)
interface CartRecoveryEmail1Props extends CartRecoveryBaseProps {}

export function CartRecoveryEmail1({
  customerName,
  cartItems,
  cartTotal,
  recoveryUrl,
}: CartRecoveryEmail1Props) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount);

  return (
    <EmailWrapper previewText="You left some items in your cart">
      <EmailHeader />
      <tr>
        <td style={{ backgroundColor: "#ffffff", padding: "40px 30px" }}>
          <h1
            style={{
              color: "#111827",
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 20px 0",
              textAlign: "center",
            }}
          >
            You Left Something Behind
          </h1>

          <p style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.6", margin: "0 0 25px 0" }}>
            {customerName ? `Hi ${customerName},` : "Hi there,"}
          </p>

          <p style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.6", margin: "0 0 25px 0" }}>
            We noticed you left some items in your cart. Don't worry, we've saved them for you!
          </p>

          {/* Cart Items */}
          <table
            role="presentation"
            cellPadding="0"
            cellSpacing="0"
            style={{
              width: "100%",
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              marginBottom: "25px",
            }}
          >
            <tr>
              <td style={{ padding: "20px" }}>
                <p style={{ color: "#111827", fontSize: "16px", fontWeight: "600", margin: "0 0 15px 0" }}>
                  Your Cart
                </p>
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: index < cartItems.length - 1 ? "1px solid #e5e7eb" : "none",
                      paddingBottom: index < cartItems.length - 1 ? "12px" : 0,
                      marginBottom: index < cartItems.length - 1 ? "12px" : 0,
                    }}
                  >
                    <div>
                      <p style={{ color: "#111827", fontSize: "14px", fontWeight: "500", margin: 0 }}>
                        {item.name}
                      </p>
                      <p style={{ color: "#6b7280", fontSize: "12px", margin: "4px 0 0 0" }}>
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span style={{ color: "#111827", fontSize: "14px", fontWeight: "600" }}>
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    borderTop: "2px solid #e5e7eb",
                    paddingTop: "15px",
                    marginTop: "15px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: "#111827", fontSize: "16px", fontWeight: "700" }}>Total</span>
                  <span style={{ color: "#2AAFA2", fontSize: "18px", fontWeight: "700" }}>
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
              </td>
            </tr>
          </table>

          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <EmailButton href={recoveryUrl}>Complete Your Purchase</EmailButton>
          </div>

          <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6", margin: 0, textAlign: "center" }}>
            Your cart will be saved for the next 7 days.
          </p>
        </td>
      </tr>
      <EmailFooter />
    </EmailWrapper>
  );
}

// Email 2: "Still thinking it over?" (sent after 24 hours)
interface CartRecoveryEmail2Props extends CartRecoveryBaseProps {
  testimonial?: {
    quote: string;
    author: string;
    role?: string;
  };
}

export function CartRecoveryEmail2({
  customerName,
  cartItems,
  cartTotal,
  recoveryUrl,
  testimonial = {
    quote: "The Tenant Doctor Agreement saved me hours of work and gave me peace of mind. Highly recommend!",
    author: "Dr. Sarah Mitchell",
    role: "GP, Melbourne",
  },
}: CartRecoveryEmail2Props) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount);

  return (
    <EmailWrapper previewText="Still thinking about your purchase?">
      <EmailHeader />
      <tr>
        <td style={{ backgroundColor: "#ffffff", padding: "40px 30px" }}>
          <h1
            style={{
              color: "#111827",
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 20px 0",
              textAlign: "center",
            }}
          >
            Still Thinking It Over?
          </h1>

          <p style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.6", margin: "0 0 25px 0" }}>
            {customerName ? `Hi ${customerName},` : "Hi there,"}
          </p>

          <p style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.6", margin: "0 0 25px 0" }}>
            We understand choosing the right legal documents is an important decision. That's why over 700 medical
            professionals trust Hamilton Bailey Law.
          </p>

          {/* Social Proof Stats */}
          <table
            role="presentation"
            cellPadding="0"
            cellSpacing="0"
            style={{
              width: "100%",
              marginBottom: "25px",
            }}
          >
            <tr>
              <td
                style={{
                  backgroundColor: "#f0fdfa",
                  padding: "20px",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <table role="presentation" cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
                  <tr>
                    <td style={{ width: "33%", textAlign: "center" }}>
                      <p style={{ color: "#2AAFA2", fontSize: "24px", fontWeight: "700", margin: 0 }}>700+</p>
                      <p style={{ color: "#6b7280", fontSize: "12px", margin: "5px 0 0 0" }}>Clients served</p>
                    </td>
                    <td style={{ width: "33%", textAlign: "center" }}>
                      <p style={{ color: "#2AAFA2", fontSize: "24px", fontWeight: "700", margin: 0 }}>98%</p>
                      <p style={{ color: "#6b7280", fontSize: "12px", margin: "5px 0 0 0" }}>Satisfaction</p>
                    </td>
                    <td style={{ width: "33%", textAlign: "center" }}>
                      <p style={{ color: "#2AAFA2", fontSize: "24px", fontWeight: "700", margin: 0 }}>14+</p>
                      <p style={{ color: "#6b7280", fontSize: "12px", margin: "5px 0 0 0" }}>Years experience</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          {/* Testimonial */}
          <table
            role="presentation"
            cellPadding="0"
            cellSpacing="0"
            style={{
              width: "100%",
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              marginBottom: "25px",
            }}
          >
            <tr>
              <td style={{ padding: "25px" }}>
                <p style={{ color: "#374151", fontSize: "16px", fontStyle: "italic", lineHeight: "1.6", margin: "0 0 15px 0" }}>
                  "{testimonial.quote}"
                </p>
                <p style={{ color: "#111827", fontSize: "14px", fontWeight: "600", margin: 0 }}>
                  — {testimonial.author}
                </p>
                {testimonial.role && (
                  <p style={{ color: "#6b7280", fontSize: "12px", margin: "4px 0 0 0" }}>{testimonial.role}</p>
                )}
              </td>
            </tr>
          </table>

          {/* Cart Summary */}
          <p style={{ color: "#111827", fontSize: "16px", fontWeight: "600", margin: "0 0 15px 0" }}>
            Your saved items ({cartItems.length}):
          </p>
          <ul style={{ color: "#4b5563", fontSize: "14px", margin: "0 0 20px 0", paddingLeft: "20px" }}>
            {cartItems.map((item) => (
              <li key={item.id} style={{ marginBottom: "8px" }}>
                {item.name} - {formatCurrency(item.price)}
              </li>
            ))}
          </ul>

          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <EmailButton href={recoveryUrl}>Return to Your Cart</EmailButton>
          </div>

          <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6", margin: 0, textAlign: "center" }}>
            Have questions? Reply to this email or call us at (08) 8212 8585.
          </p>
        </td>
      </tr>
      <EmailFooter />
    </EmailWrapper>
  );
}

// Email 3: "Last chance + discount" (sent after 72 hours)
interface CartRecoveryEmail3Props extends CartRecoveryBaseProps {
  discountCode: string;
  discountPercent: number;
  expiresIn: string;
}

export function CartRecoveryEmail3({
  customerName,
  cartItems,
  cartTotal,
  recoveryUrl,
  discountCode,
  discountPercent,
  expiresIn = "48 hours",
}: CartRecoveryEmail3Props) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount);

  const discountedTotal = cartTotal * (1 - discountPercent / 100);

  return (
    <EmailWrapper previewText={`Last chance: ${discountPercent}% off your cart!`}>
      <EmailHeader />
      <tr>
        <td style={{ backgroundColor: "#ffffff", padding: "40px 30px" }}>
          {/* Urgency Banner */}
          <table
            role="presentation"
            cellPadding="0"
            cellSpacing="0"
            style={{
              width: "100%",
              backgroundColor: "#fef3c7",
              borderRadius: "8px",
              marginBottom: "25px",
            }}
          >
            <tr>
              <td style={{ padding: "12px 20px", textAlign: "center" }}>
                <p style={{ color: "#92400e", fontSize: "14px", fontWeight: "600", margin: 0 }}>
                  ⏰ Your {discountPercent}% discount expires in {expiresIn}
                </p>
              </td>
            </tr>
          </table>

          <h1
            style={{
              color: "#111827",
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 20px 0",
              textAlign: "center",
            }}
          >
            Last Chance: {discountPercent}% Off Your Order
          </h1>

          <p style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.6", margin: "0 0 25px 0" }}>
            {customerName ? `Hi ${customerName},` : "Hi there,"}
          </p>

          <p style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.6", margin: "0 0 25px 0" }}>
            We really don't want you to miss out on the documents you were interested in. As a final thank you for
            considering Hamilton Bailey Law, here's an exclusive <strong>{discountPercent}% discount</strong> on your cart.
          </p>

          {/* Discount Code Box */}
          <table
            role="presentation"
            cellPadding="0"
            cellSpacing="0"
            style={{
              width: "100%",
              backgroundColor: "#f0fdf4",
              border: "2px dashed #22c55e",
              borderRadius: "12px",
              marginBottom: "25px",
            }}
          >
            <tr>
              <td style={{ padding: "25px", textAlign: "center" }}>
                <p style={{ color: "#166534", fontSize: "14px", fontWeight: "500", margin: "0 0 10px 0" }}>
                  Use this code at checkout:
                </p>
                <p
                  style={{
                    color: "#166534",
                    fontSize: "28px",
                    fontWeight: "700",
                    fontFamily: "monospace",
                    letterSpacing: "2px",
                    margin: "0 0 10px 0",
                  }}
                >
                  {discountCode}
                </p>
                <p style={{ color: "#15803d", fontSize: "14px", margin: 0 }}>
                  Save {formatCurrency(cartTotal - discountedTotal)}!
                </p>
              </td>
            </tr>
          </table>

          {/* Cart Summary with Discount */}
          <table
            role="presentation"
            cellPadding="0"
            cellSpacing="0"
            style={{
              width: "100%",
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              marginBottom: "25px",
            }}
          >
            <tr>
              <td style={{ padding: "20px" }}>
                <p style={{ color: "#111827", fontSize: "16px", fontWeight: "600", margin: "0 0 15px 0" }}>
                  Your Cart Summary
                </p>
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: index < cartItems.length - 1 ? "10px" : 0,
                    }}
                  >
                    <span style={{ color: "#4b5563", fontSize: "14px" }}>{item.name}</span>
                    <span style={{ color: "#111827", fontSize: "14px" }}>{formatCurrency(item.price)}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "15px", marginTop: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "#6b7280", fontSize: "14px" }}>Subtotal</span>
                    <span style={{ color: "#6b7280", fontSize: "14px", textDecoration: "line-through" }}>
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "#22c55e", fontSize: "14px", fontWeight: "600" }}>
                      Discount ({discountPercent}%)
                    </span>
                    <span style={{ color: "#22c55e", fontSize: "14px", fontWeight: "600" }}>
                      -{formatCurrency(cartTotal - discountedTotal)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#111827", fontSize: "18px", fontWeight: "700" }}>Your Price</span>
                    <span style={{ color: "#2AAFA2", fontSize: "20px", fontWeight: "700" }}>
                      {formatCurrency(discountedTotal)}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <EmailButton href={`${recoveryUrl}?discount=${discountCode}`}>
              Claim Your {discountPercent}% Discount
            </EmailButton>
          </div>

          <p style={{ color: "#6b7280", fontSize: "13px", lineHeight: "1.6", margin: 0, textAlign: "center" }}>
            This exclusive offer expires in {expiresIn}. Don't miss out!
          </p>
        </td>
      </tr>
      <EmailFooter />
    </EmailWrapper>
  );
}

// Export all templates
export const emailTemplates = {
  bookingConfirmation: BookingConfirmationEmail,
  documentPurchase: DocumentPurchaseEmail,
  newsletterWelcome: NewsletterWelcomeEmail,
  contactFormNotification: ContactFormNotificationEmail,
  cartRecovery1: CartRecoveryEmail1,
  cartRecovery2: CartRecoveryEmail2,
  cartRecovery3: CartRecoveryEmail3,
};
