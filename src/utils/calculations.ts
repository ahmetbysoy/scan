import { PriceSnapshot, TimeWindow } from '../types/ticker';

/**
 * Window duration in milliseconds
 */
export const WINDOW_MS: Record<TimeWindow, number> = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
};

/**
 * Calculates percentage change between two prices
 */
export function calculatePercentageChange(currentPrice: number, basePrice: number): number {
  if (!basePrice || basePrice === 0) return 0;
  return ((currentPrice - basePrice) / basePrice) * 100;
}

/**
 * Trims historical price snapshots older than maxWindow (e.g. 16 minutes)
 * to prevent unbounded memory growth while preserving circular buffer history.
 */
export function trimHistory(history: PriceSnapshot[], now: number, maxWindowMs = 16 * 60 * 1000): PriceSnapshot[] {
  const cutoff = now - maxWindowMs;
  // Keep elements newer than cutoff, but always keep at least 1 historical snapshot if present
  const startIndex = history.findIndex((h) => h.t >= cutoff);
  if (startIndex === -1) {
    return history.length > 0 ? [history[history.length - 1]] : [];
  }
  return history.slice(Math.max(0, startIndex - 1));
}

/**
 * Finds the base price snapshot for a given rolling time window (e.g. 1m, 5m, 15m).
 * If history has snapshots, it finds the snapshot closest to `now - windowMs`.
 */
export function getBasePriceFromHistory(history: PriceSnapshot[], now: number, windowMs: number): number | null {
  if (!history || history.length === 0) return null;

  const targetTime = now - windowMs;

  // Find snapshot closest to targetTime (preferably just before or right around targetTime)
  let bestSnapshot = history[0];
  let minDiff = Math.abs(targetTime - bestSnapshot.t);

  for (let i = 1; i < history.length; i++) {
    const diff = Math.abs(targetTime - history[i].t);
    if (diff < minDiff) {
      minDiff = diff;
      bestSnapshot = history[i];
    }
  }

  return bestSnapshot.c;
}

/**
 * Calculates rolling momentum changes for 1m, 5m, 15m from history.
 */
export function calculateRollingMomentum(
  currentPrice: number,
  open24h: number,
  history: PriceSnapshot[],
  now: number
): { change1m: number; change5m: number; change15m: number; change24h: number } {
  const change24h = calculatePercentageChange(currentPrice, open24h);

  const price1m = getBasePriceFromHistory(history, now, WINDOW_MS['1m']);
  const price5m = getBasePriceFromHistory(history, now, WINDOW_MS['5m']);
  const price15m = getBasePriceFromHistory(history, now, WINDOW_MS['15m']);

  const change1m = price1m !== null ? calculatePercentageChange(currentPrice, price1m) : 0;
  const change5m = price5m !== null ? calculatePercentageChange(currentPrice, price5m) : 0;
  const change15m = price15m !== null ? calculatePercentageChange(currentPrice, price15m) : 0;

  return {
    change1m,
    change5m,
    change15m,
    change24h,
  };
}
