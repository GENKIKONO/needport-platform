import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getNeedDisclosureLevel, createMaskedNeed } from '@/lib/disclosure/visibility';
import { getAuth } from '@clerk/nextjs/server';

// Schema for updating a need
const UpdateNeedSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(10000).optional(),
  summary: z.string().max(500).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  area: z.string().optional().nullable(),
  status: z.enum(['draft', 'published', 'frozen', 'archived']).optional(),
});

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', detail: 'ログインが必要です。' },
        { status: 401 }
      );
    }

    const { id: needId } = await params;
    if (!needId) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', detail: 'Need ID is required' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = UpdateNeedSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'VALIDATION_ERROR', 
          detail: 'Invalid input data',
          issues: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get user profile
    const userProfileId = await getUserProfileId(user.id, supabase);
    if (!userProfileId) {
      return NextResponse.json(
        { error: 'PROFILE_NOT_FOUND', detail: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check ownership and permissions
    const { data: need, error: needError } = await supabase
      .from('needs')
      .select('id, owner_id, status')
      .eq('id', needId)
      .single();

    if (needError || !need) {
      return NextResponse.json(
        { error: 'NEED_NOT_FOUND', detail: 'Need not found' },
        { status: 404 }
      );
    }

    // Check if user can edit this need
    const isOwner = need.owner_id === userProfileId;
    const isAdmin = await checkAdminStatus(userProfileId, supabase);

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'FORBIDDEN', detail: 'この投稿を編集する権限がありません。' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData = { ...validation.data };
    
    // Handle status transitions
    if (updateData.status) {
      // Only admins can set status to 'frozen' or 'archived'
      if (['frozen', 'archived'].includes(updateData.status) && !isAdmin) {
        return NextResponse.json(
          { error: 'FORBIDDEN', detail: 'この操作には管理者権限が必要です。' },
          { status: 403 }
        );
      }
      
      // Set published_at when status changes to published
      if (updateData.status === 'published' && need.status !== 'published') {
        updateData.published_at = new Date().toISOString();
      }
      
      // Set archived_at when status changes to archived
      if (updateData.status === 'archived' && need.status !== 'archived') {
        updateData.archived_at = new Date().toISOString();
      }
    }

    // Perform the update
    const { data: updatedNeed, error: updateError } = await supabase
      .from('needs')
      .update(updateData)
      .eq('id', needId)
      .select()
      .single();

    if (updateError) {
      console.error('Update need error:', updateError);
      return NextResponse.json(
        { error: 'UPDATE_FAILED', detail: '投稿の更新に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      need: updatedNeed
    });

  } catch (error) {
    console.error('API Error - Update Need:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', detail: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', detail: 'ログインが必要です。' },
        { status: 401 }
      );
    }

    const { id: needId } = await params;
    if (!needId) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', detail: 'Need ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get user profile
    const userProfileId = await getUserProfileId(user.id, supabase);
    if (!userProfileId) {
      return NextResponse.json(
        { error: 'PROFILE_NOT_FOUND', detail: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check ownership and permissions
    const { data: need, error: needError } = await supabase
      .from('needs')
      .select('id, owner_id, title, status')
      .eq('id', needId)
      .single();

    if (needError || !need) {
      return NextResponse.json(
        { error: 'NEED_NOT_FOUND', detail: 'Need not found' },
        { status: 404 }
      );
    }

    // Check if user can delete this need
    const isOwner = need.owner_id === userProfileId;
    const isAdmin = await checkAdminStatus(userProfileId, supabase);

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'FORBIDDEN', detail: 'この投稿を削除する権限がありません。' },
        { status: 403 }
      );
    }

    // Delete the need (CASCADE will handle related records)
    const { error: deleteError } = await supabase
      .from('needs')
      .delete()
      .eq('id', needId);

    if (deleteError) {
      console.error('Delete need error:', deleteError);
      return NextResponse.json(
        { error: 'DELETE_FAILED', detail: '投稿の削除に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '投稿が削除されました。'
    });

  } catch (error) {
    console.error('API Error - Delete Need:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', detail: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getUserProfileId(clerkUserId: string, supabase: any): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();
  
  return profile?.id || null;
}

async function checkAdminStatus(profileId: string, supabase: any): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', profileId)
    .single();
  
  return profile?.is_admin || false;
}
