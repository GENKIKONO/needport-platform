import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

const NeedInput = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  summary: z.string().optional(),
  region: z.string().optional(),
  category: z.string().optional(),
  pii_email: z.string().email().optional(),
  pii_phone: z.string().optional(),
  pii_address: z.string().optional(),
});

export async function POST(req: Request) {
  const startedAt = Date.now();
  try {
    console.log('[NEEDS_POST_START]', { timestamp: new Date().toISOString() });
    
    const { userId } = await auth();
    console.log('[NEEDS_POST_AUTH]', { userId, hasUserId: !!userId });
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json().catch((e) => {
      console.error('[NEEDS_POST_JSON_ERROR]', e);
      return {};
    });
    console.log('[NEEDS_POST_JSON]', { json });

    const parsed = NeedInput.safeParse(json);
    if (!parsed.success) {
      console.error('[NEEDS_POST_VALIDATION_ERROR]', { error: parsed.error.flatten() });
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;
    console.log('[NEEDS_POST_INPUT]', { inputKeys: Object.keys(input) });

    // Remove created_by to avoid UUID format issues with Clerk user IDs
    const payload = {
      title: input.title || 'Default Title',
      summary: input.summary || input.title || 'Default Summary',
      body: input.body || input.summary || input.title || 'Default Body',
      area: input.region || null
    };

    console.log('[NEEDS_POST_PAYLOAD]', { payloadKeys: Object.keys(payload) });

    const supabase = createClient();
    console.log('[NEEDS_POST_SUPABASE_CLIENT]', { hasSupabase: !!supabase });
    
    const { data, error } = await supabase.from('needs').insert(payload).select('id').limit(1);

    console.log('[NEEDS_POST_DB_RESULT]', { 
      success: !error,
      hasData: !!data,
      error: error ? {
        message: error.message,
        code: error.code
      } : null
    });

    if (error) {
      console.error('[NEEDS_INSERT_ERROR]', { 
        payloadKeys: Object.keys(payload),
        errorMessage: error.message,
        errorCode: error.code
      });
      return NextResponse.json({ 
        error: error.message,
        code: error.code 
      }, { status: 500 });
    }

    return NextResponse.json({ id: data?.[0]?.id }, { status: 201 });
  } catch (e: any) {
    console.error('[NEEDS_POST_FATAL]', { 
      message: e?.message, 
      stack: e?.stack,
      name: e?.name,
      cause: e?.cause
    });
    return NextResponse.json({ 
      error: 'Internal Error',
      message: e?.message,
      type: e?.name 
    }, { status: 500 });
  } finally {
    const processingTime = Date.now() - startedAt;
    console.info('[NEEDS_POST_FINISH]', { 
      processingTimeMs: processingTime,
      userId: userId ? 'present' : 'missing'
    });
  }
}

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("needs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error('[NEEDS_GET_ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ needs: data || [] });
  } catch (error) {
    console.error('[NEEDS_GET_FATAL]', error);
    return NextResponse.json({ error: 'Failed to fetch needs' }, { status: 500 });
  }
}