import { Resend } from 'resend';
import nodemailer from 'nodemailer';

interface MailOptions {
  to: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  text: string;
}

export async function sendMail(options: MailOptions): Promise<void> {
  const { to, bcc, subject, html, text } = options;
  
  // Normalize recipients
  const toEmails = Array.isArray(to) ? to : [to];
  const bccEmails = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [];
  
  // Deduplicate emails (case-insensitive)
  const allEmails = [...toEmails, ...bccEmails];
  const uniqueEmails = allEmails.filter((email, index) => 
    allEmails.findIndex(e => e.toLowerCase() === email.toLowerCase()) === index
  );
  
  const finalTo = uniqueEmails.filter(email => !bccEmails.includes(email));
  const finalBcc = bccEmails;

  // Check for Resend API key
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM || 'noreply@needport.com',
        to: finalTo,
        bcc: finalBcc.length > 0 ? finalBcc : undefined,
        subject,
        html,
        text,
      });
      return;
    } catch (error) {
      throw new Error(`Resend error: ${error}`);
    }
  }

  // Check for SMTP configuration
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: finalTo.join(', '),
        bcc: finalBcc.length > 0 ? finalBcc.join(', ') : undefined,
        subject,
        html,
        text,
      });
      return;
    } catch (error) {
      throw new Error(`SMTP error: ${error}`);
    }
  }

  throw new Error("No mail provider configured. Set RESEND_API_KEY or SMTP_* environment variables.");
}
