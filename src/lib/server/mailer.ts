export async function sendOpsEmail(params: { subject:string; html?:string; text?:string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.OPERATOR_EMAIL;
  const from = process.env.MAIL_FROM || 'NeedPort Ops <ops@needport.local>';
  if (!to) return { ok:false, error:'OPERATOR_EMAIL not set' };

  // APIキーが無い場合はドライラン（実送信しないで成功扱い & プレビュー返す）
  if (!apiKey) {
    return { ok:true, dryRun:true, preview: { to, from, ...params } };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from, to, subject: params.subject,
      html: params.html || undefined, text: params.text || undefined
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok:false, error: data?.message || 'send failed' };
  return { ok:true, id: data?.id || null };
}
