import { useState } from 'react';
import useLedgerStore from '../store/useLedgerStore';
import { PILLARS, CURRENCY } from '../utils/constants';
import { calcVirtualBalance, calcNetSavingsGoal, calcWeeklyThreshold } from '../utils/calculations';
import { getMonthKey, getMonthName } from '../utils/dateUtils';

export default function BudgetPage() {
  const monthlySetup = useLedgerStore((s) => s.monthlySetup);
  const transactions = useLedgerStore((s) => s.transactions);
  const setMonthlySetup = useLedgerStore((s) => s.setMonthlySetup);
  const syncWalletAction = useLedgerStore((s) => s.syncWallet);
  const lastWalletSync = useLedgerStore((s) => s.lastWalletSync);

  // Setup form state
  const [totalCash, setTotalCash] = useState(monthlySetup?.totalCashInFlow || '');
  const [fixedCosts, setFixedCosts] = useState(monthlySetup?.fixedCosts || '');
  const [pillarAmounts, setPillarAmounts] = useState({
    survival: monthlySetup?.pillars?.survival || '',
    optional: monthlySetup?.pillars?.optional || '',
    culture: monthlySetup?.pillars?.culture || '',
    extra: monthlySetup?.pillars?.extra || '',
  });
  const [setupSaved, setSetupSaved] = useState(false);

  // Wallet sync state
  const [physicalCash, setPhysicalCash] = useState('');
  const [syncResult, setSyncResult] = useState(null);

  // Computed values
  const draftSetup = {
    totalCashInFlow: parseFloat(totalCash) || 0,
    fixedCosts: parseFloat(fixedCosts) || 0,
    pillars: Object.fromEntries(PILLARS.map((p) => [p.id, parseFloat(pillarAmounts[p.id]) || 0])),
  };
  const netSavings = calcNetSavingsGoal(draftSetup);
  const weeklyThreshold = calcWeeklyThreshold(draftSetup);
  const virtualBalance = calcVirtualBalance(monthlySetup, transactions);

  const handleSaveSetup = () => {
    setMonthlySetup(draftSetup);
    setSetupSaved(true);
    setTimeout(() => setSetupSaved(false), 2000);
  };

  const handleSync = () => {
    const cash = parseFloat(physicalCash);
    if (isNaN(cash) || cash < 0) return;
    const mismatch = syncWalletAction(cash);
    if (mismatch > 0) {
      setSyncResult({ type: 'mismatch', amount: mismatch });
    } else {
      setSyncResult({ type: 'synced' });
    }
    setPhysicalCash('');
    setTimeout(() => setSyncResult(null), 4000);
  };

  const updatePillar = (id, val) => {
    setPillarAmounts((prev) => ({ ...prev, [id]: val }));
  };

  return (
    <div className="budget-page">
      {/* Monthly Setup */}
      <section className="budget-section">
        <h2 className="section-title">Monthly Setup</h2>
        <p className="section-subtitle">{getMonthName(getMonthKey())}</p>

        <div className="setup-grid">
          <div className="input-group input-group--full">
            <label className="input-label">Total Cash In Flow</label>
            <div className="input-wrapper">
              <span className="input-prefix">{CURRENCY}</span>
              <input
                type="number"
                className="input-field"
                value={totalCash}
                onChange={(e) => setTotalCash(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="input-group input-group--full">
            <label className="input-label">Fixed Costs</label>
            <div className="input-wrapper">
              <span className="input-prefix">{CURRENCY}</span>
              <input
                type="number"
                className="input-field"
                value={fixedCosts}
                onChange={(e) => setFixedCosts(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {PILLARS.map((p) => (
            <div className="input-group" key={p.id}>
              <label className="input-label" style={{ color: p.color }}>
                {p.icon} {p.label}
              </label>
              <div className="input-wrapper">
                <span className="input-prefix">{CURRENCY}</span>
                <input
                  type="number"
                  className="input-field"
                  value={pillarAmounts[p.id]}
                  onChange={(e) => updatePillar(p.id, e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Computed values */}
        <div className="computed-card">
          <div className="computed-row">
            <span className="computed-label">Net Savings Goal</span>
            <span className={`computed-value ${netSavings < 0 ? 'computed-value--negative' : ''}`}>
              {CURRENCY}{netSavings.toLocaleString()}
            </span>
          </div>
          <div className="computed-divider" />
          <div className="computed-row">
            <span className="computed-label">Weekly Threshold</span>
            <span className="computed-value">
              {CURRENCY}{weeklyThreshold.toLocaleString()}
            </span>
          </div>
        </div>

        <button className="save-btn" onClick={handleSaveSetup}>
          {setupSaved ? '✓ Saved' : 'Save Setup'}
        </button>
      </section>

      {/* Wallet Sync */}
      <section className="budget-section">
        <h2 className="section-title">Wallet Sync</h2>
        <p className="section-subtitle">Reconcile your physical cash</p>

        <div className="sync-card">
          <div className="sync-balance">
            <span className="sync-balance-label">Virtual Balance</span>
            <span className="sync-balance-value">{CURRENCY}{virtualBalance.toLocaleString()}</span>
          </div>

          {lastWalletSync && (
            <p className="sync-last">Last sync: {new Date(lastWalletSync).toLocaleString()}</p>
          )}

          <div className="input-group">
            <label className="input-label">Count your physical cash</label>
            <div className="input-wrapper">
              <span className="input-prefix">{CURRENCY}</span>
              <input
                type="number"
                className="input-field"
                value={physicalCash}
                onChange={(e) => setPhysicalCash(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <button className="sync-btn" onClick={handleSync} disabled={!physicalCash}>
            Sync Wallet
          </button>

          {syncResult && (
            <div className={`sync-result sync-result--${syncResult.type}`}>
              {syncResult.type === 'mismatch'
                ? `⚠ Mismatch of ${CURRENCY}${syncResult.amount.toLocaleString()} logged under Extra`
                : '✓ Wallet in sync'}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
