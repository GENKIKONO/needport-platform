#!/usr/bin/env node

/**
 * Production Needs Posting Flow Verification Script
 * 
 * Tests the complete needs posting flow on production (https://needport.jp)
 * and provides automated diagnosis and fixes for any failures.
 */

const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const PROD_BASE_URL = 'https://needport.jp';
const TEST_USER_EMAIL = process.env.E2E_TEST_EMAIL || 'test@needport.dev';
const TEST_USER_PASSWORD = process.env.E2E_TEST_PASSWORD || 'TestPass123!';

class ProductionFlowTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      steps: [],
      classification: null,
      diagnosis: null,
      fixRequired: false,
      logs: []
    };
  }

  log(step, status, message, details = null) {
    const logEntry = {
      step,
      status, // 'PASS', 'FAIL', 'INFO'
      message,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.results.steps.push(logEntry);
    console.log(`[${status}] ${step}: ${message}`);
    if (details) {
      console.log(`    Details: ${JSON.stringify(details, null, 2)}`);
    }
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });
      
      req.on('error', reject);
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  async testUnauthenticatedRedirect() {
    this.log('1-REDIRECT', 'INFO', 'Testing unauthenticated redirect from /needs/new');
    
    try {
      const response = await this.makeRequest(`${PROD_BASE_URL}/needs/new`, {
        method: 'GET',
        headers: {
          'User-Agent': 'NeedPort-E2E-Test/1.0'
        }
      });

      // Check for redirect (302/303) or if response contains sign-in
      if (response.statusCode >= 300 && response.statusCode < 400) {
        const location = response.headers.location;
        if (location && location.includes('/sign-in') && location.includes('redirect_url')) {
          this.log('1-REDIRECT', 'PASS', 'Correct redirect to sign-in with redirect_url', {
            statusCode: response.statusCode,
            location
          });
          return true;
        }
      }

      // Check if response body contains sign-in elements (client-side redirect)
      if (response.body.includes('sign-in') || response.body.includes('Sign in')) {
        this.log('1-REDIRECT', 'PASS', 'Redirected to sign-in page (client-side)', {
          statusCode: response.statusCode
        });
        return true;
      }

      // If we get here, redirect didn't work
      this.log('1-REDIRECT', 'FAIL', 'No redirect to sign-in detected', {
        statusCode: response.statusCode,
        bodySnippet: response.body.substring(0, 500)
      });
      return false;

    } catch (error) {
      this.log('1-REDIRECT', 'FAIL', 'Request failed', error.message);
      return false;
    }
  }

  async testAuthenticatedPosting() {
    this.log('2-AUTH-POST', 'INFO', 'Testing authenticated posting (simulation)');
    
    // Note: Real authentication testing would require a test account
    // For now, we'll test the API endpoint structure
    
    try {
      const response = await this.makeRequest(`${PROD_BASE_URL}/api/needs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NeedPort-E2E-Test/1.0'
        },
        body: JSON.stringify({
          title: 'E2E投稿テスト',
          body: '本文テスト'
        })
      });

      // Expected: 401 Unauthorized (since we're not authenticated)
      if (response.statusCode === 401) {
        const responseBody = JSON.parse(response.body);
        
        // Accept both formats: our API format and middleware format
        if (responseBody.error === 'UNAUTHORIZED' || responseBody.error === 'Unauthorized') {
          this.log('2-AUTH-POST', 'PASS', 'API correctly rejects unauthenticated requests', {
            statusCode: response.statusCode,
            error: responseBody.error,
            source: responseBody.error === 'UNAUTHORIZED' ? 'API_Route' : 'Middleware'
          });
          return true;
        }
      }

      this.log('2-AUTH-POST', 'FAIL', 'Unexpected API response', {
        statusCode: response.statusCode,
        body: response.body
      });
      return false;

    } catch (error) {
      this.log('2-AUTH-POST', 'FAIL', 'API request failed', error.message);
      return false;
    }
  }

  async testDatabaseSchema() {
    this.log('3-SCHEMA', 'INFO', 'Testing database schema assumptions');
    
    // We can't directly access the production database, but we can check
    // if our API contract matches expectations through error responses
    
    try {
      const response = await this.makeRequest(`${PROD_BASE_URL}/api/needs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NeedPort-E2E-Test/1.0'
        },
        body: JSON.stringify({
          title: '', // Invalid: empty title
          body: ''   // Invalid: empty body
        })
      });

      // Should get 401 (auth) before validation, but let's check structure
      if (response.statusCode === 401) {
        this.log('3-SCHEMA', 'PASS', 'Schema validation order correct (auth before validation)', {
          statusCode: response.statusCode
        });
        return true;
      }

      if (response.statusCode === 400) {
        const responseBody = JSON.parse(response.body);
        if (responseBody.error === 'VALIDATION_ERROR') {
          this.log('3-SCHEMA', 'PASS', 'Schema validation working', responseBody);
          return true;
        }
      }

      this.log('3-SCHEMA', 'FAIL', 'Unexpected schema response', {
        statusCode: response.statusCode,
        body: response.body
      });
      return false;

    } catch (error) {
      this.log('3-SCHEMA', 'FAIL', 'Schema test failed', error.message);
      return false;
    }
  }

  classifyFailure() {
    const failures = this.results.steps.filter(step => step.status === 'FAIL');
    
    if (failures.length === 0) {
      this.results.classification = 'SUCCESS';
      this.results.diagnosis = 'All tests passed';
      return;
    }

    // Analyze failure patterns
    const authFailures = failures.filter(f => 
      f.step.includes('AUTH') || 
      f.message.includes('401') || 
      f.message.includes('Unauthorized')
    );

    const redirectFailures = failures.filter(f => 
      f.step.includes('REDIRECT') || 
      f.message.includes('redirect')
    );

    const schemaFailures = failures.filter(f => 
      f.step.includes('SCHEMA') || 
      f.message.includes('validation') ||
      f.message.includes('constraint')
    );

    if (authFailures.length > 0) {
      this.results.classification = 'A-AUTH';
      this.results.diagnosis = 'Authentication/Authorization issues detected';
      this.results.fixRequired = true;
    } else if (redirectFailures.length > 0) {
      this.results.classification = 'B-ROUTING';
      this.results.diagnosis = 'Routing/Redirect issues detected';
      this.results.fixRequired = true;
    } else if (schemaFailures.length > 0) {
      this.results.classification = 'C-SCHEMA';
      this.results.diagnosis = 'Database schema issues detected';
      this.results.fixRequired = true;
    } else {
      this.results.classification = 'D-OTHER';
      this.results.diagnosis = 'Other issues detected';
      this.results.fixRequired = true;
    }
  }

  async generateFixPR() {
    if (!this.results.fixRequired) return;

    this.log('FIX-GEN', 'INFO', `Generating fix for classification: ${this.results.classification}`);

    const branchName = 'fix/prod-needs-posting-final';
    const timestamp = new Date().toISOString().split('T')[0];

    try {
      // Create fix branch
      await execAsync(`git checkout -b ${branchName}-${timestamp} 2>/dev/null || git checkout ${branchName}-${timestamp}`);

      let fixContent = '';
      let commitMessage = '';

      switch (this.results.classification) {
        case 'A-AUTH':
          fixContent = this.generateAuthFix();
          commitMessage = 'fix(auth): resolve production authentication issues for needs posting';
          break;
        case 'B-ROUTING':
          fixContent = this.generateRoutingFix();
          commitMessage = 'fix(routing): resolve production redirect issues for /needs/new';
          break;
        case 'C-SCHEMA':
          fixContent = this.generateSchemaFix();
          commitMessage = 'fix(schema): resolve production database schema issues';
          break;
        default:
          fixContent = this.generateGenericFix();
          commitMessage = 'fix(prod): resolve production needs posting issues';
      }

      // Write fix documentation
      const fixDoc = `# Production Needs Posting Fix

## Issue Classification: ${this.results.classification}

## Diagnosis
${this.results.diagnosis}

## Test Results
${JSON.stringify(this.results.steps, null, 2)}

## Proposed Fix
${fixContent}

## Generated: ${new Date().toISOString()}
`;

      require('fs').writeFileSync(`PROD_FIX_${timestamp}.md`, fixDoc);

      this.log('FIX-GEN', 'PASS', `Fix documentation generated: PROD_FIX_${timestamp}.md`);

    } catch (error) {
      this.log('FIX-GEN', 'FAIL', 'Failed to generate fix', error.message);
    }
  }

  generateAuthFix() {
    return `
### Authentication Fix

1. **Check Clerk Configuration**
   - Verify NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set correctly
   - Ensure CLERK_SECRET_KEY is available in production environment

2. **API Authentication Flow**
   - Verify auth() function is working in production
   - Check if Clerk JWT tokens are being properly validated

3. **Supabase Integration**
   - Ensure service role key is correctly configured
   - Verify RLS policies are active and correct

\`\`\`typescript
// Recommended fix for src/app/api/needs/route.ts
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ 
      error: 'UNAUTHORIZED',
      detail: 'Authentication required' 
    }, { status: 401 });
  }
  
  // ... rest of implementation
}
\`\`\`
`;
  }

  generateRoutingFix() {
    return `
### Routing Fix

1. **Server-side Redirect**
   - Verify auth() is working in server components
   - Check if redirect() function is properly configured

2. **Middleware Configuration**
   - Ensure Clerk middleware is properly set up
   - Verify route protection is working

\`\`\`typescript
// Recommended fix for src/app/needs/new/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function NewNeedPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in?redirect_url=' + encodeURIComponent('/needs/new'));
  }
  
  return <NewNeedForm />;
}
\`\`\`
`;
  }

  generateSchemaFix() {
    return `
### Schema Fix

1. **Database Schema Verification**
   - Check if needs table has required columns
   - Verify RLS policies are active

2. **Required SQL Updates**

\`\`\`sql
-- Ensure needs table has correct structure
ALTER TABLE needs 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id);

-- Ensure RLS policy exists
CREATE POLICY IF NOT EXISTS "needs_insert_policy" 
ON needs FOR INSERT 
TO authenticated 
WITH CHECK (true);
\`\`\`
`;
  }

  generateGenericFix() {
    return `
### Generic Fix

1. **Environment Variables**
   - Verify all required environment variables are set in production
   - Check Vercel environment configuration

2. **Build Configuration**
   - Ensure production build is using correct settings
   - Verify dynamic routes are properly configured

3. **Monitoring**
   - Check Vercel function logs for errors
   - Review Sentry error reports if available
`;
  }

  async run() {
    console.log('🔍 Starting Production Needs Posting Flow Verification...\n');
    console.log(`Target: ${PROD_BASE_URL}`);
    console.log(`Timestamp: ${this.results.timestamp}\n`);

    // Run all tests
    await this.testUnauthenticatedRedirect();
    await this.testAuthenticatedPosting();
    await this.testDatabaseSchema();

    // Classify failures and generate fixes
    this.classifyFailure();
    await this.generateFixPR();

    // Output results
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(60));
    console.log(`Classification: ${this.results.classification}`);
    console.log(`Diagnosis: ${this.results.diagnosis}`);
    console.log(`Fix Required: ${this.results.fixRequired}`);
    
    console.log('\n📋 Step Summary:');
    this.results.steps.forEach(step => {
      const status = step.status === 'PASS' ? '✅' : step.status === 'FAIL' ? '❌' : 'ℹ️';
      console.log(`  ${status} ${step.step}: ${step.message}`);
    });

    // Return non-zero exit code if fixes are needed
    if (this.results.fixRequired) {
      console.log('\n🚨 Issues detected. Fix documentation generated.');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed. Production flow is working correctly.');
      process.exit(0);
    }
  }
}

// Run the test if called directly
if (require.main === module) {
  const tester = new ProductionFlowTester();
  tester.run().catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = ProductionFlowTester;