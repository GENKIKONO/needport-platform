import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/app/api/admin/_util";
import { createVendor, listVendors } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 簡易レート制限
async function rateLimit(req: NextRequest, key: string, limitPerMin: number = 30): Promise<boolean> {
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
  const minute = Math.floor(Date.now() / 60000);
  const rateKey = `rate:${key}:${ip}:${minute}`;
  
  try {
    const { kv } = await import("@vercel/kv");
    const count = await kv.incr(rateKey);
    await kv.expire(rateKey, 60); // 1分で期限切れ
    return count <= limitPerMin;
  } catch (error) {
    // KVが利用できない場合は制限なし
    return true;
  }
}

export async function POST(req: NextRequest){
  // レート制限チェック
  const allowed = await rateLimit(req, 'vendor_post', 10);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { name, email, note } = await req.json().catch(()=>({}));
  if(!name || !email) return NextResponse.json({error:"name/email required"},{status:400});

  const vendor = await createVendor({ name, email, note });
  return NextResponse.json(vendor, { status: 201 });
}

// 管理者が一覧を見る簡易GET（管理者ガード）
export async function GET(req: NextRequest){
  const g = guard(req); if (g) return g;
  const vendors = await listVendors();
  return NextResponse.json({ items: vendors });
}
