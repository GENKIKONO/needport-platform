// src/app/api/needs/[id]/engagement/user/route.ts
// API for getting current user's engagement status

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/needs/[id]/engagement/user
 * Get current user's engagement status for this need
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const needId = params.id;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        interest: false, 
        pledge: false 
      });
    }

    const supabase = createClient();
    
    const { data: engagements, error } = await supabase
      .from('need_engagements')
      .select('kind')
      .eq('need_id', needId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    const hasInterest = engagements?.some(e => e.kind === 'interest') || false;
    const hasPledge = engagements?.some(e => e.kind === 'pledge') || false;

    return NextResponse.json({ 
      interest: hasInterest, 
      pledge: hasPledge 
    });

  } catch (error) {
    console.error('User engagement GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get user engagement', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}