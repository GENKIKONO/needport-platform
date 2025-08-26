import { NextResponse } from "next/server";
import { readCms, writeCms } from "@/lib/cms/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await readCms();
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await writeCms(body);
  return NextResponse.json(result.ok ? { ok: true } : { ok: false, reason: "read-only" });
}
