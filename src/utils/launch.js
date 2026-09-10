// Flip this to true when KlarElle is ready for customers to buy.
export const STORE_LAUNCHED = false;

// Set this to the real launch moment (ISO date) when you flip STORE_LAUNCHED.
// Shoppers will not see size quantities until 3 days after this date.
// Example: '2026-09-15T00:00:00.000Z'
export const STORE_LAUNCH_AT = null;

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function showPublicStockCounts(now = Date.now()) {
  if (!STORE_LAUNCHED) return false;
  if (!STORE_LAUNCH_AT) return false;
  const launchedAt = Date.parse(STORE_LAUNCH_AT);
  if (Number.isNaN(launchedAt)) return false;
  return now >= launchedAt + THREE_DAYS_MS;
}
