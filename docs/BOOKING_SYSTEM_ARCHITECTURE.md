# Booking System Architecture

## Overview

This document describes the booking system architecture used in the Hamilton Bailey Legal application with payment-gated workflow and compliance retention.

## System Summary

**`advanced_bookings`** - Production booking system with Stripe payment integration, Google Calendar sync, and availability slots.

---

## Booking System: `advanced_bookings`

### Purpose
This is the production booking system with full payment integration, calendar sync, and automated communications.

### Features
- Stripe payment integration (payment-gated workflow)
- Google Calendar sync with Google Meet links
- Availability slot management
- Automated confirmation emails (post-payment only)
- Event type configuration
- Booking status tracking

### Schema Fields
```typescript
{
  id: string;                    // Primary key
  client_name: string;           // Customer name
  client_email: string;          // Customer email (lookup key)
  client_phone: string | null;   // Customer phone
  event_type_id: string | null;  // Reference to event types
  event_type_name: string;       // Event type display name
  start_time: string;            // Booking start datetime
  end_time: string;              // Booking end datetime
  status: booking_status;        // pending_payment, confirmed, cancelled, etc.
  notes: string | null;          // Customer notes
  custom_answers: Json | null;   // Custom form responses
  google_event_id: string | null;      // Calendar event reference
  google_meet_link: string | null;     // Video call link
  stripe_payment_intent_id: string | null;  // Payment reference
  cancellation_reason: string | null;  // If cancelled
  created_at: string;
  updated_at: string;
}
```

### Payment-Gated Workflow

```
User Form Submission
        |
        v
+-------------------+
| Create Booking    |  Status: "pending_payment"
| (NO side effects) |  NO emails, NO calendar events
+-------------------+
        |
        v
+-------------------+
| Stripe Checkout   |  User redirected to payment
+-------------------+
        |
        v
+-------------------+
| Payment Complete  |  Stripe processes payment
+-------------------+
        |
        v
+-------------------+
| Stripe Webhook    |  checkout.session.completed
+-------------------+
        |
        v
+-------------------+
| Confirm Booking   |  Status: "confirmed"
| (ALL side effects)|  Create calendar, send emails
+-------------------+
```

### File Locations

| File | Purpose |
|------|---------|
| `/app/api/booking/route.ts` | Create pending bookings |
| `/app/api/webhooks/stripe/route.ts` | Payment confirmation & side effects |
| `/app/booking/page.tsx` | Booking form UI |

### Usage Rules
- ALL bookings go to `advanced_bookings`
- Status starts as `pending_payment`
- Side effects (emails, calendar) ONLY after Stripe webhook confirms payment
- NEVER send confirmation emails on form submission

---

## Data Retention & Compliance

### Australian Legal Requirements
Australian Tax Office (ATO) requires financial and booking records to be retained for **7 years** from the date of the transaction.

### GDPR Compliance

#### Right to Data Portability (Article 20)
Users can export their booking data:
- File: `/app/api/user/export-data/route.ts`
- Includes all `advanced_bookings` records

#### Right to Erasure (Article 17)
Users can request deletion, but records with legal retention requirements are **anonymized** rather than deleted:
- Name set to `[DELETED]`
- Email set to `[DELETED]`
- Phone set to `null`
- Notes set to `null`
- Financial reference data (amounts, dates, status) retained

### Anonymization Pattern

```typescript
// User-initiated deletion (GDPR request)
await supabase
  .from("advanced_bookings")
  .update({
    client_name: "[DELETED]",
    client_email: "[DELETED]",
    client_phone: null,
    notes: null,
  })
  .eq("client_email", userEmail);

// Admin-initiated deletion
await supabase
  .from("advanced_bookings")
  .update({
    client_name: "[DELETED BY ADMIN]",
    client_email: "[DELETED BY ADMIN]",
    client_phone: null,
    notes: null,
  })
  .eq("client_email", userEmail);
```

---

## Developer Guidelines

### DO

- Use `advanced_bookings` for ALL booking functionality
- Follow payment-gated workflow (no side effects until payment confirmed)
- Anonymize booking records during user deletion (never delete)
- Include bookings in GDPR data export
- Reference this document in code comments

### DON'T

- Delete records from booking table (violates 7-year retention)
- Send confirmation emails on form submission
- Create calendar events before payment confirmation
- Trust success URL redirects (only trust webhooks)

### Code Examples

#### Creating a New Booking (Correct)
```typescript
// POST /app/api/booking
const { data } = await supabase
  .from("advanced_bookings")
  .insert({
    client_name: name,
    client_email: email.toLowerCase(),
    start_time: startTime,
    status: "pending_payment",  // NOT "confirmed"
  })
  .select()
  .single();

// Return booking ID for Stripe, NO emails sent
```

#### Confirming After Payment (Correct)
```typescript
// Stripe webhook handler only
if (event.type === "checkout.session.completed") {
  // Update status
  await supabase
    .from("advanced_bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId);

  // NOW send emails and create calendar
  await createCalendarEvent(bookingId);
  await sendConfirmationEmail(bookingId);
}
```

#### User Data Deletion (Correct)
```typescript
// Anonymize, don't delete
await supabase
  .from("advanced_bookings")
  .update({
    client_name: "[DELETED]",
    client_email: "[DELETED]",
    client_phone: null,
    notes: null,
  })
  .eq("client_email", userEmail);
```

---

## Troubleshooting

### "Confirmation email sent before payment"
This is a bug. Check that emails are ONLY sent in the Stripe webhook handler, not in the booking form submission endpoint.

### "User wants their booking deleted, but I can't delete it"
You cannot delete booking records due to 7-year retention. Instead, anonymize the PII fields using the patterns in [Anonymization Pattern](#anonymization-pattern).

---

## Related Documentation

- `CLAUDE.md` Section 11: Stripe Payment-Gated Workflows
- `/lib/supabase/types.ts`: Type definitions with ACTIVE marker
- `/app/api/user/delete-data/route.ts`: GDPR deletion implementation
- `/app/api/user/export-data/route.ts`: GDPR export implementation

---

*Last Updated: 2025-12-15*
