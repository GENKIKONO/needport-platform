import { NextRequest, NextResponse } from "next/server";
import { listNeeds } from "@/lib/admin/store";
import { guard } from "../_util";

export async function GET(req: NextRequest) {
  const g = guard(req); if (g) return g;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const stage = (searchParams.get("stage") ?? "all") as any;
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 20);
  return NextResponse.json(listNeeds({ q, stage, page, pageSize }));
}
