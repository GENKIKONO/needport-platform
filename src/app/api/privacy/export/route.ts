import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic'; // 静的化しない
export const runtime = 'nodejs';        // EdgeではなくNodeで実行
export const revalidate = 0;            // キャッシュ無効

export async function GET(request: NextRequest) {
  try {
    // Get client ID from cookie
    const cookieStore = await cookies();
    const clientId = cookieStore.get("np_client")?.value;
    
    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID not found" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();
    
    // Export data from all tables that contain client_id
    const exportData: Record<string, any[]> = {};
    
    // Page views
    const { data: pageViews, error: pageViewsError } = await supabase
      .from("page_views")
      .select("*")
      .eq("client_id", clientId)
      .order("at", { ascending: false });
    
    if (pageViewsError) {
      console.error("Failed to fetch page views:", pageViewsError);
    } else {
      exportData.page_views = pageViews || [];
    }

    // Prejoins
    const { data: prejoins, error: prejoinsError } = await supabase
      .from("prejoins")
      .select("*")
      .eq("user_id", clientId)
      .order("created_at", { ascending: false });
    
    if (prejoinsError) {
      console.error("Failed to fetch prejoins:", prejoinsError);
    } else {
      exportData.prejoins = prejoins || [];
    }

    // Consents
    const { data: consents, error: consentsError } = await supabase
      .from("consents")
      .select("*")
      .eq("ref_id", clientId)
      .order("at", { ascending: false });
    
    if (consentsError) {
      console.error("Failed to fetch consents:", consentsError);
    } else {
      exportData.consents = consents || [];
    }

    // Client errors (if any)
    const { data: clientErrors, error: clientErrorsError } = await supabase
      .from("client_errors")
      .select("*")
      .eq("ip", clientId) // Using clientId as IP for privacy
      .order("at", { ascending: false })
      .limit(100);
    
    if (clientErrorsError) {
      console.error("Failed to fetch client errors:", clientErrorsError);
    } else {
      exportData.client_errors = clientErrors || [];
    }

    // Add metadata
    const exportMetadata = {
      exported_at: new Date().toISOString(),
      client_id: clientId,
      data_types: Object.keys(exportData),
      total_records: Object.values(exportData).reduce((sum, records) => sum + records.length, 0),
    };

    const fullExport = {
      metadata: exportMetadata,
      data: exportData,
    };

    return NextResponse.json(fullExport, {
      headers: {
        "Content-Disposition": `attachment; filename="needport-data-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error in privacy export:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
