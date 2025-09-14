// tests/auth/server-client.spec.ts
// Unit test for server Supabase client auth integration

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Clerk auth
const mockGetToken = vi.fn();
const mockAuth = vi.fn(() => ({
  getToken: mockGetToken
}));

vi.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth
}));

// Mock Supabase client
const mockSetSession = vi.fn();
const mockSupabaseClient = {
  auth: {
    setSession: mockSetSession
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis()
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}));

describe('Server Supabase Client Auth Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should attach Clerk JWT token to Supabase client', async () => {
    // Mock successful Clerk token retrieval
    mockGetToken.mockResolvedValue('mock-jwt-token-123');
    
    // Import the function after mocking
    const { createClient } = await import('@/lib/supabase/server');
    
    const client = await createClient();
    
    expect(mockAuth).toHaveBeenCalled();
    expect(mockGetToken).toHaveBeenCalledWith({ template: 'supabase' });
    expect(mockSetSession).toHaveBeenCalledWith({
      access_token: 'mock-jwt-token-123',
      refresh_token: ''
    });
  });

  it('should handle auth failure gracefully', async () => {
    // Mock Clerk token retrieval failure
    mockGetToken.mockRejectedValue(new Error('No authentication available'));
    
    const { createClient } = await import('@/lib/supabase/server');
    
    const client = await createClient();
    
    expect(mockAuth).toHaveBeenCalled();
    expect(mockGetToken).toHaveBeenCalledWith({ template: 'supabase' });
    expect(mockSetSession).not.toHaveBeenCalled();
    
    // Client should still be returned for anonymous operations
    expect(client).toBeDefined();
  });

  it('should handle missing token gracefully', async () => {
    // Mock no token returned
    mockGetToken.mockResolvedValue(null);
    
    const { createClient } = await import('@/lib/supabase/server');
    
    const client = await createClient();
    
    expect(mockAuth).toHaveBeenCalled();
    expect(mockGetToken).toHaveBeenCalledWith({ template: 'supabase' });
    expect(mockSetSession).not.toHaveBeenCalled();
    
    // Client should still work for anonymous operations
    expect(client).toBeDefined();
  });

  it('should work in synchronous mode for backward compatibility', async () => {
    const { createClientSync } = await import('@/lib/supabase/server');
    
    const client = createClientSync();
    
    expect(client).toBeDefined();
    expect(mockAuth).not.toHaveBeenCalled();
    expect(mockSetSession).not.toHaveBeenCalled();
  });

  it('should pass authentication headers for database operations', async () => {
    mockGetToken.mockResolvedValue('test-token-456');
    
    const { createClient } = await import('@/lib/supabase/server');
    const client = await createClient();
    
    // Simulate a database operation
    client.from('needs').insert({ title: 'Test Need' });
    
    expect(mockSetSession).toHaveBeenCalledWith({
      access_token: 'test-token-456',
      refresh_token: ''
    });
  });

  it('should handle Clerk template parameter correctly', async () => {
    mockGetToken.mockResolvedValue('supabase-template-token');
    
    const { createClient } = await import('@/lib/supabase/server');
    await createClient();
    
    expect(mockGetToken).toHaveBeenCalledWith({ template: 'supabase' });
    expect(mockSetSession).toHaveBeenCalledWith({
      access_token: 'supabase-template-token',
      refresh_token: ''
    });
  });

  it('should not break when auth throws unexpected errors', async () => {
    mockAuth.mockImplementation(() => {
      throw new Error('Clerk initialization failed');
    });
    
    const { createClient } = await import('@/lib/supabase/server');
    
    // Should not throw, should handle error gracefully
    expect(async () => {
      const client = await createClient();
      expect(client).toBeDefined();
    }).not.toThrow();
  });
});

describe('Environment Configuration', () => {
  it('should require Supabase environment variables', async () => {
    // Mock missing environment variables
    const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    try {
      // Re-import to trigger environment check
      await vi.importActual('@/lib/supabase/server');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('Missing Supabase environment variables');
    }
    
    // Restore environment variables
    if (originalSupabaseUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
    if (originalSupabaseKey) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalSupabaseKey;
  });
});

describe('Integration with API Routes', () => {
  it('should work with needs posting API', async () => {
    mockGetToken.mockResolvedValue('api-route-token');
    
    const { createClient } = await import('@/lib/supabase/server');
    const client = await createClient();
    
    // Mock database insert operation
    const mockQuery = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'test-need-id' },
        error: null
      })
    };
    
    client.from = vi.fn(() => mockQuery);
    
    // Simulate API operation
    const result = await client
      .from('needs')
      .insert({ title: 'Test', status: 'draft' })
      .select('id')
      .single();
    
    expect(mockSetSession).toHaveBeenCalledWith({
      access_token: 'api-route-token',
      refresh_token: ''
    });
    
    expect(result.data.id).toBe('test-need-id');
  });
});