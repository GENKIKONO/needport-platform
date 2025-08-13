import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { published } = await request.json();

    if (typeof published !== 'boolean') {
      return NextResponse.json(
        { ok: false, error: "published must be a boolean" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Update the need's published status
    const { error } = await supabase
      .from('needs')
      .update({ 
        published,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { ok: false, error: "Failed to update need" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Publish API error:', error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
