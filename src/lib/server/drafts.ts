import { createClient } from '@/lib/supabase/server';

export async function upsertDraft(kind: 'need' | 'vendor', ownerId: string, payload: unknown) {
  // Supabase環境変数がない場合はダミー実装
  if (!process.env.SUPABASE_URL) {
    console.log('Draft save (no-supabase):', { kind, ownerId, payloadSize: JSON.stringify(payload).length });
    return {
      id: 'no-supabase-draft-id',
      kind,
      owner_id: ownerId,
      payload,
      updated_at: new Date().toISOString()
    };
  }

  // Supabase環境変数がない場合はダミー実装のみ
  console.log('Draft save (no-supabase):', { kind, ownerId, payloadSize: JSON.stringify(payload).length });
  return {
    id: 'no-supabase-draft-id',
    kind,
    owner_id: ownerId,
    payload,
    updated_at: new Date().toISOString()
  };
}

export async function getDraft(kind: 'need' | 'vendor', ownerId: string) {
  // Supabase環境変数がない場合はダミー実装
  if (!process.env.SUPABASE_URL) {
    console.log('Draft get (no-supabase):', { kind, ownerId });
    return null;
  }

  // Supabase環境変数がない場合はダミー実装のみ
  console.log('Draft get (no-supabase):', { kind, ownerId });
  return null;
}

export async function deleteDraft(id: string, ownerId: string) {
  // Supabase環境変数がない場合はダミー実装
  if (!process.env.SUPABASE_URL) {
    console.log('Draft delete (no-supabase):', { id, ownerId });
    return;
  }

  // Supabase環境変数がない場合はダミー実装のみ
  console.log('Draft delete (no-supabase):', { id, ownerId });
}
