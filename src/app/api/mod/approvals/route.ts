import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDevSession } from '@/lib/devAuth';

export async function GET(req: NextRequest) {
  try {
    const devSession = getDevSession();
    if (!devSession) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'mine';

    const supabase = createAdminClient();

    let query = supabase
      .from('approvals')
      .select(`
        id,
        need_id,
        applicant_id,
        status,
        note,
        created_at,
        updated_at,
        needs!inner(
          id,
          title,
          user_id
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    // スコープに応じてフィルタ
    if (scope === 'mine') {
      // 自分のニーズへの申請のみ
      query = query.eq('needs.user_id', devSession.userId);
    }

    const { data: approvals, error } = await query;

    if (error) {
      console.error('Error fetching approvals:', error);
      return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      approvals: approvals || [] 
    });

  } catch (error) {
    console.error('Error in approvals list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'
