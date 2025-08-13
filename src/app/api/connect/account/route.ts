import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getStripeConnectConfig, createConnectAccount } from '@/lib/server/stripe-connect';
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, stripe_account_id')
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
        { error: 'Only pro users can create Connect accounts' },
        { status: 403 }
      );
    }

    // Check if account already exists
    if (profile.stripe_account_id) {
      return NextResponse.json(
        { error: 'Connect account already exists' },
        { status: 400 }
      );
    }

    // Create Connect account
    const accountResult = await createConnectAccount({
      profileId: profile.id,
      email: 'provider@example.com', // TODO: Get from user profile
      country: 'JP',
    });

    if (accountResult.error) {
      return NextResponse.json(
        { error: accountResult.error },
        { status: 500 }
      );
    }

    // Update profile with account ID
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ stripe_account_id: accountResult.accountId })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ accountId: accountResult.accountId });
  } catch (error) {
    console.error('Connect account creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
