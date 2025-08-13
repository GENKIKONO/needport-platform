import { createAdminClient } from "@/lib/supabase/admin";

interface TemplateVariables {
  [key: string]: string;
}

export async function getMailTemplate(name: string): Promise<{
  subject: string;
  html: string;
} | null> {
  try {
    const supabase = createAdminClient();
    
    const { data: template, error } = await supabase
      .from('mail_templates')
      .select('subject, html')
      .eq('name', name)
      .single();

    if (error || !template) {
      console.error(`Template '${name}' not found:`, error);
      return null;
    }

    return {
      subject: template.subject,
      html: template.html
    };
  } catch (error) {
    console.error(`Error fetching template '${name}':`, error);
    return null;
  }
}

export function replaceTemplateVariables(
  template: string,
  variables: TemplateVariables
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  }
  
  return result;
}

export async function sendTemplatedMail(
  templateName: string,
  to: string,
  variables: TemplateVariables = {}
): Promise<boolean> {
  try {
    const template = await getMailTemplate(templateName);
    if (!template) {
      console.error(`Template '${templateName}' not found`);
      return false;
    }

    const processedSubject = replaceTemplateVariables(template.subject, variables);
    const processedHtml = replaceTemplateVariables(template.html, variables);

    const { sendMail } = await import('./smtp');
    await sendMail({
      to,
      subject: processedSubject,
      html: processedHtml
    });

    return true;
  } catch (error) {
    console.error(`Error sending templated mail '${templateName}':`, error);
    return false;
  }
}

// Predefined template variables for common use cases
export const commonVariables = {
  siteName: 'NeedPort',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://needport.jp',
  supportEmail: process.env.LEGAL_SUPPORT_EMAIL || 'support@needport.jp'
};
