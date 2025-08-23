import { NextRequest, NextResponse } from 'next/server';
import { listVendorReviews } from '@/lib/server/reviews';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/reviews/vendors → 審査一覧（管理者のみ）
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | undefined;

    // TODO: 管理者権限チェック
    // 開発中は全許可、本番では管理者ロールチェック

    const reviews = await listVendorReviews(status);

    return NextResponse.json({ reviews });

  } catch (error) {
    console.error('List vendor reviews error:', error);
    return NextResponse.json({ 
      error: "internal_error" 
    }, { status: 500 });
  }
}
