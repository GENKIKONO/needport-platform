import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getNeedDisclosureLevel, createMaskedNeed } from '@/lib/disclosure/visibility';
import { getAuth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = getAuth(req);

    const admin = createAdminClient();

    // Get need data
    const { data: need, error } = await admin
      .from('needs')
      .select(`
        id,
        title,
        summary,
        body,
        tags,
        area,
        mode,
        adopted_offer_id,
        prejoin_count,
        created_at,
        updated_at,
        status,
        last_activity_at,
        user_id,
        profiles!created_by (
          id,
          clerk_user_id
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching need:', error);
      return NextResponse.json({ error: 'Need not found' }, { status: 404 });
    }

    if (!need) {
      return NextResponse.json({ error: 'Need not found' }, { status: 404 });
    }

    // Determine disclosure level
    const disclosureLevel = await getNeedDisclosureLevel(id, userId || undefined);

    // Create masked version of the need
    const maskedNeed = createMaskedNeed(need, disclosureLevel);

    // Add disclosure information to response
    const response = {
      ...maskedNeed,
      disclosure: {
        isFullyVisible: disclosureLevel.showFullBody,
        requiresPayment: !disclosureLevel.showFullBody,
        message: disclosureLevel.showFullBody 
          ? null 
          : 'マッチング決済後に詳細が表示されます'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in need detail API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
