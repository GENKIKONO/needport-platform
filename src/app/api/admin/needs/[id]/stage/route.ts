import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: connect to real DB (Prisma/SQL)
  const body = await request.json();
  const { stage } = body;
  
  // Stub response - always success
  return NextResponse.json({ 
    success: true, 
    message: `Need ${params.id} stage updated to ${stage}` 
  });
}
