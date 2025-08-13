import { wrap } from "./layout";
import { formatJPY } from "./utils";

interface Need {
  id: string;
  title: string;
}

interface Offer {
  id: string;
  vendor_name: string;
  amount: number;
}

export function offerAddedMail(need: Need, offer: Offer) {
  const subject = `[NeedPort] オファー追加: ${offer.vendor_name} / ${formatJPY(offer.amount)}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const bodyHtml = `
    <h2>新しいオファーが追加されました</h2>
    
    <div class="info-box">
      <h3>募集情報</h3>
      <p><strong>タイトル:</strong> ${need.title}</p>
      <p><strong>提供者:</strong> ${offer.vendor_name}</p>
      <p><strong>金額:</strong> ${formatJPY(offer.amount)}</p>
    </div>
    
    <div style="margin: 30px 0;">
      <a href="${siteUrl}/admin/needs/${need.id}/offers" class="button">管理画面で確認</a>
      <a href="${siteUrl}/needs/${need.id}" class="button">公開ページで確認</a>
    </div>
    
    <p>このオファーを採用するかどうか検討してください。</p>
  `;
  
  const bodyText = `
新しいオファーが追加されました

募集情報:
- タイトル: ${need.title}
- 提供者: ${offer.vendor_name}
- 金額: ${formatJPY(offer.amount)}

管理画面: ${siteUrl}/admin/needs/${need.id}/offers
公開ページ: ${siteUrl}/needs/${need.id}

このオファーを採用するかどうか検討してください。
  `.trim();
  
  return wrap(subject, bodyHtml, bodyText);
}
