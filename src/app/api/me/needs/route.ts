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
    const list = await listNeeds({ stage: "all", page: 1, pageSize: 1000 });
    
    // 自分のニーズのみフィルタ
    const myNeeds = list.rows.filter(need => need.ownerUserId === uid);
    
    return NextResponse.json({ items: myNeeds, total: myNeeds.length });
  } catch (error) {
    console.error("Failed to get my needs:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
