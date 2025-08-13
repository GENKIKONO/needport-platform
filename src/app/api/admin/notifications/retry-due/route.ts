import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonOk, jsonError } from "@/lib/api";

export async function POST() {
  try {
    const admin = createAdminClient();
    
    // Get notifications that are due for retry
    const { data: notifications, error: fetchError } = await admin
      .from("entry_notifications")
      .select("*")
      .in("status", ["queued", "failed"])
      .lte("next_attempt_at", new Date().toISOString())
      .order("next_attempt_at", { ascending: true })
      .limit(50);

    if (fetchError) {
      return jsonError("Failed to fetch notifications", 500);
    }

    if (!notifications || notifications.length === 0) {
      return jsonOk({ 
        message: "No notifications due for retry",
        processed: 0,
        success: 0,
        failed: 0
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
        const { sendMail } = await import("@/lib/mailer");
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

    return jsonOk({ 
      processed: notifications.length,
      success: successCount,
      failed: failureCount
    });

  } catch (e: any) {
    return jsonError(e?.message ?? "Unknown error", 500);
  }
}
