interface LegalData {
  companyName: string;
  address: string;
  contact: string;
  representative: string;
  supportEmail: string;
  lastUpdated: string;
}

export function getLegalData(): LegalData {
  return {
    companyName: process.env.LEGAL_COMPANY_NAME || "NeedPort株式会社",
    address: process.env.LEGAL_ADDRESS || "東京都渋谷区○○○○",
    contact: process.env.LEGAL_CONTACT || "info@needport.jp",
    representative: process.env.LEGAL_REP || "代表取締役 ○○ ○○",
    supportEmail: process.env.LEGAL_SUPPORT_EMAIL || "support@needport.jp",
    lastUpdated: "2024年12月23日",
  };
}

export function createLegalPage(content: string): string {
  const data = getLegalData();
  
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NeedPort - 法務ページ</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background-color: #f9fafb;
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0.5rem;
      margin-bottom: 2rem;
    }
    h2 {
      color: #374151;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    p {
      margin-bottom: 1rem;
    }
    .company-info {
      background: #f3f4f6;
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
    }
    .last-updated {
      text-align: right;
      color: #6b7280;
      font-size: 0.875rem;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
    
    <div class="company-info">
      <strong>会社情報</strong><br>
      ${data.companyName}<br>
      ${data.address}<br>
      代表者: ${data.representative}<br>
      お問い合わせ: ${data.contact}
    </div>
    
    <div class="last-updated">
      最終更新日: ${data.lastUpdated}
    </div>
  </div>
</body>
</html>
  `;
}
