import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getStripeConnectConfig, createAccountLink } from '@/lib/server/stripe-connect';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  const config = getStripeConnectConfig();

  if (!config.isConfigured) {
    return NextResponse.json(
      { error: 'Stripe Connect not configured' },
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

    const { type = 'account_onboarding' } = await req.json();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, stripe_account_id')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (!profile.stripe_account_id) {
      return NextResponse.json(
        { error: 'No Connect account found' },
        { status: 404 }
      );
    }

    // Create account link
    const linkResult = await createAccountLink({
      accountId: profile.stripe_account_id,
      refreshUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/my/payouts?refresh=true`,
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/my/payouts?success=true`,
      type: type as 'account_onboarding' | 'account_update',
    });

    if (linkResult.error) {
      return NextResponse.json(
        { error: linkResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: linkResult.url });
  } catch (error) {
    console.error('Account link creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
