#!/usr/bin/env node

// scripts/verify-engagement-tables.js
// Verify engagement tables structure and data

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTables() {
  try {
    console.log('Verifying engagement tables...\n');
    
    // Check need_engagements table structure
    console.log('=== need_engagements table ===');
    const { data: engagements, error: engError } = await supabase
      .from('need_engagements')
      .select('*')
      .limit(5);
    
    if (engError) {
      console.error('Error querying need_engagements:', engError);
    } else {
      console.log(`Found ${engagements.length} records in need_engagements`);
      if (engagements.length > 0) {
        console.log('Sample record:', engagements[0]);
      } else {
        console.log('Table is empty');
      }
    }
    
    // Check need_anonymous_interest table structure
    console.log('\n=== need_anonymous_interest table ===');
    const { data: interests, error: intError } = await supabase
      .from('need_anonymous_interest')
      .select('*')
      .limit(5);
    
    if (intError) {
      console.error('Error querying need_anonymous_interest:', intError);
    } else {
      console.log(`Found ${interests.length} records in need_anonymous_interest`);
      if (interests.length > 0) {
        console.log('Sample record:', interests[0]);
      } else {
        console.log('Table is empty');
      }
    }
    
    // Test inserting a sample engagement
    console.log('\n=== Testing insert operations ===');
    
    // First, check if we have any needs to work with
    const { data: needs, error: needsError } = await supabase
      .from('needs')
      .select('id, title')
      .limit(1);
    
    if (needsError) {
      console.error('Error querying needs:', needsError);
    } else if (needs.length === 0) {
      console.log('No needs found to test engagement with');
    } else {
      const needId = needs[0].id;
      console.log(`Testing with need: ${needs[0].title} (${needId})`);
      
      // Test anonymous interest insert
      const anonKey = 'test-anon-key-' + Date.now();
      const { data: anonInsert, error: anonInsertError } = await supabase
        .from('need_anonymous_interest')
        .insert({
          need_id: needId,
          anon_key: anonKey,
          day: new Date().toISOString().split('T')[0]
        })
        .select();
      
      if (anonInsertError) {
        console.error('Error inserting anonymous interest:', anonInsertError);
      } else {
        console.log('Successfully inserted anonymous interest:', anonInsert[0]);
        
        // Clean up test data
        await supabase
          .from('need_anonymous_interest')
          .delete()
          .eq('anon_key', anonKey);
        console.log('Cleaned up test anonymous interest');
      }
    }
    
  } catch (error) {
    console.error('Error verifying tables:', error);
  }
}

verifyTables();