import { sendMail as sendSmtpMail } from './smtp';
import { mailTemplates, replaceTemplateVariables, type TemplateName } from './templates';

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendMail(options: SendMailOptions): Promise<boolean> {
  try {
    if (process.env.NODE_ENV === 'development') {
      // In development, just log the email
      console.log('📧 Mail would be sent in production:');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Text:', options.text);
      console.log('HTML:', options.html);
      return true;
    }

    // In production, actually send the email
    await sendSmtpMail({
      to: options.to,
      subject: options.subject,
      html: options.html
    });

    return true;
  } catch (error) {
    console.error('Failed to send mail:', error);
    return false;
  }
}

export async function sendTemplateMail(
  templateName: TemplateName,
  to: string,
  variables: Record<string, string>
): Promise<boolean> {
  const template = mailTemplates[templateName];
  const processedTemplate = replaceTemplateVariables(template, variables);
  
  return sendMail({
    to,
    subject: processedTemplate.subject,
    text: processedTemplate.text,
    html: processedTemplate.html
  });
}

// Convenience functions for common notifications
export async function notifyAdoption(
  needTitle: string,
  vendorName: string,
  amount: string
): Promise<boolean> {
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://needport.jp'}/admin/needs`;
  const ownerEmail = process.env.MAIL_TO_OWNER;
  
  if (!ownerEmail) {
    console.warn('MAIL_TO_OWNER not configured');
    return false;
  }

  return sendTemplateMail('adopt', ownerEmail, {
    needTitle,
    vendorName,
    amount,
    adminUrl
  });
}

export async function notifyUnadoption(
  needTitle: string,
  vendorName: string,
  amount: string
): Promise<boolean> {
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://needport.jp'}/admin/needs`;
  const ownerEmail = process.env.MAIL_TO_OWNER;
  
  if (!ownerEmail) {
    console.warn('MAIL_TO_OWNER not configured');
    return false;
  }

  return sendTemplateMail('unadopt', ownerEmail, {
    needTitle,
    vendorName,
    amount,
    adminUrl
  });
}

export async function notifyScheduleUpdate(
  needTitle: string,
  itemTitle: string,
  status: string,
  dueDate: string
): Promise<boolean> {
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://needport.jp'}/admin/needs`;
  const ownerEmail = process.env.MAIL_TO_OWNER;
  
  if (!ownerEmail) {
    console.warn('MAIL_TO_OWNER not configured');
    return false;
  }

  return sendTemplateMail('scheduleUpdated', ownerEmail, {
    needTitle,
    itemTitle,
    status,
    dueDate,
    adminUrl
  });
}
