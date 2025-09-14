import { NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";
import { jsonOk, jsonError } from "@/lib/api";

// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function POST() {
  try {
    const admin = createAdminClientOrNull();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    
    // Clean up old notifications (90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const { data: notificationsDeleted, error: notificationsError } = await admin
      .from("entry_notifications")
      .delete()
      .lt("created_at", ninetyDaysAgo.toISOString())
      .select("id");

    if (notificationsError) {
      return jsonError(`Failed to clean notifications: ${notificationsError.message}`);
    }

    // Clean up old IP throttle records (30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: throttleDeleted, error: throttleError } = await admin
      .from("ip_throttle")
      .delete()
      .lt("day", thirtyDaysAgo.toISOString().split('T')[0])
      .select("ip");

    if (throttleError) {
      return jsonError(`Failed to clean IP throttle: ${throttleError.message}`);
    }

    const result = {
      notifications_deleted: notificationsDeleted?.length || 0,
      throttle_deleted: throttleDeleted?.length || 0,
      total_deleted: (notificationsDeleted?.length || 0) + (throttleDeleted?.length || 0),
    };

    console.log(`[CLEANUP] Deleted ${result.notifications_deleted} notifications and ${result.throttle_deleted} throttle records`);

    return jsonOk({
      message: "データクリーンアップが完了しました",
      ...result
    });

  } catch (error: any) {
    return jsonError(error?.message ?? "Cleanup failed", 500);
  }
}
