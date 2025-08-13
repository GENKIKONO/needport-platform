import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getStripeConnectConfig, getConnectAccount, getAccountStatus } from '@/lib/server/stripe-connect';
import { supabase } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, stripe_account_id, role')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if user is pro
    if (profile.role !== 'pro') {
      return NextResponse.json(
        { error: 'Only pro users can access Connect features' },
        { status: 403 }
      );
    }

    if (!profile.stripe_account_id) {
      return NextResponse.json({
        hasAccount: false,
        isComplete: false,
        isEnabled: false,
        missingFields: [],
      });
    }

    // Get Connect account details
    const accountResult = await getConnectAccount(profile.stripe_account_id);

    if (accountResult.error) {
      return NextResponse.json(
        { error: accountResult.error },
        { status: 500 }
      );
    }

    const status = getAccountStatus(accountResult.account);

    return NextResponse.json({
      hasAccount: true,
      accountId: profile.stripe_account_id,
      ...status,
    });
  } catch (error) {
    console.error('Connect status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
