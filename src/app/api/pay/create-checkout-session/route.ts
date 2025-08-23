import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireFullVerification, createAuthErrorResponse } from '@/lib/server/auth-guard';
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { auditHelpers } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Check if payments are enabled
    if (process.env.PAYMENTS_ENABLED !== '1') {
      return NextResponse.json({ error: 'Payments are disabled' }, { status: 501 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(req, {
      limit: RATE_LIMITS.DEFAULT.limit,
      windowMs: RATE_LIMITS.DEFAULT.windowMs,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // Require full verification (email + phone)
    const authResult = await requireFullVerification(req);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }
    
    const userId = authResult.userId!;

    // Parse request
    const body = await req.json();
    const { matchId, businessId, amount, currency = 'JPY' } = body;

    if (!matchId || !businessId || !amount || amount <= 0) {
      return NextResponse.json({ 
        error: 'Missing required fields: matchId, businessId, amount' 
      }, { status: 400 });
    }

    // Verify actor is businessId
    if (userId !== businessId) {
      return NextResponse.json({ error: 'Unauthorized: actor must be business' }, { status: 403 });
    }

    // Initialize Stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 501 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });

    // Database operations
    const admin = createAdminClient();

    // Check match exists and is pending
    const { data: match, error: matchError } = await admin
      .from('matches')
      .select('id, need_id, business_id, status, amount')
      .eq('id', matchId)
      .eq('business_id', businessId)
      .eq('status', 'pending')
      .single();

    if (matchError || !match) {
      return NextResponse.json({ 
        error: 'Match not found or not in pending status' 
      }, { status: 404 });
    }

    // Verify amount matches
    if (match.amount !== amount) {
      return NextResponse.json({ 
        error: 'Amount mismatch' 
      }, { status: 400 });
    }

    // Get business profile for Stripe customer
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id, stripe_customer_id, clerk_user_id')
      .eq('id', businessId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Business profile not found' }, { status: 404 });
    }

    // Create Stripe customer if needed
    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          profile_id: profile.id,
          clerk_user_id: profile.clerk_user_id,
        },
      });
      
      customerId = customer.id;
      
      // Update profile with customer ID
      await admin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', profile.id);
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `マッチングフィー - Need ${match.need_id}`,
              description: `ニーズマッチング手数料`,
            },
            unit_amount: amount, // Amount in smallest currency unit (yen)
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/rooms/${match.need_id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/needs/${match.need_id}`,
      metadata: {
        match_id: matchId,
        business_id: businessId,
        need_id: match.need_id,
      },
      payment_intent_data: {
        metadata: {
          match_id: matchId,
          business_id: businessId,
          need_id: match.need_id,
        },
      },
    });

    // Log audit event
    await auditHelpers.paymentInitiated(businessId, matchId, checkoutSession.id, amount);

    return NextResponse.json({ 
      url: checkoutSession.url,
      session_id: checkoutSession.id 
    });

  } catch (error) {
    console.error('Create checkout session error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
