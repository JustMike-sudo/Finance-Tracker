// Single source of truth for all budget maths. The store and the pages both
// call these, so a rule only ever lives in one place.

// Money is summed as floats, so round to cents to avoid 0.1 + 0.2 = 0.30000000000000004.
export function roundMoney(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function sumPillars(pillars = {}) {
  return roundMoney(Object.values(pillars).reduce((sum, v) => sum + (v || 0), 0));
}

// Unclamped: a negative value means the plan spends more than comes in.
export function calcNetSavingsGoal(setup) {
  if (!setup) return 0;
  return roundMoney(setup.totalCashInFlow - setup.fixedCosts - sumPillars(setup.pillars));
}

export function calcWeeklyThreshold(setup) {
  if (!setup) return 0;
  return roundMoney(sumPillars(setup.pillars) / 4);
}

export function calcDailyAverage(totalSpent, daysElapsed) {
  if (daysElapsed <= 0) return 0;
  return totalSpent / daysElapsed;
}

export function calcProjection(dailyAvg, daysInMonth) {
  return dailyAvg * daysInMonth;
}

export function calcTotalSpent(transactions) {
  return roundMoney(transactions.reduce((sum, t) => sum + t.amount, 0));
}

export function calcVirtualBalance(setup, transactions) {
  if (!setup) return 0;
  return roundMoney(setup.totalCashInFlow - setup.fixedCosts - calcTotalSpent(transactions));
}

// How much cash is missing from the wallet. Never negative: extra cash isn't a loss.
export function calcWalletMismatch(virtualBalance, physicalCash) {
  return roundMoney(Math.max(0, virtualBalance - physicalCash));
}

export function calcPillarSpend(transactions, pillarId) {
  return calcTotalSpent(transactions.filter((t) => t.pillar === pillarId));
}

// `now` is injectable so the month it filters on can be tested.
export function calcWeekSpend(transactions, weekStart, weekEnd, now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();

  return calcTotalSpent(
    transactions.filter((t) => {
      const d = new Date(t.timestamp);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() >= weekStart && d.getDate() <= weekEnd;
    })
  );
}
