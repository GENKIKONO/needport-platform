#!/usr/bin/env node

// scripts/check-schema.js
// Check current database schema

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  try {
    console.log('Checking existing tables...');
    
    // Check for existing tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
    } else {
      console.log('Existing tables:', tables.map(t => t.table_name));
    }
    
    // Check for engagement-related tables
    const engagementTables = ['need_engagements', 'need_anonymous_interest'];
    for (const tableName of engagementTables) {
      const { data: tableExists, error } = await supabase
        .from(tableName)
        .select('count', { count: 'exact', head: true })
        .limit(0);
      
      if (error) {
        console.log(`Table ${tableName}: Does not exist (${error.code})`);
      } else {
        console.log(`Table ${tableName}: Exists`);
      }
    }
    
    // Check for enum type
    const { data: enumTypes, error: enumError } = await supabase
      .from('information_schema.types')
      .select('typname')
      .eq('typtype', 'e')
      .like('typname', '%engagement%');
    
    if (enumError) {
      console.error('Error checking enum types:', enumError);
    } else {
      console.log('Engagement-related enum types:', enumTypes.map(t => t.typname));
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkSchema();