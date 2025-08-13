import { wrap } from "./layout";
import { formatJPY } from "./utils";

interface Need {
  id: string;
  title: string;
  min_people?: number | null;
  deadline?: string | null;
}

interface Offer {
  id: string;
  vendor_name: string;
  amount: number;
}

export function offerAdoptedMail(need: Need, offer: Offer) {
  const minPeopleText = need.min_people ? ` / 目標 ${need.min_people}人` : '';
  const deadlineText = need.deadline ? ` / 締切 ${need.deadline}` : '';
  const subject = `[NeedPort] オファー採用: ${offer.vendor_name}${minPeopleText}${deadlineText}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const bodyHtml = `
    <h2>オファーが採用されました</h2>
    
    <div class="success-box">
      <h3>採用されたオファー</h3>
      <p><strong>募集:</strong> ${need.title}</p>
      <p><strong>提供者:</strong> ${offer.vendor_name}</p>
      <p><strong>金額:</strong> ${formatJPY(offer.amount)}</p>
      ${need.min_people ? `<p><strong>目標人数:</strong> ${need.min_people}人</p>` : ''}
      ${need.deadline ? `<p><strong>締切:</strong> ${need.deadline}</p>` : ''}
    </div>
    
    <div style="margin: 30px 0;">
      <a href="${siteUrl}/admin/needs/${need.id}/offers" class="button">管理画面で確認</a>
      <a href="${siteUrl}/needs/${need.id}" class="button">公開ページで確認</a>
    </div>
    
    <p>募集が開始されました。応募の状況を定期的に確認してください。</p>
  `;
  
  const bodyText = `
オファーが採用されました

採用されたオファー:
- 募集: ${need.title}
- 提供者: ${offer.vendor_name}
- 金額: ${formatJPY(offer.amount)}
${need.min_people ? `- 目標人数: ${need.min_people}人` : ''}
${need.deadline ? `- 締切: ${need.deadline}` : ''}

管理画面: ${siteUrl}/admin/needs/${need.id}/offers
公開ページ: ${siteUrl}/needs/${need.id}

募集が開始されました。応募の状況を定期的に確認してください。
  `.trim();
  
  return wrap(subject, bodyHtml, bodyText);
}
