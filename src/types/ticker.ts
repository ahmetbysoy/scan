/**
 * Raw WebSocket message structure for Binance Futures !miniTicker@arr
 * Reference: https://binance-docs.github.io/apidocs/futures/en/#individual-symbol-mini-ticker-stream
 */
export interface BinanceMiniTickerRaw {
  e: string;      // Event type (24hrMiniTicker)
  E: number;      // Event time
  s: string;      // Symbol (e.g. BTCUSDT)
  c: string;      // Close price
  o: string;      // Open price (24h)
  h: string;      // High price (24h)
  l: string;      // Low price (24h)
  v: string;      // Total traded base asset volume (24h)
  q: string;      // Total traded quote asset volume (24h USDT)
}

/**
 * Historical price point snapshot used for rolling window calculations
 */
export interface PriceSnapshot {
  t: number;      // Timestamp in ms
  c: number;      // Close price
  q: number;      // Quote volume
}

/**
 * Normalized internal Ticker representation stored in memory
 */
export interface TickerData {
  symbol: string;           // Base symbol without USDT (e.g. BTC)
  rawSymbol: string;        // Full symbol (e.g. BTCUSDT)
  price: number;            // Current price
  open24h: number;          // 24h open price
  high24h: number;          // 24h high price
  low24h: number;           // 24h low price
  volume24h: number;        // 24h base volume
  quoteVolume24h: number;   // 24h quote volume in USDT
  change24h: number;        // Calculated 24h change %
  lastUpdate: number;       // Last update timestamp ms
  history: PriceSnapshot[]; // Rolling window history (last 15m+)
}

/**
 * Calculated Momentum metrics for UI display
 */
export interface TickerMomentum {
  ticker: TickerData;
  change1m: number;         // 1 minute percentage change
  change5m: number;         // 5 minutes percentage change
  change15m: number;        // 15 minutes percentage change
  selectedChange: number;   // Change % based on currently active window (1m/5m/15m/24h)
  priceDirection: 'up' | 'down' | 'neutral'; // Immediate tick direction
  isFavorite: boolean;
}

export type TimeWindow = '1m' | '5m' | '15m' | '24h';

export type SortField = 'change' | '24hChange' | 'price' | 'volume' | 'symbol';
export type SortOrder = 'desc' | 'asc';

export type ConnectionState = 'connecting' | 'open' | 'closed' | 'error' | 'reconnecting';

export interface AlertTriggerEvent {
  id: string;
  symbol: string;
  price: number;
  changePct: number;
  timeWindow: TimeWindow;
  timestamp: number;
}
