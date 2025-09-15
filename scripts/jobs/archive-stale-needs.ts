#!/usr/bin/env node
/**
 * Auto-Archive Stale Needs Job
 * 
 * Archives needs that have been published for more than 60 days.
 * This script is designed to run via GitHub Actions CRON or manual execution.
 * 
 * Usage:
 *   npm run jobs:archive-stale-needs
 *   node scripts/jobs/archive-stale-needs.ts
 *   ts-node scripts/jobs/archive-stale-needs.ts
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/database';

// Environment validation
const requiredEnvVars = ['DATABASE_URL'] as const;

function validateEnvironment(): void {
  const missing = requiredEnvVars.filter(env => !process.env[env]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Create Supabase client with service role key for admin operations
function createAdminClient() {
  const databaseUrl = process.env.DATABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required');
  }

  // Extract project URL from DATABASE_URL if needed
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl && databaseUrl) {
    // Extract from postgres://postgres:[password]@[project-id].supabase.co:5432/postgres
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

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

interface ArchiveResult {
  archivedCount: number;
  archivedNeeds: Array<{
    id: string;
    title: string;
    owner_id: string;
    published_at: string;
  }>;
  errors: Array<{
    id: string;
    title: string;
    error: string;
  }>;
}

/**
 * Archive needs that are older than the specified number of days
 */
async function archiveStaleNeeds(daysThreshold: number = 60): Promise<ArchiveResult> {
  console.log(`🔍 Starting archive job for needs older than ${daysThreshold} days...`);
  
  const supabase = createAdminClient();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);
  
  console.log(`📅 Cutoff date: ${cutoffDate.toISOString()}`);

  // Find stale needs that should be archived
  const { data: staleNeeds, error: findError } = await supabase
    .from('needs')
    .select('id, title, owner_id, published_at, status')
    .eq('status', 'published')
    .is('archived_at', null)
    .lte('published_at', cutoffDate.toISOString())
    .order('published_at', { ascending: true });

  if (findError) {
    throw new Error(`Failed to find stale needs: ${findError.message}`);
  }

  if (!staleNeeds || staleNeeds.length === 0) {
    console.log('✅ No stale needs found to archive.');
    return {
      archivedCount: 0,
      archivedNeeds: [],
      errors: []
    };
  }

  console.log(`📋 Found ${staleNeeds.length} stale needs to archive:`, 
    staleNeeds.map(n => `- ${n.title} (${n.published_at})`).join('\n')
  );

  const result: ArchiveResult = {
    archivedCount: 0,
    archivedNeeds: [],
    errors: []
  };

  // Archive each need individually for better error handling
  for (const need of staleNeeds) {
    try {
      console.log(`📦 Archiving need: ${need.title} (ID: ${need.id})`);
      
      // Update the need status and set archived_at
      const { error: updateError } = await supabase
        .from('needs')
        .update({
          status: 'archived',
          archived_at: new Date().toISOString()
        })
        .eq('id', need.id);

      if (updateError) {
        throw new Error(`Update failed: ${updateError.message}`);
      }

      // Log the archive action for audit purposes
      const { error: logError } = await supabase
        .from('audit_logs')
        .insert({
          user_id: null, // System operation
          action: 'ARCHIVE_NEED',
          resource_type: 'needs',
          resource_id: need.id,
          old_values: { status: 'published' },
          new_values: { 
            status: 'archived', 
            archived_at: new Date().toISOString(),
            reason: 'Auto-archived after 60 days'
          },
          session_id: 'archive-job'
        });

      if (logError) {
        console.warn(`⚠️ Failed to log archive action for ${need.id}: ${logError.message}`);
      }

      result.archivedCount++;
      result.archivedNeeds.push({
        id: need.id,
        title: need.title,
        owner_id: need.owner_id,
        published_at: need.published_at!
      });

      console.log(`✅ Successfully archived: ${need.title}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to archive need ${need.id} (${need.title}): ${errorMessage}`);
      
      result.errors.push({
        id: need.id,
        title: need.title,
        error: errorMessage
      });
    }
  }

  // Refresh materialized view for reaction counts (if exists)
  try {
    await supabase.rpc('refresh_reactions_summary');
    console.log('🔄 Refreshed reaction summary view');
  } catch (error) {
    console.warn('⚠️ Failed to refresh reaction summary view:', error);
  }

  return result;
}

/**
 * Send notification about archive results (placeholder for future implementation)
 */
async function notifyArchiveResults(result: ArchiveResult): Promise<void> {
  if (result.archivedCount === 0 && result.errors.length === 0) {
    return; // No notification needed for no-op
  }

  const message = [
    `📦 Auto-Archive Job Results:`,
    `✅ Successfully archived: ${result.archivedCount} needs`,
    result.errors.length > 0 ? `❌ Failed to archive: ${result.errors.length} needs` : '',
    '',
    'Archived needs:',
    ...result.archivedNeeds.map(n => `- ${n.title} (published: ${n.published_at})`),
    result.errors.length > 0 ? '\nErrors:' : '',
    ...result.errors.map(e => `- ${e.title}: ${e.error}`)
  ].filter(Boolean).join('\n');

  console.log(message);

  // TODO: Send notification to Slack/email if configured
  // if (process.env.SLACK_WEBHOOK_URL) {
  //   await sendSlackNotification(message);
  // }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 Starting auto-archive job...');
    
    // Validate environment
    validateEnvironment();
    
    // Get days threshold from environment or use default
    const daysThreshold = parseInt(process.env.ARCHIVE_DAYS_THRESHOLD || '60', 10);
    
    if (isNaN(daysThreshold) || daysThreshold < 1) {
      throw new Error('ARCHIVE_DAYS_THRESHOLD must be a positive number');
    }

    // Run the archive job
    const result = await archiveStaleNeeds(daysThreshold);
    
    // Send notifications
    await notifyArchiveResults(result);
    
    // Output final summary
    console.log('📊 Archive Job Summary:');
    console.log(`   - Threshold: ${daysThreshold} days`);
    console.log(`   - Archived: ${result.archivedCount} needs`);
    console.log(`   - Errors: ${result.errors.length} needs`);
    
    if (result.errors.length > 0) {
      console.error('❌ Job completed with errors');
      process.exit(1);
    } else {
      console.log('✅ Job completed successfully');
      process.exit(0);
    }

  } catch (error) {
    console.error('💥 Archive job failed:', error);
    process.exit(1);
  }
}

// Run the job if this script is executed directly
if (require.main === module) {
  main();
}

export { archiveStaleNeeds, notifyArchiveResults };