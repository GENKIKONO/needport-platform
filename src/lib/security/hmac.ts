import { createHmac, timingSafeEqual } from 'crypto';

export function sign(payload: string, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

interface VerifyOptions {
  payload: string;
  signature: string;
  secret: string;
  toleranceSec?: number;
  timestampHeader?: string;
}

export function verify({
  payload,
  signature,
  secret,
  toleranceSec = 300,
  timestampHeader = 'x-needport-timestamp'
}: VerifyOptions): boolean {
  try {
    // Parse signature format: "t=<unix>,v1=<hex>"
    const signatureParts = signature.split(',');
    const timestampPart = signatureParts.find(part => part.startsWith('t='));
    const signaturePart = signatureParts.find(part => part.startsWith('v1='));
    
    if (!timestampPart || !signaturePart) {
      return false;
    }
    
    const timestamp = parseInt(timestampPart.substring(2));
    const expectedSignature = signaturePart.substring(3);
    
    // Check timestamp tolerance
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > toleranceSec) {
      return false;
    }
    
    // Verify signature
    const expectedPayload = `${timestamp}.${payload}`;
    const computedSignature = sign(expectedPayload, secret);
    
    // Use timing-safe comparison to prevent timing attacks
    return timingSafeEqual(
      Buffer.from(computedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

export function createSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const expectedPayload = `${timestamp}.${payload}`;
  const signature = sign(expectedPayload, secret);
  return `t=${timestamp},v1=${signature}`;
}
