import { createAdminClient } from "@/lib/supabase/admin";

type AuditAction = 
  | 'offer.add'
  | 'offer.edit' 
  | 'offer.delete'
  | 'offer.adopt'
  | 'offer.unadopt'
  | 'membership.created'
  | 'membership.updated'
  | 'membership.canceled'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'payment.disputed'
  | 'prejoin.setup'
  | 'payment.created'
  | 'threshold.payment.processed'
  | 'threshold.check.completed';

interface AuditLogData {
  action: AuditAction;
  need_id?: string;
  offer_id?: string;
  payload?: Record<string, any>;
}

export async function logAudit(data: AuditLogData): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin
      .from("admin_audit_logs")
      .insert({
        action: data.action,
        need_id: data.need_id,
        offer_id: data.offer_id,
        payload: data.payload,
      });
  } catch (error) {
    console.error("Failed to log audit:", error);
    // Don't throw - audit logging should not break main functionality
  }
}

// Audit helpers for specific actions
export const auditHelpers = {
  async membershipCreated(userId: string, profileId: string, tier: string) {
    await logAudit({
      action: 'membership.created',
      payload: { userId, profileId, tier }
    });
  },

  async membershipUpdated(userId: string, profileId: string, tier: string) {
    await logAudit({
      action: 'membership.updated',
      payload: { userId, profileId, tier }
    });
  },

  async membershipCanceled(userId: string, profileId: string) {
    await logAudit({
      action: 'membership.canceled',
      payload: { userId, profileId }
    });
  },

  async paymentSucceeded(userId: string, profileId: string, amount: number, currency: string) {
    await logAudit({
      action: 'payment.succeeded',
      payload: { userId, profileId, amount, currency }
    });
  },

  async paymentFailed(userId: string, profileId: string, amount: number, currency: string) {
    await logAudit({
      action: 'payment.failed',
      payload: { userId, profileId, amount, currency }
    });
  },

  async paymentDisputed(userId: string, profileId: string, amount: number, currency: string) {
    await logAudit({
      action: 'payment.disputed',
      payload: { userId, profileId, amount, currency }
    });
  },

  async prejoinSetup(userId: string, needId: string, setupIntentId: string) {
    await logAudit({
      action: 'prejoin.setup',
      need_id: needId,
      payload: { userId, setupIntentId }
    });
  },

  async paymentCreated(profileId: string, needId: string, paymentIntentId: string, amount: number) {
    await logAudit({
      action: 'payment.created',
      need_id: needId,
      payload: { profileId, paymentIntentId, amount }
    });
  },

  async thresholdPaymentProcessed(needId: string, amount: number, currency: string) {
    await logAudit({
      action: 'threshold.payment.processed',
      need_id: needId,
      payload: { amount, currency }
    });
  },

  async thresholdCheckJobCompleted(needId: string, thresholdReached: boolean) {
    await logAudit({
      action: 'threshold.check.completed',
      need_id: needId,
      payload: { thresholdReached }
    });
  }
};
