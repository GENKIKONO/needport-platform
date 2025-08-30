import { NextResponse } from 'next/server';

export async function GET() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || null;
  const branch = process.env.VERCEL_GIT_COMMIT_REF || null;
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown';
  return NextResponse.json({ ok: true, sha, branch, env, at: new Date().toISOString() });
}
