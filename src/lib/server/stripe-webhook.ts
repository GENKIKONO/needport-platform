import Stripe from 'stripe';
import { getStripeServerConfig } from './stripe';
import { getSupabaseAdminConfig } from './supabase';
import { auditHelpers } from '@/lib/audit';

export interface StripeWebhookConfig {
  isConfigured: boolean;
  secret?: string;
}

export function getStripeWebhookConfig(): StripeWebhookConfig {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  return {
    isConfigured: !!secret,
    secret,
  };
}

export async function verifyStripeWebhook(
  body: string,
  signature: string
): Promise<Stripe.Event | null> {
  const config = getStripeWebhookConfig();
  const stripeConfig = getStripeServerConfig();
  
  if (!config.isConfigured || !stripeConfig.isConfigured || !stripeConfig.client) {
    return null;
  }

  try {
    const event = stripeConfig.client.webhooks.constructEvent(
      body,
      signature,
      config.secret!
    );
    return event;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return null;
  }
}

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const config = getSupabaseAdminConfig();
  
  if (!config.isConfigured || !config.client) {
    return { error: 'Database not configured' };
  }

  try {
    const profileId = session.metadata?.profile_id;
    const tier = session.metadata?.tier;

    if (!profileId || !tier) {
      return { error: 'Missing metadata' };
    }

    // Update membership
    const { error: membershipError } = await config.client
      .from('memberships')
      .upsert({
        user_id: profileId,
        tier: tier as 'user' | 'pro',
        active: true,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        updated_at: new Date().toISOString(),
      });

    if (membershipError) {
      console.error('Error updating membership:', membershipError);
      return { error: 'Failed to update membership' };
    }

    // Log audit event
    await auditHelpers.membershipCreated(profileId, profileId, tier);

    return { success: true };
  } catch (error) {
    console.error('Error in checkout.session.completed:', error);
    return { error: 'Processing failed' };
  }
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const config = getSupabaseAdminConfig();
  
  if (!config.isConfigured || !config.client) {
    return { error: 'Database not configured' };
  }

  try {
    const customerId = subscription.customer as string;

    // Get profile by customer ID
    const { data: profile, error: profileError } = await config.client
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (profileError || !profile) {
      return { error: 'Profile not found' };
    }

    const tier = subscription.metadata?.tier || 'user';
    const active = subscription.status === 'active';

    const { error: membershipError } = await config.client
      .from('memberships')
      .upsert({
        user_id: profile.id,
        tier: tier as 'user' | 'pro',
        active,
        current_period_end: subscription.current_period_end 
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      });

    if (membershipError) {
      console.error('Error updating membership:', membershipError);
      return { error: 'Failed to update membership' };
    }

    await auditHelpers.membershipUpdated(profile.id, profile.id, tier);

    return { success: true };
  } catch (error) {
    console.error('Error in customer.subscription.updated:', error);
    return { error: 'Processing failed' };
  }
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const config = getSupabaseAdminConfig();
  
  if (!config.isConfigured || !config.client) {
    return { error: 'Database not configured' };
  }

  try {
    const customerId = subscription.customer as string;

    // Get profile by customer ID
    const { data: profile, error: profileError } = await config.client
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (profileError || !profile) {
      return { error: 'Profile not found' };
    }

    const { error: membershipError } = await config.client
      .from('memberships')
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', profile.id);

    if (membershipError) {
      console.error('Error updating membership:', membershipError);
      return { error: 'Failed to update membership' };
    }

    await auditHelpers.membershipCanceled(profile.id, profile.id);

    return { success: true };
  } catch (error) {
    console.error('Error in customer.subscription.deleted:', error);
    return { error: 'Processing failed' };
  }
}

export async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const config = getSupabaseAdminConfig();
  
  if (!config.isConfigured || !config.client) {
    return { error: 'Database not configured' };
  }

  try {
    const metadata = paymentIntent.metadata;

    if (!metadata?.need_id || !metadata?.profile_id) {
      return { error: 'Missing metadata' };
    }

    // Update payment status
    const { error: paymentError } = await config.client
      .from('payments')
      .update({
        status: 'succeeded',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (paymentError) {
      console.error('Error updating payment:', paymentError);
      return { error: 'Failed to update payment' };
    }

    // Log audit event
    await auditHelpers.paymentSucceeded(
      metadata.profile_id,
      metadata.need_id,
      paymentIntent.id,
      paymentIntent.amount
    );

    return { success: true };
  } catch (error) {
    console.error('Error in payment_intent.succeeded:', error);
    return { error: 'Processing failed' };
  }
}

export async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const config = getSupabaseAdminConfig();
  
  if (!config.isConfigured || !config.client) {
    return { error: 'Database not configured' };
  }

  try {
    const metadata = paymentIntent.metadata;

    if (!metadata?.need_id) {
      return { error: 'Missing metadata' };
    }

    // Update payment status
    const { error: paymentError } = await config.client
      .from('payments')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (paymentError) {
      console.error('Error updating payment:', paymentError);
      return { error: 'Failed to update payment' };
    }

    // Log audit event
    await auditHelpers.paymentFailed(
      metadata.profile_id || 'unknown',
      metadata.need_id,
      paymentIntent.id,
      paymentIntent.amount
    );

    return { success: true };
  } catch (error) {
    console.error('Error in payment_intent.payment_failed:', error);
    return { error: 'Processing failed' };
  }
}

export async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  const config = getSupabaseAdminConfig();
  
  if (!config.isConfigured || !config.client) {
    return { error: 'Database not configured' };
  }

  try {
    // Get payment by charge ID
    const { data: payment, error: paymentError } = await config.client
      .from('payments')
      .select('id, profile_id, need_id')
      .eq('stripe_charge_id', dispute.charge)
      .single();

    if (paymentError || !payment) {
      return { error: 'Payment not found' };
    }

    // Update payment status
    const { error: updateError } = await config.client
      .from('payments')
      .update({
        status: 'disputed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return { error: 'Failed to update payment' };
    }

    // Log audit event
    await auditHelpers.paymentDisputed(
      payment.profile_id,
      payment.need_id,
      dispute.charge,
      dispute.amount
    );

    return { success: true };
  } catch (error) {
    console.error('Error in charge.dispute.created:', error);
    return { error: 'Processing failed' };
  }
}
