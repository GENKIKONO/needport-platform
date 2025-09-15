#!/usr/bin/env ts-node
import { Client } from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

// 汎用SQL実行器（Node + pg）
// 使い方: ts-node --transpile-only scripts/db/run-sql.ts <path-to-sql> [--var KEY=VAL ...]

interface Args {
  sqlPath: string;
  variables: Record<string, string>;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: ts-node --transpile-only scripts/db/run-sql.ts <path-to-sql> [--var KEY=VAL ...]');
    process.exit(1);
  }

  const sqlPath = args[0];
  const variables: Record<string, string> = {};

  // Parse --var KEY=VAL arguments
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--var' && i + 1 < args.length) {
      const varArg = args[i + 1];
      const [key, value] = varArg.split('=', 2);
      if (key && value) {
        variables[key] = value;
      }
      i++; // Skip the next argument as we've processed it
    }
  }

  return { sqlPath, variables };
}

function loadEnvironment() {
  // Load .env.local.tools for DATABASE_URL_ADMIN
  const toolsEnvPath = resolve(process.cwd(), '.env.local.tools');
  try {
    config({ path: toolsEnvPath });
  } catch (error) {
    console.warn(`Warning: Could not load ${toolsEnvPath}`);
  }

  // Fallback to standard .env files
  config({ path: '.env.local' });
  config({ path: '.env' });
}

function replaceVariables(sql: string, variables: Record<string, string>): string {
  let result = sql;
  
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\$\\{${key}\\}`, 'g');
    result = result.replace(pattern, value);
  }
  
  return result;
}

async function executeSql(databaseUrl: string, sql: string): Promise<any[]> {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Execute SQL (handles multiple statements)
    const result = await client.query(sql);
    
    // Handle multiple statements result
    if (Array.isArray(result)) {
      // Return the last result if multiple statements
      const lastResult = result[result.length - 1];
      return lastResult.rows || [];
    } else {
      return result.rows || [];
    }
  } finally {
    await client.end();
    console.log('✓ Database connection closed');
  }
}

async function main() {
  try {
    loadEnvironment();
    
    const { sqlPath, variables } = parseArgs();
    
    const databaseUrl = process.env.DATABASE_URL_ADMIN;
    if (!databaseUrl) {
      console.error('Error: DATABASE_URL_ADMIN not found in environment variables');
      console.error('Please set it in .env.local.tools or your environment');
      process.exit(1);
    }

    console.log(`📁 Loading SQL file: ${sqlPath}`);
    console.log(`🔧 Variables: ${Object.keys(variables).length > 0 ? JSON.stringify(variables) : 'none'}`);
    
    const sqlContent = readFileSync(resolve(sqlPath), 'utf8');
    const processedSql = replaceVariables(sqlContent, variables);

    console.log('\n🚀 Executing SQL...\n');
    
    const results = await executeSql(databaseUrl, processedSql);
    
    if (results.length > 0) {
      console.log('📊 Results:');
      console.table(results);
    } else {
      console.log('✅ SQL executed successfully (no results returned)');
    }
    
  } catch (error) {
    console.error('\n❌ Error executing SQL:');
    console.error(error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}