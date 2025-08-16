export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { key } = await req.json().catch(() => ({}));
  
  if (key && process.env.ADMIN_UI_KEY && key === process.env.ADMIN_UI_KEY) {
    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    return new Response(null, { 
      status: 204, 
      headers: { 
        'Set-Cookie': `admin=1; Path=/; HttpOnly; SameSite=Lax${secureFlag}` 
      }
    });
  }
  
  return Response.json({ ok: false, error: 'invalid_key' }, { status: 401 });
}
