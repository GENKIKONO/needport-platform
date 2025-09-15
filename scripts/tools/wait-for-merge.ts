#!/usr/bin/env tsx

import { execSync } from 'child_process';

const POLL_INTERVAL = 60000; // 60 seconds
const MAX_WAIT_TIME = 10 * 60 * 1000; // 10 minutes

function log(message: string): void {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function execCommand(command: string): string {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    log(`Command failed: ${command}`);
    throw error;
  }
}

async function waitForMerge(): Promise<boolean> {
  const startTime = Date.now();
  log('🔄 Starting merge detection...');
  
  while (Date.now() - startTime < MAX_WAIT_TIME) {
    try {
      // Fetch latest changes
      execCommand('git fetch origin main');
      
      // Check if there are new commits in main that we don't have
      const behindCommits = execCommand('git rev-list HEAD..origin/main');
      
      if (behindCommits.trim()) {
        log('✅ Merge detected! New commits found in origin/main');
        
        // Switch to main and pull
        execCommand('git checkout main');
        execCommand('git pull origin main');
        
        log('✅ Successfully switched to main and pulled latest changes');
        return true;
      }
      
      log(`⏳ No merge yet, waiting ${POLL_INTERVAL/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      
    } catch (error) {
      log(`❌ Error during merge detection: ${error instanceof Error ? error.message : 'Unknown error'}`);
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
  }
  
  log('⏰ Timeout: No merge detected within 10 minutes');
  return false;
}

async function main(): Promise<void> {
  const merged = await waitForMerge();
  
  if (!merged) {
    log('❌ Manual intervention required: Please check PR status manually');
    process.exit(1);
  }
  
  log('🎉 Ready for deployment!');
  process.exit(0);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}