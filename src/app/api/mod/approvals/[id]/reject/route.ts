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
    const { note, reason } = await req.json();

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

    // 却下処理
    const rejectionNote = note || (reason ? `却下理由: ${reason}` : '却下されました');
    
    const { error: updateError } = await supabase
      .from('approvals')
      .update({
        status: 'rejected',
        note: rejectionNote,
        updated_at: new Date().toISOString()
      })
      .eq('id', approvalId);

    if (updateError) {
      console.error('Error updating approval:', updateError);
      return NextResponse.json({ error: 'Failed to reject' }, { status: 500 });
    }

    // イベント追跡
    events.kaichuFilter(devSession.userId, {
      type: 'rooms.reject',
      approvalId,
      needId: approval.need_id,
      applicantId: approval.applicant_id,
      reason
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Application rejected successfully' 
    });

  } catch (error) {
    console.error('Error in rejection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
