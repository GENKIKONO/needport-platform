import { NextRequest, NextResponse } from "next/server";
import { listNeeds } from "@/lib/admin/mock";

export async function GET(request: NextRequest) {
  // TODO: connect to real DB (Prisma/SQL)
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || undefined;
  const stage = searchParams.get("stage") as any || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  
  const result = listNeeds({ q, stage, page, pageSize });
  
  return NextResponse.json(result);
}
