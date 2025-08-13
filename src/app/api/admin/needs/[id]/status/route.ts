import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/server/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    // Validate status
    const validStatuses = ['draft', 'pending', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Use service role for admin operations
    const supabase = supabaseServer();
    
    const { error } = await supabase
      .from('needs')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('[status] update error:', error);
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, status });

  } catch (error) {
    console.error('[status] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
