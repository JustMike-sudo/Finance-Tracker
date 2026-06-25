export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getCurrentDayOfMonth() {
  return new Date().getDate();
}

export function getCurrentWeekOfMonth() {
  const now = new Date();
  const day = now.getDate();
  return Math.ceil(day / 7);
}

export function getMonthKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function isLastDayOfMonth(date = new Date()) {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.getDate() === 1;
}

export function getMonthName(monthKey) {
  const [year, month] = monthKey.split('-');
  return new Date(year, parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getCurrentMonthDays() {
  const now = new Date();
  return getDaysInMonth(now.getFullYear(), now.getMonth());
}

export function getWeekBoundaries() {
  const now = new Date();
  const day = now.getDate();
  const weekNum = Math.ceil(day / 7);
  const weekStart = (weekNum - 1) * 7 + 1;
  const weekEnd = Math.min(weekNum * 7, getDaysInMonth(now.getFullYear(), now.getMonth()));
  return { weekStart, weekEnd, weekNum };
}
