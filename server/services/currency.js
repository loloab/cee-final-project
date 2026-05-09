// In-memory cache for exchange rates
let ratesCache = {
  data: null,
  timestamp: 0,
  base: 'USD',
};

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Fetch latest exchange rates from Frankfurter API.
 * Caches results for 1 hour.
 */
async function getRates(base = 'USD') {
  const now = Date.now();
  if (ratesCache.data && ratesCache.base === base && now - ratesCache.timestamp < CACHE_TTL) {
    return ratesCache.data;
  }

  try {
    const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${base}`);
    if (!response.ok) throw new Error('Failed to fetch exchange rates');

    const data = await response.json();
    ratesCache = {
      data: data.rates,
      timestamp: now,
      base,
    };

    // Add the base currency itself
    ratesCache.data[base] = 1;
    return ratesCache.data;
  } catch (error) {
    console.error('Currency API error:', error.message);
    // Return cached data if available, even if stale
    if (ratesCache.data) return ratesCache.data;
    throw error;
  }
}

/**
 * Convert an amount from one currency to another.
 */
async function convert(amount, from, to) {
  if (from === to) return amount;

  const rates = await getRates('USD');

  // Convert: amount in FROM → USD → TO
  const fromRate = rates[from];
  const toRate = rates[to];

  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currency: ${!fromRate ? from : to}`);
  }

  const amountInUSD = amount / fromRate;
  return Math.round(amountInUSD * toRate * 100) / 100;
}

/**
 * Get list of supported currencies.
 */
async function getSupportedCurrencies() {
  const rates = await getRates('USD');
  return Object.keys(rates).sort();
}

export { getRates, convert, getSupportedCurrencies };
export default { getRates, convert, getSupportedCurrencies };
