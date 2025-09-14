// scripts/test-engagement-schema.js
// Test if engagement tables exist and create test data

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testSchema() {
  console.log('🔍 Testing Collective Demand Schema...');
  console.log('=====================================');
  
  try {
    // Test 1: Check if threshold_pledge column exists in needs table
    console.log('1. Testing needs.threshold_pledge column...');
    const { data: needsTest, error: needsError } = await supabase
      .from('needs')
      .select('id, title, threshold_pledge')
      .limit(1);
      
    if (needsError) {
      console.error('❌ Error accessing needs.threshold_pledge:', needsError);
      return false;
    } else {
      console.log('✅ needs.threshold_pledge column accessible');
    }
    
    // Test 2: Check if need_engagements table exists
    console.log('2. Testing need_engagements table...');
    const { data: engagementsTest, error: engagementsError } = await supabase
      .from('need_engagements')
      .select('*')
      .limit(1);
      
    if (engagementsError) {
      console.error('❌ Error accessing need_engagements table:', engagementsError);
      if (engagementsError.code === 'PGRST204') {
        console.log('📝 need_engagements table does not exist - migration needed');
        return false;
      }
    } else {
      console.log('✅ need_engagements table accessible');
    }
    
    // Test 3: Check if need_anonymous_interest table exists
    console.log('3. Testing need_anonymous_interest table...');
    const { data: anonTest, error: anonError } = await supabase
      .from('need_anonymous_interest')
      .select('*')
      .limit(1);
      
    if (anonError) {
      console.error('❌ Error accessing need_anonymous_interest table:', anonError);
      if (anonError.code === 'PGRST204') {
        console.log('📝 need_anonymous_interest table does not exist - migration needed');
        return false;
      }
    } else {
      console.log('✅ need_anonymous_interest table accessible');
    }
    
    console.log('\n🎉 All tables exist! Creating test data...');
    
    // Create a test need if none exist
    const { data: existingNeeds, error: checkError } = await supabase
      .from('needs')
      .select('id')
      .limit(1);
      
    if (checkError) {
      console.error('❌ Error checking existing needs:', checkError);
      return false;
    }
    
    let testNeedId;
    
    if (!existingNeeds || existingNeeds.length === 0) {
      console.log('📝 Creating test need...');
      const { data: newNeed, error: createError } = await supabase
        .from('needs')
        .insert({
          title: 'Test Need for Engagement System',
          summary: 'Testing the collective demand visualization feature',
          body: 'This is a test need to verify the engagement system works correctly.',
          threshold_pledge: 5,
          location: 'テスト地域',
          category: 'IT・技術'
        })
        .select('id')
        .single();
        
      if (createError) {
        console.error('❌ Error creating test need:', createError);
        return false;
      }
      
      testNeedId = newNeed.id;
      console.log('✅ Test need created with ID:', testNeedId);
    } else {
      testNeedId = existingNeeds[0].id;
      console.log('✅ Using existing need with ID:', testNeedId);
    }
    
    // Test anonymous interest insertion
    console.log('4. Testing anonymous interest insertion...');
    const testAnonKey = 'test-anon-key-' + Date.now();
    const { data: anonInsert, error: anonInsertError } = await supabase
      .from('need_anonymous_interest')
      .insert({
        need_id: testNeedId,
        anon_key: testAnonKey,
        day: new Date().toISOString().split('T')[0]
      })
      .select();
      
    if (anonInsertError) {
      console.error('❌ Error inserting anonymous interest:', anonInsertError);
      return false;
    } else {
      console.log('✅ Anonymous interest inserted successfully');
    }
    
    console.log('\n🎯 Schema Test Results:');
    console.log('=====================');
    console.log('✅ needs.threshold_pledge column: EXISTS');
    console.log('✅ need_engagements table: EXISTS');
    console.log('✅ need_anonymous_interest table: EXISTS');
    console.log('✅ Data insertion: WORKS');
    console.log('✅ Test need ID:', testNeedId);
    
    return { success: true, testNeedId };
    
  } catch (error) {
    console.error('💥 Schema test failed:', error);
    return false;
  }
}

async function main() {
  const result = await testSchema();
  
  if (result && result.success) {
    console.log('\n🚀 Ready to test engagement APIs!');
    console.log(`Test need ID: ${result.testNeedId}`);
    console.log('\nTest URLs:');
    console.log(`- GET http://localhost:3000/api/needs/${result.testNeedId}/engagement/summary`);
    console.log(`- POST http://localhost:3000/api/needs/${result.testNeedId}/engagement`);
    console.log(`- GET http://localhost:3000/api/needs/${result.testNeedId}/engagement/user`);
  } else {
    console.log('\n❌ Schema test failed. Migration required.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}