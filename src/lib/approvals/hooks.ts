import { supabaseAdmin } from '@/lib/supabase/admin';
import { notifyUser } from '@/lib/notify/notify'; // 既存の通知ユーティリティを利用

export async function recordApproval(kind:'need'|'message', targetId:string, action:'approve'|'reject'|'send_back', reason_text:string|undefined, template_id:string|undefined, adminId:string) {
  const sa = supabaseAdmin();
  const { error } = await sa.from('approval_actions').insert({
    kind, target_id: targetId, action, reason_text, template_id, created_by: adminId
  });
  if(error) throw new Error('approval_log_failed');
}

export async function notifyDecision(kind:'need'|'message', targetId:string, action:'approve'|'reject'|'send_back') {
  // 対象の投稿者を取得（needs.owner_id / message の送信者）
  const sa = supabaseAdmin();
  let userId:string|undefined;
  if(kind==='need'){
    const { data } = await sa.from('needs').select('owner_id,title').eq('id', targetId).maybeSingle();
    userId = data?.owner_id;
    if(!userId) return;
    const title = data?.title ?? 'ニーズ';
    const msg = action==='approve' ? 'あなたのニーズが公開されました。' : action==='reject' ? 'あなたのニーズは修正が必要です。' : 'あなたのニーズは差し戻されました。';
    await notifyUser(userId, 'system', '審査結果', `${title}：${msg}`, { kind, targetId, action });
  } else {
    const { data } = await sa.from('proposal_messages').select('sender_id,proposal_id').eq('id', targetId).maybeSingle();
    userId = data?.sender_id;
    if(!userId) return;
    const msg = action==='approve' ? 'あなたのメッセージが相手に公開されました。' : action==='reject' ? 'あなたのメッセージは修正が必要です。' : 'あなたのメッセージは差し戻されました。';
    await notifyUser(userId, 'system', '審査結果', msg, { kind, targetId, action });
  }
}
