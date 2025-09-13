import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { escrowService } from '@/lib/payments/escrow';
import { auditData } from '@/lib/compliance/audit';

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
      await auditData.security('anonymous', 'unauthorized_payment_release', request.url);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transactionId, reason = 'contact_accessed' } = body;

    if (!transactionId) {
      await auditData.security(userId, 'invalid_payment_release', {
        url: request.url,
        missing_transaction_id: true
      });
      
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Get transaction to verify ownership and status
    const transaction = await escrowService.getTransaction(transactionId);
    
    if (!transaction) {
      await auditData.security(userId, 'payment_release_not_found', {
        url: request.url,
        transaction_id: transactionId
      });
      
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Only proposer can release payment (they accessed the contact info)
    if (transaction.proposer_id !== userId) {
      await auditData.security(userId, 'unauthorized_payment_release', {
        url: request.url,
        transaction_id: transactionId,
        actual_proposer: transaction.proposer_id
      });
      
      return NextResponse.json(
        { error: 'Only the proposer can release payment' },
        { status: 403 }
      );
    }

    if (transaction.status !== 'held') {
      await auditData.security(userId, 'invalid_payment_status_release', {
        url: request.url,
        transaction_id: transactionId,
        current_status: transaction.status
      });
      
      return NextResponse.json(
        { error: `Cannot release payment with status: ${transaction.status}` },
        { status: 400 }
      );
    }

    // Release payment
    await escrowService.releasePayment(transactionId, userId, reason);

    await auditData.transaction(userId, 'payment_released', {
      transaction_id: transactionId,
      amount: transaction.amount,
      reason,
      requester_id: transaction.requester_id
    });

    return NextResponse.json({
      transaction_id: transactionId,
      status: 'released',
      message: 'Payment released successfully',
      released_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Payment release error:', error);
    
    const { userId } = await auth();
    await auditData.security(userId || 'anonymous', 'payment_release_error', {
      url: request.url,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: '決済の解放に失敗しました' },
      { status: 500 }
    );
  }
}