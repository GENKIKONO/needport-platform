import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  // Production guard - prevent debug endpoints in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Debug endpoints disabled in production' }, { status: 404 });
  }

  try {
    const supabase = createAdminClient();
    
    const { data: prejoins, error } = await supabase
      .from('prejoins')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Debug prejoins error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch prejoins' },
        { status: 500 }
      );
    }

    return NextResponse.json({ prejoins: prejoins || [] });

  } catch (error) {
    console.error('Debug prejoins error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Production guard - prevent debug endpoints in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Debug endpoints disabled in production' }, { status: 404 });
  }
  
  return NextResponse.json({ error: 'POST not implemented' }, { status: 405 });
}
