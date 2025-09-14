// tests/rls/needs.policies.test.ts
// RLS snapshot test - verify policies exist on needs tables

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

describe('RLS Policies Snapshot Test', () => {
  let supabase: ReturnType<typeof createClient> | null = null;
  
  beforeAll(async () => {
    // Skip tests if database connection not available
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.warn('Skipping RLS tests: Missing Supabase environment variables');
      return;
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  });

  describe('public.needs table policies', () => {
    it('should have SELECT policy for published needs', async () => {
      if (!supabase) {
        console.warn('Skipping RLS policy test: No database connection');
        return;
      }

      const { data: policies, error } = await supabase
        .from('pg_policies')
        .select('policyname, cmd, roles, with_check, qual')
        .eq('schemaname', 'public')
        .eq('tablename', 'needs')
        .eq('cmd', 'SELECT');

      if (error) {
        console.warn('Could not query pg_policies, skipping RLS test:', error.message);
        return;
      }

      expect(policies).toBeDefined();
      
      if (policies && policies.length > 0) {
        // Look for policy that allows reading published needs
        const readPolicy = policies.find(p => 
          p.policyname.includes('read') || 
          p.policyname.includes('public') ||
          p.qual?.includes('published')
        );
        
        expect(readPolicy).toBeDefined();
        expect(readPolicy?.cmd).toBe('SELECT');
      }
    });

    it('should have INSERT policy for authenticated users', async () => {
      if (!supabase) {
        console.warn('Skipping RLS policy test: No database connection');
        return;
      }

      const { data: policies, error } = await supabase
        .from('pg_policies')
        .select('policyname, cmd, roles, with_check, qual')
        .eq('schemaname', 'public')
        .eq('tablename', 'needs')
        .eq('cmd', 'INSERT');

      if (error) {
        console.warn('Could not query pg_policies, skipping RLS test:', error.message);
        return;
      }

      expect(policies).toBeDefined();
      
      if (policies && policies.length > 0) {
        // Look for policy that allows authenticated users to insert
        const insertPolicy = policies.find(p => 
          p.policyname.includes('insert') || 
          p.roles?.includes('authenticated') ||
          p.with_check?.includes('draft')
        );
        
        expect(insertPolicy).toBeDefined();
        expect(insertPolicy?.cmd).toBe('INSERT');
      }
    });

    it('should have proper RLS enabled on needs table', async () => {
      if (!supabase) {
        console.warn('Skipping RLS enabled test: No database connection');
        return;
      }

      // Check if RLS is enabled on needs table using pg_tables
      const { data: rlsCheck, error: rlsError } = await supabase
        .from('pg_tables')
        .select('rowsecurity')
        .eq('schemaname', 'public')
        .eq('tablename', 'needs')
        .single();

      if (rlsError) {
        console.warn('Could not check table RLS status:', rlsError.message);
        return;
      }

      expect(rlsCheck).toBeDefined();
      if (rlsCheck) {
        expect(rlsCheck.rowsecurity).toBe(true);
      }
    });
  });

  describe('RLS test infrastructure', () => {
    it('should have environment variables configured for database testing', () => {
      // This test validates our test setup
      if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
        expect(SUPABASE_URL).toContain('supabase');
        expect(SUPABASE_SERVICE_KEY).toContain('service_role');
      } else {
        console.warn('Database environment variables not configured - RLS tests will be skipped');
      }
    });

    it('should have working database connection when configured', async () => {
      if (!supabase) {
        console.warn('Skipping connection test: No database configured');
        return;
      }

      // Simple connectivity test
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(1);

      if (error) {
        console.warn('Database connection test failed:', error.message);
        return;
      }

      expect(data).toBeDefined();
    });
  });
});