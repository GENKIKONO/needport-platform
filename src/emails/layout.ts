export function wrap(subject: string, bodyHtml: string, bodyText?: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 30px 20px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .button:hover { background: #059669; }
        .info-box { background: #e0f2fe; border: 1px solid #0284c7; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .warning-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .success-box { background: #d1fae5; border: 1px solid #10b981; border-radius: 6px; padding: 15px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NeedPort</h1>
        </div>
        <div class="content">
          ${bodyHtml}
        </div>
        <div class="footer">
          <p>このメールは自動送信です。</p>
          <p>NeedPort - 募集管理プラットフォーム</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = bodyText || bodyHtml.replace(/<[^>]*>/g, '');
  
  return { subject, html, text };
}
