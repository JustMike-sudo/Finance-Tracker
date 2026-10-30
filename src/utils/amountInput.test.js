import { describe, it, expect } from 'vitest';
import { appendKey, formatAmount } from './amountInput';

const type = (keys) => [...keys].reduce(appendKey, '');

describe('appendKey', () => {
  it('builds up digits', () => expect(type('125')).toBe('125'));
  it('turns a leading "." into "0." (was NaN)', () => expect(type('.5')).toBe('0.5'));
  it('ignores a second "."', () => expect(type('1.2.3')).toBe('1.23'));
  it('replaces a lone leading zero', () => {
    expect(type('05')).toBe('5');
    expect(type('00')).toBe('0');
  });
  it('keeps "0.x" decimals', () => expect(type('0.05')).toBe('0.05'));
  it('stops at two decimals', () => expect(type('1.234')).toBe('1.23'));
  it('stops at nine integer digits', () => expect(type('12345678901')).toBe('123456789'));
  it('ignores non-digit keys', () => expect(appendKey('5', 'x')).toBe('5'));
});

describe('formatAmount', () => {
  it('shows 0 when empty', () => expect(formatAmount('')).toBe('0'));
  it('adds thousands separators', () => expect(formatAmount('1234567')).toBe('1,234,567'));
  it('keeps a trailing dot and zeros so the display matches the typing', () => {
    expect(formatAmount('5.')).toBe('5.');
    expect(formatAmount('5.0')).toBe('5.0');
    expect(formatAmount('1234.50')).toBe('1,234.50');
  });
  it('formats a leading 0.', () => expect(formatAmount('0.')).toBe('0.'));
});
