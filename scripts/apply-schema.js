#!/usr/bin/env node

// scripts/apply-schema.js
// Apply SQL schema to Supabase database

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySQLSchema() {
  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, '../docs/sql/needs-engagement-rls.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Extract individual SQL statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and documentation
      if (statement.includes('注意：') || statement.includes('このファイルは')) {
        continue;
      }
      
      console.log(`Executing statement ${i + 1}:`, statement.substring(0, 80) + '...');
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement + ';'
        });
        
        if (error) {
          console.error(`Error in statement ${i + 1}:`, error);
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`Exception in statement ${i + 1}:`, err.message);
        
        // Try alternative approach for DDL statements
        if (statement.includes('CREATE TYPE') || statement.includes('CREATE TABLE') || statement.includes('ALTER TABLE')) {
          console.log('Trying alternative approach for DDL statement...');
          // For now, log what we would execute
          console.log('Would execute:', statement);
        }
      }
    }
    
    console.log('Schema application completed');
    
  } catch (error) {
    console.error('Error applying schema:', error);
    process.exit(1);
  }
}

applySQLSchema();