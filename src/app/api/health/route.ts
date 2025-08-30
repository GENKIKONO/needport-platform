import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ 
    ok: true, 
    ts: Date.now(),
    env: process.env.NODE_ENV,
    authMode: process.env.AUTH_MODE || 'simple'
  });
}
