export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  console.error('[client-error]', JSON.stringify(body).slice(0, 4000));
  return new NextResponse(null, { status: 204 });
}
