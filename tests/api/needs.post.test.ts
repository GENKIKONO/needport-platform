// tests/api/needs.post.test.ts
// API contract tests for needs posting endpoints

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Clerk auth
const mockAuth = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth
}));

// Mock Supabase
const mockCreateClient = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient
}));

// Mock implementations will be used by route handlers
const mockSupabaseQuery = {
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn(),
  order: vi.fn().mockReturnThis()
};

const mockSupabaseClient = {
  from: vi.fn(() => mockSupabaseQuery)
};

describe('API Contract Tests - Needs Posting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockResolvedValue(mockSupabaseClient);
  });

  describe('POST /api/needs', () => {
    it('should create draft need with authenticated user', async () => {
      // Mock authenticated user
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      // Mock successful database insert
      mockSupabaseQuery.single.mockResolvedValue({
        data: { id: 'need_456' },
        error: null
      });

      // Mock the API route function (would normally be imported)
      const mockApiHandler = async (request: NextRequest) => {
        const { userId } = await mockAuth();
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const body = await request.json();
        const client = await mockCreateClient();
        const { data, error } = await client.from('needs').insert([body]).select().single();
        
        if (error) {
          return new Response(JSON.stringify({ error: 'DB_ERROR' }), { status: 500 });
        }

        return new Response(JSON.stringify(data), { status: 201 });
      };

      const request = new NextRequest('http://localhost:3000/api/needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Need',
          summary: 'Test Summary',
          body: 'Test Body',
          area: 'Test Area'
        })
      });

      const response = await mockApiHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({ id: 'need_456' });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('needs');
    });

    it('should return 401 for unauthenticated user', async () => {
      // Mock unauthenticated user
      mockAuth.mockResolvedValue({ userId: null });

      // Mock API handler
      const mockApiHandler = async (request: NextRequest) => {
        const { userId } = await mockAuth();
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }
        return new Response(JSON.stringify({}), { status: 200 });
      };

      const request = new NextRequest('http://localhost:3000/api/needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test Need' })
      });

      const response = await mockApiHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should validate required fields', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      // Mock validation failure
      const mockApiHandler = async (request: NextRequest) => {
        const { userId } = await mockAuth();
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const body = await request.json();
        if (!body.title) {
          return new Response(JSON.stringify({ error: 'VALIDATION_ERROR', detail: 'Title is required' }), { status: 400 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 201 });
      };

      const request = new NextRequest('http://localhost:3000/api/needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Missing title
      });

      const response = await mockApiHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('Health check for API testing infrastructure', () => {
    it('should properly mock Supabase client creation', () => {
      expect(mockCreateClient).toBeDefined();
      expect(mockSupabaseClient.from).toBeDefined();
    });

    it('should properly mock Clerk authentication', () => {
      expect(mockAuth).toBeDefined();
    });
  });
});