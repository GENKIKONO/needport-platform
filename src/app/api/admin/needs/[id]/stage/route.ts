export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/app/api/admin/_util";
import { updateStage, getNeed } from "@/lib/admin/store";
import { getUser } from "@/lib/trust/store";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const g = guard(req); if (g) return g;
  
  try {
    const { stage } = await req.json();
    const need = await getNeed(params.id);
    if (!need) return NextResponse.json({ error: "not found" }, { status: 404 });

    // ✳ 追加：紹介必須チェック
    if (need.requireIntro) {
      const ownerId = need.ownerUserId;
      const profile = ownerId ? await getUser(ownerId).catch(() => null) : null;
      const hasReferrer = !!profile?.referrerId;
      if (!hasReferrer) {
        return NextResponse.json(
          {
            code: "require_intro",
            message: "この案件は紹介が必要です。紹介URLを発行してユーザに共有してください。",
          },
          { status: 409 }
        );
      }
    }

    const updated = await updateStage(params.id, stage);
    
    if (!updated) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.message.includes('Invalid stage transition')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
