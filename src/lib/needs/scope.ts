export type NeedScope = 'active' | 'kaichu' | 'all';

export interface NeedScopeFilters {
  scope: NeedScope;
  sort?: 'recent' | 'most_supported' | 'newest';
  page?: number;
  limit?: number;
}

export function isKaichuNeed(need: {
  status: string;
  created_at: string;
  last_activity_at?: string;
}): boolean {
  // 完了済みは確実に海中
  if (need.status === 'closed' || need.status === 'archived') {
    return true;
  }

  // 最終更新から60日以上経過
  const lastActivity = need.last_activity_at ? new Date(need.last_activity_at) : new Date(need.created_at);
  const cutoffDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  
  return lastActivity <= cutoffDate;
}

export function getScopeQuery(scope: NeedScope) {
  switch (scope) {
    case 'active':
      return {
        status: 'active',
        created_at: { gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() }
      };
    case 'kaichu':
      return {
        or: [
          { status: { in: ['archived', 'closed'] } },
          { created_at: { lte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() } }
        ]
      };
    case 'all':
    default:
      return {};
  }
}

export function getSortQuery(sort: string = 'recent') {
  switch (sort) {
    case 'most_supported':
      return { prejoin_count: { ascending: false } };
    case 'newest':
      return { created_at: { ascending: false } };
    case 'recent':
    default:
      return { updated_at: { ascending: false } };
  }
}
