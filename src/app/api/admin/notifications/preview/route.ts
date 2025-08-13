import { NextRequest, NextResponse } from "next/server";
import { createMailLayout } from "@/lib/mail/layout";
import { createSuccessBox, createButton, formatJPY, createInfoBox } from "@/lib/mail/partials";
import { sendMail } from "@/lib/mail/smtp";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const needId = searchParams.get("needId");
  const send = searchParams.get("send") === "1";

  // Mock data for preview
  const mockNeed = {
    id: needId || "mock-need-id",
    title: "テスト募集案件",
    min_people: 10,
    deadline: "2024-12-31",
  };

  const mockOffer = {
    id: "mock-offer-id",
    vendor_name: "テスト企業株式会社",
    amount: 500000,
  };

  let subject = "";
  let contentHtml = "";

  switch (type) {
    case "adopted":
      subject = `[NeedPort] オファー採用: ${mockOffer.vendor_name} / 目標 ${mockNeed.min_people}人 / 締切 ${mockNeed.deadline}`;
      contentHtml = `
        <h2>オファーが採用されました</h2>
        
        ${createSuccessBox({
          title: "採用されたオファー",
          content: `
            <p><strong>募集:</strong> ${mockNeed.title}</p>
            <p><strong>提供者:</strong> ${mockOffer.vendor_name}</p>
            <p><strong>金額:</strong> ${formatJPY(mockOffer.amount)}</p>
            <p><strong>目標人数:</strong> ${mockNeed.min_people}人</p>
            <p><strong>締切:</strong> ${mockNeed.deadline}</p>
          `
        })}
        
        <div class="text-center mt-4">
          ${createButton({ text: "管理画面で確認", href: `/admin/needs/${mockNeed.id}/offers` })}
          ${createButton({ text: "公開ページで確認", href: `/needs/${mockNeed.id}`, variant: "secondary" })}
        </div>
        
        <p class="mt-4">募集が開始されました。応募の状況を定期的に確認してください。</p>
      `;
      break;

    case "threshold":
      subject = `[NeedPort] 目標達成: ${mockNeed.title}`;
      contentHtml = `
        <h2>目標人数に到達しました</h2>
        
        ${createSuccessBox({
          title: "募集目標達成",
          content: `
            <p><strong>募集:</strong> ${mockNeed.title}</p>
            <p><strong>目標人数:</strong> ${mockNeed.min_people}人</p>
            <p><strong>現在の参加者:</strong> ${mockNeed.min_people}人</p>
            <p><strong>締切:</strong> ${mockNeed.deadline}</p>
          `
        })}
        
        <div class="text-center mt-4">
          ${createButton({ text: "詳細を確認", href: `/admin/needs/${mockNeed.id}/offers` })}
        </div>
        
        <p class="mt-4">目標人数に到達しました。支払い処理を開始してください。</p>
      `;
      break;

    case "prejoin":
      subject = `[NeedPort] 新しい参加予約: ${mockNeed.title}`;
      contentHtml = `
        <h2>新しい参加予約がありました</h2>
        
        ${createInfoBox({
          title: "参加予約詳細",
          content: `
            <p><strong>募集:</strong> ${mockNeed.title}</p>
            <p><strong>参加者:</strong> ユーザー名（メールアドレス）</p>
            <p><strong>予約日時:</strong> ${new Date().toLocaleString("ja-JP")}</p>
          `
        })}
        
        <div class="text-center mt-4">
          ${createButton({ text: "管理画面で確認", href: `/admin/needs/${mockNeed.id}/offers` })}
        </div>
        
        <p class="mt-4">新しい参加予約を確認してください。</p>
      `;
      break;

    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const html = createMailLayout({ title: subject, contentHtml });

  // If send parameter is provided, send the email
  if (send) {
    const toOwner = process.env.MAIL_TO_OWNER;
    if (!toOwner) {
      return NextResponse.json({
        preview: html,
        sent: false,
        error: "MAIL_TO_OWNER not configured",
      });
    }

    const result = await sendMail({
      to: toOwner,
      subject,
      html,
    });
    
    return NextResponse.json({
      preview: html,
      sent: result.success,
      error: result.error,
    });
  }

  // Return HTML preview
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
