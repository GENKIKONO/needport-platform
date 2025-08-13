import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/server/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = supabaseServer();
    
    const { data: notes, error } = await supabase
      .from('need_notes')
      .select('id, body, created_at')
      .eq('need_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[notes] fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notes: notes || [] });

  } catch (error) {
    console.error('[notes] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { body } = await request.json();

    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      return NextResponse.json(
        { error: 'Note body is required' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    
    const { data: note, error } = await supabase
      .from('need_notes')
      .insert({
        need_id: id,
        body: body.trim()
      })
      .select('id, body, created_at')
      .single();

    if (error) {
      console.error('[notes] insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create note' },
        { status: 500 }
      );
    }

    return NextResponse.json({ note });

  } catch (error) {
    console.error('[notes] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
