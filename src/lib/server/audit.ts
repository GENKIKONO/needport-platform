import { supabaseServer } from '@/lib/server/supabase';

interface AuditLogData {
  action: string;
  need_id?: string;
  ref_id?: string;
  meta?: Record<string, any>;
}

export async function logAction(data: AuditLogData): Promise<void> {
  try {
    const supabase = supabaseServer();
    
    await supabase
      .from('audit_logs')
      .insert({
        actor: 'admin', // Fixed for now, can be replaced with Clerk user ID later
        action: data.action,
        need_id: data.need_id,
        ref_id: data.ref_id,
        meta: data.meta ? JSON.stringify(data.meta) : null
      });
  } catch (error) {
    console.error('[audit] Failed to log action:', error);
    // Don't throw - audit logging should not break main functionality
  }
}

// Predefined audit actions
export const AUDIT_ACTIONS = {
  OFFER_ADD: 'offer.add',
  OFFER_EDIT: 'offer.edit',
  OFFER_DELETE: 'offer.delete',
  OFFER_ADOPT: 'offer.adopt',
  OFFER_UNADOPT: 'offer.unadopt',
  STATUS_CHANGE: 'status.change',
  SETTINGS_SAVE: 'settings.save',
  NEED_CREATE: 'need.create',
  NEED_UPDATE: 'need.update',
  NEED_DELETE: 'need.delete',
  ATTACHMENT_UPLOAD: 'attachment.upload',
  ATTACHMENT_DELETE: 'attachment.delete',
  NOTE_ADD: 'note.add',
  IMPORT_CSV: 'import.csv'
} as const;
