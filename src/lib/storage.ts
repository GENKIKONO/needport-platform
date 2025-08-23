import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export type FileKind = 'image' | 'doc';

const MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp'],
  doc: ['application/pdf']
} as const;

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export function validateFile(file: File, kind: FileKind): { valid: boolean; error?: string } {
  // サイズチェック
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'ファイルサイズは25MB以下にしてください' };
  }

  // MIMEタイプチェック
  if (!MIME_TYPES[kind].includes(file.type)) {
    return { valid: false, error: `${kind === 'image' ? '画像' : 'PDF'}ファイルを選択してください` };
  }

  return { valid: true };
}

export async function uploadFile(
  file: File, 
  kind: FileKind, 
  userId: string
): Promise<{ key: string; url: string }> {
  if (!supabase) {
    throw new Error('Supabaseが設定されていません');
  }

  const bucket = kind === 'image' ? 'public-attachments' : 'private-attachments';
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`アップロードに失敗しました: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return {
    key: fileName,
    url: urlData.publicUrl
  };
}

export async function deleteFile(key: string, kind: FileKind): Promise<void> {
  if (!supabase) {
    throw new Error('Supabaseが設定されていません');
  }

  const bucket = kind === 'image' ? 'public-attachments' : 'private-attachments';
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([key]);

  if (error) {
    throw new Error(`ファイル削除に失敗しました: ${error.message}`);
  }
}
