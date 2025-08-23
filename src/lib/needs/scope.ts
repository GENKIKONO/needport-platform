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
}): boolean {
  // 長期・保管状態の判定
  const isArchived = need.status === 'archived' || need.status === 'closed';
  const isOld = new Date(need.created_at) <= new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  
  return isArchived || isOld;
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
