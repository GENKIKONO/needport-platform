import { supabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function assertAdmin(userId?: string) {
  if (!userId) throw new Error("unauthorized");
  const { data } = await supabaseAdmin()
    .from("user_roles")
    .select("role").eq("user_id", userId).eq("role","admin").eq("role","admin").maybeSingle();
  if (!data) throw new Error("forbidden");
}

export async function recordAudit(kind:string, target:string, action:string, meta:any, adminId:string) {
  await supabaseAdmin().from("audit_logs").insert({
    kind, target_id: target, action, meta, created_by: adminId
  } as any);
}
