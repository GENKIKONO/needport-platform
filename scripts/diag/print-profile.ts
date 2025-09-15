import { createAdminClient } from '@/lib/supabase/admin';
import { ensureProfile } from '@/lib/ensureProfile';

/**
 * プロフィール表示ツール
 * 使用方法: npx tsx scripts/diag/print-profile.ts <clerk_user_id> [email] [name]
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: npx tsx scripts/diag/print-profile.ts <clerk_user_id> [email] [name]');
    console.error('Example: npx tsx scripts/diag/print-profile.ts user_123 test@example.com "Test User"');
    process.exit(1);
  }

  const [clerkUserId, email, name] = args;

  try {
    console.log('📋 Profile Diagnostic Tool');
    console.log('='.repeat(40));
    console.log(`Clerk User ID: ${clerkUserId}`);
    console.log(`Email: ${email || '(not provided)'}`);
    console.log(`Name: ${name || '(not provided)'}`);
    console.log('');

    // Supabase接続確認
    const supabase = createAdminClient();
    if (!supabase) {
      throw new Error('Supabase admin client is not available');
    }

    console.log('✅ Supabase admin client connected');

    // 既存のプロフィールを確認
    console.log('\n🔍 Checking existing profile...');
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Profile fetch error: ${fetchError.message}`);
    }

    if (existingProfile) {
      console.log('📄 Existing profile found:');
      console.log(JSON.stringify(existingProfile, null, 2));
    } else {
      console.log('❌ No existing profile found');
    }

    // ensureProfile テスト
    console.log('\n🔧 Testing ensureProfile...');
    const profileId = await ensureProfile({
      id: clerkUserId,
      email: email || null,
      name: name || null
    });

    console.log(`✅ Profile ensured with ID: ${profileId}`);

    // 最終結果を表示
    console.log('\n📊 Final profile state:');
    const { data: finalProfile, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (finalError) {
      throw new Error(`Final profile fetch error: ${finalError.message}`);
    }

    console.log(JSON.stringify(finalProfile, null, 2));

    console.log('\n🎉 Diagnostic completed successfully!');

  } catch (error) {
    console.error('\n💥 Error during diagnostic:', error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(console.error);
}