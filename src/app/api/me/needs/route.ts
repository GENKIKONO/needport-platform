import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { getRequestId, logWithRequestId } from '@/lib/request-id';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const startedAt = Date.now();
  const requestId = getRequestId(req);
  
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logWithRequestId(requestId, 'info', '[ME_NEEDS_GET_START]', { userId });

    const supabase = createClient();
    
    // Get user's own needs - RLS will filter by owner_id automatically
    const { data, error } = await supabase
      .from('needs')
      .select('id, title, summary, body, area, status, published, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      logWithRequestId(requestId, 'error', '[ME_NEEDS_GET_ERROR]', { 
        error: error.message,
        code: error.code 
      });
      return NextResponse.json({ 
        error: 'DB_ERROR', 
        detail: error.message 
      }, { 
        status: 500,
        headers: { 'X-Request-ID': requestId }
      });
    }

    logWithRequestId(requestId, 'info', '[ME_NEEDS_GET_SUCCESS]', { 
      count: data?.length || 0,
      processingTimeMs: Date.now() - startedAt
    });

    return NextResponse.json({ 
      needs: data || [] 
    }, {
      headers: { 'X-Request-ID': requestId }
    });
  } catch (e: any) {
    logWithRequestId(requestId, 'error', '[ME_NEEDS_GET_FATAL]', { 
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
    logWithRequestId(requestId, 'info', '[ME_NEEDS_GET_FINISH]', { 
      processingTimeMs: Date.now() - startedAt
    });
  }
}
