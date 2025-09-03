import { NextResponse } from "next/server";
import { stripe } from "@/server/payments/stripe";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature") || "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if(!secret) return NextResponse.json({ ok:false, reason:"unset webhook secret" }, { status:400 });

  const raw = await req.text();
  let evt: any;
  try{ evt = stripe.webhooks.constructEvent(raw, sig, secret); }
  catch(e:any){ return new NextResponse(`signature verification failed: ${e?.message||e}`, { status:400 }); }

  // 状態遷移はここで冪等に処理
  // 例: checkout.session.completed / invoice.paid など
  // FLAGS.DISABLE_STRIPE_CAPTURE が true の間は確定変更は行わない
  return NextResponse.json({ ok:true });
}

export const config = { api: { bodyParser: false } } as any;
