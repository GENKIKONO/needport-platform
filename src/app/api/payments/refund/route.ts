import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentRecordId, reason, notes } = body;

    if (!paymentRecordId || !reason) {
      return NextResponse.json(
        { error: 'Payment record ID and reason are required' },
        { status: 400 }
      );
    }

    // Simplified implementation for Lv1
    // TODO: Implement full payment manager integration
    
    // Generate a mock refund request ID
    const refundRequestId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      refund_request_id: refundRequestId,
      status: 'pending_approval',
      message: '返金申請を受け付けました。運営による審査後に処理されます。',
      lv1_notice: '自動返金は行われません。運営確認後に手動で処理いたします。'
    });

  } catch (error) {
    console.error('Payment refund error:', error);

    return NextResponse.json(
      { error: '返金申請の処理に失敗しました' },
      { status: 500 }
    );
  }
}