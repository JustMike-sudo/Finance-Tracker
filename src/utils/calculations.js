export function calcNetSavingsGoal(setup) {
  if (!setup) return 0;
  const { totalCashInFlow, fixedCosts, pillars } = setup;
  const pillarSum = Object.values(pillars).reduce((sum, v) => sum + v, 0);
  return totalCashInFlow - fixedCosts - pillarSum;
}

export function calcWeeklyThreshold(setup) {
  if (!setup) return 0;
  const { pillars } = setup;
  const pillarSum = Object.values(pillars).reduce((sum, v) => sum + v, 0);
  return pillarSum / 4;
}

export function calcDailyAverage(totalSpent, daysElapsed) {
  if (daysElapsed <= 0) return 0;
  return totalSpent / daysElapsed;
}

export function calcProjection(dailyAvg, daysInMonth) {
  return dailyAvg * daysInMonth;
}

export function calcWalletMismatch(virtualBalance, physicalCash) {
  const diff = virtualBalance - physicalCash;
  return diff > 0 ? diff : 0;
}

export function calcVirtualBalance(setup, transactions) {
  if (!setup) return 0;
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  return setup.totalCashInFlow - setup.fixedCosts - totalSpent;
}

export function calcPillarSpend(transactions, pillarId) {
  return transactions
    .filter(t => t.pillar === pillarId)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calcWeekSpend(transactions, weekStart, weekEnd) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  return transactions.filter(t => {
    const d = new Date(t.timestamp);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() >= weekStart && d.getDate() <= weekEnd;
  }).reduce((sum, t) => sum + t.amount, 0);
}
