import { isKaichu, Need } from '@/lib/needs/lifecycle';

describe('lifecycle functions', () => {
  describe('isKaichu', () => {
    it('should return true for closed needs', () => {
      const need: Need = {
        id: '1',
        title: 'Test Need',
        status: 'closed',
        last_activity_at: new Date().toISOString(),
        user_id: 'user1',
        created_at: new Date().toISOString()
      };
      
      expect(isKaichu(need)).toBe(true);
    });

    it('should return true for archived needs', () => {
      const need: Need = {
        id: '1',
        title: 'Test Need',
        status: 'archived',
        last_activity_at: new Date().toISOString(),
        user_id: 'user1',
        created_at: new Date().toISOString()
      };
      
      expect(isKaichu(need)).toBe(true);
    });

    it('should return true for old active needs', () => {
      const oldDate = new Date(Date.now() - 70 * 24 * 60 * 60 * 1000); // 70 days ago
      const need: Need = {
        id: '1',
        title: 'Test Need',
        status: 'active',
        last_activity_at: oldDate.toISOString(),
        user_id: 'user1',
        created_at: new Date().toISOString()
      };
      
      expect(isKaichu(need)).toBe(true);
    });

    it('should return false for recent active needs', () => {
      const recentDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const need: Need = {
        id: '1',
        title: 'Test Need',
        status: 'active',
        last_activity_at: recentDate.toISOString(),
        user_id: 'user1',
        created_at: new Date().toISOString()
      };
      
      expect(isKaichu(need)).toBe(false);
    });
  });
});
