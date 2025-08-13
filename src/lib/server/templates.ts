type Need = { id:string; title:string; summary?:string|null; prejoin_count?:number|null };
type Offer = { min_people?:number|null; deadline?:string|null; price_amount?:number|null };

export function buildLineText(need: Need, offer?: Offer) {
  const d = offer?.deadline ? offer.deadline.slice(0,10) : '-';
  const people = offer?.min_people ?? '?';
  const price = offer?.price_amount != null ? `${offer.price_amount.toLocaleString()}円` : '未定';
  return [
    '【NeedPort 企業見積り依頼（手動連携）】',
    `案件: ${need.title}`,
    `概要: ${need.summary ?? '-'}`,
    `最低人数: ${people}人 / 現在の賛同: ${need.prejoin_count ?? 0}人`,
    `希望価格(目安): ${price}`,
    `回答期限(目安): ${d}`,
    '',
    '■できる/やれる場合:',
    '・概算いくらで、何人集まれば対応可能か（例: 50万円/3人〜）',
    '・提供できる範囲（スコープ箇条書き）',
    '',
    `案件ページ: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/needs/${need.id}`,
  ].join('\n');
}

export function buildOpsEmail(need: Need, offer?: Offer) {
  const subject = `【見積り依頼・下書き】${need.title}（NeedPort）`;
  const text = buildLineText(need, offer) + '\n\n（この本文を公式LINEに貼り付けてください）';
  const html = `<pre style="font:14px/1.6 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; white-space:pre-wrap;">${text.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre>`;
  return { subject, text, html };
}
