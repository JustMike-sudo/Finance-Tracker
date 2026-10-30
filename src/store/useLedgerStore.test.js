import { describe, it, expect, beforeEach } from 'vitest';
import useLedgerStore from './useLedgerStore';
import { getMonthKey } from '../utils/dateUtils';

const budget = { totalCashInFlow: 5000, fixedCosts: 1000, pillars: { survival: 1500, optional: 500, culture: 300, extra: 200 } };
const state = () => useLedgerStore.getState();

beforeEach(() => {
  useLedgerStore.setState({ monthlySetup: null, transactions: [], walletBalance: 0, lastWalletSync: null, archives: {} });
});

describe('setMonthlySetup', () => {
  it('derives savings goal and weekly threshold from the shared maths', () => {
    state().setMonthlySetup(budget);
    expect(state().monthlySetup).toMatchObject({ netSavingsGoal: 1500, weeklyThreshold: 625, month: getMonthKey() });
  });
  it('clamps a negative savings goal to 0', () => {
    state().setMonthlySetup({ ...budget, fixedCosts: 4000 });
    expect(state().monthlySetup.netSavingsGoal).toBe(0);
  });
});

describe('addTransaction', () => {
  it('stores newest first, rounded to cents', () => {
    state().addTransaction('10.005', 'survival');
    state().addTransaction(5, 'extra');
    expect(state().transactions.map((t) => t.amount)).toEqual([5, 10.01]);
  });
  it('ignores zero, negative and non-numeric amounts', () => {
    state().addTransaction(0, 'survival');
    state().addTransaction(-4, 'survival');
    state().addTransaction('abc', 'survival');
    expect(state().transactions).toHaveLength(0);
  });
});

describe('syncWallet', () => {
  beforeEach(() => {
    state().setMonthlySetup(budget);
    state().addTransaction(100, 'survival'); // virtual balance = 5000 - 1000 - 100 = 3900
  });
  it('logs missing cash as an Extra "Wallet Mismatch"', () => {
    expect(state().syncWallet(3800.5)).toBe(99.5);
    expect(state().transactions[0]).toMatchObject({ amount: 99.5, pillar: 'extra', isWalletMismatch: true, label: 'Wallet Mismatch' });
    expect(state().walletBalance).toBe(3800.5);
  });
  it('logs nothing when the wallet matches or has extra', () => {
    expect(state().syncWallet(3900)).toBe(0);
    expect(state().syncWallet(4000)).toBe(0);
    expect(state().transactions).toHaveLength(1);
  });
  it('does nothing without a budget', () => {
    useLedgerStore.setState({ monthlySetup: null });
    expect(state().syncWallet(10)).toBe(0);
  });
});

describe('lockMonth', () => {
  it('archives the month and resets for the next one', () => {
    state().setMonthlySetup(budget);
    state().addTransaction(50, 'culture');
    state().lockMonth({ wentWell: 'saved', toImprove: '', nextMonth: '' });
    const archive = state().archives[getMonthKey()];
    expect(archive.transactions).toHaveLength(1);
    expect(archive.reflection.wentWell).toBe('saved');
    expect(state()).toMatchObject({ monthlySetup: null, transactions: [], walletBalance: 0 });
  });
});

describe('importData', () => {
  it('replaces the whole ledger', () => {
    state().addTransaction(1, 'survival');
    state().importData({ monthlySetup: null, transactions: [], walletBalance: 7, lastWalletSync: null, archives: { '2026-01': {} } });
    expect(state().transactions).toEqual([]);
    expect(state().walletBalance).toBe(7);
    expect(Object.keys(state().archives)).toEqual(['2026-01']);
  });
});
