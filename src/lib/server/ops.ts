import { supabaseServer } from './supabase-server';

export async function fetchNeedAndAdoptedOffer(needId: string) {
  const sb = supabaseServer();
  const n = await sb.from('needs').select('id,title,summary,prejoin_count,adopted_offer_id').eq('id', needId).single();
  if (n.error) throw n.error;
  let offer = null as any;
  if (n.data?.adopted_offer_id) {
    const o = await sb.from('offers').select('id,min_people,deadline,price_amount,status').eq('id', n.data.adopted_offer_id).single();
    if (!o.error) offer = o.data;
  } else {
    // 採用前は最新の offers を1件だけ参考値として拾う
    const o = await sb.from('offers').select('id,min_people,deadline,price_amount,status').eq('need_id', needId).order('created_at',{ascending:false}).limit(1).maybeSingle();
    if (!o.error) offer = o.data;
  }
  return { need: n.data, offer };
}
