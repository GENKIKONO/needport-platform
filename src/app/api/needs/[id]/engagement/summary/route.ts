// src/app/api/needs/[id]/engagement/summary/route.ts
// API for getting engagement summary

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { type EngagementSummary } from '@/lib/engagements';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/needs/[id]/engagement/summary
 * Get engagement summary for a need
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const needId = params.id;
    const supabase = createClient();

    // Get authenticated user engagements
    const { data: engagements, error: engagementsError } = await supabase
      .from('need_engagements')
      .select('kind')
      .eq('need_id', needId);

    if (engagementsError) {
      throw engagementsError;
    }

    // Get anonymous interest (today and total)
    const today = new Date().toISOString().split('T')[0];
    
    const { data: anonInterestToday, error: anonTodayError } = await supabase
      .from('need_anonymous_interest')
      .select('id')
      .eq('need_id', needId)
      .eq('day', today);

    if (anonTodayError) {
      throw anonTodayError;
    }

    const { data: anonInterestTotal, error: anonTotalError } = await supabase
      .from('need_anonymous_interest')
      .select('id')
      .eq('need_id', needId);

    if (anonTotalError) {
      throw anonTotalError;
    }

    // Calculate summary
    const interestUsers = engagements?.filter(e => e.kind === 'interest').length || 0;
    const pledgeUsers = engagements?.filter(e => e.kind === 'pledge').length || 0;
    const anonInterestTodayCount = anonInterestToday?.length || 0;
    const anonInterestTotalCount = anonInterestTotal?.length || 0;

    const summary: EngagementSummary = {
      interest_users: interestUsers,
      pledge_users: pledgeUsers,
      anon_interest_today: anonInterestTodayCount,
      anon_interest_total: anonInterestTotalCount
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Engagement summary GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get engagement summary', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}