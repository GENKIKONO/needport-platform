import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const needId = params.id;
  const { userId } = getAuth(req as any) || {};
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const s = supabaseAdmin();

  // user_identities → stripe_customer_id を取得
  const { data: ident, error: identErr } = await s.from("user_identities").select("stripe_customer_id").eq("clerk_user_id", userId).maybeSingle();
  if (identErr || !ident?.stripe_customer_id) return NextResponse.json({ error: "no_customer" }, { status: 403 });

  // vendor_accesses に該当があるか
  const { data: access } = await s.from("vendor_accesses")
    .select("id").eq("need_id", needId).eq("stripe_customer_id", ident.stripe_customer_id).maybeSingle();

  if (!access) return NextResponse.json({ error: "not_unlocked" }, { status: 403 });

  // TODO: 実際の連絡先を返す（need_idに紐づくcontact_infoを別テーブルに置く等）
  // ここではモック
  return NextResponse.json({
    contact: {
      email: "owner@example.com",
      phone: "+81-90-xxxx-xxxx"
    }
  });
}
