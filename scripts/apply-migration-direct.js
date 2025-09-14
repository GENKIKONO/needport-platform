// scripts/apply-migration-direct.js
// Direct PostgreSQL connection to apply migration

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Parse Supabase URL to get connection details
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Extract connection details from Supabase URL
// https://chmtfxaebzbejvbnvird.supabase.co -> host: db.chmtfxaebzbejvbnvird.supabase.co
const urlParts = new URL(supabaseUrl);
const projectRef = urlParts.hostname.split('.')[0];

const connectionConfig = {
  host: `db.${projectRef}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: supabaseServiceKey, // Service role key can be used as password
  ssl: { rejectUnauthorized: false }
};

async function applyMigration() {
  const client = new Client(connectionConfig);
  
  try {
    console.log('🚀 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '002-collective-demand.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Executing migration...');
    console.log('='.repeat(50));
    console.log(migrationSQL);
    console.log('='.repeat(50));
    
    // Execute the complete migration
    const result = await client.query(migrationSQL);
    console.log('✅ Migration executed successfully');
    
    // Test the new schema
    console.log('🔍 Testing new schema...');
    
    // Test threshold_pledge column
    const needsTest = await client.query('SELECT id, title, threshold_pledge FROM needs LIMIT 1');
    console.log('✅ needs.threshold_pledge column accessible');
    
    // Test new tables
    const engagementsTest = await client.query('SELECT COUNT(*) FROM need_engagements');
    console.log('✅ need_engagements table accessible');
    
    const anonTest = await client.query('SELECT COUNT(*) FROM need_anonymous_interest');
    console.log('✅ need_anonymous_interest table accessible');
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    
    if (error.message.includes('already exists')) {
      console.log('✅ Migration already applied (some objects already exist)');
    } else if (error.message.includes('authentication failed')) {
      console.log('❌ Authentication failed. Using service role key as password...');
      console.log('🔧 Alternative: Apply migration manually via Supabase Dashboard');
    } else {
      throw error;
    }
  } finally {
    await client.end();
  }
}

async function fallbackToManualInstructions() {
  console.log('\n📋 MANUAL MIGRATION REQUIRED');
  console.log('=============================');
  console.log('Please apply the migration manually:');
  console.log('');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Navigate to SQL Editor');
  console.log('4. Copy and paste the following SQL:');
  console.log('');
  
  const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '002-collective-demand.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  console.log('='.repeat(60));
  console.log(migrationSQL);
  console.log('='.repeat(60));
  console.log('');
  console.log('5. Click "Run" to execute the migration');
  console.log('6. Run the test script again: npm run test:schema');
}

async function main() {
  console.log('🎯 NeedPort Collective Demand Migration');
  console.log('=======================================');
  
  try {
    await applyMigration();
  } catch (error) {
    console.error('Migration via direct connection failed:', error.message);
    await fallbackToManualInstructions();
  }
}

if (require.main === module) {
  main().catch(console.error);
}