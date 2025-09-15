import { createAdminClient } from '@/lib/supabase/admin';
import { ensureProfile } from '@/lib/ensureProfile';

interface ClerkUser {
  id: string;
  email_addresses: Array<{
    email_address: string;
    id: string;
  }>;
  first_name: string | null;
  last_name: string | null;
}

interface ClerkApiResponse {
  data: ClerkUser[];
  total_count: number;
}

/**
 * Clerk API からユーザー一覧を取得
 */
async function fetchClerkUsers(limit = 100, offset = 0): Promise<ClerkApiResponse> {
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  
  if (!clerkSecretKey) {
    throw new Error('CLERK_SECRET_KEY environment variable is required');
  }

  const url = `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${clerkSecretKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Clerk API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * すべてのClerkユーザーを取得（ページング対応）
 */
async function fetchAllClerkUsers(): Promise<ClerkUser[]> {
  const users: ClerkUser[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    console.log(`Fetching users: offset=${offset}, limit=${limit}`);
    
    const response = await fetchClerkUsers(limit, offset);
    users.push(...response.data);
    
    console.log(`Fetched ${response.data.length} users (total: ${users.length}/${response.total_count})`);
    
    if (response.data.length < limit || users.length >= response.total_count) {
      break;
    }
    
    offset += limit;
  }

  return users;
}

/**
 * Clerkユーザーを処理してプロフィールを確保
 */
async function processUser(user: ClerkUser): Promise<{ success: boolean; action: 'created' | 'existing' | 'error'; error?: string }> {
  try {
    const email = user.email_addresses[0]?.email_address || null;
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || null;

    // 既存のプロフィールを確認
    const supabase = createAdminClient();
    if (!supabase) {
      throw new Error('Supabase admin client not available');
    }

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();

    if (existingProfile) {
      return { success: true, action: 'existing' };
    }

    // プロフィールを作成
    await ensureProfile({
      id: user.id,
      email,
      name
    });

    return { success: true, action: 'created' };

  } catch (error) {
    console.error(`Error processing user ${user.id}:`, error);
    return {
      success: false,
      action: 'error',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 Starting Clerk users backfill...');
  
  try {
    // Supabase接続確認
    const supabase = createAdminClient();
    if (!supabase) {
      throw new Error('Supabase admin client is not available. Check your environment variables.');
    }

    console.log('✅ Supabase admin client connected');

    // Clerkユーザー取得
    console.log('📥 Fetching Clerk users...');
    const users = await fetchAllClerkUsers();
    console.log(`📊 Total users to process: ${users.length}`);

    if (users.length === 0) {
      console.log('ℹ️ No users found in Clerk');
      return;
    }

    // 統計カウンター
    let createdCount = 0;
    let existingCount = 0;
    let errorCount = 0;

    // ユーザーを順次処理
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`\n[${i + 1}/${users.length}] Processing user: ${user.id}`);
      
      const result = await processUser(user);
      
      if (result.success) {
        if (result.action === 'created') {
          createdCount++;
          console.log(`  ✅ Profile created for ${user.email_addresses[0]?.email_address || user.id}`);
        } else {
          existingCount++;
          console.log(`  ↩️ Profile already exists for ${user.email_addresses[0]?.email_address || user.id}`);
        }
      } else {
        errorCount++;
        console.log(`  ❌ Error: ${result.error}`);
      }

      // 少し間隔を空けてAPI制限を回避
      if (i < users.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // 結果サマリー
    console.log('\n' + '='.repeat(50));
    console.log('📈 Backfill Summary:');
    console.log(`   Total users processed: ${users.length}`);
    console.log(`   ✅ Profiles created: ${createdCount}`);
    console.log(`   ↩️ Profiles existing: ${existingCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(50));

    if (errorCount > 0) {
      console.log('\n⚠️ Some users had errors. Check the logs above for details.');
      process.exit(1);
    } else {
      console.log('\n🎉 Backfill completed successfully!');
    }

  } catch (error) {
    console.error('\n💥 Fatal error during backfill:', error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(console.error);
}