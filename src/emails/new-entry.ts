interface Entry {
  name: string;
  email: string;
  count: number;
  note?: string | null;
}

interface Need {
  title: string;
  min_people?: number | null;
  deadline?: string | null;
}

interface Offer {
  vendor_name: string;
  amount: number;
}

export function newEntryMail(entry: Entry, need: Need, offer?: Offer) {
  const subject = `[NeedPort] 新しい応募: ${need.title}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #374151; }
        .value { color: #111827; }
        .offer { background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .progress { background: #f3f4f6; border-radius: 4px; height: 8px; margin: 5px 0; }
        .progress-bar { background: #10b981; height: 100%; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>新しい応募がありました</h1>
        </div>
        <div class="content">
          <h2>${need.title}</h2>
          
          <div class="field">
            <div class="label">応募者名:</div>
            <div class="value">${entry.name}</div>
          </div>
          
          <div class="field">
            <div class="label">メールアドレス:</div>
            <div class="value">${entry.email}</div>
          </div>
          
          <div class="field">
            <div class="label">参加人数:</div>
            <div class="value">${entry.count} 人</div>
          </div>
          
          ${entry.note ? `
          <div class="field">
            <div class="label">備考:</div>
            <div class="value">${entry.note}</div>
          </div>
          ` : ''}
          
          ${offer ? `
          <div class="offer">
            <div class="label">採用オファー:</div>
            <div class="value">${offer.vendor_name} - ${offer.amount.toLocaleString('ja-JP')} 円</div>
          </div>
          ` : ''}
          
          ${need.min_people ? `
          <div class="field">
            <div class="label">目標人数:</div>
            <div class="value">${need.min_people} 人</div>
          </div>
          ` : ''}
          
          ${need.deadline ? `
          <div class="field">
            <div class="label">締切:</div>
            <div class="value">${need.deadline}</div>
          </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
新しい応募がありました

募集: ${need.title}

応募者情報:
- 名前: ${entry.name}
- メール: ${entry.email}
- 参加人数: ${entry.count} 人
${entry.note ? `- 備考: ${entry.note}` : ''}

${offer ? `採用オファー: ${offer.vendor_name} - ${offer.amount.toLocaleString('ja-JP')} 円` : ''}
${need.min_people ? `目標人数: ${need.min_people} 人` : ''}
${need.deadline ? `締切: ${need.deadline}` : ''}
  `.trim();
  
  return { subject, html, text };
}
