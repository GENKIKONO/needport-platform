// src/app/api/prejoins/route.ts
export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { logConsent } from '@/lib/server/consent';

const BodySchema = z.object({
  needId: z.string().uuid('needId は UUID 形式で入力してください'),
  userId: z.string().min(1).optional(), // いまは任意。将来 Clerk 等で置き換え可
});

function getAdminSb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const srv = process.env.SUPABASE_SERVICE_ROLE_KEY; // サーバー専用キー
  if (!url || !srv) {
    throw new Error('SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が未設定です');
  }
  return createClient(url, srv, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}));
    const parse = BodySchema.safeParse(json);
    if (!parse.success) {
      return new Response(
        JSON.stringify({ ok: false, message: parse.error.errors[0]?.message ?? 'invalid body' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const { needId, userId } = parse.data;
    const sb = getAdminSb();

    // IP rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const today = new Date().toISOString().split('T')[0];
    const throttleKey = `prejoin:${needId}`;
    
    // Check current throttle count
    const { data: throttleData } = await sb
      .from('ip_throttle')
      .select('count')
      .eq('day', today)
      .eq('ip', ip)
      .eq('key', throttleKey)
      .single();
    
    const currentCount = throttleData?.count || 0;
    if (currentCount >= 10) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: 'Rate limit exceeded. Please try again later.' 
        }),
        { status: 429, headers: { 'content-type': 'application/json' } }
      );
    }
    
    // Increment throttle count
    await sb
      .from('ip_throttle')
      .upsert({
        day: today,
        ip: ip,
        key: throttleKey,
        count: currentCount + 1
      });

    // 重複チェック
    if (userId) {
      const { data: existing } = await sb
        .from('prejoins')
        .select('id')
        .eq('need_id', needId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        return new Response(JSON.stringify({ ok: false, message: 'already prejoined' }), {
          status: 409,
          headers: { 'content-type': 'application/json' },
        });
      }
    }

    // 参照整合性: need が存在しないと 23503（FK違反）になる
    const { data, error } = await sb
      .from('prejoins')
      .insert({ need_id: needId, user_id: userId ?? null })
      .select('id')
      .single();

    if (error) {
      // FK違反 -> 指定 need が無い
      if ((error as any).code === '23503') {
        return new Response(JSON.stringify({ ok: false, message: 'need not found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ ok: false, message: error.message }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Log consent for prejoin creation
    await logConsent({
      subject: 'prejoin.create',
      refId: data.id,
      req,
    });

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, message: e?.message ?? 'unexpected error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const needId = searchParams.get('needId');
    const userId = searchParams.get('userId');
    const sb = getAdminSb();

    const { data, error } = await sb
      .from('prejoins')
      .select('*')
      .match({ 
        ...(needId && { need_id: needId }), 
        ...(userId && { user_id: userId }) 
      });

    if (error) {
      return new Response(JSON.stringify({ ok: false, message: error.message }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      ok: true, 
      items: data || [],
      count: data?.length || 0
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, message: e?.message ?? 'unexpected error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}));
    const parse = BodySchema.safeParse(json);
    if (!parse.success) {
      return new Response(
        JSON.stringify({ ok: false, message: parse.error.errors[0]?.message ?? 'invalid body' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const { needId, userId } = parse.data;
    const sb = getAdminSb();

    if (!userId) {
      return new Response(JSON.stringify({ ok: false, message: 'userId is required for deletion' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const { data, error } = await sb
      .from('prejoins')
      .delete()
      .eq('need_id', needId)
      .eq('user_id', userId)
      .select('id')
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return new Response(JSON.stringify({ ok: false, message: 'prejoin not found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ ok: false, message: error.message }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, message: e?.message ?? 'unexpected error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
