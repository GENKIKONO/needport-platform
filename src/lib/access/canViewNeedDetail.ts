import { getDevSession } from '@/lib/devAuth';

export interface NeedDetailContext {
  viewerId?: string;
  needId: string;
}

export function canViewNeedDetail(context: NeedDetailContext): boolean {
  const { viewerId } = context;
  
  // 開発用認証バイパスが有効な場合は常にtrue
  const devSession = getDevSession();
  if (devSession) {
    return true;
  }
  
  // ログイン済みユーザーは詳細を見られる
  if (viewerId) {
    return true;
  }
  
  // 未ログインユーザーはサマリーのみ
  return false;
}

export function getNeedDisplayLevel(context: NeedDetailContext): 'summary' | 'full' {
  if (canViewNeedDetail(context)) {
    return 'full';
  }
  return 'summary';
}
