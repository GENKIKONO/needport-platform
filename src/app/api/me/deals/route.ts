import { NextResponse } from 'next/server';
import { requireUserId } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const uid = requireUserId();
    
    // モックデータ（実際の実装では listDeals(uid) を呼び出す）
    const deals = [
      {
        id: '1',
        title: 'Webサイト制作',
        status: 'active',
        amount: 500000,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
      },
      {
        id: '2',
        title: 'アプリ開発',
        status: 'completed',
        amount: 800000,
        created_at: '2024-01-10T00:00:00Z',
        updated_at: '2024-01-20T00:00:00Z',
      },
    ];

    return NextResponse.json({ ok: true, data: deals });
  } catch (error) {
    console.error('Error in GET /api/me/deals:', error);
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
