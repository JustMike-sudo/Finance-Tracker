import { useState, useMemo } from 'react';
import useLedgerStore from '../store/useLedgerStore';
import { PILLARS, CURRENCY } from '../utils/constants';
import { calcPillarSpend } from '../utils/calculations';
import { getMonthKey, getMonthName, isLastDayOfMonth } from '../utils/dateUtils';
import BarChart from '../components/BarChart';

export default function VaultPage() {
  const monthlySetup = useLedgerStore((s) => s.monthlySetup);
  const transactions = useLedgerStore((s) => s.transactions);
  const archives = useLedgerStore((s) => s.archives);
  const lockMonth = useLedgerStore((s) => s.lockMonth);

  const [reflection, setReflection] = useState({
    wentWell: '',
    toImprove: '',
    nextMonth: '',
  });
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [expandedArchive, setExpandedArchive] = useState(null);

  const budgeted = useMemo(() => {
    if (!monthlySetup) return {};
    return Object.fromEntries(
      PILLARS.map((p) => [p.id, monthlySetup.pillars[p.id] || 0])
    );
  }, [monthlySetup]);

  const actual = useMemo(() => {
    return Object.fromEntries(
      PILLARS.map((p) => [p.id, calcPillarSpend(transactions, p.id)])
    );
  }, [transactions]);

  const handleLock = () => {
    lockMonth(reflection);
    setShowLockConfirm(false);
    setReflection({ wentWell: '', toImprove: '', nextMonth: '' });
  };

  const archiveKeys = Object.keys(archives).sort().reverse();

  return (
    <div className="vault-page">
      <h2 className="section-title">Retrospective</h2>
      <p className="section-subtitle">{getMonthName(getMonthKey())}</p>

      {monthlySetup ? (
        <>
          {/* Current month chart */}
          <div className="vault-card">
            <h3 className="card-title">Budget vs. Actual</h3>
            <BarChart budgeted={budgeted} actual={actual} />
          </div>

          {/* Reflection journal */}
          <div className="vault-card">
            <h3 className="card-title">Reflection Journal</h3>
            <div className="reflection-fields">
              <div className="reflection-group">
                <label className="reflection-label">What went well this month?</label>
                <textarea
                  className="reflection-textarea"
                  value={reflection.wentWell}
                  onChange={(e) => setReflection(r => ({ ...r, wentWell: e.target.value }))}
                  placeholder="Describe your wins..."
                  rows={3}
                />
              </div>
              <div className="reflection-group">
                <label className="reflection-label">What can I improve?</label>
                <textarea
                  className="reflection-textarea"
                  value={reflection.toImprove}
                  onChange={(e) => setReflection(r => ({ ...r, toImprove: e.target.value }))}
                  placeholder="Areas for growth..."
                  rows={3}
                />
              </div>
              <div className="reflection-group">
                <label className="reflection-label">Focus for next month</label>
                <textarea
                  className="reflection-textarea"
                  value={reflection.nextMonth}
                  onChange={(e) => setReflection(r => ({ ...r, nextMonth: e.target.value }))}
                  placeholder="Your intentions..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Lock month */}
          {!showLockConfirm ? (
            <button className="lock-btn" onClick={() => setShowLockConfirm(true)}>
              🔒 Lock Month & Archive
            </button>
          ) : (
            <div className="lock-confirm">
              <p className="lock-warning">This will archive all data for this month and reset for a new month. This cannot be undone.</p>
              <div className="lock-actions">
                <button className="lock-cancel" onClick={() => setShowLockConfirm(false)}>Cancel</button>
                <button className="lock-confirm-btn" onClick={handleLock}>Confirm Lock</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">🏯</span>
          <h3>No Active Month</h3>
          <p>Set up your monthly budget to start tracking.</p>
        </div>
      )}

      {/* Archives */}
      {archiveKeys.length > 0 && (
        <section className="archives-section">
          <h3 className="section-title">Archives</h3>
          {archiveKeys.map((key) => {
            const archive = archives[key];
            const isExpanded = expandedArchive === key;
            const archiveBudgeted = archive.setup?.pillars || {};
            const archiveActual = Object.fromEntries(
              PILLARS.map((p) => [
                p.id,
                archive.transactions
                  .filter((t) => t.pillar === p.id)
                  .reduce((s, t) => s + t.amount, 0),
              ])
            );

            return (
              <div key={key} className="archive-item">
                <button
                  className="archive-header"
                  onClick={() => setExpandedArchive(isExpanded ? null : key)}
                >
                  <span>{getMonthName(key)}</span>
                  <span className="archive-toggle">{isExpanded ? '▾' : '▸'}</span>
                </button>
                {isExpanded && (
                  <div className="archive-body">
                    <BarChart budgeted={archiveBudgeted} actual={archiveActual} />
                    {archive.reflection && (
                      <div className="archive-reflections">
                        {archive.reflection.wentWell && (
                          <div className="archive-reflect-item">
                            <span className="archive-reflect-label">Went Well</span>
                            <p>{archive.reflection.wentWell}</p>
                          </div>
                        )}
                        {archive.reflection.toImprove && (
                          <div className="archive-reflect-item">
                            <span className="archive-reflect-label">To Improve</span>
                            <p>{archive.reflection.toImprove}</p>
                          </div>
                        )}
                        {archive.reflection.nextMonth && (
                          <div className="archive-reflect-item">
                            <span className="archive-reflect-label">Next Month Focus</span>
                            <p>{archive.reflection.nextMonth}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
