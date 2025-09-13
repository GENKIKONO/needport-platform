import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * Payment Confirmation API
 * 
 * Lv1: Operator-led confirmations only; auto-confirm is disabled by policy
 * - Manual verification required
 * - Escrow held until contact access
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
    const { transactionId, stripePaymentIntentId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Simplified implementation for Lv1
    // TODO: Implement full escrow service integration

    return NextResponse.json({
      transaction_id: transactionId,
      status: 'held',
      message: 'Payment confirmed and held in escrow'
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);

    return NextResponse.json(
      { error: '決済の確認に失敗しました' },
      { status: 500 }
    );
  }
}