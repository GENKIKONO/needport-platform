export function formatJPY(amount: number): string {
  return new Intl.NumberFormat("ja-JP").format(amount) + " 円";
}

export function maskPII(text: string, shouldMask: boolean): string {
  if (!shouldMask) return text;
  
  // Simple email masking
  if (text.includes('@')) {
    const [local, domain] = text.split('@');
    const maskedLocal = local.length > 2 ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1] : local;
    return `${maskedLocal}@${domain}`;
  }
  
  // Phone number masking
  if (text.replace(/\D/g, '').length >= 10) {
    return text.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3');
  }
  
  return text;
}
