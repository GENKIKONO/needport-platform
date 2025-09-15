#!/usr/bin/env tsx
/**
 * scripts/prod/verify-draft-in-db.ts
 * Supabase DB検証スクリプト
 * 
 * 直近の [E2E] で始まる need を SELECT し、
 * status='draft', published=false, owner_id NOT NULL を検証
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import path from 'path';

// 環境変数からSupabase設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

interface DBCheckResult {
  timestamp: string;
  status: 'success' | 'failed' | 'no_data';
  query: string;
  results: Array<{
    id: string;
    title: string;
    status: string;
    published: boolean;
    owner_id: string | null;
    created_at: string;
    updated_at: string;
  }>;
  validationResults: {
    total: number;
    validDrafts: number;
    invalidItems: Array<{
      id: string;
      title: string;
      issues: string[];
    }>;
  };
  summary: string;
  error?: string;
}

class DBVerifier {
  private supabase;
  private result: DBCheckResult;

  constructor() {
    this.supabase = createClient(supabaseUrl!, supabaseKey!);
    this.result = {
      timestamp: new Date().toISOString(),
      status: 'failed',
      query: '',
      results: [],
      validationResults: {
        total: 0,
        validDrafts: 0,
        invalidItems: []
      },
      summary: ''
    };
  }

  async verifyE2ENeeds() {
    console.log('🔍 Searching for E2E test needs in database...');
    
    try {
      // 直近24時間の [E2E] で始まるニーズを検索
      const query = `
        SELECT 
          id, title, status, published, owner_id, created_at, updated_at
        FROM needs 
        WHERE 
          title LIKE '[E2E]%' 
          AND created_at >= NOW() - INTERVAL '24 hours'
        ORDER BY created_at DESC
        LIMIT 10
      `;
      
      this.result.query = query;
      
      const { data, error } = await this.supabase
        .from('needs')
        .select('id, title, status, published, owner_id, created_at, updated_at')
        .like('title', '[E2E]%')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        this.result.error = `Database query failed: ${error.message}`;
        this.result.status = 'failed';
        console.error('❌ Database query failed:', error);
        return this.result;
      }

      if (!data || data.length === 0) {
        this.result.status = 'no_data';
        this.result.summary = 'No E2E test needs found in the last 24 hours';
        console.log('📝 No E2E test needs found in the last 24 hours');
        return this.result;
      }

      this.result.results = data;
      this.result.validationResults.total = data.length;

      console.log(`📊 Found ${data.length} E2E test needs`);
      
      // 各ニーズを検証
      for (const need of data) {
        const issues = this.validateNeed(need);
        
        if (issues.length === 0) {
          this.result.validationResults.validDrafts++;
          console.log(`✅ ${need.id}: ${need.title.substring(0, 50)}...`);
        } else {
          this.result.validationResults.invalidItems.push({
            id: need.id,
            title: need.title,
            issues
          });
          console.log(`❌ ${need.id}: ${issues.join(', ')}`);
        }
      }

      // 結果判定
      if (this.result.validationResults.validDrafts === this.result.validationResults.total) {
        this.result.status = 'success';
        this.result.summary = `All ${this.result.validationResults.total} E2E needs are valid drafts`;
      } else {
        this.result.status = 'failed';
        this.result.summary = `${this.result.validationResults.invalidItems.length} of ${this.result.validationResults.total} needs have validation issues`;
      }

      console.log(`\n📋 Validation Summary:`);
      console.log(`   Total: ${this.result.validationResults.total}`);
      console.log(`   Valid: ${this.result.validationResults.validDrafts}`);
      console.log(`   Invalid: ${this.result.validationResults.invalidItems.length}`);

      return this.result;

    } catch (error) {
      this.result.error = error instanceof Error ? error.message : 'Unknown error';
      this.result.status = 'failed';
      console.error('❌ Verification failed:', error);
      return this.result;
    }
  }

  private validateNeed(need: any): string[] {
    const issues: string[] = [];

    // status='draft' チェック
    if (need.status !== 'draft') {
      issues.push(`status is '${need.status}', expected 'draft'`);
    }

    // published=false チェック
    if (need.published !== false) {
      issues.push(`published is '${need.published}', expected false`);
    }

    // owner_id NOT NULL チェック
    if (!need.owner_id) {
      issues.push(`owner_id is null, expected non-null value`);
    }

    // タイトルが [E2E] で始まるかチェック
    if (!need.title.startsWith('[E2E]')) {
      issues.push(`title does not start with '[E2E]'`);
    }

    return issues;
  }

  async cleanup() {
    console.log('\n🧹 Checking for cleanup opportunities...');
    
    try {
      // 24時間以上前の E2E テストニーズを探す
      const { data: oldNeeds, error } = await this.supabase
        .from('needs')
        .select('id, title, created_at')
        .like('title', '[E2E]%')
        .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(5);

      if (error) {
        console.warn('⚠️ Cleanup check failed:', error.message);
        return;
      }

      if (oldNeeds && oldNeeds.length > 0) {
        console.log(`📅 Found ${oldNeeds.length} old E2E test needs (24+ hours old):`);
        for (const need of oldNeeds) {
          console.log(`   - ${need.id}: ${need.title} (${need.created_at})`);
        }
        console.log('💡 Consider manual cleanup if these are no longer needed');
      } else {
        console.log('✨ No old E2E test needs found');
      }
    } catch (error) {
      console.warn('⚠️ Cleanup check error:', error);
    }
  }

  async saveResults() {
    const artifactsDir = path.join(process.cwd(), 'artifacts', 'e2e');
    const dbCheckPath = path.join(artifactsDir, 'db_check.txt');
    const dbResultsPath = path.join(artifactsDir, 'db_results.json');

    // テキストレポート
    const textReport = `
Database Verification Report
============================
Timestamp: ${this.result.timestamp}
Status: ${this.result.status.toUpperCase()}

Query Executed:
${this.result.query}

Results Summary:
- Total E2E needs found: ${this.result.validationResults.total}
- Valid drafts: ${this.result.validationResults.validDrafts}
- Invalid items: ${this.result.validationResults.invalidItems.length}

${this.result.status === 'success' ? '✅ All validations passed!' : '❌ Some validations failed'}

${this.result.validationResults.invalidItems.length > 0 ? `
Invalid Items:
${this.result.validationResults.invalidItems.map(item => 
  `- ${item.id}: ${item.title}\n  Issues: ${item.issues.join(', ')}`
).join('\n')}
` : ''}

Detailed Results:
${this.result.results.map(need => 
  `- ${need.id}: ${need.title}
    Status: ${need.status}, Published: ${need.published}, Owner: ${need.owner_id}
    Created: ${need.created_at}`
).join('\n')}

Summary: ${this.result.summary}
${this.result.error ? `\nError: ${this.result.error}` : ''}
`;

    writeFileSync(dbCheckPath, textReport.trim());
    writeFileSync(dbResultsPath, JSON.stringify(this.result, null, 2));

    console.log(`\n📄 Reports saved:`);
    console.log(`   Text: ${dbCheckPath}`);
    console.log(`   JSON: ${dbResultsPath}`);
  }
}

async function main() {
  const verifier = new DBVerifier();
  
  console.log('🔗 Connecting to Supabase...');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey?.substring(0, 20)}...`);

  const result = await verifier.verifyE2ENeeds();
  await verifier.cleanup();
  await verifier.saveResults();

  console.log(`\n🏁 Database verification completed with status: ${result.status.toUpperCase()}`);
  
  process.exit(result.status === 'success' ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

export { DBVerifier };