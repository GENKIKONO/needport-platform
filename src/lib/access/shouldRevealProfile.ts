import { createAdminClient } from '@/lib/supabase/admin';

export interface ProfileRevealContext {
  viewerId: string;
  roomId?: string;
  needId?: string;
}

export async function shouldRevealProfile(context: ProfileRevealContext): Promise<boolean> {
  const { viewerId, roomId, needId } = context;
  
  if (!viewerId) {
    return false;
  }

  const supabase = createAdminClient();

  // roomIdが指定されている場合、そのルームの参加者かチェック
  if (roomId) {
    const { data: participant } = await supabase
      .from('room_participants')
      .select('role')
      .eq('room_id', roomId)
      .eq('user_id', viewerId)
      .single();

    if (!participant) {
      return false;
    }
  }

  // needIdが指定されている場合、そのニーズに支払い済みマッチがあるかチェック
  if (needId) {
    const { data: paidMatch } = await supabase
      .from('matches')
      .select('id')
      .eq('need_id', needId)
      .eq('business_id', viewerId)
      .eq('status', 'paid')
      .limit(1);

    if (!paidMatch || paidMatch.length === 0) {
      return false;
    }
  }

  // roomIdとneedIdの両方が指定されている場合、ルームのニーズに支払い済みかチェック
  if (roomId && !needId) {
    const { data: room } = await supabase
      .from('rooms')
      .select('need_id')
      .eq('id', roomId)
      .single();

    if (room?.need_id) {
      const { data: paidMatch } = await supabase
        .from('matches')
        .select('id')
        .eq('need_id', room.need_id)
        .eq('business_id', viewerId)
        .eq('status', 'paid')
        .limit(1);

      if (!paidMatch || paidMatch.length === 0) {
        return false;
      }
    }
  }

  return true;
}

// 開発用の簡易チェック（DBアクセスなし）
export function shouldRevealProfileDev(viewerId: string): boolean {
  // 開発時は常にtrue（DEV_ASSUME_AUTH=1の場合は全開示）
  return !!viewerId;
}
