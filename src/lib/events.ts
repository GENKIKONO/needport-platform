import { createAdminClient } from '@/lib/supabase/admin';

export interface EventPayload {
  [key: string]: any;
}

export async function trackEvent(
  actor: string,
  type: string,
  payload?: EventPayload
): Promise<void> {
  try {
    const supabase = createAdminClient();
    
    await supabase
      .from('events')
      .insert({
        actor,
        type,
        payload,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    // イベント記録の失敗はログに記録するが、アプリケーションの動作は継続
    console.warn('Failed to track event:', { actor, type, payload, error });
  }
}

// 主要イベントのヘルパー関数
export const events = {
  needView: (actor: string, needId: string) => 
    trackEvent(actor, 'need.view', { needId }),
  
  kaichuFilter: (actor: string, params: Record<string, any>) => 
    trackEvent(actor, 'kaichu.filter', params),
  
  matchMarkPaid: (actor: string, matchId: string) => 
    trackEvent(actor, 'match.mark_paid_manual', { matchId }),
  
  roomMessage: (actor: string, roomId: string) => 
    trackEvent(actor, 'room.message', { roomId }),
  
  needContinue: (actor: string, needId: string) => 
    trackEvent(actor, 'need.continue', { needId }),
  
  needClose: (actor: string, needId: string) => 
    trackEvent(actor, 'need.close', { needId })
};
