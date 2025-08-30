import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const origin = process.env.PLATFORM_ORIGIN;
    const { mode, needId } = await req.json().catch(() => ({} as any));

    if (!origin) return NextResponse.json({ error: "platform_origin_missing" }, { status: 500 });

    const stripe = getStripe();
    const price =
      mode === "subscription"
        ? process.env.PRICE_PHONE_SUPPORT
        : process.env.PRICE_FLAT_UNLOCK;

    if (!price) {
      return NextResponse.json({ error: "price_missing_for_mode" }, { status: 400 });
    }

    // Clerk userId を取得して metadata に積む
    let clerkUserId: string | null = null;
    try {
      const { userId } = getAuth(req as any) || {};
      clerkUserId = userId ?? null;
    } catch {}

    // 既存のStripe Customerがあれば再利用
    let customer: string | undefined;
    try {
      if (clerkUserId) {
        const sadmin = (await import("@/lib/supabase-server")).supabaseAdmin();
        const { data: ident } = await sadmin.from("user_identities").select("stripe_customer_id").eq("clerk_user_id", clerkUserId).maybeSingle();
        if (ident?.stripe_customer_id) customer = ident.stripe_customer_id;
      }
    } catch {}

    const session = await stripe.checkout.sessions.create({
      mode: mode === "subscription" ? "subscription" : "payment",
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/billing/success?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancelled`,
      customer, // 既存があれば指定（なければStripeが自動作成）
      metadata: {
        kind: mode ?? "payment",
        needId: needId ?? "",
        clerkUserId: clerkUserId ?? ""
      },
      allow_promotion_codes: true
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e:any) {
    console.error("[checkout:error]", e?.message || e);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
