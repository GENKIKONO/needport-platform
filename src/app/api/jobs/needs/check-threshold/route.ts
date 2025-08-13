import { NextRequest, NextResponse } from 'next/server';
import { getSetupIntentConfig, createOffSessionPaymentIntent, savePayment } from '@/lib/server/setup-intent';
import { getSupabaseAdminConfig } from '@/lib/server/supabase';
import { auditHelpers } from '@/lib/audit';
import { STRIPE_ENABLED } from '@/lib/featureFlags';

export async function POST(req: NextRequest) {
  if (!STRIPE_ENABLED) {
    console.log('Stripe not enabled, skipping threshold check job');
    return NextResponse.json(
      { message: 'Stripe not enabled, job skipped' },
      { status: 200 }
    );
  }

  const config = getSetupIntentConfig();
  const dbConfig = getSupabaseAdminConfig();

  if (!config.isConfigured) {
    console.log('Setup Intent not configured, skipping threshold check job');
    return NextResponse.json(
      { message: 'Setup Intent not configured, job skipped' },
      { status: 200 }
    );
  }

  if (!dbConfig.isConfigured) {
    console.log('Database not configured, skipping threshold check job');
    return NextResponse.json(
      { message: 'Database not configured, job skipped' },
      { status: 200 }
    );
  }

  try {
    console.log('Starting threshold check job...');

    // Get needs with adopted offers and check prejoin counts
    const { data: needs, error: needsError } = await dbConfig.client!
      .from('needs')
      .select(`
        id,
        title,
        adopted_offer_id,
        offers!inner(
          id,
          min_people,
          price
        )
      `)
      .not('adopted_offer_id', 'is', null);

    if (needsError) {
      console.error('Error fetching needs:', needsError);
      return NextResponse.json(
        { error: 'Failed to fetch needs' },
        { status: 500 }
      );
    }

    console.log(`Found ${needs?.length || 0} needs with adopted offers`);

    const processedNeeds = [];
    const processedPayments = [];

    for (const need of needs || []) {
      try {
        // Get prejoin count for this need
        const { count: prejoinCount, error: countError } = await dbConfig.client!
          .from('prejoins')
          .select('*', { count: 'exact', head: true })
          .eq('need_id', need.id)
          .eq('status', 'setup');

        if (countError) {
          console.error(`Error counting prejoins for need ${need.id}:`, countError);
          continue;
        }

        console.log(`Need ${need.id}: ${prejoinCount} prejoins, threshold: ${need.offers.min_people}`);

        // Check if threshold is met
        if (prejoinCount >= need.offers.min_people) {
          console.log(`Threshold met for need ${need.id}, processing payments...`);

          // Get all prejoins for this need that haven't been charged yet
          const { data: prejoins, error: prejoinsError } = await dbConfig.client!
            .from('prejoins')
            .select(`
              id,
              user_id,
              setup_intent_id,
              profiles!inner(
                stripe_customer_id
              )
            `)
            .eq('need_id', need.id)
            .eq('status', 'setup')
            .not('profiles.stripe_customer_id', 'is', null);

          if (prejoinsError) {
            console.error(`Error fetching prejoins for need ${need.id}:`, prejoinsError);
            continue;
          }

          console.log(`Processing ${prejoins?.length || 0} payments for need ${need.id}`);

          for (const prejoin of prejoins || []) {
            try {
              // Check if payment already exists
              const { data: existingPayment } = await dbConfig.client!
                .from('payments')
                .select('id')
                .eq('profile_id', prejoin.user_id)
                .eq('need_id', need.id)
                .eq('type', 'need_payment')
                .single();

              if (existingPayment) {
                console.log(`Payment already exists for profile ${prejoin.user_id} and need ${need.id}`);
                continue;
              }

              // Create off-session payment intent
              const paymentResult = await createOffSessionPaymentIntent({
                customerId: prejoin.profiles.stripe_customer_id,
                amount: need.offers.price,
                currency: 'jpy',
                metadata: {
                  profile_id: prejoin.user_id,
                  need_id: need.id,
                  need_title: need.title,
                  prejoin_id: prejoin.id,
                },
                setupIntentId: prejoin.setup_intent_id,
              });

              if (paymentResult.error) {
                console.error(`Error creating payment for profile ${prejoin.user_id}:`, paymentResult.error);
                continue;
              }

              // Save payment record
              const saveResult = await savePayment({
                profileId: prejoin.user_id,
                needId: need.id,
                paymentIntentId: paymentResult.paymentIntentId,
                amount: need.offers.price,
                currency: 'jpy',
              });

              if (saveResult.error) {
                console.error(`Error saving payment for profile ${prejoin.user_id}:`, saveResult.error);
                continue;
              }

              // Update prejoin status
              const { error: updateError } = await dbConfig.client!
                .from('prejoins')
                .update({ 
                  status: 'charged',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', prejoin.id);

              if (updateError) {
                console.error(`Error updating prejoin status for ${prejoin.id}:`, updateError);
              }

              processedPayments.push({
                profileId: prejoin.user_id,
                needId: need.id,
                paymentIntentId: paymentResult.paymentIntentId,
                amount: need.offers.price,
              });

              console.log(`Payment processed for profile ${prejoin.user_id}, need ${need.id}, amount: ${need.offers.price}`);

              // Log audit event
              await auditHelpers.thresholdPaymentProcessed(
                prejoin.user_id,
                need.id,
                paymentResult.paymentIntentId,
                need.offers.price,
                prejoinCount
              );

            } catch (error) {
              console.error(`Error processing payment for prejoin ${prejoin.id}:`, error);
            }
          }

          processedNeeds.push({
            needId: need.id,
            title: need.title,
            prejoinCount,
            threshold: need.offers.min_people,
            paymentsProcessed: prejoins?.length || 0,
          });

        } else {
          console.log(`Threshold not met for need ${need.id} (${prejoinCount}/${need.offers.min_people})`);
        }

      } catch (error) {
        console.error(`Error processing need ${need.id}:`, error);
      }
    }

    console.log('Threshold check job completed');
    console.log(`Processed ${processedNeeds.length} needs`);
    console.log(`Processed ${processedPayments.length} payments`);

    // Log job completion
    await auditHelpers.thresholdCheckJobCompleted(
      'system',
      processedNeeds.length,
      processedPayments.length
    );

    return NextResponse.json({
      message: 'Threshold check job completed successfully',
      processedNeeds,
      processedPayments,
    });

  } catch (error) {
    console.error('Threshold check job error:', error);
    return NextResponse.json(
      { error: 'Job processing failed' },
      { status: 500 }
    );
  }
}
