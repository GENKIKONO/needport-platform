import { NextRequest, NextResponse } from 'next/server';
import { approveVendor } from '@/lib/server/reviews';
import { getDevSession } from '@/lib/devAuth';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/reviews/vendors/[id]/approve → 事業者承認
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;

    // TODO: 管理者権限チェック
    // 開発中は全許可、本番では管理者ロールチェック

    const devSession = getDevSession();
    const reviewerId = devSession?.userId || 'admin';

    await approveVendor(reviewId, reviewerId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Approve vendor error:', error);
    return NextResponse.json({ 
      error: "internal_error" 
    }, { status: 500 });
  }
}
