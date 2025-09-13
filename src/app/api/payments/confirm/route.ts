import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { escrowService } from '@/lib/payments/escrow';
import { auditData } from '@/lib/compliance/audit';

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
      await auditData.security('anonymous', 'unauthorized_payment_confirm', request.url);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transactionId, stripePaymentIntentId } = body;

    if (!transactionId) {
      await auditData.security(userId, 'invalid_payment_confirm', {
        url: request.url,
        missing_transaction_id: true
      });
      
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Get transaction to verify ownership
    const transaction = await escrowService.getTransaction(transactionId);
    
    if (!transaction) {
      await auditData.security(userId, 'payment_confirm_not_found', {
        url: request.url,
        transaction_id: transactionId
      });
      
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.proposer_id !== userId) {
      await auditData.security(userId, 'unauthorized_payment_confirm', {
        url: request.url,
        transaction_id: transactionId,
        actual_proposer: transaction.proposer_id
      });
      
      return NextResponse.json(
        { error: 'Unauthorized to confirm this payment' },
        { status: 403 }
      );
    }

    if (transaction.status !== 'pending') {
      await auditData.security(userId, 'invalid_payment_status_confirm', {
        url: request.url,
        transaction_id: transactionId,
        current_status: transaction.status
      });
      
      return NextResponse.json(
        { error: `Cannot confirm payment with status: ${transaction.status}` },
        { status: 400 }
      );
    }

    // Hold the payment in escrow
    await escrowService.holdPayment(transactionId, stripePaymentIntentId);

    await auditData.transaction(userId, 'payment_confirmed', {
      transaction_id: transactionId,
      amount: transaction.amount,
      stripe_payment_intent_id: stripePaymentIntentId
    });

    return NextResponse.json({
      transaction_id: transactionId,
      status: 'held',
      message: 'Payment confirmed and held in escrow'
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    
    const { userId } = await auth();
    await auditData.security(userId || 'anonymous', 'payment_confirm_error', {
      url: request.url,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: '決済の確認に失敗しました' },
      { status: 500 }
    );
  }
}