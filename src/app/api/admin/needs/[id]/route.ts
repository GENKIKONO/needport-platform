import { NextRequest, NextResponse } from "next/server";
import { getNeed } from "@/lib/admin/mock";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: connect to real DB (Prisma/SQL)
  const need = getNeed(params.id);
  
  if (!need) {
    return NextResponse.json({ error: "Need not found" }, { status: 404 });
  }
  
  return NextResponse.json(need);
}
