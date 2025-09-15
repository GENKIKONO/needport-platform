import { NextRequest, NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/mail/smtp";


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name: templateName } = await params;
    const { subject, html } = await request.json();
    
    if (!subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get test recipient from environment
    const testRecipient = process.env.MAIL_TO_OWNER;
    if (!testRecipient) {
      return NextResponse.json(
        { error: "MAIL_TO_OWNER not configured" },
        { status: 500 }
      );
    }

    // Replace template variables with test data
    let processedHtml = html;
    processedHtml = processedHtml.replace(/\{\{title\}\}/g, "テスト用タイトル");
    processedHtml = processedHtml.replace(/\{\{message\}\}/g, "これはテストメールです。");
    processedHtml = processedHtml.replace(/\{\{name\}\}/g, "テストユーザー");
    processedHtml = processedHtml.replace(/\{\{email\}\}/g, testRecipient);

    let processedSubject = subject;
    processedSubject = processedSubject.replace(/\{\{title\}\}/g, "テスト用タイトル");
    processedSubject = processedSubject.replace(/\{\{message\}\}/g, "テストメッセージ");
    processedSubject = processedSubject.replace(/\{\{name\}\}/g, "テストユーザー");
    processedSubject = processedSubject.replace(/\{\{email\}\}/g, testRecipient);

    // Send test email
    await sendMail({
      to: testRecipient,
      subject: `[TEST] ${processedSubject}`,
      html: processedHtml
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      recipient: testRecipient
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: "Failed to send test email" },
      { status: 500 }
    );
  }
}
