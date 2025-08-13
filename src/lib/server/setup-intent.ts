import Stripe from 'stripe';
import { getStripeServerConfig } from './stripe';
import { getSupabaseAdminConfig } from './supabase';
import { auditHelpers } from '@/lib/audit';

export interface SetupIntentConfig {
  isConfigured: boolean;
}

export function getSetupIntentConfig(): SetupIntentConfig {
  const stripeConfig = getStripeServerConfig();
  return {
    isConfigured: stripeConfig.isConfigured,
  };
}

export async function createSetupIntent(params: {
  customerId: string;
  metadata: Record<string, string>;
}) {
  const config = getStripeServerConfig();
  
  if (!config.isConfigured || !config.client) {
    return { error: 'Stripe not configured' };
  }

  try {
    const setupIntent = await config.client.setupIntents.create({
      customer: params.customerId,
      payment_method_types: ['card'],
      metadata: params.metadata,
      usage: 'off_session',
    });

    return { 
      setupIntentId: setupIntent.id,
      clientSecret: setupIntent.client_secret,
    };
  } catch (error) {
    console.error('Error creating setup intent:', error);
    return { error: 'Failed to create setup intent' };
  }
}

export async function createOffSessionPaymentIntent(params: {
  customerId: string;
  amount: number;
  currency: string;
  metadata: Record<string, string>;
  setupIntentId?: string;
}) {
  const config = getStripeServerConfig();
  
  if (!config.isConfigured || !config.client) {
    return { error: 'Stripe not configured' };
  }

  try {
    const paymentIntent = await config.client.paymentIntents.create({
      customer: params.customerId,
      amount: params.amount,
      currency: params.currency,
      metadata: params.metadata,
      confirm: true,
      off_session: true,
      setup_future_usage: 'off_session',
      ...(params.setupIntentId && { setup_intent: params.setupIntentId }),
    });

    return { 
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    };
  } catch (error) {
    console.error('Error creating off-session payment intent:', error);
    return { error: 'Failed to create payment intent' };
  }
}

export async function savePrejoinSetup(params: {
  userId: string;
  needId: string;
  setupIntentId: string;
}) {
  const config = getSupabaseAdminConfig();
  
  if (!config.isConfigured || !config.client) {
    return { error: 'Database not configured' };
  }

  try {
    const { error } = await config.client
      .from('prejoins')
      .insert({
        user_id: params.userId,
        need_id: params.needId,
        setup_intent_id: params.setupIntentId,
        status: 'setup',
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving prejoin setup:', error);
      return { error: 'Failed to save prejoin setup' };
    }

    // Log audit event
    await auditHelpers.prejoinSetup(params.userId, params.needId, params.setupIntentId);

    return { success: true };
  } catch (error) {
    console.error('Error in savePrejoinSetup:', error);
    return { error: 'Processing failed' };
  }
}

export async function savePayment(params: {
  profileId: string;
  needId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}) {
  const config = getSupabaseAdminConfig();
  
  if (!config.isConfigured || !config.client) {
    return { error: 'Database not configured' };
  }

  try {
    const { error } = await config.client
      .from('payments')
      .insert({
        profile_id: params.profileId,
        need_id: params.needId,
        stripe_payment_intent_id: params.paymentIntentId,
        amount: params.amount,
        currency: params.currency,
        type: 'need_payment',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving payment:', error);
      return { error: 'Failed to save payment' };
    }

    // Log audit event
    await auditHelpers.paymentCreated(params.profileId, params.needId, params.paymentIntentId, params.amount);

    return { success: true };
  } catch (error) {
    console.error('Error in savePayment:', error);
    return { error: 'Processing failed' };
  }
}
