import { LifecycleNeed } from './schedule';

export interface LifecycleEmailPayload {
  to: string;
  needId: string;
  needTitle: string;
  daysSinceCreation: number;
  continueUrl: string;
  closeUrl: string;
}

export async function sendLifecycleReminderEmail(payload: LifecycleEmailPayload): Promise<void> {
  const { to, needId, needTitle, daysSinceCreation, continueUrl, closeUrl } = payload;
  
  const subject = `【NeedPort】ニーズ「${needTitle}」の継続について`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>NeedPort ライフサイクル通知</h2>
      <p>こんにちは、</p>
      <p>あなたが投稿したニーズ「<strong>${needTitle}</strong>」が${daysSinceCreation}日経過しました。</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>次のステップを選択してください：</h3>
        <div style="margin: 15px 0;">
          <a href="${continueUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">
            継続する
          </a>
          <a href="${closeUrl}" style="background-color: #6c757d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            完了にする
          </a>
        </div>
      </div>
      
      <p>このニーズを継続する場合は「継続する」ボタンを、完了した場合は「完了にする」ボタンをクリックしてください。</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 14px;">
        このメールは自動送信されています。<br>
        お問い合わせは <a href="mailto:support@needport.jp">support@needport.jp</a> までお願いします。
      </p>
    </div>
  `;
  
  const text = `
NeedPort ライフサイクル通知

こんにちは、

あなたが投稿したニーズ「${needTitle}」が${daysSinceCreation}日経過しました。

次のステップを選択してください：

継続する: ${continueUrl}
完了にする: ${closeUrl}

このニーズを継続する場合は「継続する」リンクを、完了した場合は「完了にする」リンクをクリックしてください。

---
このメールは自動送信されています。
お問い合わせは support@needport.jp までお願いします。
  `;

  // 開発環境ではコンソールに出力
  if (process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY) {
    console.info('MAIL:', {
      to,
      subject,
      html: html.substring(0, 200) + '...',
      text: text.substring(0, 200) + '...'
    });
    return;
  }

  // 本番環境ではResendで送信
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: process.env.RESEND_FROM || 'noreply@needport.jp',
      to,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error('Failed to send lifecycle email:', error);
    throw error;
  }
}

export async function sendMonthlyReminderEmail(payload: LifecycleEmailPayload): Promise<void> {
  const { to, needId, needTitle, daysSinceCreation, continueUrl, closeUrl } = payload;
  
  const subject = `【NeedPort】月次リマインダー：ニーズ「${needTitle}」`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>NeedPort 月次リマインダー</h2>
      <p>こんにちは、</p>
      <p>あなたが投稿したニーズ「<strong>${needTitle}</strong>」が${daysSinceCreation}日経過しています。</p>
      
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3>このニーズについて：</h3>
        <p>長期化しているニーズです。継続するか完了にするかを選択してください。</p>
        <div style="margin: 15px 0;">
          <a href="${continueUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">
            継続する
          </a>
          <a href="${closeUrl}" style="background-color: #6c757d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            完了にする
          </a>
        </div>
      </div>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 14px;">
        このメールは自動送信されています。<br>
        お問い合わせは <a href="mailto:support@needport.jp">support@needport.jp</a> までお願いします。
      </p>
    </div>
  `;
  
  // 開発環境ではコンソールに出力
  if (process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY) {
    console.info('MONTHLY MAIL:', {
      to,
      subject,
      needTitle,
      daysSinceCreation
    });
    return;
  }

  // 本番環境ではResendで送信
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: process.env.RESEND_FROM || 'noreply@needport.jp',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send monthly reminder email:', error);
    throw error;
  }
}
