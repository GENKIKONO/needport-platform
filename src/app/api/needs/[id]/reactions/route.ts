import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Request schema for toggle reaction
const toggleReactionSchema = z.object({
  kind: z.enum(['WANT_TO_BUY', 'INTERESTED']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', detail: 'ログインが必要です。' },
        { status: 401 }
      );
    }

    const needId = params.id;
    if (!needId) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', detail: 'Need ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validation = toggleReactionSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'VALIDATION_ERROR', 
          detail: 'Invalid reaction type',
          issues: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { kind } = validation.data;
    const supabase = createClient();

    // Get user profile to ensure it exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'PROFILE_NOT_FOUND', detail: 'User profile not found' },
        { status: 404 }
      );
    }

    // Verify the need exists and is accessible
    const { data: need, error: needError } = await supabase
      .from('needs')
      .select('id, status, owner_id')
      .eq('id', needId)
      .single();

    if (needError || !need) {
      return NextResponse.json(
        { error: 'NEED_NOT_FOUND', detail: 'Need not found' },
        { status: 404 }
      );
    }

    // Check if need is accessible for reactions
    if (!['published', 'archived'].includes(need.status)) {
      return NextResponse.json(
        { 
          error: 'NEED_NOT_ACCESSIBLE', 
          detail: 'この投稿にはリアクションできません。' 
        },
        { status: 403 }
      );
    }

    // Use the toggle_reaction database function
    const { data: result, error: toggleError } = await supabase
      .rpc('toggle_reaction', {
        p_need_id: needId,
        p_user_id: profile.id,
        p_kind: kind
      });

    if (toggleError) {
      console.error('Toggle reaction error:', toggleError);
      return NextResponse.json(
        { 
          error: 'TOGGLE_FAILED', 
          detail: 'リアクションの更新に失敗しました。' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      action: result.action,
      current_state: result.current_state,
      total_count: result.total_count,
      kind: kind
    });

  } catch (error) {
    console.error('API Error - Toggle Reaction:', error);
    return NextResponse.json(
      { 
        error: 'INTERNAL_ERROR', 
        detail: 'サーバーエラーが発生しました。' 
      },
      { status: 500 }
    );
  }
}