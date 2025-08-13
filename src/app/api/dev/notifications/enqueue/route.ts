import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonOk, jsonError } from "@/lib/api";

// Only allow in development
if (process.env.NODE_ENV === "production") {
  throw new Error("Not available in production");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { kind } = body;

    if (!kind) {
      return jsonError("Kind is required");
    }

    const admin = createAdminClient();

    // Get the first need for testing
    const { data: need } = await admin
      .from("needs")
      .select("id")
      .limit(1)
      .single();

    if (!need) {
      return jsonError("No needs found for testing");
    }

    // Get the first offer for testing (if kind requires it)
    let refId = need.id;
    if (kind.startsWith("offer.")) {
      const { data: offer } = await admin
        .from("offers")
        .select("id")
        .eq("need_id", need.id)
        .limit(1)
        .single();
      
      if (offer) {
        refId = offer.id;
      }
    }

    // Insert test notification
    const { data: notification, error } = await admin
      .from("entry_notifications")
      .insert({
        kind,
        need_id: need.id,
        ref_id: refId,
        status: 'queued',
      })
      .select()
      .single();

    if (error) {
      return jsonError(`Failed to enqueue notification: ${error.message}`);
    }

    return jsonOk({
      message: "Test notification enqueued successfully",
      notification: {
        id: notification.id,
        kind: notification.kind,
        need_id: notification.need_id,
        ref_id: notification.ref_id,
        status: notification.status,
      }
    });

  } catch (error: any) {
    return jsonError(error?.message ?? "Failed to enqueue test notification", 500);
  }
}
