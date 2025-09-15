/**
 * Clerk User ID取得スクリプト
 * 本番環境のClerk APIから実際のユーザーIDを取得
 */

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  console.error('❌ CLERK_SECRET_KEY environment variable is required');
  console.log('Set it in your environment or run:');
  console.log('CLERK_SECRET_KEY=sk_live_... node scripts/production/get-clerk-user-ids.js');
  process.exit(1);
}

async function getClerkUserIds() {
  console.log('🔍 Fetching ALL Clerk users for production...\n');

  // First, get all users to see what exists
  try {
    console.log('📋 Fetching all users from Clerk...');
    
    const response = await fetch('https://api.clerk.com/v1/users?limit=100', {
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Clerk API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Clerk APIは直接配列を返す場合がある
    const users = Array.isArray(data) ? data : (data.data || []);
    
    console.log(`\n📊 Found ${users.length} total users in Clerk:\n`);
    
    const userIds = {};
    
    users.forEach((user, index) => {
      const email = user.email_addresses[0]?.email_address || 'No email';
      const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No name';
      
      console.log(`${index + 1}. User ID: ${user.id}`);
      console.log(`   Email: ${email}`);
      console.log(`   Name: ${name}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Status: ${user.banned ? 'Banned' : 'Active'}`);
      console.log('');
      
      userIds[email] = {
        id: user.id,
        name: name,
        email: email,
        created_at: user.created_at
      };
    });

    return userIds;
    
  } catch (error) {
    console.error('💥 Error fetching users:', error.message);
    return {};
  }

}

async function generateSQLForUsers() {
  const userIds = await getClerkUserIds();
  
  console.log('\n📝 Generated SQL for all users:\n');
  console.log('-- Copy and paste this into enable-auto-provisioning.sql');
  console.log('-- Replace the placeholder INSERT statements\n');

  Object.entries(userIds).forEach(([email, userData]) => {
    if (userData && userData.id) {
      const role = email.includes('genkikono.2615') ? 'admin' : 'user';
      
      console.log(`-- For ${email}:`);
      console.log(`INSERT INTO profiles (clerk_user_id, email, full_name, role, created_at, updated_at)`);
      console.log(`VALUES (`);
      console.log(`  '${userData.id}',`);
      console.log(`  '${userData.email}',`);
      console.log(`  '${userData.name}',`);
      console.log(`  '${role}',`);
      console.log(`  NOW(),`);
      console.log(`  NOW()`);
      console.log(`) ON CONFLICT (clerk_user_id) DO UPDATE SET`);
      console.log(`  email = EXCLUDED.email,`);
      console.log(`  full_name = EXCLUDED.full_name,`);
      console.log(`  updated_at = NOW();`);
      console.log('');
    }
  });

  console.log('\n📋 JSON Format for API integration:\n');
  console.log(JSON.stringify(userIds, null, 2));

  return userIds;
}

// Execute if run directly
if (require.main === module) {
  generateSQLForUsers().catch(console.error);
}

module.exports = { getClerkUserIds };