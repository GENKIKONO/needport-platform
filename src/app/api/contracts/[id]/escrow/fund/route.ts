import { NextResponse } from 'next/server';
import type { B2BApiResponse } from '@/lib/types/b2b';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<B2BApiResponse>> {
  return NextResponse.json(
    {
      ok: false,
      todo: 'Escrow funding API - Phase 2 implementation pending (Stripe integration required)'
    },
    { status: 501 }
  );
}
