import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNeedDisclosureLevel, maskContent, createMaskedNeed } from '../visibility';

// Mock Supabase admin client
const mockSupabaseQuery = vi.fn();
const mockAdminClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => mockSupabaseQuery)
          }))
        }))
      }))
    }))
  }))
};

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdminClient
}));

describe('Disclosure Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNeedDisclosureLevel', () => {
    it('should return default level for anonymous user', async () => {
      const result = await getNeedDisclosureLevel('need-123');
      
      expect(result).toEqual({
        showFullBody: false,
        showContactInfo: false,
        showFullProfile: false,
        showCompanyInfo: false,
      });
    });

    it('should return default level when no paid matches found', async () => {
      mockSupabaseQuery.mockResolvedValueOnce({
        data: [],
        error: null
      });

      const result = await getNeedDisclosureLevel('need-123', 'user-456');
      
      expect(result).toEqual({
        showFullBody: false,
        showContactInfo: false,
        showFullProfile: false,
        showCompanyInfo: false,
      });
    });

    it('should return full disclosure level when user has paid', async () => {
      mockSupabaseQuery.mockResolvedValueOnce({
        data: [{ id: 'match-789', status: 'paid', payment_id: 'payment-123' }],
        error: null
      });

      const result = await getNeedDisclosureLevel('need-123', 'user-456');
      
      expect(result).toEqual({
        showFullBody: true,
        showContactInfo: true,
        showFullProfile: true,
        showCompanyInfo: true,
      });
    });

    it('should handle database errors gracefully', async () => {
      mockSupabaseQuery.mockResolvedValueOnce({
        data: null,
        error: new Error('Database error')
      });

      const result = await getNeedDisclosureLevel('need-123', 'user-456');
      
      expect(result).toEqual({
        showFullBody: false,
        showContactInfo: false,
        showFullProfile: false,
        showCompanyInfo: false,
      });
    });
  });

  describe('maskContent', () => {
    it('should return content unchanged when showFull is true', () => {
      const content = 'Contact me at test@example.com or 090-1234-5678';
      const result = maskContent(content, true);
      
      expect(result).toBe(content);
    });

    it('should mask email addresses', () => {
      const content = 'Contact me at test@example.com for more info';
      const result = maskContent(content, false);
      
      expect(result).toBe('Contact me at [お支払い後に表示] for more info');
    });

    it('should mask phone numbers', () => {
      const content = 'Call me at 090-1234-5678 or 03-1234-5678';
      const result = maskContent(content, false);
      
      expect(result).toBe('Call me at [お支払い後に表示] or [お支払い後に表示]');
    });

    it('should mask URLs', () => {
      const content = 'Visit my website at https://example.com';
      const result = maskContent(content, false);
      
      expect(result).toBe('Visit my website at [お支払い後に表示]');
    });

    it('should mask multiple types of sensitive information', () => {
      const content = 'Email: test@example.com, Phone: 090-1234-5678, Site: https://example.com';
      const result = maskContent(content, false);
      
      expect(result).toBe('Email: [お支払い後に表示], Phone: [お支払い後に表示], Site: [お支払い後に表示]');
    });
  });

  describe('createMaskedNeed', () => {
    const sampleNeed = {
      id: 'need-123',
      title: 'Test Need',
      summary: 'A test need summary',
      body: 'Contact me at test@example.com or call 090-1234-5678',
      tags: ['test', 'sample'],
      area: 'Tokyo',
      contact_info: 'test@example.com',
      company_info: 'Test Company Inc.',
    };

    it('should mask sensitive fields when not disclosed', () => {
      const disclosureLevel = {
        showFullBody: false,
        showContactInfo: false,
        showFullProfile: false,
        showCompanyInfo: false,
      };

      const result = createMaskedNeed(sampleNeed, disclosureLevel);

      expect(result.title).toBe('Test Need'); // Always shown
      expect(result.summary).toBe('A test need summary'); // Always shown
      expect(result.tags).toEqual(['test', 'sample']); // Always shown
      expect(result.area).toBe('Tokyo'); // Always shown
      expect(result.body).toBe('Contact me at [お支払い後に表示] or call [お支払い後に表示]'); // Masked
      expect(result.contact_info).toBeNull(); // Hidden
      expect(result.company_info).toBeNull(); // Hidden
    });

    it('should show all fields when fully disclosed', () => {
      const disclosureLevel = {
        showFullBody: true,
        showContactInfo: true,
        showFullProfile: true,
        showCompanyInfo: true,
      };

      const result = createMaskedNeed(sampleNeed, disclosureLevel);

      expect(result.body).toBe('Contact me at test@example.com or call 090-1234-5678'); // Not masked
      expect(result.contact_info).toBe('test@example.com'); // Shown
      expect(result.company_info).toBe('Test Company Inc.'); // Shown
    });
  });
});
