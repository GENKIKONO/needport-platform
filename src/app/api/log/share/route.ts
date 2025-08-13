import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, url, title, timestamp } = body;

    // Validate required fields
    if (!platform || !url || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    
    // Log share event
    const { error } = await supabase
      .from('share_logs')
      .insert({
        platform,
        url,
        title,
        timestamp: timestamp || new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });

    if (error) {
      console.error('Share log error:', error);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Share tracking error:', error);
    // Return success even on error to not break the user experience
    return NextResponse.json({ success: true });
  }
}
