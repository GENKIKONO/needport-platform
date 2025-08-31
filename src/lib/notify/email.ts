import { supabaseAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const MAIL_FROM = process.env.MAIL_FROM || 'NeedPort <no-reply@needport.jp>';

export async function enqueueEmail(input: {
  to: string;
  toUserId?: string;
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  meta?: Record<string, any>;
}) {
  const { error } = await supabaseAdmin().from('email_queue').insert({
    to_email: input.to, to_user_id: input.toUserId ?? null,
    subject: input.subject, text_body: input.text ?? null, html_body: input.html ?? null,
    template: input.template ?? null, meta: input.meta ?? {}
  });
  if (error) throw error;
}

// シンプルな"即時"送信（運用ではCRON/キューで送るのが推奨）
export async function flushEmailQueue(limit = 20) {
  if (!RESEND_API_KEY) return { ok:false, reason:'no_resend_key' };
  const client = new Resend(RESEND_API_KEY);
  const { data, error } = await supabaseAdmin()
    .from('email_queue')
    .select('*')
    .eq('status','queued')
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) return { ok:false, error };
  if (!data?.length) return { ok:true, sent:0 };

  let sent = 0;
  for (const row of data) {
    try {
      await client.emails.send({
        from: MAIL_FROM,
        to: row.to_email,
        subject: row.subject,
        text: row.text_body ?? undefined,
        html: row.html_body ?? undefined,
      });
      await supabaseAdmin().from('email_queue').update({ status:'sent', sent_at: new Date().toISOString() }).eq('id', row.id);
      sent++;
    } catch (e: any) {
      await supabaseAdmin().from('email_queue').update({ status:'error', error: String(e?.message || e) }).eq('id', row.id);
    }
  }
  return { ok:true, sent };
}
