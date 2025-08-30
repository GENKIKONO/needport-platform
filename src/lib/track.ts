import { events } from './events';

// ニーズ関連のイベント追跡
export const trackNeeds = {
  tabClick: (scope: string) => {
    events.kaichuFilter('dev-user-123', { 
      type: 'needs.tab_click',
      scope 
    });
  },
  
  sortChange: (sort: string) => {
    events.kaichuFilter('dev-user-123', { 
      type: 'needs.sort_change',
      sort 
    });
  },
  
  cardOpen: (id: string, scope: string) => {
    events.kaichuFilter('dev-user-123', { 
      type: 'needs.card_open',
      id,
      scope 
    });
  }
};
