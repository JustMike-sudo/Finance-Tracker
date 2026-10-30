import { describe, it, expect } from 'vitest';
import { createBackup, parseBackup, transactionsToCsv } from './backup';

const setup = { month: '2026-10', totalCashInFlow: 1000, fixedCosts: 200, pillars: { survival: 300, optional: 100, culture: 50, extra: 50 } };
const t = { id: 'a', amount: 12.5, pillar: 'survival', timestamp: '2026-10-05T10:00:00.000Z', label: '', isWalletMismatch: false };
const state = { monthlySetup: setup, transactions: [t], walletBalance: 100, lastWalletSync: null, archives: {} };

describe('backup round trip', () => {
  it('restores exactly what was exported', () => {
    const text = JSON.stringify(createBackup(state, new Date('2026-10-30T00:00:00Z')));
    expect(parseBackup(text)).toEqual(state);
  });
  it('accepts an empty ledger', () => {
    const empty = { monthlySetup: null, transactions: [], walletBalance: 0, lastWalletSync: null, archives: {} };
    expect(parseBackup(JSON.stringify(createBackup(empty)))).toEqual(empty);
  });
  it('accepts archives', () => {
    const withArchive = { ...state, archives: { '2026-09': { setup, transactions: [t], reflection: {}, lockedAt: 'x' } } };
    expect(parseBackup(JSON.stringify(createBackup(withArchive))).archives['2026-09'].transactions).toHaveLength(1);
  });
});

describe('parseBackup rejects bad files', () => {
  const make = (mutate) => {
    const b = JSON.parse(JSON.stringify(createBackup(state)));
    mutate(b);
    return JSON.stringify(b);
  };
  it('not JSON', () => expect(() => parseBackup('nope')).toThrow(/not valid JSON/));
  it('wrong app', () => expect(() => parseBackup('{"app":"other"}')).toThrow(/not a Fusion Ledger/));
  it('wrong version', () => expect(() => parseBackup(make((b) => { b.version = 99; }))).toThrow(/Unsupported/));
  it('negative amount', () => expect(() => parseBackup(make((b) => { b.data.transactions[0].amount = -5; }))).toThrow(/transaction 1/));
  it('amount as a string', () => expect(() => parseBackup(make((b) => { b.data.transactions[0].amount = '12'; }))).toThrow(/transaction 1/));
  it('unknown pillar', () => expect(() => parseBackup(make((b) => { b.data.transactions[0].pillar = 'gold'; }))).toThrow(/transaction 1/));
  it('bad timestamp', () => expect(() => parseBackup(make((b) => { b.data.transactions[0].timestamp = 'yesterday'; }))).toThrow(/transaction 1/));
  it('missing pillar in setup', () => expect(() => parseBackup(make((b) => { delete b.data.monthlySetup.pillars.extra; }))).toThrow(/setup is invalid/));
  it('bad archive key', () => expect(() => parseBackup(make((b) => { b.data.archives = { oops: {} }; }))).toThrow(/Archive "oops"/));
});

describe('transactionsToCsv', () => {
  it('writes a header and rows', () => {
    expect(transactionsToCsv([t]).split('\n')).toEqual([
      'date,pillar,amount,label,wallet_mismatch',
      '2026-10-05T10:00:00.000Z,survival,12.50,,no',
    ]);
  });
  it('quotes commas and quotes', () => {
    expect(transactionsToCsv([{ ...t, label: 'tea, "green"' }])).toContain('"tea, ""green"""');
  });
  it('neutralises spreadsheet formulas', () => {
    expect(transactionsToCsv([{ ...t, label: '=SUM(A1)' }])).toContain("'=SUM(A1)");
  });
});
