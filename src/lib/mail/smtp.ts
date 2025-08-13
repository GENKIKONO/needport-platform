import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SendMailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Create transporter from environment variables
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = port === 465;

  if (!host) {
    console.warn('SMTP_HOST not configured, using mock transporter');
    return nodemailer.createTransporter({
      host: 'localhost',
      port: 1025,
      secure: false,
      ignoreTLS: true,
    });
  }

  return nodemailer.createTransporter({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    ignoreTLS: !secure && port !== 587,
  });
}

export async function sendMail(options: MailOptions): Promise<SendMailResult> {
  try {
    const transporter = createTransporter();
    const from = process.env.MAIL_FROM || 'NeedPort <no-reply@needport.jp>';

    const mailOptions = {
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function isSmtpConfigured(): boolean {
  return !!process.env.SMTP_HOST;
}

export function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS ? '***' : undefined,
    from: process.env.MAIL_FROM || 'NeedPort <no-reply@needport.jp>',
    toOwner: process.env.MAIL_TO_OWNER,
    configured: isSmtpConfigured(),
  };
}
