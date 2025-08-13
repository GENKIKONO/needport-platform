import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { 
  getStripeWebhookConfig,
  verifyStripeWebhook,
  handleCheckoutSessionCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleChargeDisputeCreated
} from '@/lib/server/stripe-webhook';
import { 
  createNotConfiguredResponse, 
  createBadRequestResponse, 
  createInternalErrorResponse,
  createSuccessResponse 
} from '@/lib/server/response';

export async function POST(req: NextRequest) {
  const config = getStripeWebhookConfig();

  if (!config.isConfigured) {
    return createNotConfiguredResponse('Stripe webhook');
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return createBadRequestResponse('No signature');
  }

  const event = await verifyStripeWebhook(body, signature);
  
  if (!event) {
    return createBadRequestResponse('Invalid signature');
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const result = await handleCheckoutSessionCompleted(session);
        if (result.error) {
          console.error('Error handling checkout.session.completed:', result.error);
          return createInternalErrorResponse();
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const result = await handleSubscriptionUpdated(subscription);
        if (result.error) {
          console.error('Error handling customer.subscription.updated:', result.error);
          return createInternalErrorResponse();
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const result = await handleSubscriptionDeleted(subscription);
        if (result.error) {
          console.error('Error handling customer.subscription.deleted:', result.error);
          return createInternalErrorResponse();
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const result = await handlePaymentIntentSucceeded(paymentIntent);
        if (result.error) {
          console.error('Error handling payment_intent.succeeded:', result.error);
          return createInternalErrorResponse();
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const result = await handlePaymentIntentFailed(paymentIntent);
        if (result.error) {
          console.error('Error handling payment_intent.payment_failed:', result.error);
          return createInternalErrorResponse();
        }
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        const result = await handleChargeDisputeCreated(dispute);
        if (result.error) {
          console.error('Error handling charge.dispute.created:', result.error);
          return createInternalErrorResponse();
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return createSuccessResponse({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return createInternalErrorResponse();
  }
}
