import { NextRequest, NextResponse } from "next/server";
import { listNeeds } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const uid = req.cookies.get("uid")?.value;
  
  if (!uid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
    const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? "50"), 1), 100);
    
    const list = await listNeeds({ stage: "all", page, pageSize: 1000 });
    
    // 自分のニーズのみフィルタ
    const myNeeds = list.rows.filter(need => need.ownerUserId === uid);
    
    const total = myNeeds.length;
    const start = (page - 1) * pageSize;
    const items = myNeeds.slice(start, start + pageSize);
    
    return NextResponse.json({ items, total, page, pageSize });
  } catch (error) {
    console.error("Failed to get my needs:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
