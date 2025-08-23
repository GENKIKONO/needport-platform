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

    const approvalId = params.id;
    const { note } = await req.json();

    const supabase = createAdminClient();

    // 申請の存在確認と権限チェック
    const { data: approval, error: approvalError } = await supabase
      .from('approvals')
      .select(`
        id,
        need_id,
        applicant_id,
        status,
        needs!inner(
          id,
          title,
          user_id
        )
      `)
      .eq('id', approvalId)
      .single();

    if (approvalError || !approval) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
    }

    // 権限チェック（ニーズの所有者または管理者のみ）
    if (approval.needs.user_id !== devSession.userId && devSession.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (approval.status !== 'pending') {
      return NextResponse.json({ error: 'Approval is not pending' }, { status: 400 });
    }

    // 承認処理
    const { error: updateError } = await supabase
      .from('approvals')
      .update({
        status: 'approved',
        note: note || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', approvalId);

    if (updateError) {
      console.error('Error updating approval:', updateError);
      return NextResponse.json({ error: 'Failed to approve' }, { status: 500 });
    }

    // ルーム参加者として追加
    const { error: participantError } = await supabase
      .from('room_participants')
      .upsert({
        room_id: approval.need_id, // 簡易的にneed_idをroom_idとして使用
        user_id: approval.applicant_id,
        role: 'participant',
        created_at: new Date().toISOString()
      });

    if (participantError) {
      console.warn('Error adding participant:', participantError);
      // 参加者追加に失敗しても承認は成功とする
    }

    // イベント追跡
    events.kaichuFilter(devSession.userId, {
      type: 'rooms.approve',
      approvalId,
      needId: approval.need_id,
      applicantId: approval.applicant_id
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Application approved successfully' 
    });

  } catch (error) {
    console.error('Error in approval:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
