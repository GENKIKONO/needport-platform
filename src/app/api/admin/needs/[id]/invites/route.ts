import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/server/supabase";


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: needId } = await params;
    const { email, note } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    
    // Verify need exists
    const { data: need, error: needError } = await supabase
      .from("needs")
      .select("id, title")
      .eq("id", needId)
      .single();

    if (needError || !need) {
      return NextResponse.json(
        { error: "Need not found" },
        { status: 404 }
      );
    }

    // Create vendor invite
    const { data, error } = await supabase
      .from("vendor_invites")
      .insert({
        need_id: needId,
        email: email.trim(),
        note: note?.trim() || null,
      })
      .select("id, email, note, created_at")
      .single();

    if (error) {
      console.error("Failed to create vendor invite:", error);
      return NextResponse.json(
        { error: "Failed to create invite" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, invite: data });
  } catch (error) {
    console.error("Error in vendor invite creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: needId } = await params;
    const supabase = supabaseServer();

    // Get vendor invites for this need
    const { data, error } = await supabase
      .from("vendor_invites")
      .select("id, email, note, created_at")
      .eq("need_id", needId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Failed to fetch vendor invites:", error);
      return NextResponse.json(
        { error: "Failed to fetch invites" },
        { status: 500 }
      );
    }

    return NextResponse.json({ invites: data || [] });
  } catch (error) {
    console.error("Error in vendor invite fetch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
