import { NextRequest, NextResponse } from "next/server";
import { createNeed, listPublicNeeds } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/needs → 公開/サンプルの一覧
export async function GET() {
  const list = await listPublicNeeds();
  return NextResponse.json({ items: list });
}

// POST /api/needs → 一般ユーザの投稿
export async function POST(req: NextRequest) {
  const { title, body, estimateYen } = await req.json().catch(() => ({}));
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }
  const need = await createNeed({
    title,
    body,
    estimateYen: typeof estimateYen === "number" ? estimateYen : undefined,
    ownerMasked: "ユーザ", // 将来はログインユーザ名に置換
    isPublished: false,     // 投稿直後は非公開（管理で公開にする）
    isSample: false,
  });
  return NextResponse.json(need, { status: 201 });
}
