import { useMemo } from 'react';
import useLedgerStore from '../store/useLedgerStore';
import { PILLARS, CURRENCY } from '../utils/constants';
import { calcPillarSpend, calcDailyAverage, calcProjection, calcWeekSpend } from '../utils/calculations';
import { getCurrentDayOfMonth, getCurrentMonthDays, getWeekBoundaries } from '../utils/dateUtils';
import WeeklyGauge from '../components/WeeklyGauge';
import AlertBanner from '../components/AlertBanner';

export default function InsightPage() {
  const monthlySetup = useLedgerStore((s) => s.monthlySetup);
  const transactions = useLedgerStore((s) => s.transactions);

  const daysElapsed = getCurrentDayOfMonth();
  const daysInMonth = getCurrentMonthDays();
  const { weekStart, weekEnd, weekNum } = getWeekBoundaries();

  const pillarData = useMemo(() => {
    return PILLARS.map((p) => {
      const budget = monthlySetup?.pillars?.[p.id] || 0;
      const spent = calcPillarSpend(transactions, p.id);
      const dailyAvg = calcDailyAverage(spent, daysElapsed);
      const projection = calcProjection(dailyAvg, daysInMonth);
      const isOver = projection > budget && budget > 0;
      const ratio = budget > 0 ? spent / budget : 0;
      return { ...p, budget, spent, dailyAvg, projection, isOver, ratio };
    });
  }, [monthlySetup, transactions, daysElapsed, daysInMonth]);

  const totalWeekSpend = calcWeekSpend(transactions, weekStart, weekEnd);
  const weeklyThreshold = monthlySetup?.weeklyThreshold || 0;

  const totalBudget = pillarData.reduce((s, p) => s + p.budget, 0);
  const totalSpent = pillarData.reduce((s, p) => s + p.spent, 0);
  const totalProjected = pillarData.reduce((s, p) => s + p.projection, 0);
  const savingsGoal = monthlySetup?.netSavingsGoal || 0;

  if (!monthlySetup) {
    return (
      <div className="insight-page">
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <h3>No Budget Set</h3>
          <p>Set up your monthly budget first to see projections.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insight-page">
      <h2 className="section-title">Projections</h2>
      <p className="section-subtitle">Day {daysElapsed} of {daysInMonth}</p>

      {/* Weekly Gauge */}
      <WeeklyGauge spent={totalWeekSpend} threshold={weeklyThreshold} weekNum={weekNum} />

      {/* Pillar projections */}
      <div className="projections-list">
        {pillarData.map((p) => (
          <div key={p.id} className="projection-card">
            <div className="projection-header">
              <span className="projection-pillar" style={{ color: p.color }}>
                {p.icon} {p.label}
              </span>
              <span className="projection-amount">
                {CURRENCY}{p.spent.toLocaleString()} / {CURRENCY}{p.budget.toLocaleString()}
              </span>
            </div>

            {/* Progress bar */}
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(p.ratio * 100, 100)}%`,
                  background: p.ratio > 1 ? 'var(--danger)' : p.color,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>

            <div className="projection-footer">
              <span className="projection-daily">
                Avg: {CURRENCY}{p.dailyAvg.toFixed(0)}/day
              </span>
              <span className={`projection-eom ${p.isOver ? 'projection-eom--over' : ''}`}>
                EOM: {CURRENCY}{p.projection.toFixed(0)}
              </span>
            </div>

            {p.isOver && (
              <AlertBanner
                message={`On track to exceed by ${CURRENCY}${(p.projection - p.budget).toFixed(0)}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="summary-card">
        <div className="summary-row">
          <span>Total Budget</span>
          <span>{CURRENCY}{totalBudget.toLocaleString()}</span>
        </div>
        <div className="summary-row">
          <span>Total Spent</span>
          <span>{CURRENCY}{totalSpent.toLocaleString()}</span>
        </div>
        <div className="summary-row">
          <span>Projected Total</span>
          <span className={totalProjected > totalBudget ? 'text-danger' : ''}>
            {CURRENCY}{totalProjected.toFixed(0)}
          </span>
        </div>
        <div className="summary-divider" />
        <div className="summary-row summary-row--highlight">
          <span>Savings Goal</span>
          <span>{CURRENCY}{savingsGoal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
