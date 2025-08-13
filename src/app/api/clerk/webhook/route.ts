import { NextRequest } from 'next/server';
import { verifyClerkWebhook, getClerkWebhookConfig } from '@/lib/server/clerk';
import { upsertProfile, deleteProfile } from '@/lib/server/supabase';
import { 
  createNotConfiguredResponse, 
  createBadRequestResponse, 
  createInternalErrorResponse,
  createSuccessResponse 
} from '@/lib/server/response';

export async function POST(req: NextRequest) {
  const config = getClerkWebhookConfig();

  if (!config.isConfigured) {
    return createNotConfiguredResponse('Clerk webhook');
  }

  const evt = await verifyClerkWebhook(req);
  
  if (!evt) {
    return createBadRequestResponse('Invalid webhook signature');
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id } = evt.data;
    
    if (!id) {
      console.error('No user ID in user.created event');
      return createBadRequestResponse('No user ID in user.created event');
    }
    
    const result = await upsertProfile(id, {
      role: 'user', // Default role
    });

    if (result.error) {
      console.error('Error in user.created webhook:', result.error);
      return createInternalErrorResponse();
    }
  }

  if (eventType === 'user.updated') {
    const { id } = evt.data;
    
    if (!id) {
      console.error('No user ID in user.updated event');
      return createBadRequestResponse('No user ID in user.updated event');
    }
    
    const result = await upsertProfile(id, {
      updated_at: new Date().toISOString(),
    });

    if (result.error) {
      console.error('Error in user.updated webhook:', result.error);
      return createInternalErrorResponse();
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    if (!id) {
      console.error('No user ID in user.deleted event');
      return createBadRequestResponse('No user ID in user.deleted event');
    }
    
    const result = await deleteProfile(id);

    if (result.error) {
      console.error('Error in user.deleted webhook:', result.error);
      return createInternalErrorResponse();
    }
  }

  return createSuccessResponse({ message: 'Webhook processed successfully' });
}
