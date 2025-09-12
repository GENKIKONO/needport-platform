import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { audit } from "@/lib/audit";

type NeedCreateInput = {
  title: string;
  category?: string;
  region?: string;
  description?: string;
  budgetHint?: string;
};

const mem:any[] = []; // STEP1: 擬似保存。STEP2でDB化

export async function POST(req: Request) {
  const { userId } = await requireUser();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json()) as NeedCreateInput;
  if (!body?.title || body.title.length < 2) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const row = {
    id: `np-${Date.now()}`,
    userId, status: "active",
    updatedAt: now, createdAt: now,
    ...body,
  };
  mem.push(row);

  await audit("need.create", { userId, id: row.id, title: row.title });

  return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
}