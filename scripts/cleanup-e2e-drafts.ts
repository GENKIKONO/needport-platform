#!/usr/bin/env npx tsx

/**
 * E2E Draft Cleanup Job
 * 
 * Safely removes old E2E test drafts from the production database.
 * Only removes drafts that:
 * - Have title starting with "[E2E]"
 * - Are older than 30 days
 * - Have status = 'draft'
 * - Have published = false
 * - Have no engagements/offers
 */

import { createClient } from '@supabase/supabase-js';

interface CleanupConfig {
  dryRun?: boolean;
  ageThresholdDays?: number;
  batchSize?: number;
}

class E2EDraftCleaner {
  private supabase: any;
  private config: Required<CleanupConfig>;
  
  constructor(config: CleanupConfig = {}) {
    this.config = {
      dryRun: config.dryRun ?? process.argv.includes('--dry-run'),
      ageThresholdDays: config.ageThresholdDays ?? 30,
      batchSize: config.batchSize ?? 50
    };
    
    // Initialize Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  
  private log(level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', message: string, details?: any) {
    const emoji = {
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
      SUCCESS: '✅'
    }[level];
    
    console.log(`${emoji} [${level}] ${message}`);
    if (details) {
      console.log(`    ${JSON.stringify(details, null, 2)}`);
    }
  }
  
  async findCandidateDrafts() {
    this.log('INFO', 'Searching for E2E draft candidates...');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.ageThresholdDays);
    
    const { data: drafts, error } = await this.supabase
      .from('needs')
      .select(`
        id,
        title,
        created_at,
        status,
        published,
        owner_id
      `)
      .ilike('title', '[E2E]%')
      .eq('status', 'draft')
      .eq('published', false)
      .lt('created_at', cutoffDate.toISOString())
      .limit(this.config.batchSize);
    
    if (error) {
      this.log('ERROR', 'Failed to query candidate drafts', { error });
      throw error;
    }
    
    this.log('INFO', `Found ${drafts?.length || 0} candidate E2E drafts`);
    return drafts || [];
  }
  
  async checkForEngagements(needIds: string[]) {
    if (needIds.length === 0) return {};
    
    this.log('INFO', 'Checking for existing engagements...');
    
    // Check for any related data that would prevent deletion
    const checks = await Promise.all([
      // Check offers/entries
      this.supabase
        .from('offers')
        .select('need_id')
        .in('need_id', needIds),
      
      // Check engagements (if table exists)
      this.supabase
        .from('need_engagements')
        .select('need_id')
        .in('need_id', needIds)
        .then((result: any) => result)
        .catch(() => ({ data: [], error: null })), // Table may not exist
      
      // Check anonymous interest (if table exists)
      this.supabase
        .from('need_anonymous_interest')
        .select('need_id')
        .in('need_id', needIds)
        .then((result: any) => result)
        .catch(() => ({ data: [], error: null })) // Table may not exist
    ]);
    
    const [offersResult, engagementsResult, anonymousResult] = checks;
    
    if (offersResult.error) {
      this.log('ERROR', 'Failed to check offers', { error: offersResult.error });
      throw offersResult.error;
    }
    
    const blockedIds = new Set([
      ...(offersResult.data || []).map((r: any) => r.need_id),
      ...(engagementsResult.data || []).map((r: any) => r.need_id),
      ...(anonymousResult.data || []).map((r: any) => r.need_id)
    ]);
    
    this.log('INFO', `Found ${blockedIds.size} needs with existing engagements (will skip)`);
    
    return Object.fromEntries(
      needIds.map(id => [id, blockedIds.has(id)])
    );
  }
  
  async performCleanup(safeDrafts: any[]) {
    if (safeDrafts.length === 0) {
      this.log('INFO', 'No drafts to clean up');
      return { deleted: 0, skipped: 0 };
    }
    
    this.log('INFO', `Preparing to clean up ${safeDrafts.length} E2E drafts`);
    
    if (this.config.dryRun) {
      this.log('WARN', 'DRY RUN MODE: No actual deletions will be performed');
      safeDrafts.forEach(draft => {
        this.log('INFO', `[DRY RUN] Would delete: ${draft.title} (${draft.id})`);
      });
      return { deleted: 0, skipped: safeDrafts.length };
    }
    
    let deleted = 0;
    let skipped = 0;
    
    for (const draft of safeDrafts) {
      try {
        const { error } = await this.supabase
          .from('needs')
          .delete()
          .eq('id', draft.id)
          .eq('status', 'draft') // Extra safety check
          .eq('published', false); // Extra safety check
        
        if (error) {
          this.log('ERROR', `Failed to delete draft ${draft.id}`, { error });
          skipped++;
        } else {
          this.log('SUCCESS', `Deleted draft: ${draft.title} (${draft.id})`);
          deleted++;
        }
      } catch (error) {
        this.log('ERROR', `Exception deleting draft ${draft.id}`, { error });
        skipped++;
      }
    }
    
    return { deleted, skipped };
  }
  
  async run() {
    console.log('🧹 Starting E2E Draft Cleanup Job...\n');
    console.log(`Configuration:`);
    console.log(`  - Dry Run: ${this.config.dryRun}`);
    console.log(`  - Age Threshold: ${this.config.ageThresholdDays} days`);
    console.log(`  - Batch Size: ${this.config.batchSize}`);
    console.log(`  - Timestamp: ${new Date().toISOString()}\n`);
    
    try {
      // Step 1: Find candidate drafts
      const candidates = await this.findCandidateDrafts();
      
      if (candidates.length === 0) {
        this.log('SUCCESS', 'No E2E drafts found for cleanup');
        return;
      }
      
      // Step 2: Check for engagements
      const needIds = candidates.map(d => d.id);
      const engagementMap = await this.checkForEngagements(needIds);
      
      // Step 3: Filter safe drafts (no engagements)
      const safeDrafts = candidates.filter(draft => !engagementMap[draft.id]);
      const blockedDrafts = candidates.filter(draft => engagementMap[draft.id]);
      
      if (blockedDrafts.length > 0) {
        this.log('WARN', `Skipping ${blockedDrafts.length} drafts with existing engagements`);
        blockedDrafts.forEach(draft => {
          this.log('WARN', `  Skipped: ${draft.title} (${draft.id}) - has engagements`);
        });
      }
      
      // Step 4: Perform cleanup
      const result = await this.performCleanup(safeDrafts);
      
      // Step 5: Summary
      console.log('\n' + '='.repeat(60));
      console.log('📊 CLEANUP SUMMARY');
      console.log('='.repeat(60));
      console.log(`Total Candidates: ${candidates.length}`);
      console.log(`Deleted: ${result.deleted}`);
      console.log(`Skipped (with engagements): ${blockedDrafts.length}`);
      console.log(`Skipped (errors): ${result.skipped}`);
      console.log(`Mode: ${this.config.dryRun ? 'DRY RUN' : 'LIVE'}`);
      
      if (result.deleted > 0 && !this.config.dryRun) {
        this.log('SUCCESS', `Successfully cleaned up ${result.deleted} E2E drafts`);
      }
      
    } catch (error) {
      this.log('ERROR', 'Cleanup job failed', { error });
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const cleaner = new E2EDraftCleaner();
  cleaner.run().catch(error => {
    console.error('💥 Cleanup job failed:', error);
    process.exit(1);
  });
}

export default E2EDraftCleaner;