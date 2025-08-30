import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDevSession } from '@/lib/devAuth';
import { events } from '@/lib/events';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const devSession = getDevSession();
    if (!devSession) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const needId = params.id;
    const { note } = await req.json();

    const supabase = createAdminClient();

    // ニーズの存在確認
    const { data: need, error: needError } = await supabase
      .from('needs')
      .select('id, title, user_id, status')
      .eq('id', needId)
      .single();

    if (needError || !need) {
      return NextResponse.json({ error: 'Need not found' }, { status: 404 });
    }

    if (need.status !== 'active') {
      return NextResponse.json({ error: 'Need is not active' }, { status: 400 });
    }

    // 既存の申請確認
    const { data: existingApproval } = await supabase
      .from('approvals')
      .select('id, status')
      .eq('need_id', needId)
      .eq('applicant_id', devSession.userId)
      .single();

    if (existingApproval) {
      return NextResponse.json({ 
        error: 'Application already exists',
        status: existingApproval.status 
      }, { status: 409 });
    }

    // 申請作成
    const { data: approval, error: approvalError } = await supabase
      .from('approvals')
      .insert({
        need_id: needId,
        applicant_id: devSession.userId,
        status: 'pending',
        note: note || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (approvalError) {
      console.error('Error creating approval:', approvalError);
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }

    // イベント追跡
    events.kaichuFilter(devSession.userId, {
      type: 'rooms.apply',
      needId,
      approvalId: approval.id
    });

    return NextResponse.json({ 
      success: true, 
      approval,
      message: 'Application submitted successfully' 
    });

  } catch (error) {
    console.error('Error in room application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
