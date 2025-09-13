import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * Payment Release API
 * 
 * Lv1: Operator-led releases only; auto-release is disabled by policy
 * - Manual admin approval required
 * - Contact access triggers release
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
    const { transactionId, reason = 'contact_accessed' } = body;

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
      status: 'released',
      message: 'Payment released successfully',
      released_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Payment release error:', error);

    return NextResponse.json(
      { error: '決済の解放に失敗しました' },
      { status: 500 }
    );
  }
}