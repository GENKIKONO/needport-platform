// scripts/apply-migration.js
// Script to apply the collective demand migration to Supabase

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create admin client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('🚀 Starting collective demand migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '002-collective-demand.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL into individual statements (roughly)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          // Continue with other statements unless it's a critical error
          if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
            console.log(`✅ Statement ${i + 1} already applied, continuing...`);
          } else {
            throw error;
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    
    // Test the new schema by querying the new columns
    console.log('🔍 Testing new schema...');
    
    const { data: needsSample, error: needsError } = await supabase
      .from('needs')
      .select('id, title, threshold_pledge')
      .limit(1);
      
    if (needsError) {
      console.error('❌ Error testing needs table:', needsError);
    } else {
      console.log('✅ needs.threshold_pledge column accessible');
    }
    
    const { data: engagements, error: engagementsError } = await supabase
      .from('need_engagements')
      .select('*')
      .limit(0);
      
    if (engagementsError) {
      console.error('❌ Error testing need_engagements table:', engagementsError);
    } else {
      console.log('✅ need_engagements table accessible');
    }
    
    const { data: anonInterest, error: anonError } = await supabase
      .from('need_anonymous_interest')
      .select('*')
      .limit(0);
      
    if (anonError) {
      console.error('❌ Error testing need_anonymous_interest table:', anonError);
    } else {
      console.log('✅ need_anonymous_interest table accessible');
    }
    
    console.log('✨ Schema validation completed!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Check if we can use rpc for raw SQL
async function checkRpcAvailability() {
  console.log('🔍 Checking RPC function availability...');
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: 'SELECT 1' });
    
    if (error) {
      console.log('⚠️  exec_sql RPC not available, trying alternative approach...');
      return false;
    } else {
      console.log('✅ exec_sql RPC is available');
      return true;
    }
  } catch (err) {
    console.log('⚠️  RPC not available, trying alternative approach...');
    return false;
  }
}

async function manualMigration() {
  console.log('🔧 Applying migration manually...');
  
  try {
    // 1. Add threshold_pledge column to needs table
    console.log('1. Adding threshold_pledge column...');
    const { error: alterError } = await supabase
      .from('needs')
      .select('threshold_pledge')
      .limit(1);
      
    if (alterError && alterError.code === 'PGRST204') {
      console.log('⚠️  threshold_pledge column missing - this requires direct SQL access');
      console.log('🔗 Please apply the migration manually via Supabase Dashboard:');
      console.log('   1. Go to https://supabase.com/dashboard');
      console.log('   2. Navigate to SQL Editor');
      console.log('   3. Copy and paste the contents of database/migrations/002-collective-demand.sql');
      console.log('   4. Execute the migration');
      return false;
    } else {
      console.log('✅ threshold_pledge column already exists');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Manual migration check failed:', error);
    return false;
  }
}

async function main() {
  console.log('🎯 NeedPort Collective Demand Migration');
  console.log('=====================================');
  
  const rpcAvailable = await checkRpcAvailability();
  
  if (rpcAvailable) {
    await applyMigration();
  } else {
    const success = await manualMigration();
    if (!success) {
      console.log('\n📋 Manual Migration Required:');
      console.log('Copy the following SQL to Supabase Dashboard SQL Editor:');
      console.log('='.repeat(50));
      
      const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '002-collective-demand.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      console.log(migrationSQL);
      console.log('='.repeat(50));
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}