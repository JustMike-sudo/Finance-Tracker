import { describe, it, expect } from 'vitest';
import { getDaysInMonth, getMonthKey, isLastDayOfMonth, getMonthName } from './dateUtils';

describe('dateUtils', () => {
  it('knows days in a month, including leap years', () => {
    expect(getDaysInMonth(2026, 1)).toBe(28);
    expect(getDaysInMonth(2028, 1)).toBe(29);
    expect(getDaysInMonth(2026, 9)).toBe(31);
  });
  it('builds a zero-padded month key', () => {
    expect(getMonthKey(new Date(2026, 0, 15))).toBe('2026-01');
    expect(getMonthKey(new Date(2026, 11, 31))).toBe('2026-12');
  });
  it('detects the last day of the month', () => {
    expect(isLastDayOfMonth(new Date(2026, 9, 31))).toBe(true);
    expect(isLastDayOfMonth(new Date(2026, 9, 30))).toBe(false);
  });
  it('formats a month name', () => expect(getMonthName('2026-10')).toBe('October 2026'));
});
