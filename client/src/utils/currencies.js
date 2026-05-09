export const CURRENCIES = [
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
];

export function getCurrencySymbol(code) {
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency ? currency.symbol : code;
}

export function formatAmount(amount, currencyCode = 'THB') {
  const symbol = getCurrencySymbol(currencyCode);
  const formatted = Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

/**
 * Formats a number with K / M / B suffix when it's large,
 * always showing exactly 2 decimal places for consistency.
 * e.g. 1000 -> "฿1.00K", 1500 -> "฿1.50K", 999 -> "฿999.00"
 */
export function formatAmountCompact(amount, currencyCode = 'THB') {
  const symbol = getCurrencySymbol(currencyCode);
  const num = Number(amount);
  const abs = Math.abs(num);
  let value, suffix;
  if (abs >= 1_000_000_000) {
    value = num / 1_000_000_000;
    suffix = 'B';
  } else if (abs >= 1_000_000) {
    value = num / 1_000_000;
    suffix = 'M';
  } else if (abs >= 1_000) {
    value = num / 1_000;
    suffix = 'K';
  } else {
    value = num;
    suffix = '';
  }
  return `${symbol}${value.toFixed(2)}${suffix}`;
}
