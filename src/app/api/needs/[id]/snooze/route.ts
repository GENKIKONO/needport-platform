import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // TODO: 後でSupabase更新に差し替え
  // いまは204でOK（フロントは楽観更新）
  return new NextResponse(null, { status: 204 });
}
