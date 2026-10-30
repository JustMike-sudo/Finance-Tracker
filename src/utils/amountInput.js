// Pure helpers for the on-screen keypad. The amount is kept as a string while
// typing so "5." and "5.0" survive until the user confirms.

const MAX_INTEGER_DIGITS = 9;

export function appendKey(prev, key) {
  if (key === '.') {
    if (prev.includes('.')) return prev;
    return prev === '' ? '0.' : prev + '.';
  }
  if (!/^[0-9]$/.test(key)) return prev;
  if (prev === '0') return key;

  const [whole, decimals] = prev.split('.');
  if (decimals !== undefined) return decimals.length >= 2 ? prev : prev + key;
  return whole.length >= MAX_INTEGER_DIGITS ? prev : prev + key;
}

// "1234.5" -> "1,234.5". Keeps a trailing "." or zero so the display matches what was typed.
export function formatAmount(raw) {
  if (!raw) return '0';
  const [whole, decimals] = raw.split('.');
  const formatted = Number(whole || 0).toLocaleString('en-US');
  return decimals === undefined ? formatted : `${formatted}.${decimals}`;
}
