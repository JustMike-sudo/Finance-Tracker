import { PILLARS, CURRENCY } from '../utils/constants';

export default function TransactionList({ transactions, limit = 10 }) {
  const items = transactions.slice(0, limit);
  const pillarMap = Object.fromEntries(PILLARS.map(p => [p.id, p]));

  if (items.length === 0) {
    return (
      <div className="tx-list-empty">
        <span className="tx-empty-icon">📝</span>
        <span>No transactions yet</span>
      </div>
    );
  }

  return (
    <div className="tx-list">
      {items.map((tx) => {
        const pillar = pillarMap[tx.pillar];
        const time = new Date(tx.timestamp);
        const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = time.toLocaleDateString([], { month: 'short', day: 'numeric' });

        return (
          <div key={tx.id} className={`tx-item ${tx.isWalletMismatch ? 'tx-item--mismatch' : ''}`}>
            <div className="tx-dot" style={{ background: pillar?.color || '#888' }} />
            <div className="tx-info">
              <span className="tx-pillar">{tx.label || pillar?.label || tx.pillar}</span>
              <span className="tx-time">{dateStr} · {timeStr}</span>
            </div>
            <span className="tx-amount">-{CURRENCY}{tx.amount.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}
