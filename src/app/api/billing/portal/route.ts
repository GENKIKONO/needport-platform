import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req as any) || {};
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sadmin = supabaseAdmin();
  const { data: ident } = await sadmin.from("user_identities").select("stripe_customer_id").eq("clerk_user_id", userId).maybeSingle();
  if (!ident?.stripe_customer_id) return NextResponse.json({ error: "no_customer" }, { status: 404 });

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: ident.stripe_customer_id,
    return_url: `${process.env.PLATFORM_ORIGIN}/me`,
  });
  return NextResponse.json({ url: session.url });
}
