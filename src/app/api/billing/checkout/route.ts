import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  getStripeServerConfig, 
  isBillingConfigured, 
  createCheckoutSession, 
  createCustomer 
} from '@/lib/server/stripe';
import { supabase } from '@/lib/supabase/client';
import { 
  createNotConfiguredResponse, 
  createUnauthorizedResponse, 
  createBadRequestResponse, 
  createNotFoundResponse,
  createInternalErrorResponse,
  createSuccessResponse 
} from '@/lib/server/response';

export async function POST(req: NextRequest) {
  if (!isBillingConfigured()) {
    return createNotConfiguredResponse('Billing');
  }

  try {
    const { userId } = auth();
    if (!userId) {
      return createUnauthorizedResponse();
    }

    const { priceId, successUrl, cancelUrl } = await req.json();
    const config = getStripeServerConfig();

    // Validate price ID
    if (priceId !== config.priceIds.userMonthly && priceId !== config.priceIds.proMonthly) {
      return createBadRequestResponse('Invalid price ID');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, stripe_customer_id')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError || !profile) {
      return createNotFoundResponse('Profile');
    }

    let customerId = profile.stripe_customer_id;

    // Create customer if doesn't exist
    if (!customerId) {
      const customerResult = await createCustomer({
        metadata: {
          profile_id: profile.id,
        },
      });

      if (customerResult.error) {
        return createInternalErrorResponse();
      }

      customerId = customerResult.customerId;

      // Update profile with customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', profile.id);
    }

    // Create checkout session
    const sessionResult = await createCheckoutSession({
      customerId,
      priceId,
      successUrl: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/billing/cancel`,
      metadata: {
        profile_id: profile.id,
        tier: priceId === config.priceIds.userMonthly ? 'user' : 'pro',
      },
    });

    if (sessionResult.error) {
      return createInternalErrorResponse();
    }

    return createSuccessResponse({ 
      sessionId: sessionResult.sessionId, 
      url: sessionResult.url 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return createInternalErrorResponse();
  }
}
