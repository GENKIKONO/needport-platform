/**
 * Email Notification System (Lv1: Log provider with SendGrid ready)
 * 
 * Abstract interface for email notifications with provider switching
 * - Lv1: Log provider for development/testing
 * - Production: SendGrid provider
 */

export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<EmailResult>;
}

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
  fromName?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Log Provider - For Lv1 development
 * Outputs email content to console instead of sending
 */
class LogEmailProvider implements EmailProvider {
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      console.log('\n=== EMAIL NOTIFICATION (Log Provider) ===');
      console.log(`To: ${options.to}`);
      console.log(`From: ${options.fromName || 'NeedPort'} <${options.from || 'noreply@needport.jp'}>`);
      console.log(`Subject: ${options.subject}`);
      console.log('--- Content ---');
      console.log(options.text);
      if (options.html) {
        console.log('--- HTML Content ---');
        console.log(options.html);
      }
      console.log('=== END EMAIL NOTIFICATION ===\n');

      return {
        success: true,
        messageId: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      console.error('Log email provider error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * SendGrid Provider - For production
 * Requires SENDGRID_API_KEY environment variable
 */
class SendGridEmailProvider implements EmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      // In a real implementation, you would use @sendgrid/mail here
      // For now, we'll simulate the API call
      const sgMail = await import('@sendgrid/mail').catch(() => null);
      
      if (!sgMail) {
        throw new Error('SendGrid package not available. Install @sendgrid/mail for production use.');
      }

      sgMail.setApiKey(this.apiKey);

      const msg = {
        to: options.to,
        from: {
          email: options.from || process.env.FROM_EMAIL || 'noreply@needport.jp',
          name: options.fromName || process.env.FROM_NAME || 'NeedPort'
        },
        subject: options.subject,
        text: options.text,
        html: options.html || options.text
      };

      const result = await sgMail.send(msg);
      
      return {
        success: true,
        messageId: result[0]?.headers?.['x-message-id'] || 'sendgrid_sent'
      };
    } catch (error) {
      console.error('SendGrid email provider error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SendGrid error'
      };
    }
  }
}

/**
 * Email Service Factory
 * Creates appropriate provider based on EMAIL_PROVIDER environment variable
 */
function createEmailProvider(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER || 'log';
  
  switch (provider.toLowerCase()) {
    case 'sendgrid':
      const apiKey = process.env.SENDGRID_API_KEY;
      if (!apiKey) {
        console.warn('SENDGRID_API_KEY not found, falling back to log provider');
        return new LogEmailProvider();
      }
      return new SendGridEmailProvider(apiKey);
    
    case 'log':
    default:
      return new LogEmailProvider();
  }
}

/**
 * Main Email Service
 * Single interface for sending emails with error handling
 */
export class EmailService {
  private provider: EmailProvider;

  constructor() {
    this.provider = createEmailProvider();
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      return await this.provider.sendEmail(options);
    } catch (error) {
      console.error('EmailService error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email service error'
      };
    }
  }

  /**
   * Send notification for new proposal received
   */
  async sendProposalNotification(recipientEmail: string, proposalDetails: {
    needTitle: string;
    proposerName: string;
    estimateAmount: number;
    needId: string;
  }): Promise<EmailResult> {
    const { needTitle, proposerName, estimateAmount, needId } = proposalDetails;
    
    return this.sendEmail({
      to: recipientEmail,
      subject: `新しい提案が届きました - ${needTitle}`,
      text: `
こんにちは、

あなたのニーズ「${needTitle}」に新しい提案が届きました。

提案者: ${proposerName}
見積金額: ¥${estimateAmount.toLocaleString()}

詳細はこちらからご確認ください：
https://needport.jp/needs/${needId}

NeedPort チーム
      `.trim(),
      html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>新しい提案が届きました</h2>
  <p>こんにちは、</p>
  <p>あなたのニーズ「<strong>${needTitle}</strong>」に新しい提案が届きました。</p>
  
  <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p><strong>提案者:</strong> ${proposerName}</p>
    <p><strong>見積金額:</strong> ¥${estimateAmount.toLocaleString()}</p>
  </div>
  
  <p>
    <a href="https://needport.jp/needs/${needId}" 
       style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      詳細を確認
    </a>
  </p>
  
  <p>NeedPort チーム</p>
</div>
      `.trim()
    });
  }

  /**
   * Send notification for new chat message
   */
  async sendMessageNotification(recipientEmail: string, messageDetails: {
    senderName: string;
    needTitle: string;
    messagePreview: string;
    roomId: string;
  }): Promise<EmailResult> {
    const { senderName, needTitle, messagePreview, roomId } = messageDetails;
    
    return this.sendEmail({
      to: recipientEmail,
      subject: `新しいメッセージ - ${needTitle}`,
      text: `
こんにちは、

${senderName}さんから新しいメッセージが届きました。

ニーズ: ${needTitle}
メッセージプレビュー: ${messagePreview}

チャットで返信する：
https://needport.jp/chat/${roomId}

NeedPort チーム
      `.trim(),
      html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>新しいメッセージが届きました</h2>
  <p>こんにちは、</p>
  <p><strong>${senderName}</strong>さんから新しいメッセージが届きました。</p>
  
  <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p><strong>ニーズ:</strong> ${needTitle}</p>
    <p><strong>メッセージ:</strong> ${messagePreview}</p>
  </div>
  
  <p>
    <a href="https://needport.jp/chat/${roomId}" 
       style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      チャットで返信
    </a>
  </p>
  
  <p>NeedPort チーム</p>
</div>
      `.trim()
    });
  }

  /**
   * Send notification for payment release completion
   */
  async sendPaymentReleaseNotification(recipientEmail: string, paymentDetails: {
    needTitle: string;
    amount: number;
    vendorName: string;
    releaseDate: string;
  }): Promise<EmailResult> {
    const { needTitle, amount, vendorName, releaseDate } = paymentDetails;
    
    return this.sendEmail({
      to: recipientEmail,
      subject: `決済が完了しました - ${needTitle}`,
      text: `
こんにちは、

ニーズ「${needTitle}」の決済が正常に完了しました。

決済金額: ¥${amount.toLocaleString()}
事業者: ${vendorName}
完了日時: ${releaseDate}

取引履歴はマイページからご確認いただけます：
https://needport.jp/me/transactions

ご利用ありがとうございました。

NeedPort チーム
      `.trim(),
      html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>決済が完了しました</h2>
  <p>こんにちは、</p>
  <p>ニーズ「<strong>${needTitle}</strong>」の決済が正常に完了しました。</p>
  
  <div style="background: #ecfdf5; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #16a34a;">
    <p><strong>決済金額:</strong> ¥${amount.toLocaleString()}</p>
    <p><strong>事業者:</strong> ${vendorName}</p>
    <p><strong>完了日時:</strong> ${releaseDate}</p>
  </div>
  
  <p>
    <a href="https://needport.jp/me/transactions" 
       style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      取引履歴を確認
    </a>
  </p>
  
  <p>ご利用ありがとうございました。</p>
  <p>NeedPort チーム</p>
</div>
      `.trim()
    });
  }
}

// Singleton instance
export const emailService = new EmailService();