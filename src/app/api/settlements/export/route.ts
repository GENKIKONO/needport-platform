import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function toCSV(rows: any[]): string {
  if (!rows.length) return 'id,need_id,vendor_id,final_price,fee_rate,fee_amount,method,status,paid_at,created_at\n';
  const header = Object.keys(rows[0]).join(',');
  const body = rows.map(r =>
    Object.values(r).map(v => {
      if (v == null) return '';
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    }).join(',')
  ).join('\n');
  return header + '\n' + body + '\n';
}

export async function GET() {
  const { userId, sessionClaims } = auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  // admin 判定（user_rolesを使う場合は既存のAPIと揃える）
  const isAdmin = Array.isArray((sessionClaims as any)?.publicMetadata?.roles)
    ? (sessionClaims as any).publicMetadata.roles.includes('admin')
    : true; // 暫定: 他の層で既にadmin限定にしている前提／必要ならDBで検証
  if (!isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const s = supabaseAdmin();
  const { data, error } = await s
    .from('project_settlements')
    .select('id,need_id,vendor_id,final_price,fee_rate,fee_amount,method,status,paid_at,created_at')
    .order('created_at', { ascending: false })
    .limit(2000);
  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });

  const csv = toCSV(data ?? []);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="settlements.csv"',
      'cache-control': 'no-store'
    }
  });
}
