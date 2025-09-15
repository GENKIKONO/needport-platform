#!/usr/bin/env node
/**
 * RLS Policy Snapshot Verification Script
 * 
 * This script verifies that the current RLS policies in the database
 * match the expected snapshot, preventing configuration drift.
 * 
 * Usage:
 *   npm run ci:verify-rls
 *   ts-node scripts/ci/verify-rls-snapshot.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface RLSPolicy {
  schemaname: string;
  tablename: string;
  policyname: string;
  permissive: string;
  roles: string[];
  cmd: string;
  qual: string | null;
  with_check: string | null;
}

interface RLSSnapshot {
  timestamp: string;
  git_sha: string;
  policies: RLSPolicy[];
  tables: string[];
}

// Environment validation
function validateEnvironment(): void {
  const requiredVars = ['DATABASE_URL'];
  const missing = requiredVars.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Create Supabase client
function createAdminClient() {
  const databaseUrl = process.env.DATABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required');
  }

  // Extract Supabase URL from DATABASE_URL
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl && databaseUrl) {
    const match = databaseUrl.match(/\/\/[^@]+@([^:]+)/);
    if (match) {
      const host = match[1];
      if (host.includes('.supabase.co')) {
        supabaseUrl = `https://${host.split('.')[0]}.supabase.co`;
      }
    }
  }

  if (!supabaseUrl) {
    throw new Error('Cannot determine Supabase URL from environment');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Get current RLS policies from the database
 */
async function getCurrentRLSPolicies(): Promise<RLSPolicy[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('pg_policies')
    .select(`
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    `)
    .eq('schemaname', 'public')
    .order('tablename')
    .order('policyname');

  if (error) {
    throw new Error(`Failed to fetch RLS policies: ${error.message}`);
  }

  return data || [];
}

/**
 * Get list of tables with RLS enabled
 */
async function getRLSEnabledTables(): Promise<string[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase.rpc('get_rls_enabled_tables');
  
  if (error) {
    // Fallback query if custom function doesn't exist
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('pg_class')
      .select('relname')
      .eq('relrowsecurity', true)
      .eq('relkind', 'r'); // regular tables only

    if (fallbackError) {
      throw new Error(`Failed to fetch RLS-enabled tables: ${fallbackError.message}`);
    }

    return (fallbackData || []).map(row => row.relname);
  }

  return data || [];
}

/**
 * Load expected RLS snapshot from file
 */
