import { NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";
import { FF_NOTIFICATIONS } from "@/lib/flags";
import { sendMail } from "@/lib/mailer";
import { newEntryMail } from "@/emails/new-entry";

// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function POST(_req: Request) {
  // Check feature flag
  if (!FF_NOTIFICATIONS) {
    return NextResponse.json({ 
      ok: false, 
      error: "Notifications feature is disabled" 
    }, { status: 404 });
  }

  try {
    const admin = createAdminClientOrNull();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    
    // Get latest queued notifications (limit 10)
    const { data: notifications, error: fetchError } = await admin
      .from("entry_notifications")
      .select(`
        id,
        entry_id,
        status,
        entries!inner(
          name,
          email,
          count,
          note,
          need_id,
          needs!inner(
            title,
            min_people,
            deadline,
            adopted_offer_id,
            offers!inner(
              vendor_name,
              amount
            )
          )
        )
      `)
      .eq("status", "queued")
      .order("created_at", { ascending: true })
      .limit(10);

    if (fetchError) {
      return NextResponse.json({ 
        ok: false, 
        error: fetchError.message 
      }, { status: 500 });
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({ 
        ok: true, 
        message: "No queued notifications found" 
      });
    }

    let successCount = 0;
    let failureCount = 0;

    for (const notification of notifications) {
      try {
        // Get need data for recipient resolution
        const { data: need } = await admin
          .from("needs")
          .select("title, notify_email")
          .eq("id", notification.need_id)
          .single();

        if (!need) {
          console.error(`Need not found for notification ${notification.id}`);
          failureCount++;
          continue;
        }

        // Build recipients
        const globalRecipients = process.env.NP_NOTIFY_TO?.split(',').map(e => e.trim()).filter(Boolean) || [];
        const needRecipients = need.notify_email ? [need.notify_email] : [];
        const bccRecipients = process.env.NP_NOTIFY_BCC?.split(',').map(e => e.trim()).filter(Boolean) || [];
        
        const toEmails = [...globalRecipients, ...needRecipients];
        
        if (toEmails.length === 0) {
          console.error(`No recipients configured for notification ${notification.id}`);
          failureCount++;
          continue;
        }

        // Generate email content based on kind
        let emailContent;
        switch (notification.kind) {
          case 'offer.added':
            const { data: offer } = await admin
              .from("offers")
              .select("vendor_name, amount")
              .eq("id", notification.ref_id)
              .single();
            if (offer) {
              const { offerAddedMail } = await import("@/emails/offer_added");
              emailContent = offerAddedMail(need, offer);
            }
            break;
          default:
            // Fallback for unknown kinds
            emailContent = {
              subject: `[NeedPort] ${notification.kind}`,
              html: `<h2>通知: ${notification.kind}</h2><p>詳細は管理画面で確認してください。</p>`,
              text: `通知: ${notification.kind}\n詳細は管理画面で確認してください。`
            };
        }

        if (!emailContent) {
          console.error(`No email template for kind: ${notification.kind}`);
          failureCount++;
          continue;
        }

        // Send email
        await sendMail({
          to: toEmails,
          bcc: bccRecipients,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        // Mark as sent
        const { error: updateError } = await admin
          .from("entry_notifications")
          .update({ 
            status: "sent",
            updated_at: new Date().toISOString()
          })
          .eq("id", notification.id);

        if (updateError) {
          console.error(`Failed to update notification ${notification.id}:`, updateError);
          failureCount++;
        } else {
          successCount++;
        }

      } catch (e: any) {
        console.error(`Failed to process notification ${notification.id}:`, e);
        
        // Calculate retry delay
        const retryCount = notification.retry_count || 0;
        const delayMinutes = Math.min(10 * Math.pow(2, retryCount), 360); // Cap at 6 hours
        const nextAttempt = new Date();
        nextAttempt.setMinutes(nextAttempt.getMinutes() + delayMinutes);
        
        // Mark as failed with retry schedule
        await admin
          .from("entry_notifications")
          .update({ 
            status: "failed", 
            last_error: e?.message ?? "Unknown error",
            retry_count: retryCount + 1,
            next_attempt_at: nextAttempt.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", notification.id);
        
        failureCount++;
      }
    }

    return NextResponse.json({ 
      ok: true, 
      processed: notifications.length,
      success: successCount,
      failed: failureCount
    });

  } catch (e: any) {
    return NextResponse.json({ 
      ok: false, 
      error: e?.message ?? "Unknown error" 
    }, { status: 500 });
  }
}
