import { createAdminClient } from '@/lib/supabase/admin';
import { getDevSession } from '@/lib/devAuth';
import { events } from '@/lib/events';
import { auditHelpers } from '@/lib/audit';

export type NeedStatus = 'active' | 'closed' | 'archived';

export interface Need {
  id: string;
  title: string;
  status: NeedStatus;
  last_activity_at: string;
  user_id: string;
  created_at: string;
}

/**
 * ニーズのステータスを更新
 */
export async function setNeedStatus(needId: string, status: NeedStatus, reason?: string) {
  const devSession = getDevSession();
  if (!devSession) {
    throw new Error('Authentication required');
  }

  const supabase = createAdminClient();
  
  const updateData: any = {
    status,
    last_activity_at: new Date().toISOString()
  };

  // 完了理由を保存（簡易的にnotesフィールドに保存）
  if (status === 'closed' && reason) {
    updateData.notes = reason;
  }

  const { data, error } = await supabase
    .from('needs')
    .update(updateData)
    .eq('id', needId)
    .select()
    .single();

  if (error) {
    console.error('Error updating need status:', error);
    throw new Error('Failed to update need status');
  }

  return data;
}

/**
 * ニーズを継続状態にする
 */
export async function continueNeed(needId: string) {
  const result = await setNeedStatus(needId, 'active');
  
  // イベント追跡
  events.kaichuFilter('dev-user-123', {
    type: 'need.continue',
    needId,
    actorId: 'dev-user-123'
  });

  // 監査ログ
  await auditHelpers.log('dev-user-123', 'NEED_CONTINUE', 'need', needId, {
    previousStatus: result.status,
    newStatus: 'active'
  });

  return result;
}

/**
 * ニーズを完了状態にする
 */
export async function closeNeed(needId: string, reason?: string) {
  const result = await setNeedStatus(needId, 'closed', reason);
  
  // イベント追跡
  events.kaichuFilter('dev-user-123', {
    type: 'need.close',
    needId,
    actorId: 'dev-user-123',
    reason
  });

  // 監査ログ
  await auditHelpers.log('dev-user-123', 'NEED_CLOSE', 'need', needId, {
    previousStatus: result.status,
    newStatus: 'closed',
    reason
  });

  // 完了通知（ダミー実装）
  console.info(`Need ${needId} closed by dev-user-123. Reason: ${reason || 'No reason provided'}`);

  return result;
}

/**
 * ニーズが海中（長期・保管状態）かどうかを判定
 */
export function isKaichu(need: Need): boolean {
  // 完了済みは確実に海中
  if (need.status === 'closed' || need.status === 'archived') {
    return true;
  }

  // 最終更新から60日以上経過
  const lastActivity = new Date(need.last_activity_at);
  const cutoffDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  
  return lastActivity <= cutoffDate;
}

/**
 * ニーズの詳細情報を取得
 */
export async function getNeed(needId: string): Promise<Need | null> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('needs')
    .select('id, title, status, last_activity_at, user_id, created_at')
    .eq('id', needId)
    .single();

  if (error) {
    console.error('Error fetching need:', error);
    return null;
  }

  return data;
}

/**
 * ユーザーのニーズ一覧を取得
 */
export async function getUserNeeds(userId: string): Promise<Need[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('needs')
    .select('id, title, status, last_activity_at, user_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user needs:', error);
    return [];
  }

  return data || [];
}
