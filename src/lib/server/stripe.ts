import Stripe from 'stripe';

export interface StripeServerConfig {
  isConfigured: boolean;
  client?: Stripe;
  priceIds: {
    userMonthly?: string;
    proMonthly?: string;
  };
}

export function getStripeServerConfig(): StripeServerConfig {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const userMonthlyPrice = process.env.STRIPE_PRICE_USER_MONTHLY;
  const proMonthlyPrice = process.env.STRIPE_PRICE_PRO_MONTHLY;
  
  if (!stripeSecretKey) {
    return {
      isConfigured: false,
      priceIds: {},
    };
  }

  const client = new Stripe(stripeSecretKey, {
    apiVersion: '2024-12-18.acacia',
  });
  
  return {
    isConfigured: true,
    client,
    priceIds: {
      userMonthly: userMonthlyPrice,
      proMonthly: proMonthlyPrice,
    },
  };
}

export function isBillingConfigured(): boolean {
  const config = getStripeServerConfig();
  return config.isConfigured && 
         !!config.priceIds.userMonthly && 
         !!config.priceIds.proMonthly;
}

export async function createCheckoutSession(params: {
  customerId?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const config = getStripeServerConfig();
  
  if (!config.isConfigured || !config.client) {
    return { error: 'Stripe not configured' };
  }

  try {
    const session = await config.client.checkout.sessions.create({
      customer: params.customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { error: 'Failed to create checkout session' };
  }
}

export async function createBillingPortalSession(params: {
  customerId: string;
  returnUrl: string;
}) {
  const config = getStripeServerConfig();
  
  if (!config.isConfigured || !config.client) {
    return { error: 'Stripe not configured' };
  }

  try {
    const session = await config.client.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return { error: 'Failed to create billing portal session' };
  }
}

export async function createCustomer(params: {
  metadata?: Record<string, string>;
}) {
  const config = getStripeServerConfig();
  
  if (!config.isConfigured || !config.client) {
    return { error: 'Stripe not configured' };
  }

  try {
    const customer = await config.client.customers.create({
      metadata: params.metadata,
    });

    return { customerId: customer.id };
  } catch (error) {
    console.error('Error creating customer:', error);
    return { error: 'Failed to create customer' };
  }
}
