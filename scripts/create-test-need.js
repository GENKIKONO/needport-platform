#!/usr/bin/env node

// scripts/create-test-need.js
// Create test needs for engagement testing

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestNeed() {
  try {
    console.log('Creating test need for engagement testing...');
    
    const testNeed = {
      title: 'Test Need for Engagement API',
      body: 'This is a test need created specifically for testing the engagement API endpoints.',
      summary: 'Test need for engagement API testing',
      area: 'Tokyo',
      published: true,
      created_by: 'test-user-id'
    };

    const { data: need, error: needError } = await supabase
      .from('needs')
      .insert(testNeed)
      .select()
      .single();

    if (needError) {
      console.error('Error creating test need:', needError);
    } else {
      console.log('Test need created successfully:', need);
      console.log('Need ID:', need.id);
      console.log('\nYou can now test engagement with:');
      console.log(`curl -X POST http://localhost:3000/api/needs/${need.id}/engagement -H "Content-Type: application/json" -d '{"kind":"interest"}'`);
      console.log(`curl -X GET http://localhost:3000/api/needs/${need.id}/engagement/summary`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestNeed();