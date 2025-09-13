import { stripe } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PaymentRecord, RefundRequest, PaymentResult, RefundResult, RefundReason } from './types';

/**
 * Payment and Escrow Manager for NeedPort Platform
 * 
 * Lv1 Policy: Operator-led refunds only; auto-refund is disabled by policy
 * Lv2+ Policy: Stripe webhook automation planned (do not remove this hook point)
 * 
 * Current refund flow:
 * 1. Manual admin approval required for all refunds
 * 2. 24-hour rule enforced (contact access restriction)
 * 3. No automatic processing after 30 days
 */
export class PaymentManager {
  private admin = supabaseAdmin();

  /**
   * 決済記録を作成
   */
  async createPaymentRecord(params: {
    type: PaymentRecord['type'];
    amount: number;
    vendor_id: string;
    proposal_id?: string;
    need_id?: string;
    client_id?: string;
    stripe_payment_intent_id?: string;
    stripe_session_id?: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentResult> {
    try {
      const { data, error } = await this.admin
        .from('payment_records')
        .insert({
          type: params.type,
          status: 'pending',
          amount: params.amount,
          currency: 'jpy',
          vendor_id: params.vendor_id,
          proposal_id: params.proposal_id,
          need_id: params.need_id,
          client_id: params.client_id,
          stripe_payment_intent_id: params.stripe_payment_intent_id,
          stripe_session_id: params.stripe_session_id,
          metadata: params.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        payment_record_id: data.id,
        stripe_payment_intent_id: params.stripe_payment_intent_id
      };
    } catch (error) {
      console.error('Error creating payment record:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 決済記録を更新
   */
  async updatePaymentStatus(
    paymentRecordId: string, 
    status: PaymentRecord['status'],
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (metadata) {
        // 既存のメタデータとマージ
        const { data: existing } = await this.admin
          .from('payment_records')
          .select('metadata')
          .eq('id', paymentRecordId)
          .single();

        updateData.metadata = {
          ...(existing?.metadata || {}),
          ...metadata
        };
      }

      const { error } = await this.admin
        .from('payment_records')
        .update(updateData)
        .eq('id', paymentRecordId);

      return !error;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return false;
    }
  }

  /**
   * 返金リクエストを作成
   */
  async createRefundRequest(params: {
    payment_record_id: string;
    requested_by: string;
    reason: RefundReason;
    amount: number;
    notes?: string;
  }): Promise<{ success: boolean; refund_request_id?: string; error?: string }> {
    try {
      // 元の決済記録を取得
      const { data: paymentRecord, error: paymentError } = await this.admin
        .from('payment_records')
        .select('*')
        .eq('id', params.payment_record_id)
        .single();

      if (paymentError || !paymentRecord) {
        return { success: false, error: 'Payment record not found' };
      }

      // 返金可能かチェック
      if (paymentRecord.status !== 'completed') {
        return { success: false, error: 'Payment not completed' };
      }

      if (params.amount > paymentRecord.amount) {
        return { success: false, error: 'Refund amount exceeds payment amount' };
      }

      // 返金リクエスト作成
      const { data, error } = await this.admin
        .from('refund_requests')
        .insert({
          payment_record_id: params.payment_record_id,
          requested_by: params.requested_by,
          reason: params.reason,
          amount: params.amount,
          status: 'pending',
          notes: params.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // 監査ログ記録
      await this.admin.from('audit_logs').insert({
        actor_id: params.requested_by,
        action: 'REFUND_REQUESTED',
        target_type: 'payment_record',
        target_id: params.payment_record_id,
        meta: {
          refund_request_id: data.id,
          reason: params.reason,
          amount: params.amount,
          notes: params.notes
        }
      });

      return { success: true, refund_request_id: data.id };
    } catch (error) {
      console.error('Error creating refund request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 返金を承認して実行
   */
  async approveAndProcessRefund(
    refundRequestId: string,
    approvedBy: string,
    notes?: string
  ): Promise<RefundResult> {
    if (!stripe) {
      return { success: false, error: 'Stripe not configured' };
    }

    try {
      // 返金リクエストを取得
      const { data: refundRequest, error: refundError } = await this.admin
        .from('refund_requests')
        .select(`
          *,
          payment_record:payment_records(*)
        `)
        .eq('id', refundRequestId)
        .single();

      if (refundError || !refundRequest) {
        return { success: false, error: 'Refund request not found' };
      }

      if (refundRequest.status !== 'pending') {
        return { success: false, error: 'Refund request already processed' };
      }

      const paymentRecord = refundRequest.payment_record;
      if (!paymentRecord?.stripe_payment_intent_id) {
        return { success: false, error: 'No Stripe payment intent found' };
      }

      // Stripeで返金実行
      const stripeRefund = await stripe.refunds.create({
        payment_intent: paymentRecord.stripe_payment_intent_id,
        amount: refundRequest.amount,
        metadata: {
          refund_request_id: refundRequestId,
          approved_by: approvedBy,
          reason: refundRequest.reason
        }
      });

      // 返金リクエスト更新
      await this.admin
        .from('refund_requests')
        .update({
          status: 'completed',
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
          stripe_refund_id: stripeRefund.id,
          processed_at: new Date().toISOString(),
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', refundRequestId);

      // 元の決済記録も更新
      await this.admin
        .from('payment_records')
        .update({
          status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', refundRequest.payment_record_id);

      // 監査ログ記録
      await this.admin.from('audit_logs').insert({
        actor_id: approvedBy,
        action: 'REFUND_PROCESSED',
        target_type: 'refund_request',
        target_id: refundRequestId,
        meta: {
          stripe_refund_id: stripeRefund.id,
          amount: refundRequest.amount,
          reason: refundRequest.reason,
          notes
        }
      });

      return {
        success: true,
        refund_request_id: refundRequestId,
        stripe_refund_id: stripeRefund.id,
        amount_refunded: refundRequest.amount
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      
      // 失敗をログに記録
      await this.admin
        .from('refund_requests')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', refundRequestId);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 返金リクエストを拒否
   */
  async rejectRefundRequest(
    refundRequestId: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<boolean> {
    try {
      const { error } = await this.admin
        .from('refund_requests')
        .update({
          status: 'rejected',
          approved_by: rejectedBy,
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', refundRequestId);

      if (error) throw error;

      // 監査ログ記録
      await this.admin.from('audit_logs').insert({
        actor_id: rejectedBy,
        action: 'REFUND_REJECTED',
        target_type: 'refund_request',
        target_id: refundRequestId,
        meta: {
          rejection_reason: rejectionReason
        }
      });

      return true;
    } catch (error) {
      console.error('Error rejecting refund request:', error);
      return false;
    }
  }

  /**
   * ベンダーの決済バランスを取得
   */
  async getVendorBalance(vendorId: string) {
    try {
      const { data: payments, error } = await this.admin
        .from('payment_records')
        .select('type, status, amount')
        .eq('vendor_id', vendorId);

      if (error) throw error;

      const balance = {
        vendor_id: vendorId,
        total_deposited: 0,
        total_earned: 0,
        total_refunded: 0,
        available_balance: 0,
        pending_settlements: 0,
        last_updated: new Date().toISOString()
      };

      payments?.forEach(payment => {
        switch (payment.type) {
          case 'deposit':
            if (payment.status === 'completed') {
              balance.total_deposited += payment.amount;
              balance.available_balance += payment.amount;
            }
            break;
          case 'commission':
            if (payment.status === 'completed') {
              balance.total_earned += payment.amount;
            } else if (payment.status === 'pending') {
              balance.pending_settlements += payment.amount;
            }
            break;
          case 'refund':
            if (payment.status === 'completed') {
              balance.total_refunded += payment.amount;
              balance.available_balance -= payment.amount;
            }
            break;
        }
      });

      return balance;
    } catch (error) {
      console.error('Error getting vendor balance:', error);
      return null;
    }
  }
}

// シングルトンインスタンス
export const paymentManager = new PaymentManager();