import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isBillingConfigured, createBillingPortalSession } from '@/lib/server/stripe';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  if (!isBillingConfigured()) {
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

    const { returnUrl } = await req.json();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
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
        { error: 'No billing account found' },
        { status: 404 }
      );
    }

    // Create portal session
    const sessionResult = await createBillingPortalSession({
      customerId: profile.stripe_customer_id,
      returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/my`,
    });

    if (sessionResult.error) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: sessionResult.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
