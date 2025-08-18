import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/app/api/admin/_util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 簡易: KVがなければプロセスメモリ配列に積む
const mem:any[] = [];

export async function POST(req: NextRequest){
  const { name, email, note } = await req.json().catch(()=>({}));
  if(!name || !email) return NextResponse.json({error:"name/email required"},{status:400});

  const v = { id: "V"+String(Date.now()), name, email, note, status:"pending", createdAt:new Date().toISOString()};
  mem.push(v);
  // TODO: KV保存に置き換え（将来）
  return NextResponse.json(v, { status: 201 });
}

// 管理者が一覧を見る簡易GET（管理者ガード）
export async function GET(req: NextRequest){
  const g = guard(req); if (g) return g;
  return NextResponse.json({ items: mem });
}
