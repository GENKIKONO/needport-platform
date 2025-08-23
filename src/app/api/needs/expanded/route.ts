import { NextRequest, NextResponse } from 'next/server';
import { needExpandedSchema } from '@/lib/validation/needExpanded';
import { getDevSession } from '@/lib/devAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { createValidationError, createUnauthorizedError } from '@/lib/api/errors';
import { events } from '@/lib/events';
import { auditHelpers } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = getDevSession();
    if (!session) {
      return NextResponse.json(createUnauthorizedError(), { status: 401 });
    }

    const body = await request.json();
    const validation = needExpandedSchema.safeParse(body);

    if (!validation.success) {
      const fields: Record<string, string> = {};
      validation.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        fields[path] = issue.message;
      });
      return NextResponse.json(createValidationError(fields), { status: 400 });
    }

    const data = validation.data;
    const supabase = createAdminClient();

    // ニーズを作成
    const { data: need, error: needError } = await supabase
      .from('needs')
      .insert({
        title: data.title,
        summary: data.summary,
        body: data.body,
        area: data.area,
        category: data.category,
        subcategory: data.subcategory,
        quantity: data.quantity,
        unit_price: data.unitPrice,
        desired_start_date: data.desiredStartDate,
        desired_end_date: data.desiredEndDate,
        visibility: data.visibility,
        contact_pref: data.contactPref,
        disclosure_level: data.disclosureLevel,
        user_id: session.userId,
        status: 'active'
      })
      .select()
      .single();

    if (needError) {
      console.error('Need creation error:', needError);
      return NextResponse.json(
        { code: 'DATABASE_ERROR', message: 'ニーズの作成に失敗しました' },
        { status: 500 }
      );
    }

    // タグを保存
    if (data.tags && data.tags.length > 0) {
      const tagData = data.tags.map(tag => ({
        need_id: need.id,
        tag: tag.trim()
      }));

      const { error: tagError } = await supabase
        .from('need_tags')
        .insert(tagData);

      if (tagError) {
        console.error('Tag creation error:', tagError);
        // タグエラーは致命的ではないので続行
      }
    }

    // イベントと監査ログを記録
    await events.track('need.create_expanded', {
      needId: need.id,
      actorId: session.userId,
      category: data.category,
      visibility: data.visibility
    });

    await auditHelpers.log({
      actor: session.userId,
      action: 'NEED_CREATE_EXPANDED',
      entity: 'need',
      entity_id: need.id,
      meta: {
        category: data.category,
        visibility: data.visibility,
        hasAttachments: data.attachments && data.attachments.length > 0
      }
    });

    return NextResponse.json(need);

  } catch (error) {
    console.error('Expanded need creation error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
