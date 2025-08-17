import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

function requireAuth() {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE;
  const adminKey = process.env.ADMIN_UI_KEY;
  
  if (!serviceRole) {
    throw new Error('SUPABASE_SERVICE_ROLE is not set');
  }
  if (!adminKey) {
    throw new Error('ADMIN_UI_KEY is not set');
  }
  
  return { serviceRole, adminKey };
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    requireAuth();
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const id = params.id;

  // Supabase Admin SDK が無ければfetch RPCでもOK。ここは擬似コード。
  // 既存の supabase server クライアント生成ヘルパがあればそれを import。
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );

  // 関連テーブルがあれば先に delete（FK制約に応じて調整）
  const { error } = await supabase.from('needs').delete().eq('id', id);
  if (error) {
    console.error('delete need error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
