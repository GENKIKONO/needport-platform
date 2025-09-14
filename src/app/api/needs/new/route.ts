// src/app/api/needs/new/route.ts
// Simple need creation endpoint - isolated from legacy flow

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { SimpleNeedInput } from '@/lib/validation/need';
import { ok, fail } from '@/lib/api/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/needs/new - Create a new need (simple flow)
 * 
 * Body: { title: string, summary?: string, body?: string, area?: string }
 * Response: { id: string, created_at: string } | { error: string, detail?: string }
 */
export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  
  try {
    // Authentication required
    const { userId } = await auth();
    if (!userId) {
      console.info('[NEEDS_NEW] Unauthorized attempt', { 
        processingTimeMs: Date.now() - startedAt 
      });
      return fail('UNAUTHORIZED', 'ログインが必要です', 401);
    }

    // Parse and validate input
    let json;
    try {
      json = await req.json();
    } catch (parseError) {
      console.warn('[NEEDS_NEW] JSON parse error', { 
        error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        processingTimeMs: Date.now() - startedAt 
      });
      return fail('INVALID_JSON', '有効なJSONを送信してください', 400);
    }

    const validation = SimpleNeedInput.safeParse(json);
    if (!validation.success) {
      console.info('[NEEDS_NEW] Validation failed', { 
        errors: validation.error.flatten(),
        processingTimeMs: Date.now() - startedAt 
      });
      return fail('VALIDATION_ERROR', validation.error.errors[0]?.message || 'バリデーションエラー', 400);
    }

    const input = validation.data;
    
    // Prepare database payload with fallbacks
    const dbPayload = {
      title: input.title.trim(),
      summary: input.summary?.trim() || input.title.trim(),
      body: input.body?.trim() || input.summary?.trim() || input.title.trim(),
      area: input.area?.trim() || null,
      published: false, // Draft by default
    };

    console.info('[NEEDS_NEW] Inserting need', { 
      userId,
      titleLength: dbPayload.title.length,
      hasArea: !!dbPayload.area,
      processingTimeMs: Date.now() - startedAt 
    });

    // Database insertion using existing supabase client
    const supabase = createClient();
    const { data, error } = await supabase
      .from('needs')
      .insert([dbPayload])
      .select('id, created_at')
      .single();

    if (error) {
      console.error('[NEEDS_NEW] Database error', { 
        userId,
        dbError: error.message,
        code: error.code,
        processingTimeMs: Date.now() - startedAt 
      });
      return fail('DB_ERROR', 'データベースエラーが発生しました', 500);
    }

    if (!data) {
      console.error('[NEEDS_NEW] No data returned from insert', { 
        userId,
        processingTimeMs: Date.now() - startedAt 
      });
      return fail('DB_ERROR', 'データが正しく作成されませんでした', 500);
    }

    console.info('[NEEDS_NEW] Success', { 
      userId,
      needId: data.id,
      processingTimeMs: Date.now() - startedAt 
    });

    return ok({
      id: data.id,
      created_at: data.created_at,
    }, 201);

  } catch (error) {
    console.error('[NEEDS_NEW] Unexpected error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTimeMs: Date.now() - startedAt 
    });
    return fail('INTERNAL_ERROR', 'サーバー内部エラーが発生しました', 500);
  }
}

/**
 * GET /api/needs/new - Not supported (should use POST)
 */
export async function GET() {
  return fail('METHOD_NOT_ALLOWED', 'この操作はPOSTメソッドでのみ利用できます', 405);
}