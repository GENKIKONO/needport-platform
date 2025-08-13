import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the consent module
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => Promise.resolve({ error: null })),
  })),
};

vi.mock('@/lib/server/supabase', () => ({
  supabaseServer: () => mockSupabase,
}));

// Mock crypto module
const mockHash = {
  update: vi.fn().mockReturnThis(),
  digest: vi.fn().mockReturnValue('mocked-hash'),
};

vi.mock('crypto', () => ({
  createHash: vi.fn(() => mockHash),
}));

// Import after mocking
import { logConsent } from '../consent';

describe('Consent logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CONSENT_SALT = 'test-salt';
  });

  it('should create deterministic IP hash for same IP and day', () => {
    const mockReq = {
      headers: {
        get: vi.fn((key: string) => {
          if (key === 'x-forwarded-for') return '192.168.1.1';
          if (key === 'user-agent') return 'test-user-agent';
          return null;
        }),
      },
      ip: '192.168.1.1',
    } as unknown as NextRequest;

    // Mock the date to ensure consistent testing
    const mockDate = new Date('2024-01-15T10:00:00Z');
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    logConsent({
      subject: 'test.create',
      refId: 'test-id',
      req: mockReq,
    });

    // Verify that the hash was created with the expected input
    expect(mockHash.update).toHaveBeenCalledWith('192.168.1.1:2024-01-15:test-salt');
    expect(mockHash.digest).toHaveBeenCalledWith('hex');
  });

  it('should handle different IP addresses', () => {
    const mockReq1 = {
      headers: {
        get: vi.fn((key: string) => {
          if (key === 'x-forwarded-for') return '192.168.1.1';
          if (key === 'user-agent') return 'test-user-agent';
          return null;
        }),
      },
      ip: '192.168.1.1',
    } as unknown as NextRequest;

    const mockReq2 = {
      headers: {
        get: vi.fn((key: string) => {
          if (key === 'x-forwarded-for') return '192.168.1.2';
          if (key === 'user-agent') return 'test-user-agent';
          return null;
        }),
      },
      ip: '192.168.1.2',
    } as unknown as NextRequest;

    const mockDate = new Date('2024-01-15T10:00:00Z');
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    logConsent({
      subject: 'test.create',
      refId: 'test-id-1',
      req: mockReq1,
    });

    logConsent({
      subject: 'test.create',
      refId: 'test-id-2',
      req: mockReq2,
    });

    // Should be called with different IPs
    expect(mockHash.update).toHaveBeenCalledWith('192.168.1.1:2024-01-15:test-salt');
    expect(mockHash.update).toHaveBeenCalledWith('192.168.1.2:2024-01-15:test-salt');
  });

  it('should handle missing IP gracefully', () => {
    const mockReq = {
      headers: {
        get: vi.fn(() => null),
      },
      ip: null,
    } as unknown as NextRequest;

    const mockDate = new Date('2024-01-15T10:00:00Z');
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    logConsent({
      subject: 'test.create',
      refId: 'test-id',
      req: mockReq,
    });

    // Should use 'unknown' as fallback
    expect(mockHash.update).toHaveBeenCalledWith('unknown:2024-01-15:test-salt');
  });

  it('should handle x-real-ip header', () => {
    const mockReq = {
      headers: {
        get: vi.fn((key: string) => {
          if (key === 'x-real-ip') return '10.0.0.1';
          if (key === 'user-agent') return 'test-user-agent';
          return null;
        }),
      },
      ip: '192.168.1.1',
    } as unknown as NextRequest;

    const mockDate = new Date('2024-01-15T10:00:00Z');
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    logConsent({
      subject: 'test.create',
      refId: 'test-id',
      req: mockReq,
    });

    // Should use x-real-ip over req.ip
    expect(mockHash.update).toHaveBeenCalledWith('10.0.0.1:2024-01-15:test-salt');
  });

  it('should handle x-forwarded-for with multiple IPs', () => {
    const mockReq = {
      headers: {
        get: vi.fn((key: string) => {
          if (key === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1, 172.16.0.1';
          if (key === 'user-agent') return 'test-user-agent';
          return null;
        }),
      },
      ip: '192.168.1.1',
    } as unknown as NextRequest;

    const mockDate = new Date('2024-01-15T10:00:00Z');
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    logConsent({
      subject: 'test.create',
      refId: 'test-id',
      req: mockReq,
    });

    // Should use the first IP from x-forwarded-for
    expect(mockHash.update).toHaveBeenCalledWith('192.168.1.1:2024-01-15:test-salt');
  });

  it('should use default salt when CONSENT_SALT is not set', () => {
    delete process.env.CONSENT_SALT;

    const mockReq = {
      headers: {
        get: vi.fn((key: string) => {
          if (key === 'x-forwarded-for') return '192.168.1.1';
          if (key === 'user-agent') return 'test-user-agent';
          return null;
        }),
      },
      ip: '192.168.1.1',
    } as unknown as NextRequest;

    const mockDate = new Date('2024-01-15T10:00:00Z');
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    logConsent({
      subject: 'test.create',
      refId: 'test-id',
      req: mockReq,
    });

    // Should use default salt
    expect(mockHash.update).toHaveBeenCalledWith('192.168.1.1:2024-01-15:default-salt');
  });
});
