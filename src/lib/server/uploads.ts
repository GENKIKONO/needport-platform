import { createClient } from '@/lib/supabase/server';

export interface UploadMeta {
  name: string;
  mime: string;
  size: number;
}

export async function createPendingUpload(ownerId: string, kind: 'need' | 'vendor', meta: UploadMeta) {
  // Supabase環境変数がない場合はダミー実装
  if (!process.env.SUPABASE_URL) {
    console.log('Upload create (no-supabase):', { ownerId, kind, meta });
    const fileKey = `no-supabase/${kind}/${ownerId}/${Date.now()}_${meta.name}`;
    return {
      id: 'no-supabase-upload-id',
      fileKey,
      previewUrl: URL.createObjectURL(new Blob([], { type: meta.mime })),
      mime: meta.mime,
      size: meta.size
    };
  }

  // Supabase環境変数がない場合はダミー実装のみ
  console.log('Upload create (no-supabase):', { ownerId, kind, meta });
  const fileKey = `no-supabase/${kind}/${ownerId}/${Date.now()}_${meta.name}`;
  return {
    id: 'no-supabase-upload-id',
    fileKey,
    previewUrl: URL.createObjectURL(new Blob([], { type: meta.mime })),
    mime: meta.mime,
    size: meta.size
  };
}
