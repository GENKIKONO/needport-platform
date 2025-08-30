import { createClient } from '@/lib/supabase/server';

export interface VendorReview {
  id: string;
  vendorId: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
  vendor: {
    companyName: string;
    prefecture?: string;
    description?: string;
  };
}

export async function listVendorReviews(status?: 'pending' | 'approved' | 'rejected'): Promise<VendorReview[]> {
  // Supabase環境変数がない場合はダミー実装
  if (!process.env.SUPABASE_URL) {
    console.log('Reviews list (no-supabase):', { status });
    return [];
  }

  // Supabase環境変数がない場合はダミー実装のみ
  console.log('Reviews list (no-supabase):', { status });
  return [];
}

export async function approveVendor(reviewId: string, reviewerId: string) {
  // Supabase環境変数がない場合はダミー実装
  if (!process.env.SUPABASE_URL) {
    console.log('Vendor approve (no-supabase):', { reviewId, reviewerId });
    return;
  }

  // Supabase環境変数がない場合はダミー実装のみ
  console.log('Vendor approve (no-supabase):', { reviewId, reviewerId });
}

export async function rejectVendor(reviewId: string, reviewerId: string, note: string) {
  // Supabase環境変数がない場合はダミー実装
  if (!process.env.SUPABASE_URL) {
    console.log('Vendor reject (no-supabase):', { reviewId, reviewerId, note });
    return;
  }

  // Supabase環境変数がない場合はダミー実装のみ
  console.log('Vendor reject (no-supabase):', { reviewId, reviewerId, note });
}
