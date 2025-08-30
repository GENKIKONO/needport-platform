import { computeMatchingFee } from '@/lib/fees';

describe('computeMatchingFee', () => {
  it('card: 90,000 → 10%', () => {
    const r = computeMatchingFee({ quantity: 3, unitPrice: 30000, method: 'card' });
    expect(r.rate).toBe(0.10);
    expect(r.total).toBe(90000);
    expect(r.fee).toBeGreaterThan(0);
  });
  
  it('card: 120,000 → 9%', () => {
    const r = computeMatchingFee({ quantity: 4, unitPrice: 30000, method: 'card' });
    expect(r.rate).toBe(0.09);
  });
  
  it('bank: 600,000 → 7%', () => {
    const r = computeMatchingFee({ quantity: 12, unitPrice: 50000, method: 'bank' });
    expect(r.rate).toBe(0.07);
  });
  
  it('bank: 80,000 → 9%', () => {
    const r = computeMatchingFee({ quantity: 2, unitPrice: 40000, method: 'bank' });
    expect(r.rate).toBe(0.09);
  });
  
  it('card: 600,000 → 8%', () => {
    const r = computeMatchingFee({ quantity: 12, unitPrice: 50000, method: 'card' });
    expect(r.rate).toBe(0.08);
  });
  
  it('fee is rounded to 1000 yen unit', () => {
    const r = computeMatchingFee({ quantity: 1, unitPrice: 12345, method: 'card' });
    expect(r.fee % 1000).toBe(0);
  });
  
  it('stripe cost is calculated for card payments', () => {
    const r = computeMatchingFee({ quantity: 1, unitPrice: 10000, method: 'card' });
    expect(r.stripeCost).toBeGreaterThan(0);
  });
  
  it('stripe cost is 0 for bank transfers', () => {
    const r = computeMatchingFee({ quantity: 1, unitPrice: 10000, method: 'bank' });
    expect(r.stripeCost).toBe(0);
  });
  
  it('referral buffer is calculated', () => {
    const r = computeMatchingFee({ quantity: 1, unitPrice: 10000, method: 'card' });
    expect(r.referralBuf).toBeGreaterThan(0);
  });
});
