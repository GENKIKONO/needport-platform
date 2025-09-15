import { NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";
import { generateSignedUrl } from "@/lib/server/signed-urls";
import { sendMail } from "@/lib/mailer";


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function POST(_req: Request) {
  try {
    const admin = createAdminClientOrNull();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    
    // Find needs older than 60 days without recent reminders
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: needsForFirstReminder, error: firstReminderError } = await admin
      .from("needs")
      .select(`
        id,
        title,
        created_at,
        created_by,
        last_reminder_at,
        profiles!created_by (
          id,
          clerk_user_id
        )
      `)
      .lt('created_at', sixtyDaysAgo)
      .neq('status', 'closed')
      .is('last_reminder_at', null);

    if (firstReminderError) {
      console.error('Error fetching needs for first reminder:', firstReminderError);
    }

    // Find needs for monthly follow-up reminders
    const { data: needsForFollowup, error: followupError } = await admin
      .from("needs")
      .select(`
        id,
        title,
        created_at,
        created_by,
        last_reminder_at,
        profiles!created_by (
          id,
          clerk_user_id
        )
      `)
      .lt('last_reminder_at', thirtyDaysAgo)
      .neq('status', 'closed')
      .not('last_reminder_at', 'is', null);

    if (followupError) {
      console.error('Error fetching needs for follow-up reminder:', followupError);
    }

    const allNeeds = [
      ...(needsForFirstReminder || []),
      ...(needsForFollowup || [])
    ];

    let successCount = 0;
    let failureCount = 0;

    for (const need of allNeeds) {
      try {
        if (!need.profiles?.clerk_user_id) {
          console.warn(`No user profile found for need ${need.id}`);
          failureCount++;
          continue;
        }

        // Get user email from Clerk
        const { clerkClient } = await import('@clerk/nextjs/server');
        const user = await clerkClient.users.getUser(need.profiles.clerk_user_id);
        const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
        
        if (!primaryEmail?.emailAddress) {
          console.warn(`No primary email found for user ${need.profiles.clerk_user_id}`);
          failureCount++;
          continue;
        }

        // Generate signed action URLs
        const continueToken = generateSignedUrl('continue', need.id, need.created_by);
        const closeToken = generateSignedUrl('close', need.id, need.created_by);
        
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const continueUrl = `${baseUrl}/api/needs/${need.id}/continue?token=${continueToken}`;
        const closeUrl = `${baseUrl}/api/needs/${need.id}/close?token=${closeToken}`;

        // Generate email content
        const isFirstReminder = !need.last_reminder_at;
        const subject = isFirstReminder 
          ? `[NeedPort] ニーズ「${need.title}」の継続確認（60日経過）`
          : `[NeedPort] ニーズ「${need.title}」の継続確認（月次リマインド）`;

        const html = generateLifecycleEmailHtml(need, continueUrl, closeUrl, isFirstReminder);
        const text = generateLifecycleEmailText(need, continueUrl, closeUrl, isFirstReminder);

        // Send email
        await sendMail({
          to: [primaryEmail.emailAddress],
          subject,
          html,
          text,
        });

        // Update reminder timestamp
        await admin
          .from("needs")
          .update({
            last_reminder_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", need.id);

        successCount++;
        console.log(`Sent lifecycle reminder for need ${need.id} to ${primaryEmail.emailAddress}`);

      } catch (error) {
        console.error(`Failed to send lifecycle reminder for need ${need.id}:`, error);
        failureCount++;
      }
    }

    return NextResponse.json({ 
      ok: true, 
      processed: allNeeds.length,
      success: successCount,
      failed: failureCount
    });

  } catch (e: any) {
    console.error('Lifecycle reminders cron error:', e);
    return NextResponse.json({ 
      ok: false, 
      error: e?.message ?? "Unknown error" 
    }, { status: 500 });
  }
}

function generateLifecycleEmailHtml(
  need: any, 
  continueUrl: string, 
  closeUrl: string, 
  isFirstReminder: boolean
): string {
  const period = isFirstReminder ? '60日' : '1ヶ月';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ニーズの継続確認</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #2c3e50; margin: 0 0 10px 0;">ニーズの継続確認</h1>
    <p style="margin: 0; color: #666;">投稿から${period}が経過しました</p>
  </div>

  <h2 style="color: #34495e;">「${need.title}」</h2>
  
  <p>いつもNeedPortをご利用いただき、ありがとうございます。</p>
  
  <p>あなたが投稿したニーズ「<strong>${need.title}</strong>」について、投稿から${period}が経過いたしました。</p>
  
  <p>下記のいずれかのアクションをお選びください：</p>
  
  <div style="margin: 30px 0;">
    <table style="width: 100%; border-spacing: 0;">
      <tr>
        <td style="padding: 0 10px 20px 0; width: 50%;">
          <a href="${continueUrl}" style="display: block; background-color: #3498db; color: white; text-decoration: none; padding: 15px 20px; border-radius: 5px; text-align: center; font-weight: bold;">
            ✅ 継続する
          </a>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">まだ解決していない場合</p>
        </td>
        <td style="padding: 0 0 20px 10px; width: 50%;">
          <a href="${closeUrl}" style="display: block; background-color: #95a5a6; color: white; text-decoration: none; padding: 15px 20px; border-radius: 5px; text-align: center; font-weight: bold;">
            🏁 完了する
          </a>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">解決済み・不要になった場合</p>
        </td>
      </tr>
    </table>
  </div>
  
  <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p style="margin: 0;"><strong>⚠️ 重要:</strong> アクションを取らない場合、${isFirstReminder ? '次回は1ヶ月後' : '再度1ヶ月後'}に同様のリマインドをお送りします。</p>
  </div>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
  
  <p style="font-size: 14px; color: #666;">
    このメールは自動送信されています。<br>
    ご質問がございましたら、サポートまでお問い合わせください。
  </p>
  
  <p style="font-size: 14px; color: #666;">
    NeedPort チーム
  </p>
</body>
</html>
  `;
}

function generateLifecycleEmailText(
  need: any, 
  continueUrl: string, 
  closeUrl: string, 
  isFirstReminder: boolean
): string {
  const period = isFirstReminder ? '60日' : '1ヶ月';
  return `
ニーズの継続確認

「${need.title}」

いつもNeedPortをご利用いただき、ありがとうございます。

あなたが投稿したニーズ「${need.title}」について、投稿から${period}が経過いたしました。

下記のいずれかのアクションをお選びください：

✅ 継続する（まだ解決していない場合）
${continueUrl}

🏁 完了する（解決済み・不要になった場合）
${closeUrl}

⚠️ 重要: アクションを取らない場合、${isFirstReminder ? '次回は1ヶ月後' : '再度1ヶ月後'}に同様のリマインドをお送りします。

---

このメールは自動送信されています。
ご質問がございましたら、サポートまでお問い合わせください。

NeedPort チーム
  `;
}
