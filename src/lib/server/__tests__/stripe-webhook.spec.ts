import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleCheckoutSessionCompleted } from '../stripe-webhook';
import type Stripe from 'stripe';

// Mock dependencies
const mockSupabaseQuery = vi.fn();
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => mockSupabaseQuery)
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => mockSupabaseQuery)
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => mockSupabaseQuery)
      }))
    })),
    upsert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => mockSupabaseQuery)
      }))
    }))
  }))
};

const mockAuditHelpers = {
  paymentCompleted: vi.fn()
};

vi.mock('@/lib/server/supabase', () => ({
  getSupabaseAdminConfig: () => ({
    isConfigured: true,
    client: mockSupabaseClient
  })
}));

vi.mock('@/lib/audit', () => ({
  auditHelpers: mockAuditHelpers
}));

describe('Stripe Webhook Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleCheckoutSessionCompleted', () => {
    const mockSession: Partial<Stripe.Checkout.Session> = {
      id: 'cs_test_123',
      payment_intent: 'pi_test_123',
      amount_total: 5000,
      currency: 'jpy',
      metadata: {
        match_id: 'match-123',
        business_id: 'business-456',
        need_id: 'need-789'
      }
    };

    it('should handle new payment successfully', async () => {
      // Mock: No existing payment (idempotency check)
      mockSupabaseQuery.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' } // Not found
      });

      // Mock: Payment insert
      mockSupabaseQuery.mockResolvedValueOnce({
        data: { id: 'payment-123' },
        error: null
      });

      // Mock: Match update
      mockSupabaseQuery.mockResolvedValueOnce({
        data: null,
        error: null
      });

      // Mock: Room upsert
      mockSupabaseQuery.mockResolvedValueOnce({
        data: { id: 'room-123' },
        error: null
      });

      // Mock: Participant upsert
      mockSupabaseQuery.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const result = await handleCheckoutSessionCompleted(mockSession as Stripe.Checkout.Session, 'evt_123');

      expect(result.success).toBe(true);
      expect(mockAuditHelpers.paymentCompleted).toHaveBeenCalledWith(
        'business-456',
        'match-123',
        'cs_test_123',
        5000
      );
    });

    it('should handle duplicate payment (idempotency)', async () => {
      // Mock: Existing payment found
      mockSupabaseQuery.mockResolvedValueOnce({
        data: { id: 'payment-123', status: 'completed' },
        error: null
      });

      const result = await handleCheckoutSessionCompleted(mockSession as Stripe.Checkout.Session, 'evt_123');

      expect(result.success).toBe(true);
      expect(result.duplicate).toBe(true);
      expect(mockAuditHelpers.paymentCompleted).not.toHaveBeenCalled();
    });

    it('should handle missing metadata', async () => {
      const sessionWithoutMetadata: Partial<Stripe.Checkout.Session> = {
        id: 'cs_test_123',
        metadata: {}
      };

      const result = await handleCheckoutSessionCompleted(sessionWithoutMetadata as Stripe.Checkout.Session);

      expect(result.error).toBe('Missing required metadata in session');
      expect(result.retryable).toBe(false);
    });

    it('should handle database errors as retryable', async () => {
      // Mock: Database error during idempotency check
      mockSupabaseQuery.mockResolvedValueOnce({
        data: null,
        error: { code: 'CONNECTION_ERROR', message: 'Database connection failed' }
      });

      const result = await handleCheckoutSessionCompleted(mockSession as Stripe.Checkout.Session);

      expect(result.error).toBe('Database error during idempotency check');
      expect(result.retryable).toBe(true);
    });

    it('should handle payment insert failure', async () => {
      // Mock: No existing payment
      mockSupabaseQuery.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      // Mock: Payment insert failure
      mockSupabaseQuery.mockResolvedValueOnce({
        data: null,
        error: { message: 'Insert failed' }
      });

      const result = await handleCheckoutSessionCompleted(mockSession as Stripe.Checkout.Session);

      expect(result.error).toBe('Failed to create payment record');
      expect(result.retryable).toBe(true);
    });

    it('should handle match update failure', async () => {
      // Mock: No existing payment
      mockSupabaseQuery.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      // Mock: Payment insert success
      mockSupabaseQuery.mockResolvedValueOnce({
        data: { id: 'payment-123' },
        error: null
      });

      // Mock: Match update failure
      mockSupabaseQuery.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' }
      });

      const result = await handleCheckoutSessionCompleted(mockSession as Stripe.Checkout.Session);

      expect(result.error).toBe('Failed to update match status');
      expect(result.retryable).toBe(true);
    });

    it('should validate required session fields', async () => {
      const incompleteSession: Partial<Stripe.Checkout.Session> = {
        id: 'cs_test_123',
        metadata: {
          match_id: 'match-123',
          // Missing business_id and need_id
        }
      };

      const result = await handleCheckoutSessionCompleted(incompleteSession as Stripe.Checkout.Session);

      expect(result.error).toBe('Missing required metadata in session');
      expect(result.retryable).toBe(false);
    });
  });
});
