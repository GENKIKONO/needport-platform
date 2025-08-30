import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

export async function POST(req: NextRequest) {
  try {
    const origin = process.env.PLATFORM_ORIGIN || "";
    const body = await req.json().catch(() => ({}));
    const mode = body?.mode === "subscription" ? "subscription" : "payment";
    const price =
      mode === "subscription" ? process.env.PRICE_PHONE_SUPPORT : process.env.PRICE_FLAT_UNLOCK;

    if (!origin || !price || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      return NextResponse.json(
        { error: "env_missing", detail: { origin: !!origin, price: !!price } },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/billing/success?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancelled`,
      allow_promotion_codes: true,
      metadata: { kind: mode },
    });
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "checkout_failed", message: String(e?.message || e) }, { status: 500 });
  }
}
