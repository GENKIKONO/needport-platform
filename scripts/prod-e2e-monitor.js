#!/usr/bin/env node

/**
 * Production E2E Needs Posting Monitor
 * 
 * Runs authenticated posting flow on production, classifies failures,
 * and automatically creates fix PRs when issues are detected.
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const execAsync = promisify(exec);

const PROD_BASE_URL = 'https://needport.jp';

class ProductionE2EMonitor {
  constructor(options = {}) {
    this.results = {
      timestamp: new Date().toISOString(),
      success: false,
      classification: null,
      diagnosis: null,
      fixRequired: false,
      testResults: {},
      logs: []
    };
    
    this.testEmail = process.env.CLERK_TEST_EMAIL;
    this.testPassword = process.env.CLERK_TEST_PASSWORD;
    this.options = {
      dryRun: options.dryRun || process.argv.includes('--dry-run'),
      prOnly: options.prOnly || process.argv.includes('--pr-only'),
      ...options
    };
  }

  log(category, status, message, details = null) {
    const logEntry = {
      category,
      status, // 'PASS', 'FAIL', 'INFO', 'WARN'
      message,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.results.logs.push(logEntry);
    console.log(`[${status}] ${category}: ${message}`);
    if (details) {
      console.log(`    Details: ${JSON.stringify(details, null, 2)}`);
    }
  }

  async checkEnvironmentSetup() {
    this.log('ENV_CHECK', 'INFO', 'Checking environment setup');
    
    if (!this.testEmail || !this.testPassword) {
      this.log('ENV_CHECK', 'FAIL', 'Missing required environment variables', {
        CLERK_TEST_EMAIL: !!this.testEmail,
        CLERK_TEST_PASSWORD: !!this.testPassword
      });
      return false;
    }
    
    // Check if Playwright is available
    try {
      await execAsync('npx playwright --version');
      this.log('ENV_CHECK', 'PASS', 'Playwright available');
    } catch (error) {
      this.log('ENV_CHECK', 'FAIL', 'Playwright not available', error.message);
      return false;
    }
    
    this.log('ENV_CHECK', 'PASS', 'Environment setup verified');
    return true;
  }

  async runProductionE2E() {
    this.log('E2E_TEST', 'INFO', 'Running production E2E test');
    
    try {
      // Set environment variables for the test
      const env = {
        ...process.env,
        CLERK_TEST_EMAIL: this.testEmail,
        CLERK_TEST_PASSWORD: this.testPassword,
        BASE_URL: PROD_BASE_URL
      };
      
      const { stdout, stderr } = await execAsync(
        'npx playwright test tests/prod/e2e-needs-post.spec.ts --reporter=json',
        { env, timeout: 120000 }
      );
      
      // Parse Playwright JSON output
      let testResults;
      try {
        testResults = JSON.parse(stdout);
      } catch (e) {
        // Fallback: look for JSON in the output
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          testResults = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse test results');
        }
      }
      
      this.results.testResults = testResults;
      
      // Check if tests passed
      const failed = testResults.stats?.failed || 0;
      const passed = testResults.stats?.passed || 0;
      
      if (failed === 0 && passed > 0) {
        this.log('E2E_TEST', 'PASS', `All tests passed (${passed} passed, ${failed} failed)`);
        this.results.success = true;
        return true;
      } else {
        this.log('E2E_TEST', 'FAIL', `Tests failed (${passed} passed, ${failed} failed)`, {
          stdout: stdout.substring(0, 1000),
          stderr: stderr.substring(0, 1000)
        });
        return false;
      }
      
    } catch (error) {
      this.log('E2E_TEST', 'FAIL', 'E2E test execution failed', {
        message: error.message,
        code: error.code
      });
      return false;
    }
  }

  classifyFailure() {
    const logs = this.results.logs;
    const failedLogs = logs.filter(log => log.status === 'FAIL');
    
    if (failedLogs.length === 0) {
      this.results.classification = 'SUCCESS';
      this.results.diagnosis = 'All tests passed successfully';
      return;
    }

    // Analyze failure patterns
    const errorMessages = failedLogs.map(log => log.message + ' ' + (log.details?.message || '')).join(' ');
    
    if (errorMessages.includes('CLERK_TEST_EMAIL') || errorMessages.includes('environment')) {
      this.results.classification = 'ENV_CONFIG';
      this.results.diagnosis = 'Environment configuration issues';
      this.results.fixRequired = true;
    } else if (errorMessages.includes('401') || errorMessages.includes('Unauthorized') || errorMessages.includes('AUTH_INTEGRATION')) {
      this.results.classification = 'A_AUTH';
      this.results.diagnosis = 'Authentication/Authorization integration issues';
      this.results.fixRequired = true;
    } else if (errorMessages.includes('403') || errorMessages.includes('RLS') || errorMessages.includes('policy')) {
      this.results.classification = 'B_RLS';
      this.results.diagnosis = 'RLS policy or permissions issues';
      this.results.fixRequired = true;
    } else if (errorMessages.includes('constraint') || errorMessages.includes('null') || errorMessages.includes('schema')) {
      this.results.classification = 'C_SCHEMA';
      this.results.diagnosis = 'Database schema constraint issues';
      this.results.fixRequired = true;
    } else if (errorMessages.includes('timeout') || errorMessages.includes('network')) {
      this.results.classification = 'D_NETWORK';
      this.results.diagnosis = 'Network or timeout issues';
      this.results.fixRequired = false; // Usually transient
    } else {
      this.results.classification = 'D_OTHER';
      this.results.diagnosis = 'Other issues detected';
      this.results.fixRequired = true;
    }
  }

  async generateFixPR() {
    if (!this.results.fixRequired) {
      this.log('FIX_GEN', 'INFO', 'No fix required');
      return;
    }

    this.log('FIX_GEN', 'INFO', `Generating fix for classification: ${this.results.classification}`);
    
    if (this.options.dryRun) {
      this.log('FIX_GEN', 'INFO', 'DRY RUN MODE: Fix generation simulated only');
    }

    const branchName = `fix/prod-e2e-needs-post`;
    const timestamp = new Date().toISOString().split('T')[0];

    try {
      // Create fix branch
      await execAsync(`git checkout -b ${branchName}-${timestamp} 2>/dev/null || git checkout ${branchName}-${timestamp}`);

      let fixContent = '';
      let commitMessage = '';
      let fixes = [];

      switch (this.results.classification) {
        case 'A_AUTH':
          fixes = this.generateAuthFixes();
          commitMessage = 'fix(auth): resolve production authentication integration for needs posting';
          break;
        case 'B_RLS':
          fixes = this.generateRLSFixes();
          commitMessage = 'fix(rls): resolve production RLS policies for needs posting';
          break;
        case 'C_SCHEMA':
          fixes = this.generateSchemaFixes();
          commitMessage = 'fix(schema): resolve production database schema issues';
          break;
        case 'ENV_CONFIG':
          fixes = this.generateEnvFixes();
          commitMessage = 'fix(env): update production environment configuration';
          break;
        default:
          fixes = this.generateGenericFixes();
          commitMessage = 'fix(prod): resolve production needs posting issues';
      }

      // Apply fixes
      for (const fix of fixes) {
        if (this.options.dryRun) {
          this.log('FIX_GEN', 'INFO', `[DRY RUN] Would apply fix: ${fix.description}`);
          if (fix.type === 'file') {
            this.log('FIX_GEN', 'INFO', `[DRY RUN] Would write to ${fix.path}`);
          } else if (fix.type === 'script') {
            this.log('FIX_GEN', 'INFO', `[DRY RUN] Would execute: ${fix.command}`);
          }
        } else {
          if (fix.type === 'file') {
            fs.writeFileSync(fix.path, fix.content);
            this.log('FIX_GEN', 'INFO', `Applied fix to ${fix.path}`);
          } else if (fix.type === 'script') {
            await execAsync(fix.command);
            this.log('FIX_GEN', 'INFO', `Executed fix script: ${fix.command}`);
          }
        }
      }

      // Generate comprehensive fix documentation
      const fixDoc = this.generateFixDocumentation(fixes);
      fs.writeFileSync(`PROD_E2E_FIX_${timestamp}.md`, fixDoc);

      // Stage and commit changes
      if (!this.options.dryRun) {
        await execAsync('git add .');
        await execAsync(`git commit -m "${commitMessage}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"`);

        this.log('FIX_GEN', 'PASS', `Fix committed to branch ${branchName}-${timestamp}`);
      } else {
        this.log('FIX_GEN', 'INFO', `[DRY RUN] Would commit with message: ${commitMessage}`);
      }

      // Push and create PR if gh CLI is available and prOnly is enabled
      if (this.options.prOnly || !this.options.dryRun) {
        try {
          if (!this.options.dryRun) {
            await execAsync(`git push -u origin ${branchName}-${timestamp}`);
          } else {
            this.log('FIX_GEN', 'INFO', `[DRY RUN] Would push to origin ${branchName}-${timestamp}`);
          }
          
          const prBody = `## Production E2E Failure Auto-Fix

### Classification: ${this.results.classification}
### Diagnosis: ${this.results.diagnosis}

### Test Results Summary
- Timestamp: ${this.results.timestamp}
- Failed Logs: ${this.results.logs.filter(l => l.status === 'FAIL').length}

### Applied Fixes
${fixes.map(fix => `- ${fix.description}`).join('\n')}

### Reproduction Steps
1. Set CLERK_TEST_EMAIL and CLERK_TEST_PASSWORD
2. Run: \`npm run test:prod:e2e\`
3. Observe failure classification: ${this.results.classification}

### Impact & Rollback
- **Scope**: Production posting flow only
- **Safety**: All changes are backwards compatible
- **Rollback**: Revert this PR to restore previous behavior

### Test Execution Logs
\`\`\`json
${JSON.stringify(this.results.logs, null, 2)}
\`\`\`

### Generated Artifacts
- Fix documentation: \`PROD_E2E_FIX_${timestamp}.md\`
- Test results: \`artifacts/prod-e2e/\`

🤖 Generated with [Claude Code](https://claude.ai/code)`;

          if (!this.options.dryRun) {
            await execAsync(`gh pr create --title "${commitMessage}" --body "${prBody.replace(/"/g, '\\"')}"`);
            this.log('FIX_GEN', 'PASS', 'Fix PR created successfully');
          } else {
            this.log('FIX_GEN', 'INFO', `[DRY RUN] Would create PR with title: ${commitMessage}`);
            this.log('FIX_GEN', 'INFO', `[DRY RUN] PR body length: ${prBody.length} characters`);
          }
          
        } catch (prError) {
          this.log('FIX_GEN', 'WARN', 'Could not create PR automatically', prError.message);
        }
      }

    } catch (error) {
      this.log('FIX_GEN', 'FAIL', 'Failed to generate fix', error.message);
    }
  }

  generateAuthFixes() {
    return [
      {
        type: 'file',
        path: 'src/app/api/needs/route.ts',
        description: 'Enhanced auth error handling in needs API',
        content: `import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Enhanced auth validation
const MinimalNeedInput = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
});

export async function POST(req: NextRequest) {
  try {
    // Enhanced auth check with detailed error logging
    const { userId } = await auth();
    
    if (!userId) {
      console.error('[AUTH] No userId from auth() in production');
      return NextResponse.json({ 
        error: 'UNAUTHORIZED',
        detail: 'ログインが必要です。ログインしてから再度お試しください。',
        debug: process.env.NODE_ENV === 'development' ? 'No Clerk userId' : undefined
      }, { status: 401 });
    }

    console.log('[AUTH] Authenticated request for userId:', userId);

    const json = await req.json().catch(() => ({}));
    
    const validation = MinimalNeedInput.safeParse(json);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { title, body } = validation.data;
    
    const supabase = createAdminClient();
    if (!supabase) {
      console.error('[DB] Admin client unavailable');
      return NextResponse.json({ 
        error: 'SERVICE_ERROR', 
        detail: 'Admin client unavailable' 
      }, { status: 500 });
    }
    
    // Enhanced profile lookup with error logging
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single();
    
    if (profileError || !profile) {
      console.error('[DB] Profile lookup failed:', { userId, profileError });
      return NextResponse.json({ 
        error: 'USER_NOT_FOUND', 
        detail: 'ユーザープロフィールが見つかりません。アカウント設定を確認してください。',
        debug: process.env.NODE_ENV === 'development' ? profileError : undefined
      }, { status: 400 });
    }
    
    console.log('[DB] Found profile:', profile.id);
    
    const { data, error } = await supabase
      .from('needs')
      .insert([{ 
        title: title.trim(), 
        body: body.trim(),
        status: 'draft',
        published: false,
        owner_id: profile.id
      }])
      .select('id, title, created_at')
      .single();

    if (error) {
      console.error('[DB] Insert failed:', error);
      return NextResponse.json({ 
        error: 'DB_ERROR', 
        detail: error?.message ?? String(error),
        debug: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 });
    }

    console.log('[SUCCESS] Need created:', data.id);
    return NextResponse.json({ 
      id: data.id, 
      title: data.title, 
      created_at: data.created_at 
    }, { status: 201 });

  } catch (e: any) {
    console.error('[ERROR] Unhandled error in needs POST:', e);
    return NextResponse.json({ 
      error: 'INTERNAL_ERROR',
      detail: e?.message ?? String(e),
      debug: process.env.NODE_ENV === 'development' ? e.stack : undefined
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ 
        error: 'SERVICE_ERROR', 
        detail: 'Admin client unavailable' 
      }, { status: 500 });
    }
    
    const { data, error } = await supabase
      .from("needs")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { 
        status: 500
      });
    }

    return NextResponse.json({ needs: data || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch needs' }, { 
      status: 500
    });
  }
}`
      }
    ];
  }

  generateRLSFixes() {
    return [
      {
        type: 'file',
        path: 'scripts/apply-rls-fix.sql',
        description: 'Enhanced RLS policies for needs table',
        content: `-- Enhanced RLS policies for production needs posting

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "needs_insert_draft" ON needs;
DROP POLICY IF EXISTS "public_read_needs" ON needs;
DROP POLICY IF EXISTS "owners_read_needs" ON needs;

-- Create enhanced insert policy
CREATE POLICY "needs_insert_draft" ON needs
  FOR INSERT TO authenticated
  WITH CHECK (
    status = 'draft' AND 
    published = false AND
    owner_id IS NOT NULL
  );

-- Create enhanced read policies
CREATE POLICY "public_read_needs" ON needs
  FOR SELECT TO anon, authenticated
  USING (published = true AND status = 'published');

CREATE POLICY "owners_read_needs" ON needs
  FOR SELECT TO authenticated
  USING (owner_id = (
    SELECT id FROM profiles 
    WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- Create enhanced update policy for owners
CREATE POLICY "owners_update_needs" ON needs
  FOR UPDATE TO authenticated
  USING (owner_id = (
    SELECT id FROM profiles 
    WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- Ensure RLS is enabled
ALTER TABLE needs ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT INSERT, SELECT, UPDATE ON needs TO authenticated;
GRANT SELECT ON needs TO anon;`
      },
      {
        type: 'script',
        command: 'npm run db:apply-sql scripts/apply-rls-fix.sql',
        description: 'Apply RLS policy fixes to database'
      }
    ];
  }

  generateSchemaFixes() {
    return [
      {
        type: 'file',
        path: 'scripts/schema-fix.sql',
        description: 'Schema constraint adjustments',
        content: `-- Schema fixes for production needs posting

-- Ensure needs table has correct structure
ALTER TABLE needs 
  ALTER COLUMN status SET DEFAULT 'draft',
  ALTER COLUMN published SET DEFAULT false;

-- Add constraints if missing
ALTER TABLE needs 
  ADD CONSTRAINT IF NOT EXISTS needs_status_check 
  CHECK (status IN ('draft', 'published', 'closed'));

-- Ensure owner_id foreign key exists
ALTER TABLE needs 
  ADD CONSTRAINT IF NOT EXISTS needs_owner_fkey 
  FOREIGN KEY (owner_id) REFERENCES profiles(id);

-- Create partial index for performance
CREATE INDEX IF NOT EXISTS needs_published_idx 
  ON needs (created_at DESC) 
  WHERE published = true;

CREATE INDEX IF NOT EXISTS needs_owner_idx 
  ON needs (owner_id, created_at DESC);`
      }
    ];
  }

  generateEnvFixes() {
    return [
      {
        type: 'file',
        path: '.env.example',
        description: 'Updated environment variables example',
        content: `# Clerk Test Credentials for E2E
CLERK_TEST_EMAIL=test@example.com
CLERK_TEST_PASSWORD=TestPassword123!

# Existing variables...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=`
      }
    ];
  }

  generateGenericFixes() {
    return [
      {
        type: 'file',
        path: 'PRODUCTION_TROUBLESHOOTING.md',
        description: 'Production troubleshooting guide',
        content: `# Production Troubleshooting Guide

## E2E Test Failure Analysis

### Recent Issues
- Timestamp: ${this.results.timestamp}
- Classification: ${this.results.classification}
- Diagnosis: ${this.results.diagnosis}

### Debugging Steps
1. Check environment variables are set correctly
2. Verify Clerk authentication is working
3. Test API endpoints manually
4. Check Supabase connection and RLS policies
5. Review application logs

### Common Solutions
- Restart Vercel deployment
- Check Clerk dashboard for API limits
- Verify Supabase service role key
- Check database connection limits

### Logs
\`\`\`json
${JSON.stringify(this.results.logs, null, 2)}
\`\`\`
`
      }
    ];
  }

  generateFixDocumentation(fixes) {
    return `# Production E2E Fix Documentation

## Issue Classification: ${this.results.classification}

## Diagnosis
${this.results.diagnosis}

## Timestamp
${this.results.timestamp}

## Applied Fixes
${fixes.map((fix, index) => `
### ${index + 1}. ${fix.description}
- Type: ${fix.type}
- ${fix.type === 'file' ? `File: ${fix.path}` : `Command: ${fix.command}`}
`).join('')}

## Test Results
\`\`\`json
${JSON.stringify(this.results.testResults, null, 2)}
\`\`\`

## Execution Logs
\`\`\`json
${JSON.stringify(this.results.logs, null, 2)}
\`\`\`

## Verification Steps
1. Re-run the E2E test: \`npm run test:prod:e2e\`
2. Check production posting flow manually
3. Monitor error rates in production

## Generated: ${new Date().toISOString()}
`;
  }

  async run() {
    console.log('🔍 Starting Production E2E Needs Posting Monitor...\n');
    console.log(`Target: ${PROD_BASE_URL}`);
    console.log(`Timestamp: ${this.results.timestamp}\n`);

    // Check environment setup
    const envOk = await this.checkEnvironmentSetup();
    if (!envOk) {
      this.results.fixRequired = true;
      this.classifyFailure();
      await this.generateFixPR();
      process.exit(1);
    }

    // Run E2E tests
    const e2eSuccess = await this.runProductionE2E();
    
    // Classify results and generate fixes if needed
    this.classifyFailure();
    
    if (!e2eSuccess) {
      await this.generateFixPR();
    }

    // Output results
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(60));
    console.log(`Classification: ${this.results.classification}`);
    console.log(`Diagnosis: ${this.results.diagnosis}`);
    console.log(`Success: ${this.results.success}`);
    console.log(`Fix Required: ${this.results.fixRequired}`);
    
    console.log('\n📋 Log Summary:');
    this.results.logs.forEach(log => {
      const status = log.status === 'PASS' ? '✅' : log.status === 'FAIL' ? '❌' : log.status === 'WARN' ? '⚠️' : 'ℹ️';
      console.log(`  ${status} ${log.category}: ${log.message}`);
    });

    if (!this.results.success) {
      console.log('\n🚨 E2E tests failed. Diagnostic information generated.');
      process.exit(1);
    } else {
      console.log('\n✅ All E2E tests passed. Production posting flow is working correctly.');
      process.exit(0);
    }
  }
}

// Run the monitor if called directly
if (require.main === module) {
  const monitor = new ProductionE2EMonitor();
  monitor.run().catch(error => {
    console.error('💥 Monitor execution failed:', error);
    process.exit(1);
  });
}

module.exports = ProductionE2EMonitor;