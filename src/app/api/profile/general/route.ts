import { NextRequest, NextResponse } from 'next/server';
import { generalProfileSchema } from '@/lib/validation/onboarding';
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
    const validation = generalProfileSchema.safeParse(body);

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

    // プロファイルを更新
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: data.displayName,
        city: data.city,
        intro: data.intro,
        notify_email: data.notifyEmail,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.userId)
      .select()
      .single();

    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json(
        { code: 'DATABASE_ERROR', message: 'プロファイルの更新に失敗しました' },
        { status: 500 }
      );
    }

    // イベントと監査ログを記録
    await events.track('profile.general_update', {
      actorId: session.userId,
      hasIntro: !!data.intro,
      notifyEmail: data.notifyEmail
    });

    await auditHelpers.log({
      actor: session.userId,
      action: 'PROFILE_GENERAL_UPDATE',
      entity: 'profile',
      entity_id: session.userId,
      meta: {
        hasIntro: !!data.intro,
        notifyEmail: data.notifyEmail
      }
    });

    return NextResponse.json(profile);

  } catch (error) {
    console.error('General profile update error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
