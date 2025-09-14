#!/usr/bin/env node

// scripts/list-needs.js
// List all needs in the database

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listNeeds() {
  try {
    console.log('Fetching all needs from database...');
    
    const { data: needs, error } = await supabase
      .from('needs')
      .select('id, title, published, created_by, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching needs:', error);
    } else {
      console.log(`Found ${needs.length} needs:`);
      needs.forEach((need, index) => {
        console.log(`${index + 1}. ${need.title} (${need.id})`);
        console.log(`   Published: ${need.published}, Created by: ${need.created_by}`);
        console.log(`   Created: ${need.created_at}\n`);
      });
      
      if (needs.length > 0) {
        const publishedNeeds = needs.filter(n => n.published);
        console.log(`\n${publishedNeeds.length} published needs available for engagement testing`);
        
        if (publishedNeeds.length > 0) {
          const testNeed = publishedNeeds[0];
          console.log(`\nTest engagement with first published need (${testNeed.id}):`);
          console.log(`curl -X POST "http://localhost:3000/api/needs/${testNeed.id}/engagement" -H "Content-Type: application/json" -d '{"kind":"interest"}'`);
          console.log(`curl -X GET "http://localhost:3000/api/needs/${testNeed.id}/engagement/summary"`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

listNeeds();