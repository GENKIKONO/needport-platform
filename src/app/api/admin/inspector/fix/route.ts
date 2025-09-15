import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { assertAdmin, recordAudit } from "@/lib/admin/inspector";


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=> ({}));
  const { action, proposalId, messageIds=[], reason, confirm=false, uid } = body || {};
  await assertAdmin(uid);

  if (!confirm) return NextResponse.json({ error:"confirm_required" }, { status: 400 });

  const sadmin = supabaseAdmin();

  if (action === "approve_messages") {
    if (!Array.isArray(messageIds) || messageIds.length === 0)
      return NextResponse.json({ error:"messageIds_required" }, { status: 400 });
    await sadmin.from("proposal_messages")
      .update({ visible:true, audit_note: reason || null })
      .in("id", messageIds);
    await recordAudit("messages","bulk","approve_messages",{ messageIds, reason }, uid);
    return NextResponse.json({ ok:true });
  }

  if (action === "lock_proposal") {
    if (!proposalId) return NextResponse.json({ error:"proposalId_required" }, { status: 400 });
    await sadmin.from("proposals").update({ locked:true }).eq("id", proposalId);
    await recordAudit("proposal", proposalId, "lock", { reason }, uid);
    return NextResponse.json({ ok:true });
  }

  if (action === "unlock_proposal") {
    if (!proposalId) return NextResponse.json({ error:"proposalId_required" }, { status: 400 });
    await sadmin.from("proposals").update({ locked:false }).eq("id", proposalId);
    await recordAudit("proposal", proposalId, "unlock", { reason }, uid);
    return NextResponse.json({ ok:true });
  }

  return NextResponse.json({ error:"unknown_action" }, { status: 400 });
}
