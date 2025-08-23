import { NextRequest, NextResponse } from 'next/server';
import { vendorOnboardingSchema } from '@/lib/validation/onboarding';
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
    const validation = vendorOnboardingSchema.safeParse(body);

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

    // 事業者プロファイルをupsert
    const { data: vendorProfile, error: vendorError } = await supabase
      .from('vendor_profiles')
      .upsert({
        user_id: session.userId,
        company_name: data.companyName,
        company_kana: data.companyKana,
        website: data.website,
        industries: data.industries,
        service_areas: data.serviceAreas,
        portfolio_urls: data.portfolioUrls?.filter(url => url.trim()),
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        invoice_qualified: data.invoiceQualified,
        intro: data.intro,
        verification_status: 'pending'
      })
      .select()
      .single();

    if (vendorError) {
      console.error('Vendor profile creation error:', vendorError);
      return NextResponse.json(
        { code: 'DATABASE_ERROR', message: '事業者プロファイルの作成に失敗しました' },
        { status: 500 }
      );
    }

    // プロファイルのroleをbusinessに更新
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'business',
        updated_at: new Date().toISOString()
      })
      .eq('id', session.userId);

    if (profileError) {
      console.error('Profile role update error:', profileError);
      // 致命的ではないので続行
    }

    // イベントと監査ログを記録
    await events.track('profile.vendor_submit', {
      actorId: session.userId,
      companyName: data.companyName,
      industries: data.industries?.length || 0,
      serviceAreas: data.serviceAreas?.length || 0,
      hasPortfolio: data.portfolioUrls && data.portfolioUrls.length > 0,
      invoiceQualified: data.invoiceQualified
    });

    await auditHelpers.log({
      actor: session.userId,
      action: 'PROFILE_VENDOR_SUBMIT',
      entity: 'vendor_profile',
      entity_id: session.userId,
      meta: {
        companyName: data.companyName,
        industries: data.industries,
        serviceAreas: data.serviceAreas,
        invoiceQualified: data.invoiceQualified
      }
    });

    return NextResponse.json(vendorProfile);

  } catch (error) {
    console.error('Vendor profile submission error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
