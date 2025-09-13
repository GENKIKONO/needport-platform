import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface NeedDraft {
  id?: string;
  title: string;
  category: string;
  region: string;
  summary: string;
  body: string;
  pii_email?: string;
  pii_phone?: string;
  pii_address?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  auto_saved?: boolean;
}

// Get user's drafts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('need_drafts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    const drafts = data || [];

    return NextResponse.json({
      ok: true,
      data: { drafts }
    });

  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Failed to fetch drafts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Save or update draft
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, auto_saved = false, ...draftData }: NeedDraft & { auto_saved?: boolean } = body;

    if (!draftData.user_id) {
      return NextResponse.json(
        { ok: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields for manual saves
    if (!auto_saved && !draftData.title?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Title is required for manual saves' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    
    let result;
    if (id) {
      // Update existing draft
      const supabase = createClient();
      const { data, error } = await supabase
        .from('need_drafts')
        .update({
          ...draftData,
          updated_at: now,
          auto_saved
        })
        .eq('id', id)
        .eq('user_id', draftData.user_id) // Security check
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new draft
      const supabase = createClient();
      const { data, error } = await supabase
        .from('need_drafts')
        .insert({
          ...draftData,
          created_at: now,
          updated_at: now,
          auto_saved
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Cache clearing removed for simplicity

    return NextResponse.json({
      ok: true,
      data: { draft: result },
      message: auto_saved ? 'Draft auto-saved' : 'Draft saved successfully'
    });

  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Failed to save draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Delete draft
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('user_id');
    
    if (!id || !userId) {
      return NextResponse.json(
        { ok: false, error: 'Draft ID and User ID are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('need_drafts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Security check

    if (error) throw error;

    // Cache clearing removed for simplicity

    return NextResponse.json({
      ok: true,
      message: 'Draft deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Failed to delete draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Bulk operations
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ids, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'delete_multiple':
        if (!Array.isArray(ids) || ids.length === 0) {
          return NextResponse.json(
            { ok: false, error: 'Draft IDs are required for bulk delete' },
            { status: 400 }
          );
        }

        const supabaseDelete = createClient();
        const { error: deleteError } = await supabaseDelete
          .from('need_drafts')
          .delete()
          .in('id', ids)
          .eq('user_id', userId); // Security check

        if (deleteError) throw deleteError;

        // Cache clearing removed for simplicity

        return NextResponse.json({
          ok: true,
          message: `${ids.length} drafts deleted successfully`
        });

      case 'cleanup_auto_saved':
        // Delete auto-saved drafts older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const supabaseCleanup = createClient();
        const { error: cleanupError } = await supabaseCleanup
          .from('need_drafts')
          .delete()
          .eq('user_id', userId)
          .eq('auto_saved', true)
          .lt('updated_at', thirtyDaysAgo.toISOString());

        if (cleanupError) throw cleanupError;

        // Cache clearing removed for simplicity

        return NextResponse.json({
          ok: true,
          message: 'Old auto-saved drafts cleaned up'
        });

      default:
        return NextResponse.json(
          { ok: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Failed to perform bulk operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}