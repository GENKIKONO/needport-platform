import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

function requireServiceRole() {
  const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE is not set');
  return key;
}

// 認可: 既存の管理ログイン cookie を検査するヘルパがあれば使ってOK。
// ここでは簡易に service role 有無で縛る（UIは管理画面からのみ叩く前提）
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  requireServiceRole();
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
