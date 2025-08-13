export function createMailLayout({ title, contentHtml }: { title: string; contentHtml: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f9fafb;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #ffffff; 
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #10b981, #059669); 
          color: white; 
          padding: 24px 20px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: bold; 
        }
        .header .subtitle {
          margin: 8px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .content { 
          padding: 32px 24px; 
        }
        .footer { 
          background: #f8fafc; 
          padding: 20px 24px; 
          text-align: center; 
          color: #64748b; 
          font-size: 14px; 
          border-top: 1px solid #e2e8f0; 
        }
        .footer p {
          margin: 4px 0;
        }
        .button { 
          display: inline-block; 
          background: #10b981; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 8px 4px; 
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .button:hover { 
          background: #059669; 
        }
        .button.secondary {
          background: #6b7280;
        }
        .button.secondary:hover {
          background: #4b5563;
        }
        .info-box { 
          background: #eff6ff; 
          border: 1px solid #3b82f6; 
          border-radius: 8px; 
          padding: 16px; 
          margin: 16px 0; 
        }
        .warning-box { 
          background: #fffbeb; 
          border: 1px solid #f59e0b; 
          border-radius: 8px; 
          padding: 16px; 
          margin: 16px 0; 
        }
        .success-box { 
          background: #f0fdf4; 
          border: 1px solid #10b981; 
          border-radius: 8px; 
          padding: 16px; 
          margin: 16px 0; 
        }
        .error-box { 
          background: #fef2f2; 
          border: 1px solid #ef4444; 
          border-radius: 8px; 
          padding: 16px; 
          margin: 16px 0; 
        }
        .muted-text {
          color: #6b7280;
          font-size: 14px;
        }
        .text-center {
          text-align: center;
        }
        .mt-4 {
          margin-top: 16px;
        }
        .mb-4 {
          margin-bottom: 16px;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .content {
            padding: 24px 16px;
          }
          .header {
            padding: 20px 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NeedPort</h1>
          <p class="subtitle">募集管理プラットフォーム</p>
        </div>
        <div class="content">
          ${contentHtml}
        </div>
        <div class="footer">
          <p>このメールは自動送信です。</p>
          <p>NeedPort - 募集管理プラットフォーム</p>
          <p class="muted-text">
            <a href="${siteUrl}" style="color: #6b7280;">${siteUrl}</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return html;
}
