import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";
import { insertAudit } from "@/lib/audit";
import { pushNotification } from '@/lib/notify/notify';
import { enqueueEmail } from '@/lib/notify/email';

export async function POST(req: NextRequest) {
  // 本番初期は「決済画面で止める」運用：確定処理をスキップ
  const { FLAGS } = await import("../../../../config/flags");
  if (FLAGS.DISABLE_STRIPE_CAPTURE) {
    return NextResponse.json({ ok: true, skipped: "capture_disabled" }, { status: 200 });
  }

  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "missing_webhook_secret" }, { status: 500 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err:any) {
    console.error("[stripe:webhook:verify_failed]", err?.message || err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    // まず去重：同じevent.idを二重処理しない
    try {
      const sadmin = (await import("@/lib/supabase-server")).supabaseAdmin();
      const { error: dedupeErr } = await sadmin.from("webhook_events").insert({ id: event.id });
      if (dedupeErr) {
        // 既に処理済み
        return NextResponse.json({ ok: true });
      }
    } catch (e) {
      console.error("[stripe:webhook:dedupe_fail]", e);
    }

    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      await insertAudit({
        actorType: "system",
        action: "stripe.checkout.session.completed",
        targetType: "checkout_session",
        targetId: s.id,
        meta: { kind: s.metadata?.kind, needId: s.metadata?.needId, customer: s.customer, subscription: s.subscription }
      });
      // DB フラグ更新（スキーマに合わせて調整）
      // 例：
      //  - kind === 'payment'      → vendor_accesses に insert（needId + customerId ひも付け）
      //  - kind === 'subscription' → user_phone_supports に upsert（customerId ひも付け）
      try {
        const sadmin = (await import("@/lib/supabase-server")).supabaseAdmin();
        const customerId = typeof s.customer === "string" ? s.customer : null;
        const kind = s.metadata?.kind ?? "payment";
        const needId = s.metadata?.needId || null;
        const clerkUserId = s.metadata?.clerkUserId || null;

        if (clerkUserId && customerId) {
          await sadmin.from("user_identities").upsert({
            clerk_user_id: clerkUserId,
            stripe_customer_id: customerId
          }, { onConflict: "clerk_user_id" });
        }

        if (kind === "payment" && needId && customerId) {
          await sadmin.from("vendor_accesses").insert({
            need_id: needId,
            stripe_customer_id: customerId,
            unlocked_at: new Date().toISOString()
          });
        }
        if (kind === "subscription" && customerId) {
          await sadmin.from("user_phone_supports").upsert({
            stripe_customer_id: customerId,
            active: true,
            updated_at: new Date().toISOString()
          }, { onConflict: "stripe_customer_id" });
        }
        
        // 成約手数料の決済完了処理
        if (s.metadata?.type === 'settlement_fee') {
          const settlementId = s.metadata.settlementId;
          const { data: updated, error } = await sadmin
            .from('project_settlements')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
              stripe_checkout_session: s.id
            })
            .eq('id', settlementId)
            .select('id, need_id, vendor_id, final_price, fee_amount')
            .maybeSingle();
          if (error) {
            console.error('Settlement update error:', error);
          } else if (updated) {
            // 参加者（vendor と need owner）へ通知＆メール
            const { data: need } = await sadmin
              .from('needs').select('owner_id,title').eq('id', updated.need_id).maybeSingle();
            const participants = [
              { user_id: updated.vendor_id, role: 'vendor' },
              { user_id: need?.owner_id, role: 'owner' }
            ].filter(Boolean) as {user_id:string, role:'vendor'|'owner'}[];

            for (const p of participants) {
              await pushNotification({
                userId: p.user_id,
                type: 'settlement',
                title: '成約が確定しました（お支払い完了）',
                body: `案件「${need?.title ?? ''}」の成約が確定しました。明細は成約一覧をご確認ください。`,
                meta: { settlementId: updated.id, needId: updated.need_id }
              });
              // メール（ユーザーのプリファレンス尊重）
              const { data: pref } = await sadmin
                .from('notification_prefs').select('email_on_settlement').eq('user_id', p.user_id).maybeSingle();
              if (pref?.email_on_settlement !== false) {
                // 送信先メールを vendor_profiles / profiles などから取得（存在する方を採用）
                const { data: vendorMail } = await sadmin
                  .from('vendor_profiles').select('email').eq('user_id', p.user_id).maybeSingle();
                const to = vendorMail?.email || s.customer_details?.email || null;
                if (to) {
                  await enqueueEmail({
                    to,
                    toUserId: p.user_id,
                    subject: '【NeedPort】成約が確定しました（お支払い完了）',
                    text: `案件「${need?.title ?? ''}」の成約が確定しました。\n成約明細: https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'needport.jp'}/admin/settlements`,
                    html: `<p>案件「${need?.title ?? ''}」の成約が確定しました。</p><p><a href="https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'needport.jp'}/admin/settlements">成約明細を見る</a></p>`,
                    meta: { settlementId: updated.id, needId: updated.need_id }
                  });
                }
              }
            }
          }
        }
      } catch (e) {
        console.error("[stripe:webhook:db_update_failed]", e);
      }
    }
    if (event.type.startsWith("customer.subscription.")) {
      const sub = event.data.object as Stripe.Subscription;
      await insertAudit({
        actorType: "system",
        action: `stripe.${event.type}`,
        targetType: "subscription",
        targetId: sub.id,
        meta: { status: sub.status, customer: sub.customer }
      });
      // サブスク状態に応じてON/OFF
      try {
        const sadmin = (await import("@/lib/supabase-server")).supabaseAdmin();
        const customerId = typeof sub.customer === "string" ? sub.customer : null;
        if (customerId) {
          const active = sub.status === "active" || sub.status === "trialing";
          await sadmin.from("user_phone_supports").upsert({
            stripe_customer_id: customerId,
            active,
            updated_at: new Date().toISOString()
          }, { onConflict: "stripe_customer_id" });
        }
      } catch (e) {
        console.error("[stripe:webhook:sub_update_failed]", e);
      }
    }
    
    // Stripe Connect: account.updated
    if (event.type === 'account.updated') {
      const account = event.data.object as Stripe.Account;
      if (account.charges_enabled && account.payouts_enabled) {
        try {
          const sadmin = (await import("@/lib/supabase-server")).supabaseAdmin();
          const { error } = await sadmin
            .from('vendor_profiles')
            .update({
              stripe_connect_ready: true,
              stripe_connect_updated_at: new Date().toISOString()
            })
            .eq('stripe_connect_account_id', account.id);
          if (error) {
            console.error('Vendor profile update error:', error);
          } else {
            console.log(`Vendor ${account.id} onboarding completed`);
          }
        } catch (e) {
          console.error("[stripe:webhook:connect_update_failed]", e);
        }
      }
    }
  } catch (err:any) {
    console.error("[stripe:webhook:handler_error]", err?.message || err);
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export const config = { api: { bodyParser: false } } as any;
