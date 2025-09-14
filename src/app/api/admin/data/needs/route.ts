import { NextRequest, NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/server";

// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = createAdminClientOrNull();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    
    const { data: needs, error } = await supabase
      .from('needs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch needs' }, { status: 500 });
    }

    return NextResponse.json({ needs });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}