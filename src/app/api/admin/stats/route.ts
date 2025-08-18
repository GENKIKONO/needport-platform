import { NextResponse } from "next/server";
import { getStats } from "@/lib/admin/mock";

export async function GET() {
  // TODO: connect to real DB (Prisma/SQL)
  const stats = getStats();
  
  return NextResponse.json(stats);
}
