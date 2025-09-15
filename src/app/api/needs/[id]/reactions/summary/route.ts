import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    const needId = params.id;

    if (!needId) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', detail: 'Need ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get user profile if authenticated
    let userProfileId: string | null = null;
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_user_id', userId)
        .single();
      
      userProfileId = profile?.id || null;
    }

    // Verify the need exists and is accessible
    const { data: need, error: needError } = await supabase
      .from('needs')
      .select('id, status')
      .eq('id', needId)
      .single();

    if (needError || !need) {
      return NextResponse.json(
        { error: 'NEED_NOT_FOUND', detail: 'Need not found' },
        { status: 404 }
      );
    }

    // Check if need is publicly accessible
    const isAccessible = need.status === 'published' || 
                        (need.status === 'archived' && userId !== null);

    if (!isAccessible) {
      return NextResponse.json(
        { error: 'NEED_NOT_ACCESSIBLE', detail: 'Need not accessible' },
        { status: 403 }
      );
    }

    // Use the database function to get reaction summary
    const { data: summary, error: summaryError } = await supabase
      .rpc('get_need_reactions_summary', {
        need_uuid: needId,
        requesting_user_uuid: userProfileId
      });

    if (summaryError) {
      console.error('Get reactions summary error:', summaryError);
      return NextResponse.json(
        { error: 'SUMMARY_FAILED', detail: 'Failed to get reaction summary' },
        { status: 500 }
      );
    }

    // Return the summary with proper structure
    return NextResponse.json({
      need_id: needId,
      want_to_buy_count: summary.want_to_buy_count || 0,
      interested_count: summary.interested_count || 0,
      total_reactions: (summary.want_to_buy_count || 0) + (summary.interested_count || 0),
      user_reactions: summary.user_reactions || {
        want_to_buy: false,
        interested: false
      }
    });

  } catch (error) {
    console.error('API Error - Get Reactions Summary:', error);
    return NextResponse.json(
      { 
        error: 'INTERNAL_ERROR', 
        detail: 'サーバーエラーが発生しました。' 
      },
      { status: 500 }
    );
  }
}