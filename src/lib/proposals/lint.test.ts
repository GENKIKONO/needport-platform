import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { lintProposal } from './lint.js';

describe('lintProposal', () => {
  it('detects email addresses', () => {
    const issues = lintProposal({
      vendorName: 'Test Vendor',
      deliverables: ['test@example.com'],
      riskNotes: '',
      terms: ''
    });
    
    assert.strictEqual(issues.length, 1);
    assert.strictEqual(issues[0].id, 'contact-email');
    assert.strictEqual(issues[0].severity, 'error');
    assert.strictEqual(issues[0].match, 'test@example.com');
  });

  it('detects phone numbers', () => {
    const issues = lintProposal({
      vendorName: 'Test Vendor',
      deliverables: ['Call me at 090-1234-5678'],
      riskNotes: '',
      terms: ''
    });
    
    assert.strictEqual(issues.length, 1);
    assert.strictEqual(issues[0].id, 'contact-phone');
    assert.strictEqual(issues[0].severity, 'error');
  });

  it('detects external links as warning', () => {
    const issues = lintProposal({
      vendorName: 'Test Vendor',
      deliverables: ['Check our website at https://example.com'],
      riskNotes: '',
      terms: ''
    });
    
    assert.strictEqual(issues.length, 1);
    assert.strictEqual(issues[0].id, 'external-link');
    assert.strictEqual(issues[0].severity, 'warn');
  });

  it('requires at least one deliverable', () => {
    const issues = lintProposal({
      vendorName: 'Test Vendor',
      deliverables: [],
      riskNotes: '',
      terms: ''
    });
    
    assert.strictEqual(issues.length, 1);
    assert.strictEqual(issues[0].id, 'no-deliverables');
    assert.strictEqual(issues[0].severity, 'error');
  });

  it('detects multiple issues simultaneously', () => {
    const issues = lintProposal({
      vendorName: 'Test Vendor',
      deliverables: ['test@example.com', 'Call 090-1234-5678'],
      riskNotes: 'Visit https://example.com',
      terms: ''
    });
    
    assert.strictEqual(issues.length, 3);
    const ids = issues.map(i => i.id).sort();
    assert.deepStrictEqual(ids, ['contact-email', 'contact-phone', 'external-link']);
  });

  it('passes validation with clean content', () => {
    const issues = lintProposal({
      vendorName: 'Test Vendor',
      deliverables: ['要件定義書', '実装', 'テスト'],
      riskNotes: '技術的なリスクがあります',
      terms: '支払い条件について'
    });
    
    assert.strictEqual(issues.length, 0);
  });
});
