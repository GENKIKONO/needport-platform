import { createClient } from '@/lib/supabase/server';
import { VendorInput } from '@/lib/validation/vendor';

export interface VendorPublic {
  id: string;
  companyName: string;
  kana?: string;
  prefecture?: string;
  website?: string;
  representative?: string;
  description?: string;
  capabilities: Array<{ title: string; detail?: string }>;
  createdAt: string;
}

export async function createVendor(input: VendorInput, ownerId: string) {
  // Supabase環境変数がない場合はダミー実装
  if (!process.env.SUPABASE_URL) {
    console.log('Vendor create (no-supabase):', { input, ownerId });
    return {
      vendor: {
        id: 'no-supabase-vendor-id',
        companyName: input.companyName,
        kana: input.companyKana,
        prefecture: input.prefecture,
        website: input.website,
        representative: input.representative,
        description: input.description,
        capabilities: input.capabilities,
        createdAt: new Date().toISOString()
      },
      reviewId: 'no-supabase-review-id',
      status: 'pending' as const
    };
  }

  // Supabase環境変数がない場合はダミー実装のみ
  console.log('Vendor create (no-supabase):', { input, ownerId });
  return {
    vendor: {
      id: 'no-supabase-vendor-id',
      companyName: input.companyName,
      kana: input.companyKana,
      prefecture: input.prefecture,
      website: input.website,
      representative: input.representative,
      description: input.description,
      capabilities: input.capabilities,
      createdAt: new Date().toISOString()
    },
    reviewId: 'no-supabase-review-id',
    status: 'pending' as const
  };
}

export async function getVendor(id: string): Promise<VendorPublic | null> {
  // Supabase環境変数がない場合はダミー実装
  if (!process.env.SUPABASE_URL) {
    console.log('Vendor get (no-supabase):', { id });
    return null;
  }

  // Supabase環境変数がない場合はダミー実装のみ
  console.log('Vendor get (no-supabase):', { id });
  return null;
}
