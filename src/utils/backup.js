import { PILLARS } from './constants';

export const BACKUP_APP = 'fusion-ledger';
export const BACKUP_VERSION = 1;

const PILLAR_IDS = PILLARS.map((p) => p.id);

export function createBackup(state, now = new Date()) {
  const { monthlySetup, transactions, walletBalance, lastWalletSync, archives } = state;
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    data: { monthlySetup, transactions, walletBalance, lastWalletSync, archives },
  };
}

const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function checkTransactions(list, where) {
  if (!Array.isArray(list)) throw new Error(`${where}: transactions must be a list`);
  list.forEach((t, i) => {
    if (!isObject(t) || typeof t.id !== 'string' || !isNumber(t.amount) || t.amount < 0
      || !PILLAR_IDS.includes(t.pillar) || typeof t.timestamp !== 'string' || Number.isNaN(Date.parse(t.timestamp))) {
      throw new Error(`${where}: transaction ${i + 1} is invalid`);
    }
  });
}

function checkSetup(setup, where) {
  if (!isObject(setup) || !isNumber(setup.totalCashInFlow) || !isNumber(setup.fixedCosts)
    || !isObject(setup.pillars) || !PILLAR_IDS.every((id) => isNumber(setup.pillars[id]))) {
    throw new Error(`${where}: budget setup is invalid`);
  }
}

// Validates a backup file's text and returns just the data to restore.
// Throws an Error with a readable message if anything looks wrong, so a bad
// file can never overwrite the ledger.
export function parseBackup(text) {
  let backup;
  try {
    backup = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  if (!isObject(backup) || backup.app !== BACKUP_APP) throw new Error('This is not a Fusion Ledger backup.');
  if (backup.version !== BACKUP_VERSION) throw new Error(`Unsupported backup version: ${backup.version}.`);

  const data = backup.data;
  if (!isObject(data)) throw new Error('The backup has no data.');

  if (data.monthlySetup !== null) checkSetup(data.monthlySetup, 'Current month');
  checkTransactions(data.transactions, 'Current month');
  if (!isNumber(data.walletBalance)) throw new Error('Wallet balance is invalid.');
  if (!isObject(data.archives)) throw new Error('Archives are invalid.');

  for (const [key, archive] of Object.entries(data.archives)) {
    if (!/^\d{4}-\d{2}$/.test(key) || !isObject(archive)) throw new Error(`Archive "${key}" is invalid.`);
    checkSetup(archive.setup, `Archive ${key}`);
    checkTransactions(archive.transactions, `Archive ${key}`);
  }

  return {
    monthlySetup: data.monthlySetup,
    transactions: data.transactions,
    walletBalance: data.walletBalance,
    lastWalletSync: typeof data.lastWalletSync === 'string' ? data.lastWalletSync : null,
    archives: data.archives,
  };
}

// Spreadsheet apps run cells that start with = + - @ as formulas, so neutralise them.
function csvCell(value) {
  let s = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function transactionsToCsv(transactions) {
  const rows = transactions.map((t) => [t.timestamp, t.pillar, t.amount.toFixed(2), t.label || '', t.isWalletMismatch ? 'yes' : 'no']);
  return [['date', 'pillar', 'amount', 'label', 'wallet_mismatch'], ...rows]
    .map((row) => row.map(csvCell).join(','))
    .join('\n');
}
