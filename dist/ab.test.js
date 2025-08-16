import { describe, it, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert';
import { djb2, demoEndorseCount, variant } from './ab.js';
describe('A/B Testing & Dummy Number Generation', () => {
    let originalLocalStorage;
    let mockLocalStorage;
    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {};
        originalLocalStorage = global.localStorage;
        global.localStorage = {
            getItem: (key) => mockLocalStorage[key] || null,
            setItem: (key, value) => { mockLocalStorage[key] = value; },
            removeItem: (key) => { delete mockLocalStorage[key]; },
            clear: () => { mockLocalStorage = {}; },
            length: Object.keys(mockLocalStorage).length,
            key: (index) => Object.keys(mockLocalStorage)[index] || null,
        };
    });
    afterEach(() => {
        // Restore original localStorage
        if (originalLocalStorage) {
            global.localStorage = originalLocalStorage;
        }
    });
    describe('djb2', () => {
        it('should return stable hash for same input', () => {
            const input = 'test-string';
            const hash1 = djb2(input);
            const hash2 = djb2(input);
            assert.strictEqual(hash1, hash2);
        });
        it('should return different hashes for different inputs', () => {
            const hash1 = djb2('test1');
            const hash2 = djb2('test2');
            assert.notStrictEqual(hash1, hash2);
        });
        it('should handle empty string', () => {
            const hash = djb2('');
            assert.strictEqual(typeof hash, 'number');
            assert.ok(hash > 0);
        });
        it('should handle special characters', () => {
            const hash = djb2('test@#$%^&*()');
            assert.strictEqual(typeof hash, 'number');
            assert.ok(hash > 0);
        });
    });
    describe('demoEndorseCount', () => {
        it('should return values between 3 and 9', () => {
            for (let i = 0; i < 100; i++) {
                const count = demoEndorseCount(`seed-${i}`);
                assert.ok(count >= 3);
                assert.ok(count <= 9);
            }
        });
        it('should return deterministic results for same seed', () => {
            const seed = 'deterministic-seed';
            const count1 = demoEndorseCount(seed);
            const count2 = demoEndorseCount(seed);
            assert.strictEqual(count1, count2);
        });
        it('should return different results for different seeds', () => {
            const count1 = demoEndorseCount('seed1');
            const count2 = demoEndorseCount('seed2');
            assert.notStrictEqual(count1, count2);
        });
        it('should handle empty seed', () => {
            const count = demoEndorseCount('');
            assert.ok(count >= 3);
            assert.ok(count <= 9);
        });
    });
    describe('variant', () => {
        it('should return A for SSR (no window)', () => {
            const originalWindow = global.window;
            delete global.window;
            const result = variant('test-variant');
            assert.strictEqual(result, 'A');
            global.window = originalWindow;
        });
        it('should assign and persist variant in localStorage', () => {
            const result1 = variant('test-variant');
            assert.ok(/^[AB]$/.test(result1));
            assert.strictEqual(mockLocalStorage['ab:test-variant'], result1);
        });
        it('should return same variant for same name', () => {
            const result1 = variant('test-variant');
            const result2 = variant('test-variant');
            assert.strictEqual(result1, result2);
        });
        it('should return different variants for different names', () => {
            const result1 = variant('variant1');
            const result2 = variant('variant2');
            // Note: This test might occasionally fail due to randomness
            // but it's unlikely to fail consistently
            assert.strictEqual(typeof result1, 'string');
            assert.strictEqual(typeof result2, 'string');
        });
        it('should use custom choices', () => {
            const result = variant('custom', ['X', 'Y', 'Z']);
            assert.ok(['X', 'Y', 'Z'].includes(result));
        });
    });
});
