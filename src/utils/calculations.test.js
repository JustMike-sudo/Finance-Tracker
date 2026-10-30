import { describe, it, expect } from 'vitest';
import {
  roundMoney, sumPillars, calcNetSavingsGoal, calcWeeklyThreshold, calcDailyAverage,
  calcProjection, calcVirtualBalance, calcWalletMismatch, calcPillarSpend, calcWeekSpend,
} from './calculations';

const setup = {
  totalCashInFlow: 10000,
  fixedCosts: 4000,
  pillars: { survival: 3000, optional: 1000, culture: 500, extra: 500 },
};
const tx = (amount, pillar = 'survival', day = 5) => ({ amount, pillar, timestamp: new Date(2026, 9, day, 12).toISOString() });

describe('roundMoney', () => {
  it('removes floating-point noise', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
    expect(roundMoney(1.005)).toBe(1.01);
  });
});

describe('budget maths', () => {
  it('sums pillars', () => expect(sumPillars(setup.pillars)).toBe(5000));
  it('sums to 0 when there are no pillars', () => expect(sumPillars()).toBe(0));
  it('computes the savings goal', () => expect(calcNetSavingsGoal(setup)).toBe(1000));
  it('lets the savings goal go negative when the plan overspends', () => {
    expect(calcNetSavingsGoal({ ...setup, fixedCosts: 6000 })).toBe(-1000);
  });
  it('computes the weekly threshold', () => expect(calcWeeklyThreshold(setup)).toBe(1250));
  it('handles a missing setup', () => {
    expect(calcNetSavingsGoal(null)).toBe(0);
    expect(calcWeeklyThreshold(null)).toBe(0);
    expect(calcVirtualBalance(null, [])).toBe(0);
  });
});

describe('run rate', () => {
  it('averages per day and projects the month', () => {
    expect(calcDailyAverage(300, 10)).toBe(30);
    expect(calcProjection(30, 31)).toBe(930);
  });
  it('does not divide by zero', () => expect(calcDailyAverage(300, 0)).toBe(0));
});

describe('balances', () => {
  const txs = [tx(0.1), tx(0.2), tx(100, 'optional')];
  it('subtracts spending from the cash left after fixed costs', () => {
    expect(calcVirtualBalance(setup, txs)).toBe(5899.7);
  });
  it('totals spend per pillar without float noise', () => {
    expect(calcPillarSpend(txs, 'survival')).toBe(0.3);
    expect(calcPillarSpend(txs, 'optional')).toBe(100);
    expect(calcPillarSpend(txs, 'culture')).toBe(0);
  });
});

describe('calcWalletMismatch', () => {
  it('reports missing cash', () => expect(calcWalletMismatch(500, 450.5)).toBe(49.5));
  it('ignores extra cash', () => expect(calcWalletMismatch(500, 520)).toBe(0));
  it('ignores float noise from an exact match', () => expect(calcWalletMismatch(0.1 + 0.2, 0.3)).toBe(0));
});

describe('calcWeekSpend', () => {
  const now = new Date(2026, 9, 20);
  const txs = [tx(10, 'survival', 1), tx(20, 'survival', 7), tx(40, 'survival', 8), { amount: 99, pillar: 'extra', timestamp: new Date(2026, 8, 3).toISOString() }];
  it('only counts days inside the week, in the current month', () => {
    expect(calcWeekSpend(txs, 1, 7, now)).toBe(30);
    expect(calcWeekSpend(txs, 8, 14, now)).toBe(40);
  });
});
