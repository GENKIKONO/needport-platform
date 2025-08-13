export interface MailTemplate {
  subject: string;
  text: string;
  html: string;
}

export const mailTemplates = {
  adopt: {
    subject: '[NeedPort] オファーが採用されました',
    text: `オファーが採用されました。

ニーズ: {{needTitle}}
ベンダー: {{vendorName}}
金額: {{amount}}

詳細は管理画面でご確認ください。
{{adminUrl}}

---
NeedPort`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">🎉 オファーが採用されました</h2>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>ニーズ:</strong> {{needTitle}}</p>
          <p><strong>ベンダー:</strong> {{vendorName}}</p>
          <p><strong>金額:</strong> {{amount}}</p>
        </div>
        
        <p>詳細は管理画面でご確認ください。</p>
        
        <a href="{{adminUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          管理画面を開く
        </a>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">NeedPort</p>
      </div>
    `
  },

  unadopt: {
    subject: '[NeedPort] オファーの採用が解除されました',
    text: `オファーの採用が解除されました。

ニーズ: {{needTitle}}
ベンダー: {{vendorName}}
金額: {{amount}}

詳細は管理画面でご確認ください。
{{adminUrl}}

---
NeedPort`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">⚠️ オファーの採用が解除されました</h2>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>ニーズ:</strong> {{needTitle}}</p>
          <p><strong>ベンダー:</strong> {{vendorName}}</p>
          <p><strong>金額:</strong> {{amount}}</p>
        </div>
        
        <p>詳細は管理画面でご確認ください。</p>
        
        <a href="{{adminUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          管理画面を開く
        </a>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">NeedPort</p>
      </div>
    `
  },

  scheduleUpdated: {
    subject: '[NeedPort] スケジュールが更新されました',
    text: `スケジュールが更新されました。

ニーズ: {{needTitle}}
アイテム: {{itemTitle}}
ステータス: {{status}}
期限: {{dueDate}}

詳細は管理画面でご確認ください。
{{adminUrl}}

---
NeedPort`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">📅 スケジュールが更新されました</h2>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>ニーズ:</strong> {{needTitle}}</p>
          <p><strong>アイテム:</strong> {{itemTitle}}</p>
          <p><strong>ステータス:</strong> {{status}}</p>
          <p><strong>期限:</strong> {{dueDate}}</p>
        </div>
        
        <p>詳細は管理画面でご確認ください。</p>
        
        <a href="{{adminUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          管理画面を開く
        </a>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">NeedPort</p>
      </div>
    `
  }
} as const;

export type TemplateName = keyof typeof mailTemplates;

export function replaceTemplateVariables(
  template: MailTemplate,
  variables: Record<string, string>
): MailTemplate {
  const replaceInString = (str: string): string => {
    let result = str;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
    return result;
  };

  return {
    subject: replaceInString(template.subject),
    text: replaceInString(template.text),
    html: replaceInString(template.html)
  };
}
