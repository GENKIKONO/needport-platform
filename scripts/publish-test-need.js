#!/usr/bin/env node

// scripts/publish-test-need.js
// Publish the first unpublished need for testing

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function publishTestNeed() {
  try {
    console.log('Finding an unpublished need to publish for testing...');
    
    // Get the first unpublished need
    const { data: unpublishedNeeds, error: fetchError } = await supabase
      .from('needs')
      .select('id, title, published')
      .eq('published', false)
      .limit(1);
    
    if (fetchError) {
      console.error('Error fetching unpublished needs:', fetchError);
      return;
    }
    
    if (unpublishedNeeds.length === 0) {
      console.log('No unpublished needs found');
      return;
    }
    
    const testNeed = unpublishedNeeds[0];
    console.log(`Publishing need: ${testNeed.title} (${testNeed.id})`);
    
    // Update the need to published
    const { data: updatedNeed, error: updateError } = await supabase
      .from('needs')
      .update({ published: true })
      .eq('id', testNeed.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error publishing need:', updateError);
    } else {
      console.log('Successfully published need:', updatedNeed);
      console.log(`\nTest engagement endpoints with need ${testNeed.id}:`);
      console.log(`curl -X POST "http://localhost:3000/api/needs/${testNeed.id}/engagement" -H "Content-Type: application/json" -d '{"kind":"interest"}'`);
      console.log(`curl -X GET "http://localhost:3000/api/needs/${testNeed.id}/engagement/summary"`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

publishTestNeed();