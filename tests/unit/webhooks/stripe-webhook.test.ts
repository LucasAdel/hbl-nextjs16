/**
 * Stripe Webhook Handler Tests
 *
 * Critical tests for payment processing to ensure:
 * 1. Webhook signature verification
 * 2. Idempotency (no duplicate processing)
 * 3. Payment status validation before side effects
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the dependencies before importing the route
vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => ({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ data: null, error: null })),
      })),
    })),
  })),
}))

vi.mock('@/lib/webhooks/idempotency', () => ({
  processWebhookIdempotent: vi.fn(),
}))

vi.mock('@/lib/notifications/notification-triggers', () => ({
  notifyPaymentReceived: vi.fn(),
  notifyDocumentPurchased: vi.fn(),
  notifyXPEarned: vi.fn(),
  notifyAchievementUnlocked: vi.fn(),
}))

vi.mock('@/lib/google-calendar', () => ({
  createCalendarEvent: vi.fn(() => ({
    success: true,
    eventId: 'test-event-id',
    eventData: { hangoutLink: 'https://meet.google.com/test' },
  })),
}))

vi.mock('@/lib/env', () => ({
  env: {
    RESEND_API_KEY: 'test-resend-key',
    ADMIN_NOTIFICATION_EMAIL: 'admin@test.com',
  },
}))

vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: vi.fn(() => ({ data: { id: 'email-id' }, error: null })),
    },
  })),
}))

vi.mock('stripe', () => {
  const mockStripe = vi.fn(() => ({
    webhooks: {
      constructEvent: vi.fn(),
    },
    checkout: {
      sessions: {
        listLineItems: vi.fn(() => ({
          data: [
            {
              id: 'li_123',
              description: 'Test Document',
              amount_total: 10000, // $100
              quantity: 1,
            },
          ],
        })),
      },
    },
  }))
  return { default: mockStripe }
})

describe('Stripe Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set required environment variables
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123'
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('Webhook Signature Verification', () => {
    it('should reject requests without stripe-signature header', async () => {
      // Import dynamically to get fresh mocks
      const { processWebhookIdempotent } = await import(
        '@/lib/webhooks/idempotency'
      )
      vi.mocked(processWebhookIdempotent).mockResolvedValue({
        processed: false,
        status: 'failed' as const,
      })

      // Create a mock request without signature
      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ type: 'checkout.session.completed' }),
        headers: {
          'Content-Type': 'application/json',
          // No stripe-signature header
        },
      })

      // Import the route handler
      const { POST } = await import('@/app/api/webhooks/stripe/route')

      // Mock stripe.webhooks.constructEvent to throw for invalid signature
      const Stripe = (await import('stripe')).default
      const mockStripeInstance = new Stripe('sk_test_123')
      vi.mocked(mockStripeInstance.webhooks.constructEvent).mockImplementation(
        () => {
          throw new Error('No signature provided')
        }
      )

      const response = await POST(request as unknown as Request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid webhook signature')
    })

    it('should reject requests with invalid signature', async () => {
      const Stripe = (await import('stripe')).default
      const mockStripeInstance = new Stripe('sk_test_123')

      // Mock constructEvent to throw for invalid signature
      vi.mocked(mockStripeInstance.webhooks.constructEvent).mockImplementation(
        () => {
          throw new Error('Invalid signature')
        }
      )

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ type: 'checkout.session.completed' }),
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'invalid_signature',
        },
      })

      const { POST } = await import('@/app/api/webhooks/stripe/route')
      const response = await POST(request as unknown as Request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid webhook signature')
    })
  })

  describe('Idempotency', () => {
    it('should prevent duplicate event processing', async () => {
      const { processWebhookIdempotent } = await import(
        '@/lib/webhooks/idempotency'
      )

      // Mock idempotency check returning duplicate
      vi.mocked(processWebhookIdempotent).mockResolvedValue({
        processed: true,
        status: 'duplicate' as const,
      })

      const Stripe = (await import('stripe')).default
      const mockStripeInstance = new Stripe('sk_test_123')

      // Mock valid event
      vi.mocked(mockStripeInstance.webhooks.constructEvent).mockReturnValue({
        id: 'evt_duplicate_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_status: 'paid',
            customer_email: 'test@example.com',
            metadata: {},
          },
        },
      } as unknown as ReturnType<
        typeof mockStripeInstance.webhooks.constructEvent
      >)

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({
          id: 'evt_duplicate_123',
          type: 'checkout.session.completed',
        }),
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'valid_signature',
        },
      })

      const { POST } = await import('@/app/api/webhooks/stripe/route')
      const response = await POST(request as unknown as Request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('duplicate')
      expect(data.received).toBe(true)
    })

    it('should process new events only once', async () => {
      const { processWebhookIdempotent } = await import(
        '@/lib/webhooks/idempotency'
      )

      let processingCallback: (() => Promise<void>) | null = null

      // Capture the processing callback
      vi.mocked(processWebhookIdempotent).mockImplementation(
        async (_provider, _eventId, _eventType, callback) => {
          processingCallback = callback
          await callback()
          return { processed: true, status: 'processed' as const }
        }
      )

      const Stripe = (await import('stripe')).default
      const mockStripeInstance = new Stripe('sk_test_123')

      vi.mocked(mockStripeInstance.webhooks.constructEvent).mockReturnValue({
        id: 'evt_new_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_status: 'paid',
            customer_email: 'test@example.com',
            amount_total: 10000,
            metadata: { type: 'document' },
          },
        },
      } as unknown as ReturnType<
        typeof mockStripeInstance.webhooks.constructEvent
      >)

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({
          id: 'evt_new_123',
          type: 'checkout.session.completed',
        }),
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'valid_signature',
        },
      })

      const { POST } = await import('@/app/api/webhooks/stripe/route')
      const response = await POST(request as unknown as Request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.processed).toBe(true)
      expect(data.status).toBe('processed')

      // Verify callback was captured and called
      expect(processingCallback).not.toBeNull()
    })
  })

  describe('Payment Status Validation', () => {
    it('should only trigger side effects for paid sessions', async () => {
      const { processWebhookIdempotent } = await import(
        '@/lib/webhooks/idempotency'
      )
      const { createCalendarEvent } = await import('@/lib/google-calendar')

      vi.mocked(processWebhookIdempotent).mockImplementation(
        async (_provider, _eventId, _eventType, callback) => {
          await callback()
          return { processed: true, status: 'processed' as const }
        }
      )

      const Stripe = (await import('stripe')).default
      const mockStripeInstance = new Stripe('sk_test_123')

      // Create unpaid session
      vi.mocked(mockStripeInstance.webhooks.constructEvent).mockReturnValue({
        id: 'evt_unpaid_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_unpaid',
            payment_status: 'unpaid', // NOT paid
            customer_email: 'test@example.com',
            metadata: { bookingId: 'booking_123' },
          },
        },
      } as unknown as ReturnType<
        typeof mockStripeInstance.webhooks.constructEvent
      >)

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({
          id: 'evt_unpaid_123',
          type: 'checkout.session.completed',
        }),
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'valid_signature',
        },
      })

      const { POST } = await import('@/app/api/webhooks/stripe/route')
      await POST(request as unknown as Request)

      // Calendar event should NOT be created for unpaid sessions
      // Note: The actual route checks payment_status in handleCheckoutComplete
      // This test verifies the behavior is correct
      expect(createCalendarEvent).not.toHaveBeenCalled()
    })
  })

  describe('Booking Confirmation', () => {
    it('should update booking status after payment', async () => {
      const { processWebhookIdempotent } = await import(
        '@/lib/webhooks/idempotency'
      )
      const { createServiceRoleClient } = await import(
        '@/lib/supabase/server'
      )

      let callbackExecuted = false

      vi.mocked(processWebhookIdempotent).mockImplementation(
        async (_provider, _eventId, _eventType, callback) => {
          await callback()
          callbackExecuted = true
          return { processed: true, status: 'processed' as const }
        }
      )

      const Stripe = (await import('stripe')).default
      const mockStripeInstance = new Stripe('sk_test_123')

      // Paid session with booking ID
      vi.mocked(mockStripeInstance.webhooks.constructEvent).mockReturnValue({
        id: 'evt_booking_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_booking',
            payment_status: 'paid',
            customer_email: 'test@example.com',
            amount_total: 45000, // $450
            metadata: {
              bookingId: 'booking_123',
              type: 'consultation',
            },
          },
        },
      } as unknown as ReturnType<
        typeof mockStripeInstance.webhooks.constructEvent
      >)

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({
          id: 'evt_booking_123',
          type: 'checkout.session.completed',
        }),
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'valid_signature',
        },
      })

      const { POST } = await import('@/app/api/webhooks/stripe/route')
      const response = await POST(request as unknown as Request)

      expect(response.status).toBe(200)
      expect(callbackExecuted).toBe(true)
      // Verify supabase client was called for booking update
      expect(createServiceRoleClient).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should return 500 for unexpected errors', async () => {
      const { processWebhookIdempotent } = await import(
        '@/lib/webhooks/idempotency'
      )

      // Mock throwing an error
      vi.mocked(processWebhookIdempotent).mockRejectedValue(
        new Error('Database connection failed')
      )

      const Stripe = (await import('stripe')).default
      const mockStripeInstance = new Stripe('sk_test_123')

      vi.mocked(mockStripeInstance.webhooks.constructEvent).mockReturnValue({
        id: 'evt_error_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_error',
            payment_status: 'paid',
            customer_email: 'test@example.com',
            metadata: {},
          },
        },
      } as unknown as ReturnType<
        typeof mockStripeInstance.webhooks.constructEvent
      >)

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({
          id: 'evt_error_123',
          type: 'checkout.session.completed',
        }),
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'valid_signature',
        },
      })

      const { POST } = await import('@/app/api/webhooks/stripe/route')
      const response = await POST(request as unknown as Request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Webhook handler failed')
    })
  })
})
