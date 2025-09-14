import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { assertAdmin } from "@/lib/admin/inspector";


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const uid = url.searchParams.get("uid") || ""; // Clerk user id（middleware等で埋めてもOK）
  await assertAdmin(uid);

  const needId = url.searchParams.get("needId");
  const proposalId = url.searchParams.get("proposalId");
  const messageId = url.searchParams.get("messageId");

  const sadmin = createAdminClientOrNull();
    
    if (!sadmin) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }

  if (proposalId) {
    const { data: p } = await sadmin.from("proposals")
      .select("id, need_id, vendor_id, status, locked, created_at, meta")
      .eq("id", proposalId).maybeSingle();

    if (!p) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const { data: need } = await sadmin.from("needs")
      .select("id, title, owner_id, kind, industry_id, user_reveal_policy")
      .eq("id", p.need_id).maybeSingle();

    const { data: msgs } = await sadmin.from("proposal_messages")
      .select("id, sender_id, body, visible, read_by, created_at, audit_note")
      .eq("proposal_id", proposalId).order("created_at",{ascending:true}).limit(200);

    return NextResponse.json({ proposal: p, need, messages: msgs||[] });
  }

  if (messageId) {
    const { data: m } = await sadmin.from("proposal_messages")
      .select("id, proposal_id, sender_id, body, visible, read_by, created_at, audit_note")
      .eq("id", messageId).maybeSingle();

    if (!m) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const { data: p } = await sadmin.from("proposals")
      .select("id, need_id, vendor_id, status, locked").eq("id", m.proposal_id).maybeSingle();

    return NextResponse.json({ message: m, proposal: p });
  }

  if (needId) {
    const { data: need } = await sadmin.from("needs")
      .select("id, title, owner_id, kind, industry_id, user_reveal_policy")
      .eq("id", needId).maybeSingle();
    const { data: proposals } = await sadmin.from("proposals")
      .select("id, vendor_id, status, locked, created_at")
      .eq("need_id", needId).order("created_at",{ascending:true}).limit(200);
    return NextResponse.json({ need, proposals: proposals||[] });
  }

  return NextResponse.json({ error:"missing_param" }, { status: 400 });
}
