import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { demoProposals } from './b2b-demo';

describe('demoProposals', () => {
  it('generates correct number of proposals', () => {
    const proposals = demoProposals('test-seed', 3);
    assert.strictEqual(proposals.length, 3);
  });

  it('generates proposals with valid price range', () => {
    const proposals = demoProposals('test-seed', 5);
    proposals.forEach(proposal => {
      assert.ok(proposal.priceJpy >= 150000, `Price should be >= 150000, got ${proposal.priceJpy}`);
      assert.ok(proposal.priceJpy <= 450000, `Price should be <= 450000, got ${proposal.priceJpy}`);
    });
  });

  it('generates proposals with valid duration range', () => {
    const proposals = demoProposals('test-seed', 5);
    proposals.forEach(proposal => {
      assert.ok(proposal.durationWeeks >= 2, `Duration should be >= 2, got ${proposal.durationWeeks}`);
      assert.ok(proposal.durationWeeks <= 7, `Duration should be <= 7, got ${proposal.durationWeeks}`);
    });
  });

  it('generates deterministic results for same seed', () => {
    const proposals1 = demoProposals('deterministic-seed', 3);
    const proposals2 = demoProposals('deterministic-seed', 3);
    
    assert.strictEqual(proposals1.length, proposals2.length);
    proposals1.forEach((proposal, index) => {
      assert.strictEqual(proposal.id, proposals2[index].id);
      assert.strictEqual(proposal.priceJpy, proposals2[index].priceJpy);
      assert.strictEqual(proposal.durationWeeks, proposals2[index].durationWeeks);
    });
  });

  it('generates different results for different seeds', () => {
    const proposals1 = demoProposals('seed1', 3);
    const proposals2 = demoProposals('seed2', 3);
    
    // At least one proposal should be different
    const prices1 = proposals1.map(p => p.priceJpy);
    const prices2 = proposals2.map(p => p.priceJpy);
    assert.notStrictEqual(prices1.join(','), prices2.join(','));
  });

  it('includes all required fields', () => {
    const proposals = demoProposals('test-seed', 1);
    const proposal = proposals[0];
    
    assert.strictEqual(typeof proposal.id, 'string');
    assert.strictEqual(typeof proposal.vendorName, 'string');
    assert.strictEqual(typeof proposal.priceJpy, 'number');
    assert.strictEqual(typeof proposal.durationWeeks, 'number');
    assert.ok(Array.isArray(proposal.deliverables));
    assert.ok(proposal.deliverables.length > 0);
  });
});
