import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  // Production guard - prevent debug endpoints in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Debug endpoints disabled in production' }, { status: 404 });
  }

  try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !anon) {
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(url, anon, { db: { schema: 'public' } });
    
    // Test basic connectivity
    const { data, error } = await supabase
      .from('needs')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json(
        { error: 'Database connection failed', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Database test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
