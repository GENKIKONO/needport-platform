import { djb2 } from './ab';
import type { ProposalPreview } from './types/b2b';

export function demoProposals(seed: string, n = 3): ProposalPreview[] {
  const base = djb2(seed) % 1000;
  const vendors = ['Alpha Works','Bravotech','Civic Lab','Delta Studio','Epsilon'];
  const list: ProposalPreview[] = [];
  
  for (let i = 0; i < n; i++) {
    const price = 150000 + ((base + i * 137) % 7) * 50000; // 15万〜45万
    const weeks = 2 + ((base + i * 73) % 6);               // 2〜7週
    list.push({
      id: `${seed}-${i}`,
      vendorName: vendors[(base + i) % vendors.length],
      priceJpy: price,
      durationWeeks: weeks,
      deliverables: ['要件定義','実装','検収'].slice(0, 2 + ((base + i) % 2)),
      riskNotes: ((base + i) % 3) ? undefined : '要件確定待ち',
      updatedAt: new Date(Date.now() - ((base + i) % 14) * 864e5).toISOString(),
    });
  }
  
  return list;
}
