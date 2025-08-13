import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';

export interface ClerkWebhookConfig {
  isConfigured: boolean;
  secret?: string;
}

export function getClerkWebhookConfig(): ClerkWebhookConfig {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  return {
    isConfigured: !!secret,
    secret,
  };
}

export async function verifyClerkWebhook(req: Request): Promise<WebhookEvent | null> {
  const config = getClerkWebhookConfig();
  
  if (!config.isConfigured) {
    return null;
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return null;
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(config.secret!);

  try {
    // Verify the payload with the headers
    const evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    
    return evt;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return null;
  }
}
