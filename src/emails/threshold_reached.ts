import { wrap } from "./layout";

interface Need {
  id: string;
  title: string;
  min_people: number;
  total_people: number;
}

export function thresholdReachedMail(need: Need) {
  const subject = `[NeedPort] 目標人数に到達: ${need.title}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const bodyHtml = `
    <h2>目標人数に到達しました</h2>
    
    <div class="success-box">
      <h3>達成された募集</h3>
      <p><strong>募集:</strong> ${need.title}</p>
      <p><strong>目標人数:</strong> ${need.min_people}人</p>
      <p><strong>現在の応募人数:</strong> ${need.total_people}人</p>
    </div>
    
    <div style="margin: 30px 0;">
      <a href="${siteUrl}/admin/needs/${need.id}/offers" class="button">管理画面で確認</a>
      <a href="${siteUrl}/admin/needs/${need.id}/entries" class="button">応募者一覧</a>
    </div>
    
    <p>目標人数に到達しました。応募者の詳細を確認し、次のステップを検討してください。</p>
  `;
  
  const bodyText = `
目標人数に到達しました

達成された募集:
- 募集: ${need.title}
- 目標人数: ${need.min_people}人
- 現在の応募人数: ${need.total_people}人

管理画面: ${siteUrl}/admin/needs/${need.id}/offers
応募者一覧: ${siteUrl}/admin/needs/${need.id}/entries

目標人数に到達しました。応募者の詳細を確認し、次のステップを検討してください。
  `.trim();
  
  return wrap(subject, bodyHtml, bodyText);
}
