import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

const querySchema = z.object({
  needId: z.string().uuid()
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return NextResponse.json({ error: 'invalid_query' }, { status: 400 });

  const { needId } = parsed.data;
  // 公開側で使うため、認証不要・枚数のみ返す
  const sadmin = supabaseAdmin();
  const { data, error } = await sadmin.from('proposals').select('id', { count: 'exact', head: true }).eq('need_id', needId);
  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });

  return NextResponse.json({ needId, count: data ? data.length : 0 }); // Supabase head+count が取りづらい環境向けフォールバック
}
