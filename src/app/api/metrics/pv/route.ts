import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/server/supabase';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();

    // Validate path
    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    if (!path.startsWith('/') || path.length > 300) {
      return NextResponse.json(
        { error: 'Invalid path format' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const supabase = supabaseServer();

    // Upsert pageview count
    const { error } = await supabase
      .from('pageviews')
      .upsert(
        { 
          path, 
          day: today, 
          views: 1,
          updated_at: new Date().toISOString()
        },
        { 
          onConflict: 'path,day',
          ignoreDuplicates: false
        }
      )
      .select('views')
      .single();

    if (error) {
      // If upsert failed, try to increment existing record
      const { data, error: updateError } = await supabase
        .from('pageviews')
        .update({ 
          views: supabase.sql`views + 1`,
          updated_at: new Date().toISOString()
        })
        .eq('path', path)
        .eq('day', today)
        .select('views')
        .single();

      if (updateError) {
        console.error('[pageview] update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update pageview' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('[pageview] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
