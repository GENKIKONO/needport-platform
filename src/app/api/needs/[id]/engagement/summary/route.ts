// src/app/api/needs/[id]/engagement/summary/route.ts
// Engagement summary API for collective demand visualization

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: { id: string };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const needId = params.id;
    const supabase = createClient();

    // Check if need exists
    const { data: need, error: needError } = await supabase
      .from('needs')
      .select('id, title, published')
      .eq('id', needId)
      .single();

    if (needError || !need) {
      return NextResponse.json(
        { error: 'Need not found' },
        { status: 404 }
      );
    }

    // Get authenticated engagement counts
    const { data: engagementCounts, error: engError } = await supabase
      .from('need_engagements')
      .select('kind')
      .eq('need_id', needId);

    if (engError) throw engError;

    // Count by kind
    const interestUsers = engagementCounts.filter(e => e.kind === 'interest').length;
    const pledgeUsers = engagementCounts.filter(e => e.kind === 'pledge').length;

    // Get anonymous interest counts
    const today = new Date().toISOString().split('T')[0];

    // Today's anonymous interest
    const { count: anonInterestToday, error: anonTodayError } = await supabase
      .from('need_anonymous_interest')
      .select('*', { count: 'exact', head: true })
      .eq('need_id', needId)
      .eq('day', today);

    if (anonTodayError) throw anonTodayError;

    // Total anonymous interest
    const { count: anonInterestTotal, error: anonTotalError } = await supabase
      .from('need_anonymous_interest')
      .select('*', { count: 'exact', head: true })
      .eq('need_id', needId);

    if (anonTotalError) throw anonTotalError;

    // Calculate total engagement
    const totalEngagement = interestUsers + pledgeUsers + (anonInterestTotal || 0);

    return NextResponse.json({
      need_id: needId,
      need_title: need.title,
      need_published: need.published,
      interest_users: interestUsers,
      pledge_users: pledgeUsers,
      anon_interest_today: anonInterestToday || 0,
      anon_interest_total: anonInterestTotal || 0,
      total_engagement: totalEngagement,
      last_updated: new Date().toISOString(),
      breakdown: {
        authenticated: {
          interest: interestUsers,
          pledge: pledgeUsers,
          total: interestUsers + pledgeUsers,
        },
        anonymous: {
          today: anonInterestToday || 0,
          total: anonInterestTotal || 0,
        }
      }
    });

  } catch (error: any) {
    console.error('Error in engagement summary GET:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}