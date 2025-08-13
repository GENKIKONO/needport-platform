import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getStripeServerConfig } from '@/lib/server/stripe';
import { supabase } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  const config = getStripeServerConfig();

  if (!config.isConfigured) {
    return NextResponse.json(
      { error: 'Billing is not configured' },
      { status: 503 }
    );
  }

  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { hasSubscription: false },
        { status: 200 }
      );
    }

    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { hasSubscription: false },
        { status: 200 }
      );
    }

    // Get subscriptions from Stripe
    const subscriptions = await config.client!.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { hasSubscription: false },
        { status: 200 }
      );
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    
    // Determine tier based on price ID
    let tier: 'user' | 'pro' | undefined;
    if (priceId === config.priceIds.userMonthly) {
      tier = 'user';
    } else if (priceId === config.priceIds.proMonthly) {
      tier = 'pro';
    }

    return NextResponse.json({
      hasSubscription: true,
      tier,
      customerId: profile.stripe_customer_id,
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  } catch (error) {
    console.error('Billing status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
