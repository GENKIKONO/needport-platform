import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { djb2, demoEndorseCount, variant } from './ab';

const makeStore = () => {
  const m = new Map<string,string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => { m.set(k, v); }
  };
};

describe('variant() with DI storage', () => {
  it('returns deterministic variant for same key with injected storage', () => {
    const s = makeStore();
    const v1 = variant('x', ['A','B'], s);
    const v2 = variant('x', ['A','B'], s);
    assert.strictEqual(v1, v2);
  });

  it('isolates variants by key', () => {
    const s = makeStore();
    const a = variant('a', ['A','B'], s);
    const b = variant('b', ['A','B'], s);
    assert.ok(a === 'A' || a === 'B');
    assert.ok(b === 'A' || b === 'B');
    // より堅牢な独立性チェック：複数回実行して確率的に検証
    const results = [];
    for (let i = 0; i < 10; i++) {
      const testStore = makeStore();
      const x = variant(`key${i}`, ['A','B'], testStore);
      results.push(x);
    }
    // 少なくとも2つの異なる値があることを確認
    const uniqueResults = new Set(results);
    assert.ok(uniqueResults.size >= 2, `Expected at least 2 unique variants, got ${uniqueResults.size}`);
  });

  it('SSR (no window, no storage) falls back to first choice', () => {
    const v = variant('server-only');
    assert.strictEqual(v, 'A');
  });

  it('uses custom choices with injected storage', () => {
    const s = makeStore();
    const result = variant('custom', ['X', 'Y', 'Z'], s);
    assert.ok(['X', 'Y', 'Z'].includes(result));
  });

  it('persists variant in injected storage', () => {
    const s = makeStore();
    const result1 = variant('persist-test', ['A','B'], s);
    assert.ok(/^[AB]$/.test(result1));
    // 同じストレージで再呼び出し
    const result2 = variant('persist-test', ['A','B'], s);
    assert.strictEqual(result1, result2);
  });
});

describe('djb2 & demoEndorseCount', () => {
  it('djb2 is stable', () => {
    const h1 = djb2('abc');
    const h2 = djb2('abc');
    assert.strictEqual(h1, h2);
  });

  it('djb2 returns different hashes for different inputs', () => {
    const h1 = djb2('test1');
    const h2 = djb2('test2');
    assert.notStrictEqual(h1, h2);
  });

  it('djb2 handles empty string', () => {
    const hash = djb2('');
    assert.strictEqual(typeof hash, 'number');
    assert.ok(hash > 0);
  });

  it('djb2 handles special characters', () => {
    const hash = djb2('test@#$%^&*()');
    assert.strictEqual(typeof hash, 'number');
    assert.ok(hash > 0);
  });

  it('demoEndorseCount is deterministic and 3..9', () => {
    const n1 = demoEndorseCount('seed');
    const n2 = demoEndorseCount('seed');
    assert.strictEqual(n1, n2);
    assert.ok(n1 >= 3 && n1 <= 9);
  });

  it('demoEndorseCount returns values between 3 and 9', () => {
    for (let i = 0; i < 100; i++) {
      const count = demoEndorseCount(`seed-${i}`);
      assert.ok(count >= 3);
      assert.ok(count <= 9);
    }
  });

  it('demoEndorseCount returns different results for different seeds', () => {
    const count1 = demoEndorseCount('seed1');
    const count2 = demoEndorseCount('seed2');
    assert.notStrictEqual(count1, count2);
  });

  it('demoEndorseCount handles empty seed', () => {
    const count = demoEndorseCount('');
    assert.ok(count >= 3);
    assert.ok(count <= 9);
  });
});
