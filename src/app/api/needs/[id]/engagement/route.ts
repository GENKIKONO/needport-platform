// src/app/api/needs/[id]/engagement/route.ts
// API for need engagement (interest/pledge) and anonymous interest

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { 
  generateAnonymousKey, 
  getClientIP, 
  checkAnonymousRateLimit, 
  isValidEngagementKind,
  type EngagementSummary 
} from '@/lib/engagements';

interface RouteParams {
  params: { id: string };
}

/**
 * POST /api/needs/[id]/engagement
 * Record user engagement (interest/pledge) or anonymous interest
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const needId = params.id;
    const body = await request.json();
    const { kind } = body;
    
    if (!isValidEngagementKind(kind)) {
      return NextResponse.json(
        { error: 'Invalid engagement kind. Must be "interest" or "pledge"' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { userId } = await auth();

    // Check if need exists
    const { data: need, error: needError } = await supabase
      .from('needs')
      .select('id, title')
      .eq('id', needId)
      .single();

    if (needError || !need) {
      return NextResponse.json(
        { error: 'Need not found' },
        { status: 404 }
      );
    }

    if (!userId) {
      // Anonymous user - only 'interest' allowed
      if (kind !== 'interest') {
        return NextResponse.json(
          { error: 'Anonymous users can only express interest. Please log in to pledge.' },
          { status: 401 }
        );
      }

      // Check rate limit
      const clientIP = getClientIP(request);
      if (!checkAnonymousRateLimit(clientIP)) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      // Generate anonymous key and record interest
      const anonKey = generateAnonymousKey(request);
      
      const { error: insertError } = await supabase
        .from('need_anonymous_interest')
        .insert({
          need_id: needId,
          anon_key: anonKey,
          day: new Date().toISOString().split('T')[0] // YYYY-MM-DD
        });

      if (insertError) {
        // If unique constraint violation, it means they already expressed interest today
        if (insertError.code === '23505') {
          return NextResponse.json({ ok: true, message: 'Interest already recorded for today' });
        }
        throw insertError;
      }

      return NextResponse.json({ 
        ok: true, 
        message: 'Anonymous interest recorded. Log in to express purchase intent!' 
      });
    } else {
      // Authenticated user
      const { error: upsertError } = await supabase
        .from('need_engagements')
        .upsert({
          need_id: needId,
          user_id: userId,
          kind: kind
        }, {
          onConflict: 'need_id,user_id,kind'
        });

      if (upsertError) {
        throw upsertError;
      }

      return NextResponse.json({ 
        ok: true, 
        message: `${kind === 'pledge' ? 'Purchase intent' : 'Interest'} recorded successfully` 
      });
    }

  } catch (error) {
    console.error('Engagement POST error:', error);
    return NextResponse.json(
      { error: 'Failed to record engagement', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/needs/[id]/engagement
 * Remove user engagement (toggle off)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const needId = params.id;
    const url = new URL(request.url);
    const kind = url.searchParams.get('kind');
    
    if (!isValidEngagementKind(kind)) {
      return NextResponse.json(
        { error: 'Invalid engagement kind. Must be "interest" or "pledge"' },
        { status: 400 }
      );
    }

    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    
    const { error } = await supabase
      .from('need_engagements')
      .delete()
      .eq('need_id', needId)
      .eq('user_id', userId)
      .eq('kind', kind);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      ok: true, 
      message: `${kind === 'pledge' ? 'Purchase intent' : 'Interest'} removed successfully` 
    });

  } catch (error) {
    console.error('Engagement DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to remove engagement', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


