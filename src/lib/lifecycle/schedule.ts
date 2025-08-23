import { createAdminClient } from '@/lib/supabase/admin';

export interface LifecycleNeed {
  id: string;
  title: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: string;
}

export async function getNeedsRequiringLifecycleReminders(): Promise<LifecycleNeed[]> {
  const supabase = createAdminClient();
  
  // 60日以上経過したアクティブなニーズを取得
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 60);
  
  const { data, error } = await supabase
    .from('needs')
    .select('id, title, created_by, created_at, updated_at, status')
    .eq('status', 'active')
    .lte('created_at', cutoffDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching lifecycle needs:', error);
    return [];
  }

  return data || [];
}

export async function getMonthlyReminderNeeds(): Promise<LifecycleNeed[]> {
  const supabase = createAdminClient();
  
  // 90日以上経過したニーズで、最後のリマインダーから30日以上経過
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  
  const { data, error } = await supabase
    .from('needs')
    .select('id, title, created_by, created_at, updated_at, status')
    .eq('status', 'active')
    .lte('created_at', cutoffDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching monthly reminder needs:', error);
    return [];
  }

  return data || [];
}
