import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/types/database';

type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

interface EnsureProfileParams {
  id: string;
  email?: string | null;
  name?: string | null;
}

/**
 * ユーザーのプロフィールを確保する（存在しない場合は作成）
 * @param params - Clerkユーザー情報
 * @returns プロフィールのID
 */
export async function ensureProfile(params: EnsureProfileParams): Promise<string> {
  const supabase = createAdminClient();
  
  if (!supabase) {
    throw new Error('Supabase admin client is not available');
  }

  const { id, email, name } = params;

  try {
    // まずclerk_user_idで既存のプロフィールを検索
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116は「レコードが見つからない」エラー以外はエラーとして扱う
      throw new Error(`プロフィール検索エラー: ${fetchError.message}`);
    }

    if (existingProfile) {
      return existingProfile.id;
    }

    // プロフィールが存在しない場合は新規作成
    const profileData: ProfileInsert = {
      clerk_user_id: id,
      email: email || null,
      full_name: name || '',
      role: 'user'
    };

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select('id')
      .single();

    if (insertError) {
      // 競合状態で同時に挿入された場合は、再度取得を試行
      if (insertError.code === '23505') { // unique constraint violation
        const { data: retryProfile, error: retryError } = await supabase
          .from('profiles')
          .select('id')
          .eq('clerk_user_id', id)
          .single();

        if (retryError || !retryProfile) {
          throw new Error(`プロフィール再取得エラー: ${retryError?.message || 'プロフィールが見つかりません'}`);
        }

        return retryProfile.id;
      }

      throw new Error(`プロフィール作成エラー: ${insertError.message}`);
    }

    if (!newProfile) {
      throw new Error('プロフィールの作成に失敗しました');
    }

    return newProfile.id;

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('プロフィール確保処理で予期しないエラーが発生しました');
  }
}