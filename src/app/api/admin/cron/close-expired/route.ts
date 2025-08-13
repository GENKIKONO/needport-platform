import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(_req: Request) {
  try {
    const admin = createAdminClient();
    
    // Close recruitments that are expired or have reached target
    const { data, error } = await admin
      .from("needs")
      .update({ 
        recruitment_closed: true, 
        updated_at: new Date().toISOString() 
      })
      .eq("adopted_offer_id", "is not null")
      .eq("recruitment_closed", false)
      .or("deadline.lt.now(),and(min_people.not.is.null,min_people.lte.(select coalesce(sum(count),0) from entries e where e.need_id = needs.id))")
      .select("id, title");

    if (error) {
      return NextResponse.json({ 
        ok: false, 
        error: error.message 
      }, { status: 500 });
    }

    const closedCount = data?.length || 0;
    
    if (closedCount > 0) {
      console.log(`[CRON] Closed ${closedCount} expired recruitments:`, 
        data?.map(n => n.title).join(", "));
    }

    return NextResponse.json({ 
      ok: true, 
      closed_count: closedCount,
      closed_needs: data?.map(n => ({ id: n.id, title: n.title })) || []
    });

  } catch (e: any) {
    return NextResponse.json({ 
      ok: false, 
      error: e?.message ?? "Unknown error" 
    }, { status: 500 });
  }
}
