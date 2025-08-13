// Need scale domain types & helpers
export type NeedScale = 'personal' | 'community';

export const SCALE_LABEL: Record<NeedScale, string> = {
  personal: 'わたしごと',
  community: 'みんなごと',
};

export function isCommunity(scale?: string | null): boolean {
  return (scale ?? '') === 'community';
}

export function parseScale(input: any): NeedScale {
  return input === 'community' ? 'community' : 'personal';
}

export function mainCtaLabel(scale: NeedScale): string {
  return scale === 'community' ? '顧客になりたい' : '購入したい';
}

// Backward-compat alias
export const toScaleLabel = (s: NeedScale) => SCALE_LABEL[s];
