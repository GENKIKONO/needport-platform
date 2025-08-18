import { NextResponse } from "next/server";
import { guard } from "@/app/api/admin/_util";
import { listUsersWithTrust } from "@/lib/trust/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await guard(req as any); if (g) return g;
  const { rows, total } = await listUsersWithTrust({ page: 1, pageSize: 200 }); // 最小でOK
  return NextResponse.json({ rows, total });
}
