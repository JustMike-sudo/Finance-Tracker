import { useState, useCallback } from 'react';
import useLedgerStore from '../store/useLedgerStore';
import { PILLARS, CURRENCY } from '../utils/constants';
import NumPad from '../components/NumPad';
import PillarCard from '../components/PillarCard';
import TransactionList from '../components/TransactionList';

export default function HomePage() {
  const [amount, setAmount] = useState('');
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const addTransaction = useLedgerStore((s) => s.addTransaction);
  const transactions = useLedgerStore((s) => s.transactions);
  const monthlySetup = useLedgerStore((s) => s.monthlySetup);

  const handleInput = useCallback((digit) => {
    setAmount((prev) => {
      if (digit === '.' && prev.includes('.')) return prev;
      if (prev === '0' && digit !== '.') return digit;
      if (prev.includes('.') && prev.split('.')[1].length >= 2) return prev;
      return prev + digit;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setAmount((prev) => prev.slice(0, -1));
  }, []);

  const handleConfirm = useCallback(() => {
    const val = parseFloat(amount);
    if (!val || !selectedPillar) return;
    addTransaction(val, selectedPillar);
    if (navigator.vibrate) navigator.vibrate(50);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 600);
    setAmount('');
    setSelectedPillar(null);
  }, [amount, selectedPillar, addTransaction]);

  const displayAmount = amount || '0';
  const canConfirm = parseFloat(amount) > 0 && selectedPillar;

  return (
    <div className="home-page">
      {/* Success overlay */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-checkmark">✓</div>
        </div>
      )}

      {/* Amount display */}
      <div className="amount-card">
        <span className="amount-label">INPUT LEDGER</span>
        <span className="amount-value">
          <span className="amount-currency">{CURRENCY}</span>
          {parseFloat(displayAmount).toLocaleString()}
        </span>
      </div>

      {/* Pillar selection */}
      <div className="pillar-grid">
        {PILLARS.map((p) => (
          <PillarCard
            key={p.id}
            pillar={p}
            selected={selectedPillar}
            onClick={setSelectedPillar}
          />
        ))}
      </div>

      {/* NumPad */}
      <NumPad onInput={handleInput} onBackspace={handleBackspace} />

      {/* Confirm button */}
      <button
        className={`confirm-btn ${canConfirm ? 'confirm-btn--active' : ''}`}
        onClick={handleConfirm}
        disabled={!canConfirm}
        type="button"
      >
        <span className="confirm-sparkle">✦</span>
        Confirm Transaction
      </button>

      {/* Recent transactions */}
      {transactions.length > 0 && (
        <div className="recent-section">
          <h3 className="section-title">Recent</h3>
          <TransactionList transactions={transactions} limit={5} />
        </div>
      )}
    </div>
  );
}
