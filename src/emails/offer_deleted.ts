import { wrap } from "./layout";

interface Need {
  id: string;
  title: string;
}

interface Offer {
  id: string;
  vendor_name: string;
}

export function offerDeletedMail(need: Need, offer: Offer) {
  const subject = `[NeedPort] オファー削除: ${offer.vendor_name}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const bodyHtml = `
    <h2>オファーが削除されました</h2>
    
    <div class="warning-box">
      <h3>削除されたオファー</h3>
      <p><strong>募集:</strong> ${need.title}</p>
      <p><strong>提供者:</strong> ${offer.vendor_name}</p>
    </div>
    
    <div style="margin: 30px 0;">
      <a href="${siteUrl}/admin/needs/${need.id}/offers" class="button">管理画面で確認</a>
    </div>
    
    <p>削除されたオファーの詳細を確認してください。</p>
  `;
  
  const bodyText = `
オファーが削除されました

削除されたオファー:
- 募集: ${need.title}
- 提供者: ${offer.vendor_name}

管理画面: ${siteUrl}/admin/needs/${need.id}/offers

削除されたオファーの詳細を確認してください。
  `.trim();
  
  return wrap(subject, bodyHtml, bodyText);
}