function loadExpectedSnapshot(): RLSSnapshot | null {
  const snapshotPath = join(process.cwd(), '.rls-snapshot.json');
  
  try {
    const content = readFileSync(snapshotPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('No existing RLS snapshot found, will create one');
    return null;
  }
}

/**
 * Save RLS snapshot to file
 */
function saveSnapshot(snapshot: RLSSnapshot): void {
  const snapshotPath = join(process.cwd(), '.rls-snapshot.json');
  writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
  console.log(`✅ RLS snapshot saved to ${snapshotPath}`);
}

/**
 * Compare two RLS snapshots and return differences
 */
function compareSnapshots(current: RLSSnapshot, expected: RLSSnapshot): string[] {
  const differences: string[] = [];

  // Compare tables with RLS enabled
  const currentTables = new Set(current.tables);
  const expectedTables = new Set(expected.tables);
  
  for (const table of expectedTables) {
    if (!currentTables.has(table)) {
      differences.push(`❌ Table '${table}' should have RLS enabled but doesn't`);
    }
  }
  
  for (const table of currentTables) {
    if (!expectedTables.has(table)) {
      differences.push(`⚠️ Table '${table}' has RLS enabled but wasn't expected`);
    }
  }

  // Compare policies
  const currentPolicies = new Map(
    current.policies.map(p => [`${p.tablename}.${p.policyname}`, p])
  );
  const expectedPolicies = new Map(
    expected.policies.map(p => [`${p.tablename}.${p.policyname}`, p])
  );

  // Check for missing policies
  for (const [key, policy] of expectedPolicies) {
    if (!currentPolicies.has(key)) {
      differences.push(`❌ Missing policy: ${policy.tablename}.${policy.policyname}`);
    }
  }

  // Check for unexpected policies
  for (const [key, policy] of currentPolicies) {
    if (!expectedPolicies.has(key)) {
      differences.push(`⚠️ Unexpected policy: ${policy.tablename}.${policy.policyname}`);
    }
  }

  // Check for policy differences
  for (const [key, currentPolicy] of currentPolicies) {
    const expectedPolicy = expectedPolicies.get(key);
    if (expectedPolicy) {
      const policyDiffs = comparePolicies(currentPolicy, expectedPolicy);
      differences.push(...policyDiffs.map(diff => `🔄 ${key}: ${diff}`));
    }
  }

  return differences;
}

/**
 * Compare two individual policies
 */
function comparePolicies(current: RLSPolicy, expected: RLSPolicy): string[] {
  const differences: string[] = [];

  if (current.cmd !== expected.cmd) {
    differences.push(`command changed from '${expected.cmd}' to '${current.cmd}'`);
  }

  if (current.permissive !== expected.permissive) {
    differences.push(`permissive changed from '${expected.permissive}' to '${current.permissive}'`);
  }

  if (JSON.stringify(current.roles) !== JSON.stringify(expected.roles)) {
    differences.push(`roles changed from [${expected.roles}] to [${current.roles}]`);
  }

  if (current.qual !== expected.qual) {
    differences.push(`qual expression changed`);
  }

  if (current.with_check !== expected.with_check) {
    differences.push(`with_check expression changed`);
  }

  return differences;
}

/**
 * Get current git SHA
 */
function getCurrentGitSha(): string {
  try {
    const { execSync } = require('child_process');
    return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Main verification function
 */
async function verifyRLSSnapshot(): Promise<void> {
  console.log('🔍 Verifying RLS policy snapshot...');

  try {
    // Get current state
    console.log('📊 Fetching current RLS policies...');
    const [currentPolicies, currentTables] = await Promise.all([
      getCurrentRLSPolicies(),
      getRLSEnabledTables()
    ]);

    const currentSnapshot: RLSSnapshot = {
      timestamp: new Date().toISOString(),
      git_sha: getCurrentGitSha(),
      policies: currentPolicies,
      tables: currentTables.sort()
    };

    console.log(`📋 Found ${currentPolicies.length} RLS policies across ${currentTables.length} tables`);

    // Load expected snapshot
    const expectedSnapshot = loadExpectedSnapshot();

    if (!expectedSnapshot) {
      console.log('📝 Creating initial RLS snapshot...');
      saveSnapshot(currentSnapshot);
      console.log('✅ Initial snapshot created successfully');
      return;
    }

    // Compare snapshots
    console.log('🔍 Comparing with expected snapshot...');
    const differences = compareSnapshots(currentSnapshot, expectedSnapshot);

    if (differences.length === 0) {
      console.log('✅ RLS policies match expected snapshot');
      console.log(`📊 Verified ${currentPolicies.length} policies across ${currentTables.length} tables`);
      return;
    }

    // Report differences
    console.error('❌ RLS policy drift detected:');
    console.error('');
    differences.forEach(diff => console.error(`  ${diff}`));
    console.error('');
    console.error('To update the snapshot with current policies, run:');
    console.error('  npm run ci:update-rls-snapshot');
    console.error('');
    
    process.exit(1);

  } catch (error) {
    console.error('💥 RLS verification failed:', error);
    process.exit(1);
  }
}

/**
 * Update RLS snapshot with current state
 */
async function updateRLSSnapshot(): Promise<void> {
  console.log('🔄 Updating RLS snapshot...');

  try {
    const [currentPolicies, currentTables] = await Promise.all([
      getCurrentRLSPolicies(),
      getRLSEnabledTables()
    ]);

    const snapshot: RLSSnapshot = {
      timestamp: new Date().toISOString(),
      git_sha: getCurrentGitSha(),
      policies: currentPolicies,
      tables: currentTables.sort()
    };

    saveSnapshot(snapshot);
    console.log(`✅ Snapshot updated with ${currentPolicies.length} policies across ${currentTables.length} tables`);

  } catch (error) {
    console.error('💥 Failed to update RLS snapshot:', error);
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  validateEnvironment();

  const command = process.argv[2];

  switch (command) {
    case 'update':
      await updateRLSSnapshot();
      break;
    case 'verify':
    default:
      await verifyRLSSnapshot();
      break;
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { verifyRLSSnapshot, updateRLSSnapshot, getCurrentRLSPolicies };