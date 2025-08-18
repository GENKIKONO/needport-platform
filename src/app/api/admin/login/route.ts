export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  const { key } = await req.json().catch(() => ({}));
  const expected = process.env.ADMIN_ACCESS_TOKEN;

  if (key && expected && key === expected) {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    return new Response(null, {
      status: 204,
      headers: {
        'Set-Cookie': `admin_token=${key}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=86400`,
      },
    });
  }
  return Response.json({ ok: false, error: 'invalid_key' }, { status: 401 });
}
