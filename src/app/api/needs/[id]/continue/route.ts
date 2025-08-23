import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySignedUrl } from '@/lib/server/signed-urls';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: needId } = await params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing verification token' }, { status: 400 });
    }

    // Verify signed URL token
    const verification = await verifySignedUrl(token, 'continue', needId);
    if (!verification.valid) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
    }

    const admin = createAdminClient();

    // Get the need to ensure it exists and belongs to the user
    const { data: need, error: needError } = await admin
      .from('needs')
      .select('id, title, created_by, status')
      .eq('id', needId)
      .eq('created_by', verification.userId)
      .single();

    if (needError || !need) {
      return NextResponse.json({ error: 'Need not found or unauthorized' }, { status: 404 });
    }

    // Update need to extend its lifecycle (reset reminder timestamp)
    const { error: updateError } = await admin
      .from('needs')
      .update({
        last_reminder_at: null, // Reset reminder
        lifecycle_continued_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', needId);

    if (updateError) {
      console.error('Error updating need lifecycle:', updateError);
      return NextResponse.json({ error: 'Failed to continue need' }, { status: 500 });
    }

    // Log the action
    await admin
      .from('audit_logs')
      .insert({
        actor: verification.userId,
        action: 'need.lifecycle.continued',
        entity: 'need',
        entity_id: needId,
        meta: {
          method: 'email_link',
          timestamp: new Date().toISOString(),
        },
      });

    return NextResponse.json({ 
      success: true, 
      message: 'ニーズが継続されました。次回のリマインドは60日後です。' 
    });

  } catch (error) {
    console.error('Error in continue need API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
