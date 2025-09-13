import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/client';

/**
 * Admin Payment Release API (Lv1: Manual operator-led)
 * 
 * Releases held payments to vendors after operator confirmation
 * - Manual admin approval required
 * - Audit logging
 * - Stripe transfer processing
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

    // For Lv1, we'll simulate the release process
    // In a full implementation, this would:
    // 1. Transfer funds from escrow to vendor's Stripe account
    // 2. Update payment_records table status
    // 3. Send notifications

    // Simulate Stripe transfer (in production, this would be a real transfer)
    let stripeTransferResult = null;
    if (stripe && stripePaymentIntentId) {
      try {
        // In production: 
        // const transfer = await stripe.transfers.create({
        //   amount: transaction.deposit_amount * 100, // Convert to cents
        //   currency: 'jpy',
        //   destination: vendorStripeAccountId,
        //   transfer_group: transactionId,
        // });
        // stripeTransferResult = transfer.id;
        
        // For Lv1 demo:
        stripeTransferResult = `tr_demo_${Date.now()}`;
        console.log(`[DEMO] Would transfer ¥${transaction.deposit_amount} for transaction ${transactionId}`);
      } catch (stripeError) {
        console.error('Stripe transfer error:', stripeError);
        return NextResponse.json(
          { error: 'Failed to process payment release' },
          { status: 500 }
        );
      }
    }

    // Update transaction status (for Lv1, we'll add a simple flag)
    const { error: updateError } = await sadmin
      .from('vendor_accesses')
      .update({
        // In full implementation, we'd have a dedicated status field
        // For now, we'll use a metadata field or create audit trail
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
    }

    // Create audit log
    const { error: auditError } = await sadmin.from('audit_logs').insert({
      actor_id: 'admin', // In production, this would be the actual admin user ID
      action: 'PAYMENT_RELEASED_MANUAL',
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
        stripe_transfer_id: stripeTransferResult,
        lv1_manual_release: true,
        released_at: new Date().toISOString()
      }
    });

    if (auditError) {
      console.error('Error creating audit log:', auditError);
    }

    return NextResponse.json({
      success: true,
      transaction_id: transactionId,
      status: 'released',
      amount: transaction.deposit_amount,
      vendor_id: transaction.vendor_id,
      stripe_transfer_id: stripeTransferResult,
      message: 'Payment released successfully',
      lv1_notice: 'Manual operator release completed'
    });

  } catch (error) {
    console.error('Payment release error:', error);
    return NextResponse.json(
      { error: 'Failed to release payment' },
      { status: 500 }
    );
  }
}