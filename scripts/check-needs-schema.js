#!/usr/bin/env node

// scripts/check-needs-schema.js
// Check the actual needs table schema

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkNeedsSchema() {
  try {
    console.log('Checking needs table schema...');
    
    // Check what columns exist by trying to select
    const { data: sample, error } = await supabase
      .from('needs')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying needs table:', error);
    } else {
      console.log('Sample needs record structure:', sample[0] ? Object.keys(sample[0]) : 'No records found');
    }
    
    // Try a simple insert to see the expected structure
    console.log('\nTrying minimal insert to understand required fields...');
    
    const { data: testInsert, error: insertError } = await supabase
      .from('needs')
      .insert({
        title: 'Schema Test Need',
        body: 'Test need for schema checking',
        status: 'draft',
        created_by: 'test-user'
      })
      .select()
      .single();
    
    if (insertError) {
      console.log('Insert error (this helps us understand the schema):', insertError);
    } else {
      console.log('Successfully created test need:', testInsert);
      
      // Clean up the test record
      await supabase.from('needs').delete().eq('id', testInsert.id);
      console.log('Test need cleaned up');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkNeedsSchema();