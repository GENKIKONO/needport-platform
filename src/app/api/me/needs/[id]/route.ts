import { NextRequest, NextResponse } from "next/server";
import { getNeed, updateNeed, deleteNeed, logEvent } from "@/lib/admin/store";
import { getFlags } from "@/lib/admin/flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = req.cookies.get("uid")?.value;
  
  if (!uid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  
  try {
    // フラグチェック
    const flags = await getFlags();
    if (!flags.userEditEnabled) {
      return NextResponse.json({ error: "feature_disabled" }, { status: 423 });
    }
    
    // 所有権チェック
    const need = await getNeed(params.id);
    if (!need) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    
    if (need.ownerUserId !== uid) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    
    // 更新データ
    const { title, body, estimateYen } = await req.json();
    const updates: any = {};
    
    if (title !== undefined) updates.title = title;
    if (body !== undefined) updates.body = body;
    if (estimateYen !== undefined) updates.estimateYen = estimateYen;
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "no_updates" }, { status: 400 });
    }
    
    // 更新実行
    const updated = await updateNeed(params.id, updates);
    
    // 監査ログ
    await logEvent({
      type: "me:update",
      needId: params.id,
      meta: { uid, updates: Object.keys(updates) }
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update need:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = req.cookies.get("uid")?.value;
  
  if (!uid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  
  try {
    // フラグチェック
    const flags = await getFlags();
    if (!flags.userDeleteEnabled) {
      return NextResponse.json({ error: "feature_disabled" }, { status: 423 });
    }
    
    // 所有権チェック
    const need = await getNeed(params.id);
    if (!need) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    
    if (need.ownerUserId !== uid) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    
    // 削除実行
    await deleteNeed(params.id);
    
    // 監査ログ
    await logEvent({
      type: "me:delete",
      needId: params.id,
      meta: { uid, title: need.title }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete need:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
