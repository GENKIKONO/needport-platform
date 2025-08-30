import { NextRequest, NextResponse } from "next/server";
import { NeedCreateSchema } from '@/schemas/need';
import { verifyTurnstile } from '@/lib/turnstile';
// import { db } from '@/lib/db' // 既存のDB層に合わせて実装してください

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/needs → 公開ニーズの一覧
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? "10"), 1), 50);
  const q = searchParams.get("q") ?? undefined;

  try {
    // TODO: Supabase クライアントで実装
    // const supabase = createAdminClient();
    // let query = supabase.from('needs').select('*').order('created_at', { ascending: false });
    // if (q) query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
    // const { data: items, error } = await query.range((page - 1) * pageSize, page * pageSize - 1);
    
    return NextResponse.json({ 
      items: [], 
      total: 0, 
      page, 
      pageSize 
    });
  } catch (error) {
    console.error('Error in GET /api/needs:', error);
    return NextResponse.json({ items: [], total: 0, page, pageSize }, { 
      status: 200,
      headers: { 'cache-control': 'no-store' }
    });
  }
}

// POST /api/needs → ニーズ投稿
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? undefined;
  const tokenHeader = req.headers.get('x-turnstile-token');

  const v = await verifyTurnstile(tokenHeader, ip);
  if (!v.ok) {
    return NextResponse.json({ error: 'turnstile_failed', detail: v.reason }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = NeedCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input', detail: parsed.error.flatten() }, { status: 400 });
  }

  // 常に review 固定（published で来ても無視）
  const payload = { ...parsed.data, status: 'review' as const };
  // const inserted = await db.needs.insert(payload);
  // return NextResponse.json({ ok: true, id: inserted.id });
  // 一時モック（DB接続前提なら上を使う）:
  return NextResponse.json({ ok: true, id: 'mock-id', status: 'review' });
}
