import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
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
    const deletionResults: Record<string, { deleted: number; anonymized: number }> = {};
    
    // Soft delete/anonymize page views
    const { data: pageViews, error: pageViewsError } = await supabase
      .from("page_views")
      .update({
        client_id: null,
        ip: null,
        ua: null,
        referer: null,
        utm: null,
      })
      .eq("client_id", clientId)
      .select("id");
    
    if (pageViewsError) {
      console.error("Failed to anonymize page views:", pageViewsError);
    } else {
      deletionResults.page_views = { deleted: 0, anonymized: pageViews?.length || 0 };
    }

    // Soft delete prejoins (set user_id to null)
    const { data: prejoins, error: prejoinsError } = await supabase
      .from("prejoins")
      .update({
        user_id: null,
      })
      .eq("user_id", clientId)
      .select("id");
    
    if (prejoinsError) {
      console.error("Failed to anonymize prejoins:", prejoinsError);
    } else {
      deletionResults.prejoins = { deleted: 0, anonymized: prejoins?.length || 0 };
    }

    // Soft delete consents (set ref_id to null)
    const { data: consents, error: consentsError } = await supabase
      .from("consents")
      .update({
        ref_id: null,
        ip_hash: null,
        ua: null,
      })
      .eq("ref_id", clientId)
      .select("id");
    
    if (consentsError) {
      console.error("Failed to anonymize consents:", consentsError);
    } else {
      deletionResults.consents = { deleted: 0, anonymized: consents?.length || 0 };
    }

    // Soft delete client errors (set ip to null)
    const { data: clientErrors, error: clientErrorsError } = await supabase
      .from("client_errors")
      .update({
        ip: null,
        ua: null,
      })
      .eq("ip", clientId)
      .select("id");
    
    if (clientErrorsError) {
      console.error("Failed to anonymize client errors:", clientErrorsError);
    } else {
      deletionResults.client_errors = { deleted: 0, anonymized: clientErrors?.length || 0 };
    }

    // Clear the client cookie
    const response = NextResponse.json({
      success: true,
      message: "Data anonymization completed",
      results: deletionResults,
      total_anonymized: Object.values(deletionResults).reduce(
        (sum, result) => sum + result.anonymized,
        0
      ),
    });

    // Remove the client cookie
    response.cookies.set("np_client", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error) {
    console.error("Error in privacy deletion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
