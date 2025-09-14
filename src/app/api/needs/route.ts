import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { getRequestId, logWithRequestId } from '@/lib/request-id';

const NeedInput = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  summary: z.string().optional(),
  area: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const requestId = getRequestId(req);
  
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json().catch(() => ({}));
    const parsed = NeedInput.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;
    
    // Hardened payload - only these 4 fields, never created_by
    const title = input.title;
    const summary = input.summary ?? input.title;
    const body = input.body ?? input.summary ?? input.title;
    const area = input.area ?? null;

    logWithRequestId(requestId, 'info', '[NEEDS_POST_PAYLOAD]', { 
      keys: ['title', 'summary', 'body', 'area'],
      processingTimeMs: Date.now() - startedAt
    });

    const supabase = createClient();
    
    // Explicit column-based insert to prevent field injection
    const { data, error } = await supabase
      .from('needs')
      .insert([{ title, summary, body, area }])
      .select('id')
      .single();

    if (error) {
      logWithRequestId(requestId, 'error', '[NEEDS_INSERT_ERROR]', { 
        keys: Object.keys({ title, summary, body, area }), 
        err: error, 
        supabaseError: error?.message 
      });
      return NextResponse.json({ 
        error: 'DB_ERROR', 
        detail: error?.message ?? String(error) 
      }, { status: 500, headers: { 'X-Request-ID': requestId } });
    }

    return NextResponse.json({ id: data.id }, { 
      status: 201,
      headers: { 'X-Request-ID': requestId }
    });
  } catch (e: any) {
    logWithRequestId(requestId, 'error', '[NEEDS_POST_FATAL]', { 
      message: e?.message, 
      type: e?.name 
    });
    return NextResponse.json({ 
      error: 'INTERNAL_ERROR',
      detail: e?.message ?? String(e)
    }, { 
      status: 500,
      headers: { 'X-Request-ID': requestId }
    });
  } finally {
    logWithRequestId(requestId, 'info', '[NEEDS_POST_FINISH]', { 
      processingTimeMs: Date.now() - startedAt
    });
  }
}

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("needs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logWithRequestId(requestId, 'error', '[NEEDS_GET_ERROR]', error);
      return NextResponse.json({ error: error.message }, { 
        status: 500,
        headers: { 'X-Request-ID': requestId }
      });
    }

    return NextResponse.json({ needs: data || [] }, {
      headers: { 'X-Request-ID': requestId }
    });
  } catch (error) {
    logWithRequestId(requestId, 'error', '[NEEDS_GET_FATAL]', error);
    return NextResponse.json({ error: 'Failed to fetch needs' }, { 
      status: 500,
      headers: { 'X-Request-ID': requestId }
    });
  }
}