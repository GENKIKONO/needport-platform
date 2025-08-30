import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req as any) || {};
  if (!userId) return NextResponse.json({ user: null, entitlements: {} });

  const s = supabaseAdmin();
  const { data: ident } = await s.from("user_identities").select("stripe_customer_id").eq("clerk_user_id", userId).maybeSingle();

  let hasPhoneSupport = false;
  if (ident?.stripe_customer_id) {
    const { data: ps } = await s.from("user_phone_supports").select("active").eq("stripe_customer_id", ident.stripe_customer_id).maybeSingle();
    hasPhoneSupport = !!ps?.active;
  }

  return NextResponse.json({
    user: { id: userId },
    entitlements: { phoneSupport: hasPhoneSupport }
  });
}
