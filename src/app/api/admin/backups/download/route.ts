import { NextRequest, NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";

export const dynamic = 'force-dynamic'; // 静的化しない
export const runtime = 'nodejs';        // EdgeではなくNodeで実行
export const revalidate = 0;            // キャッシュ無効

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");
    
    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      );
    }
    
    const supabase = createAdminClientOrNull();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    
    // Create a signed URL for the file
    const { data, error } = await supabase.storage
      .from("attachments")
      .createSignedUrl(filePath, 60); // 60 seconds expiry
    
    if (error) {
      console.error("Error creating signed URL:", error);
      return NextResponse.json(
        { error: "Failed to create download link" },
        { status: 500 }
      );
    }
    
    if (!data?.signedUrl) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
    
    // Redirect to the signed URL
    return NextResponse.redirect(data.signedUrl);
    
  } catch (error) {
    console.error("Error in backup download:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
