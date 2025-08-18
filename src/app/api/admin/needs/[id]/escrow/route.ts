import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: hook to Stripe
  const body = await request.json();
  const { action } = body;
  
  // Stub response - always success
  return NextResponse.json({ 
    success: true, 
    message: `Escrow ${action} for need ${params.id}` 
  });
}
