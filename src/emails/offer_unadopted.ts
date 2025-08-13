import { wrap } from "./layout";

interface Need {
  id: string;
  title: string;
}

export function offerUnadoptedMail(need: Need) {
  const subject = `[NeedPort] オファー採用解除: ${need.title}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const bodyHtml = `
    <h2>オファーの採用が解除されました</h2>
    
    <div class="warning-box">
      <h3>採用解除された募集</h3>
      <p><strong>募集:</strong> ${need.title}</p>
    </div>
    
    <div style="margin: 30px 0;">
      <a href="${siteUrl}/admin/needs/${need.id}/offers" class="button">管理画面で確認</a>
      <a href="${siteUrl}/needs/${need.id}" class="button">公開ページで確認</a>
    </div>
    
    <p>募集が一時停止されました。必要に応じて新しいオファーを検討してください。</p>
  `;
  
  const bodyText = `
オファーの採用が解除されました

採用解除された募集:
- 募集: ${need.title}

管理画面: ${siteUrl}/admin/needs/${need.id}/offers
公開ページ: ${siteUrl}/needs/${need.id}

募集が一時停止されました。必要に応じて新しいオファーを検討してください。
  `.trim();
  
  return wrap(subject, bodyHtml, bodyText);
}
