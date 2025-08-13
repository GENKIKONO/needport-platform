import { wrap } from "./layout";

interface DigestStats {
  date: string;
  newNeeds: number;
  newOffers: number;
  newEntries: number;
  topNeeds: Array<{
    id: string;
    title: string;
    newEntries: number;
  }>;
  nearingDeadlines: Array<{
    id: string;
    title: string;
    deadline: string;
    daysLeft: number;
  }>;
}

export function digestMail(stats: DigestStats) {
  const subject = `[NeedPort] 日次ダイジェスト: ${stats.date}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const bodyHtml = `
    <h2>NeedPort 日次ダイジェスト</h2>
    <p><strong>日付:</strong> ${stats.date}</p>
    
    <div class="info-box">
      <h3>本日の統計</h3>
      <ul>
        <li>新しい募集: ${stats.newNeeds} 件</li>
        <li>新しいオファー: ${stats.newOffers} 件</li>
        <li>新しい応募: ${stats.newEntries} 件</li>
      </ul>
    </div>
    
    ${stats.topNeeds.length > 0 ? `
    <div class="success-box">
      <h3>応募数トップ (本日)</h3>
      <ul>
        ${stats.topNeeds.map(need => `
          <li>
            <a href="${siteUrl}/admin/needs/${need.id}/offers" style="color: #10b981; text-decoration: none;">
              ${need.title}
            </a>
            - ${need.newEntries} 件の新規応募
          </li>
        `).join('')}
      </ul>
    </div>
    ` : ''}
    
    ${stats.nearingDeadlines.length > 0 ? `
    <div class="warning-box">
      <h3>締切が近い募集 (7日以内)</h3>
      <ul>
        ${stats.nearingDeadlines.map(need => `
          <li>
            <a href="${siteUrl}/admin/needs/${need.id}/offers" style="color: #f59e0b; text-decoration: none;">
              ${need.title}
            </a>
            - 締切: ${need.deadline} (残り ${need.daysLeft} 日)
          </li>
        `).join('')}
      </ul>
    </div>
    ` : ''}
    
    <div style="margin: 30px 0;">
      <a href="${siteUrl}/admin" class="button">管理画面を開く</a>
    </div>
    
    <p>このダイジェストは毎日自動生成されます。</p>
  `;
  
  const bodyText = `
NeedPort 日次ダイジェスト

日付: ${stats.date}

本日の統計:
- 新しい募集: ${stats.newNeeds} 件
- 新しいオファー: ${stats.newOffers} 件
- 新しい応募: ${stats.newEntries} 件

${stats.topNeeds.length > 0 ? `
応募数トップ (本日):
${stats.topNeeds.map(need => `- ${need.title} - ${need.newEntries} 件の新規応募`).join('\n')}
` : ''}

${stats.nearingDeadlines.length > 0 ? `
締切が近い募集 (7日以内):
${stats.nearingDeadlines.map(need => `- ${need.title} - 締切: ${need.deadline} (残り ${need.daysLeft} 日)`).join('\n')}
` : ''}

管理画面: ${siteUrl}/admin

このダイジェストは毎日自動生成されます。
  `.trim();
  
  return wrap(subject, bodyHtml, bodyText);
}
