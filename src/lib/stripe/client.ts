import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    })
  : null;

export const stripePublishable = stripePublishableKey || '';

// Check if Stripe is configured
export const isStripeConfigured = !!(stripeSecretKey && stripePublishableKey);

// Price IDs
export const STRIPE_PRICE_USER_MONTHLY = process.env.STRIPE_PRICE_USER_MONTHLY;
export const STRIPE_PRICE_PRO_MONTHLY = process.env.STRIPE_PRICE_PRO_MONTHLY;

export const isBillingConfigured = !!(
  isStripeConfigured && 
  STRIPE_PRICE_USER_MONTHLY && 
  STRIPE_PRICE_PRO_MONTHLY
);
