import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSetupIntentConfig, createSetupIntent, savePrejoinSetup } from '@/lib/server/setup-intent';
import { supabase } from '@/lib/supabase/client';
import { STRIPE_ENABLED } from '@/lib/featureFlags';

export async function POST(req: NextRequest) {
  if (!STRIPE_ENABLED) {
    return NextResponse.json(
      { error: 'Setup Intent not enabled' },
      { status: 503 }
    );
  }

  const config = getSetupIntentConfig();

  if (!config.isConfigured) {
    return NextResponse.json(
      { error: 'Setup Intent not configured' },
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

    const { needId } = await req.json();

    if (!needId) {
      return NextResponse.json(
        { error: 'Need ID is required' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, stripe_customer_id')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found. Please set up billing first.' },
        { status: 400 }
      );
    }

    // Get need details
    const { data: need, error: needError } = await supabase
      .from('needs')
      .select('id, title, adopted_offer_id')
      .eq('id', needId)
      .single();

    if (needError || !need) {
      return NextResponse.json(
        { error: 'Need not found' },
        { status: 404 }
      );
    }

    if (!need.adopted_offer_id) {
      return NextResponse.json(
        { error: 'No adopted offer found for this need' },
        { status: 400 }
      );
    }

    // Check if already prejoined
    const { data: existingPrejoin } = await supabase
      .from('prejoins')
      .select('id, status')
      .eq('user_id', profile.id)
      .eq('need_id', needId)
      .single();

    if (existingPrejoin) {
      return NextResponse.json(
        { error: 'Already prejoined to this need' },
        { status: 400 }
      );
    }

    // Create SetupIntent
    const setupIntentResult = await createSetupIntent({
      customerId: profile.stripe_customer_id,
      metadata: {
        profile_id: profile.id,
        need_id: needId,
        need_title: need.title,
      },
    });

    if (setupIntentResult.error) {
      return NextResponse.json(
        { error: setupIntentResult.error },
        { status: 500 }
      );
    }

    // Save prejoin setup
    const saveResult = await savePrejoinSetup({
      userId: profile.id,
      needId: needId,
      setupIntentId: setupIntentResult.setupIntentId,
    });

    if (saveResult.error) {
      return NextResponse.json(
        { error: saveResult.error },
        { status: 500 }
      );
    }

    console.log(`SetupIntent created for need ${needId} by user ${profile.id}`);

    return NextResponse.json({
      setupIntentId: setupIntentResult.setupIntentId,
      clientSecret: setupIntentResult.clientSecret,
    });
  } catch (error) {
    console.error('Setup intent creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
