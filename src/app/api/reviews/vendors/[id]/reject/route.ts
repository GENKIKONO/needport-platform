import { NextRequest, NextResponse } from 'next/server';
import { rejectVendor } from '@/lib/server/reviews';
import { getDevSession } from '@/lib/devAuth';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/reviews/vendors/[id]/reject → 事業者却下
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    const json = await req.json();
    const { note } = json;

    if (!note || typeof note !== 'string') {
      return NextResponse.json({ 
        error: "note_required" 
      }, { status: 400 });
    }

    // TODO: 管理者権限チェック
    // 開発中は全許可、本番では管理者ロールチェック

    const devSession = getDevSession();
    const reviewerId = devSession?.userId || 'admin';

    await rejectVendor(reviewId, reviewerId, note);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Reject vendor error:', error);
    return NextResponse.json({ 
      error: "internal_error" 
    }, { status: 500 });
  }
}
