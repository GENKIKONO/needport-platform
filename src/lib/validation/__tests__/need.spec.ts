import { describe, it, expect } from 'vitest';
import { NeedInput, stripPII } from '../need';

describe('NeedInput validation', () => {
  it('should validate valid need input', () => {
    const validInput = {
      title: 'Test Need Title',
      summary: 'This is a test summary with sufficient length for validation',
      min_people: 10,
      price_amount: 500000,
      deadline: new Date().toISOString(),
      location: 'Tokyo',
      tags: ['test', 'development'],
      agree: true,
    };

    const result = NeedInput.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should reject invalid title (too short)', () => {
    const invalidInput = {
      title: 'ABC',
      summary: 'Valid summary',
      agree: true,
    };

    const result = NeedInput.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('title');
    }
  });

  it('should reject invalid title (too long)', () => {
    const invalidInput = {
      title: 'A'.repeat(81),
      summary: 'Valid summary',
      agree: true,
    };

    const result = NeedInput.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('title');
    }
  });

  it('should reject invalid summary (too short)', () => {
    const invalidInput = {
      title: 'Valid Title',
      summary: 'Short',
      agree: true,
    };

    const result = NeedInput.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('summary');
    }
  });

  it('should reject without agreement', () => {
    const invalidInput = {
      title: 'Valid Title',
      summary: 'Valid summary with sufficient length',
      agree: false,
    };

    const result = NeedInput.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('agree');
    }
  });

  it('should accept optional fields', () => {
    const minimalInput = {
      title: 'Valid Title',
      summary: 'Valid summary with sufficient length',
      agree: true,
    };

    const result = NeedInput.safeParse(minimalInput);
    expect(result.success).toBe(true);
  });
});

describe('stripPII function', () => {
  it('should remove email addresses', () => {
    const text = 'Contact me at test@example.com for more info';
    const result = stripPII(text);
    expect(result).toBe('Contact me at [EMAIL] for more info');
  });

  it('should remove phone numbers', () => {
    const text = 'Call me at 090-1234-5678 or 03-1234-5678';
    const result = stripPII(text);
    expect(result).toBe('Call me at [PHONE] or [PHONE]');
  });

  it('should handle multiple PII in same text', () => {
    const text = 'Email: test@example.com, Phone: 090-1234-5678';
    const result = stripPII(text);
    expect(result).toBe('Email: [EMAIL], Phone: [PHONE]');
  });

  it('should return original text if no PII found', () => {
    const text = 'This is a normal text without any personal information';
    const result = stripPII(text);
    expect(result).toBe(text);
  });

  it('should handle empty string', () => {
    const result = stripPII('');
    expect(result).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(stripPII(null as any)).toBe('');
    expect(stripPII(undefined as any)).toBe('');
  });
});
