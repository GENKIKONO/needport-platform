import { createAdminClient } from "@/lib/supabase/admin";
import { FF_NOTIFICATIONS } from "@/lib/flags";

export type NotificationKind = 
  | 'prejoin.created'
  | 'offer.added'
  | 'offer.updated'
  | 'offer.deleted'
  | 'offer.adopted'
  | 'offer.unadopted'
  | 'need.threshold_reached';

export async function enqueueAndMaybeSend(
  kind: NotificationKind,
  needId: string,
  refId?: string
): Promise<void> {
  try {
    const admin = createAdminClient();
    
    // Insert notification (on conflict do nothing due to unique constraint)
    const { error } = await admin
      .from("entry_notifications")
      .insert({
        kind,
        need_id: needId,
        ref_id: refId || needId,
        status: 'queued',
      })
      .select()
      .single();

    if (error && error.code !== '23505') { // Ignore unique constraint violations
      console.error(`Failed to enqueue notification ${kind}:`, error);
      return;
    }

    // If notifications are enabled, try to dispatch immediately
    if (FF_NOTIFICATIONS) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/notifications/dispatch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.error(`Failed to dispatch notification ${kind}:`, await response.text());
        }
      } catch (dispatchError) {
        console.error(`Error dispatching notification ${kind}:`, dispatchError);
      }
    }
  } catch (error) {
    console.error(`Error in enqueueAndMaybeSend for ${kind}:`, error);
  }
}
