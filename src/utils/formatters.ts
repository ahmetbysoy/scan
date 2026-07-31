/**
 * Formats a cryptocurrency price nicely based on its scale.
 * e.g., 0.00001234 -> "0.00001234", 1.25 -> "1.2500", 64500.5 -> "64,500.50"
 */
export function formatPrice(price: number): string {
  if (price === 0) return '0.00';
  if (price < 0.0001) {
    return price.toFixed(8);
  }
  if (price < 1) {
    return price.toFixed(6);
  }
  if (price < 10) {
    return price.toFixed(4);
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Formats USDT volume into human readable strings (K, M, B)
 * e.g. 154000000 -> "$154.0M", 2500000 -> "$2.50M", 45000 -> "$45.0K"
 */
export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `$${(volume / 1_000_000_000).toFixed(2)}B`;
  }
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(2)}M`;
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(1)}K`;
  }
  return `$${volume.toFixed(0)}`;
}

/**
 * Formats percentage with + sign for positive values
 * e.g. +3.42%, -1.15%, 0.00%
 */
export function formatPercent(percent: number, includeSign = true): string {
  const formatted = percent.toFixed(2);
  if (includeSign && percent > 0) {
    return `+${formatted}%`;
  }
  return `${formatted}%`;
}

/**
 * Formats timestamp to HH:mm:ss
 */
export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Clean base symbol extractor from USDT futures ticker
 * e.g. BTCUSDT -> BTC, 1000PEPEUSDT -> 1000PEPE
 */
export function cleanSymbolName(rawSymbol: string): string {
  if (rawSymbol.endsWith('USDT')) {
    return rawSymbol.slice(0, -4);
  }
  return rawSymbol;
}
