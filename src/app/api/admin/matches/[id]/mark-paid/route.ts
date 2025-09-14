import { NextRequest, NextResponse } from 'next/server';
import { createAdminClientOrNull } from "@/lib/supabase/admin";
import { getDevSession } from '@/lib/devAuth';
import { auditHelpers } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;
    
    // 開発用認証チェック
    const devSession = getDevSession();
    if (!devSession || devSession.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClientOrNull();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }

    // 既存のマッチを確認
    const { data: existingMatch, error: matchError } = await supabase
      .from('matches')
      .select('id, status, need_id, business_id')
      .eq('id', matchId)
      .single();

    if (matchError || !existingMatch) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // 既にpaidの場合は冪等で成功
    if (existingMatch.status === 'paid') {
      return NextResponse.json({ 
        success: true, 
        message: 'Already paid',
        matchId 
      });
    }

    // トランザクション開始
    const { error: updateError } = await supabase
      .from('matches')
      .update({ 
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId);

    if (updateError) {
      console.error('Error updating match status:', updateError);
      return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
    }

    // paymentsテーブルに手動支払い記録を追加
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        match_id: matchId,
        amount: 5000, // 仮の金額
        currency: 'JPY',
        method: 'manual',
        status: 'completed',
        created_at: new Date().toISOString()
      });

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      // 支払い記録の失敗は警告として扱うが、マッチ更新は成功とする
    }

    // ルームが存在しない場合は作成
    const { data: existingRoom } = await supabase
      .from('rooms')
      .select('id')
      .eq('need_id', existingMatch.need_id)
      .single();

    if (!existingRoom) {
      const { error: roomError } = await supabase
        .from('rooms')
        .insert({
          need_id: existingMatch.need_id,
          status: 'active',
          created_at: new Date().toISOString()
        });

      if (roomError) {
        console.error('Error creating room:', roomError);
      }
    }

    // 監査ログに記録
    await auditHelpers.log({
      actor: devSession.userId,
      action: 'match.mark_paid_manual',
      target: matchId,
      metadata: {
        matchId,
        needId: existingMatch.need_id,
        businessId: existingMatch.business_id
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Match marked as paid',
      matchId 
    });

  } catch (error) {
    console.error('Error in mark-paid API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
