import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { paymentManager } from '@/lib/payments/core';
import { auditData } from '@/lib/compliance/audit';

/**
 * Payment Refund API
 * 
 * Lv1: Operator-led refunds only; auto-refund is disabled by policy
 * - Manual admin approval required for all refunds
 * - 24-hour rule enforced (contact access restriction)
 * - No automatic processing after 30 days
 * 
 * Lv2+: Stripe webhook automation planned (do not remove this endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      await auditData.security('anonymous', 'unauthorized_payment_refund', request.url);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentRecordId, reason, notes } = body;

    if (!paymentRecordId || !reason) {
      await auditData.security(userId, 'invalid_payment_refund', {
        url: request.url,
        missing_fields: { paymentRecordId: !paymentRecordId, reason: !reason }
      });
      
      return NextResponse.json(
        { error: 'Payment record ID and reason are required' },
        { status: 400 }
      );
    }

    // Create refund request (Lv1: requires manual operator approval)
    const result = await paymentManager.createRefundRequest({
      payment_record_id: paymentRecordId,
      requested_by: userId,
      reason,
      amount: 0, // Will be determined from payment record
      notes
    });

    if (!result.success) {
      await auditData.security(userId, 'payment_refund_failed', {
        url: request.url,
        payment_record_id: paymentRecordId,
        error: result.error
      });
      
      return NextResponse.json(
        { error: result.error || 'Refund request failed' },
        { status: 400 }
      );
    }

    await auditData.transaction(userId, 'refund_requested', {
      payment_record_id: paymentRecordId,
      refund_request_id: result.refund_request_id,
      reason,
      lv1_policy: 'operator_approval_required'
    });

    return NextResponse.json({
      refund_request_id: result.refund_request_id,
      status: 'pending_approval',
      message: '返金申請を受け付けました。運営による審査後に処理されます。',
      lv1_notice: '自動返金は行われません。運営確認後に手動で処理いたします。'
    });

  } catch (error) {
    console.error('Payment refund error:', error);
    
    const { userId } = await auth();
    await auditData.security(userId || 'anonymous', 'payment_refund_error', {
      url: request.url,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: '返金申請の処理に失敗しました' },
      { status: 500 }
    );
  }
}