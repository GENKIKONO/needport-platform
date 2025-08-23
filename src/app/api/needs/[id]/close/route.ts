import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from '@/lib/devAuth';
import { closeNeed, getNeed } from '@/lib/needs/lifecycle';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    const { reason } = await req.json();

    // ニーズの存在確認と権限チェック
    const need = await getNeed(needId);
    if (!need) {
      return NextResponse.json({ error: 'Need not found' }, { status: 404 });
    }

    // 投稿者または管理者のみ操作可能
    if (need.user_id !== devSession.userId && devSession.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 完了処理
    const updatedNeed = await closeNeed(needId, reason);

    return NextResponse.json({ 
      success: true, 
      need: updatedNeed,
      message: 'ニーズを完了しました'
    });

  } catch (error) {
    console.error('Error closing need:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
