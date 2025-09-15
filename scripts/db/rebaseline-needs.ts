#!/usr/bin/env ts-node
import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';

// まとめ実行（再基準化 → スモーク）
// 使い方: ts-node --transpile-only scripts/db/rebaseline-needs.ts --user <UUID>

const execAsync = promisify(exec);

interface Args {
  userUuid: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  
  const userIndex = args.indexOf('--user');
  if (userIndex === -1 || userIndex + 1 >= args.length) {
    console.error('Usage: ts-node --transpile-only scripts/db/rebaseline-needs.ts --user <UUID>');
    process.exit(1);
  }

  const userUuid = args[userIndex + 1];
  
  if (!userUuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    console.error('Error: Invalid UUID format for --user parameter');
    process.exit(1);
  }

  return { userUuid };
}

async function runSqlScript(scriptPath: string, variables: Record<string, string> = {}): Promise<void> {
  console.log(`\n🔄 Running: ${scriptPath}`);
  
  const varArgs = Object.entries(variables)
    .map(([key, value]) => `--var ${key}=${value}`)
    .join(' ');
  
  const command = `ts-node --transpile-only scripts/db/run-sql.ts ${scriptPath} ${varArgs}`;
  
  try {
    const { stdout, stderr } = await execAsync(command);
    
    if (stdout) {
      console.log(stdout);
    }
    
    if (stderr) {
      console.error('Warning:', stderr);
    }
  } catch (error: any) {
    console.error(`❌ Failed to execute ${scriptPath}:`);
    console.error(error.message);
    throw error;
  }
}

async function logExecutionReport(userUuid: string, startTime: Date): Promise<void> {
  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();
  
  const report = `
=== EXECUTION REPORT ===
Date: ${new Date().toISOString()}
Duration: ${duration}ms
User UUID: ${userUuid}
Operation: Rebaseline needs minimal posting flow

Files Changed:
- supabase/sql/rebaseline_needs_minimal.sql (applied)
- supabase/sql/smoke_insert_need.template.sql (executed with USER_UUID=${userUuid})

Schema Changes Applied:
- Added columns: status (default 'draft'), published (default false), owner_id (references profiles)
- Created trigger: set_owner_id_trigger with set_owner_id() function
- Applied RLS policy: needs_insert_policy (authenticated users can insert)
- PostgREST schema cache reloaded

Status: SUCCESS ✅
`;

  console.log(report);
  
  // Append to report file
  const fs = await import('fs');
  const reportPath = resolve(process.cwd(), 'EXECUTION_REPORT.txt');
  fs.appendFileSync(reportPath, report + '\n');
  console.log(`📝 Report appended to: ${reportPath}`);
}

async function main() {
  const startTime = new Date();
  
  try {
    console.log('🚀 Starting needs rebaseline process...\n');
    
    const { userUuid } = parseArgs();
    
    console.log(`👤 User UUID: ${userUuid}`);
    
    // Step 1: Apply schema migration
    console.log('\n📋 Step 1: Applying schema migration');
    await runSqlScript('supabase/sql/rebaseline_needs_minimal.sql');
    
    // Step 2: Run smoke test
    console.log('\n🧪 Step 2: Running smoke test insertion');
    await runSqlScript('supabase/sql/smoke_insert_need.template.sql', {
      USER_UUID: userUuid
    });
    
    // Step 3: Log execution report
    console.log('\n📊 Step 3: Generating execution report');
    await logExecutionReport(userUuid, startTime);
    
    console.log('\n🎉 Rebaseline process completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Rebaseline process failed:');
    console.error(error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}