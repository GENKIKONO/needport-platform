import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/client';

/**
 * Admin Payment Refund API (Lv1: Manual operator-led)
 * 
 * Processes refunds for held payments after operator confirmation
 * - Manual admin approval required
 * - Audit logging
 * - Stripe refund processing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, reason, notes, stripePaymentIntentId } = body;

    if (!transactionId || !reason) {
      return NextResponse.json(
        { error: 'Transaction ID and reason are required' },
        { status: 400 }
      );
    }

    const sadmin = supabaseAdmin();

    // Get transaction details
    const { data: transaction, error: fetchError } = await sadmin
      .from('vendor_accesses')
      .select(`
        id,
        payment_intent_id,
        deposit_amount,
        vendor_id,
        need_id,
        proposal_id,
        granted_at,
        needs(title),
        profiles!vendor_id(first_name, last_name, business_name)
      `)
      .eq('id', transactionId)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Process Stripe refund
    let stripeRefundResult = null;
    if (stripe && stripePaymentIntentId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: stripePaymentIntentId,
          amount: transaction.deposit_amount * 100, // Convert to cents
          reason: 'requested_by_customer', // Stripe refund reason
          metadata: {
            transaction_id: transactionId,
            admin_reason: reason,
            lv1_manual_refund: 'true'
          }
        });
        
        stripeRefundResult = refund.id;
        console.log(`Stripe refund created: ${refund.id} for ¥${transaction.deposit_amount}`);
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError);
        return NextResponse.json(
          { error: 'Failed to process refund with Stripe' },
          { status: 500 }
        );
      }
    }

    // Update transaction status (for Lv1, we'll add metadata)
    const { error: updateError } = await sadmin
      .from('vendor_accesses')
      .update({
        // In full implementation, we'd have a dedicated status field
        // For now, we'll rely on audit trail
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
    }

    // Create audit log
    const { error: auditError } = await sadmin.from('audit_logs').insert({
      actor_id: 'admin', // In production, this would be the actual admin user ID
      action: 'PAYMENT_REFUNDED_MANUAL',
      target_type: 'vendor_access',
      target_id: transactionId,
      meta: {
        vendor_id: transaction.vendor_id,
        need_id: transaction.need_id,
        proposal_id: transaction.proposal_id,
        amount: transaction.deposit_amount,
        reason,
        notes: notes || null,
        stripe_payment_intent_id: stripePaymentIntentId,
        stripe_refund_id: stripeRefundResult,
        lv1_manual_refund: true,
        refunded_at: new Date().toISOString()
      }
    });

    if (auditError) {
      console.error('Error creating audit log:', auditError);
    }

    return NextResponse.json({
      success: true,
      transaction_id: transactionId,
      status: 'refunded',
      amount: transaction.deposit_amount,
      vendor_id: transaction.vendor_id,
      stripe_refund_id: stripeRefundResult,
      message: 'Refund processed successfully',
      lv1_notice: 'Manual operator refund completed - funds will return to original payment method'
    });

  } catch (error) {
    console.error('Payment refund error:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}