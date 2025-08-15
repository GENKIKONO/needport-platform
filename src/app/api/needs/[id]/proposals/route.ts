import { NextResponse } from 'next/server';
import type { B2BApiResponse } from '@/lib/types/b2b';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const notYet = (todo: string) =>
  Response.json({ ok: false, todo }, { status: 501 });

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  return notYet('Proposals list API - Phase 2 implementation pending');
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  return notYet('Proposal creation API - Phase 2 implementation pending');
}
