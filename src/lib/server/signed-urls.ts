import crypto from 'crypto';

const SECRET_KEY = process.env.LIFECYCLE_URL_SECRET || 'default-secret-key';
const EXPIRY_HOURS = 72; // 3 days

export interface SignedUrlPayload {
  action: 'continue' | 'close';
  needId: string;
  userId: string;
  exp: number;
}

export interface VerificationResult {
  valid: boolean;
  userId?: string;
  needId?: string;
  action?: string;
  error?: string;
}

/**
 * Generate a signed URL token for lifecycle actions
 */
export function generateSignedUrl(
  action: 'continue' | 'close',
  needId: string,
  userId: string
): string {
  const exp = Date.now() + (EXPIRY_HOURS * 60 * 60 * 1000);
  
  const payload: SignedUrlPayload = {
    action,
    needId,
    userId,
    exp,
  };

  const payloadString = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadString).toString('base64url');
  
  // Create HMAC signature
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(payloadBase64);
  const signature = hmac.digest('base64url');
  
  return `${payloadBase64}.${signature}`;
}

/**
 * Verify a signed URL token
 */
export async function verifySignedUrl(
  token: string,
  expectedAction: 'continue' | 'close',
  expectedNeedId: string
): Promise<VerificationResult> {
  try {
    const [payloadBase64, signature] = token.split('.');
    
    if (!payloadBase64 || !signature) {
      return { valid: false, error: 'Invalid token format' };
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(payloadBase64);
    const expectedSignature = hmac.digest('base64url');
    
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' };
    }

    // Decode payload
    const payloadString = Buffer.from(payloadBase64, 'base64url').toString();
    const payload: SignedUrlPayload = JSON.parse(payloadString);

    // Check expiry
    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Token expired' };
    }

    // Check action and needId
    if (payload.action !== expectedAction) {
      return { valid: false, error: 'Invalid action' };
    }

    if (payload.needId !== expectedNeedId) {
      return { valid: false, error: 'Invalid need ID' };
    }

    return {
      valid: true,
      userId: payload.userId,
      needId: payload.needId,
      action: payload.action,
    };

  } catch (error) {
    console.error('Error verifying signed URL:', error);
    return { valid: false, error: 'Verification failed' };
  }
}
