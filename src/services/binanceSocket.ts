import { BinanceMiniTickerRaw, ConnectionState } from '../types/ticker';

const SPOT_WS_URL = 'wss://stream.binance.com:9443/ws/!miniTicker@arr';
const SPOT_STREAM_URL = 'wss://stream.binance.com:9443/stream?streams=!miniTicker@arr';
const FUTURES_WS_URL = 'wss://fstream.binance.com/ws/!miniTicker@arr';
const FUTURES_STREAM_URL = 'wss://fstream.binance.com/stream?streams=!miniTicker@arr';

type BatchCallback = (tickers: BinanceMiniTickerRaw[]) => void;
type StatusCallback = (state: ConnectionState, error?: string | null) => void;
type MetricsCallback = (count: number, rate: number) => void;

export interface DiagnosticResult {
  id: string;
  name: string;
  type: 'WebSocket' | 'REST';
  url: string;
  status: 'ok' | 'warning' | 'error';
  latencyMs?: number;
  itemCount: number;
  message: string;
}

export class BinanceSocketManager {
  private ws: WebSocket | null = null;
  private isIntentionalDisconnect = false;
  private retryCount = 0;
  private maxRetries = 25;
  private baseDelayMs = 1000;
  private maxDelayMs = 20000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private restPollerTimer: ReturnType<typeof setInterval> | null = null;
  private activeUrlIndex = 0;
  private urls = [
    SPOT_WS_URL,
    SPOT_STREAM_URL,
    FUTURES_WS_URL,
    FUTURES_STREAM_URL,
  ];

  // Batching queue for 250ms UI update cycle
  private queue: BinanceMiniTickerRaw[] = [];
  private flushIntervalTimer: ReturnType<typeof setInterval> | null = null;
  private metricsTimer: ReturnType<typeof setInterval> | null = null;

  private messageCountInSecond = 0;
  private totalMessages = 0;
  private lastWsMessageTime = 0;

  private onBatchCb: BatchCallback | null = null;
  private onStatusCb: StatusCallback | null = null;
  private onMetricsCb: MetricsCallback | null = null;

  public subscribe(onBatch: BatchCallback, onStatus: StatusCallback, onMetrics: MetricsCallback) {
    this.onBatchCb = onBatch;
    this.onStatusCb = onStatus;
    this.onMetricsCb = onMetrics;
  }

  public async connect() {
    this.isIntentionalDisconnect = false;
    this.clearTimers();
    this.updateStatus('connecting');

    // Immediate initial REST seed to populate UI instantly
    await this.fetchInitialSeed();

    // Start WebSocket connection
    this.initWebSocket();

    // Start REST Fallback Poller to guarantee continuous data updates even if WS stalls
    this.startRestPoller();
  }

  private initWebSocket() {
    const targetUrl = this.urls[this.activeUrlIndex];

    try {
      this.ws = new WebSocket(targetUrl);

      this.ws.onopen = () => {
        this.retryCount = 0;
        this.updateStatus('open');
        this.startBatchFlushing();
        this.startMetricsTracking();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          let items: BinanceMiniTickerRaw[] = [];

          if (Array.isArray(data)) {
            items = data;
          } else if (data && Array.isArray(data.data)) {
            items = data.data;
          } else if (data && data.e === '24hrMiniTicker') {
            items = [data];
          } else if (data && data.data && data.data.e === '24hrMiniTicker') {
            items = [data.data];
          }

          if (items.length > 0) {
            this.lastWsMessageTime = Date.now();
            this.queue.push(...items);
            this.messageCountInSecond += items.length;
            this.totalMessages += items.length;
          }
        } catch (err) {
          console.error('[BinanceSocket] JSON Parse Error:', err);
        }
      };

      this.ws.onerror = (evt) => {
        console.warn('[BinanceSocket] WebSocket Error on URL:', targetUrl, evt);
      };

      this.ws.onclose = (event) => {
        this.stopBatchFlushing();
        this.stopMetricsTracking();

        if (this.isIntentionalDisconnect) {
          this.updateStatus('closed');
          return;
        }

        this.scheduleReconnect(event.reason || 'Bağlantı sıfırlandı');
      };
    } catch (err) {
      console.error('[BinanceSocket] Initialization error:', err);
      this.scheduleReconnect(err instanceof Error ? err.message : 'Bağlantı başlatılamadı');
    }
  }

  public async fetchInitialSeed(): Promise<void> {
    try {
      // 1. Try Binance Futures 24hr Ticker API
      const res = await fetch('https://fapi.binance.com/fapi/v1/ticker/24hr');
      if (res.ok) {
        const rawData = await res.json();
        if (Array.isArray(rawData) && rawData.length > 0) {
          const mapped: BinanceMiniTickerRaw[] = rawData.map((item: any) => ({
            e: '24hrMiniTicker',
            E: item.closeTime || Date.now(),
            s: item.symbol,
            c: item.lastPrice,
            o: item.openPrice,
            h: item.highPrice,
            l: item.lowPrice,
            v: item.volume,
            q: item.quoteVolume,
          }));
          this.queue.push(...mapped);
          this.totalMessages += mapped.length;
          this.startBatchFlushing();
          return;
        }
      }
    } catch (err) {
      console.warn('[BinanceSocket] Futures REST initial seed failed, trying Spot REST...', err);
    }

    // 2. Fallback to Binance Spot 24hr Ticker API
    try {
      const resSpot = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (resSpot.ok) {
        const rawData = await resSpot.json();
        if (Array.isArray(rawData) && rawData.length > 0) {
          const mapped: BinanceMiniTickerRaw[] = rawData
            .filter((item: any) => item.symbol && item.symbol.endsWith('USDT'))
            .map((item: any) => ({
              e: '24hrMiniTicker',
              E: item.closeTime || Date.now(),
              s: item.symbol,
              c: item.lastPrice,
              o: item.openPrice,
              h: item.highPrice,
              l: item.lowPrice,
              v: item.volume,
              q: item.quoteVolume,
            }));
          this.queue.push(...mapped);
          this.totalMessages += mapped.length;
          this.startBatchFlushing();
        }
      }
    } catch (err) {
      console.error('[BinanceSocket] Spot REST seed failed:', err);
    }
  }

  private startRestPoller() {
    this.stopRestPoller();
    // Poll REST endpoint every 3 seconds if WebSocket hasn't received messages in last 4 seconds
    this.restPollerTimer = setInterval(async () => {
      const timeSinceLastWsMsg = Date.now() - this.lastWsMessageTime;
      // If WebSocket active in last 4s, no need for aggressive REST polling
      if (timeSinceLastWsMsg < 4000) return;

      try {
        const res = await fetch('https://fapi.binance.com/fapi/v1/ticker/24hr');
        if (res.ok) {
          const rawData = await res.json();
          if (Array.isArray(rawData) && rawData.length > 0) {
            const mapped: BinanceMiniTickerRaw[] = rawData.map((item: any) => ({
              e: '24hrMiniTicker',
              E: item.closeTime || Date.now(),
              s: item.symbol,
              c: item.lastPrice,
              o: item.openPrice,
              h: item.highPrice,
              l: item.lowPrice,
              v: item.volume,
              q: item.quoteVolume,
            }));
            this.queue.push(...mapped);
            this.messageCountInSecond += mapped.length;
            this.totalMessages += mapped.length;
            if (this.onStatusCb && this.queue.length > 0) {
              this.updateStatus('open');
            }
          }
        }
      } catch {
        // Silent catch for poller
      }
    }, 3000);
  }

  private stopRestPoller() {
    if (this.restPollerTimer) {
      clearInterval(this.restPollerTimer);
      this.restPollerTimer = null;
    }
  }

  private scheduleReconnect(reason: string) {
    this.retryCount++;
    if (this.retryCount > this.maxRetries) {
      this.updateStatus('error', `Maksimum yeniden bağlanma denemesi aşıldı. ${reason}`);
      return;
    }

    // Cycle through fallback URLs every reconnect attempt
    this.activeUrlIndex = (this.activeUrlIndex + 1) % this.urls.length;

    const delay = Math.min(
      this.baseDelayMs * Math.pow(1.3, this.retryCount - 1),
      this.maxDelayMs
    );

    this.updateStatus('reconnecting', `Yeniden bağlanılıyor (${this.retryCount}/${this.maxRetries})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  public disconnect() {
    this.isIntentionalDisconnect = true;
    this.clearTimers();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateStatus('closed');
  }

  private startBatchFlushing() {
    if (this.flushIntervalTimer) return;
    // Flush batch every 250ms to keep UI 60fps responsive without React re-render overload
    this.flushIntervalTimer = setInterval(() => {
      if (this.queue.length > 0 && this.onBatchCb) {
        const batchToDeliver = [...this.queue];
        this.queue = [];
        this.onBatchCb(batchToDeliver);
      }
    }, 250);
  }

  private stopBatchFlushing() {
    if (this.flushIntervalTimer) {
      clearInterval(this.flushIntervalTimer);
      this.flushIntervalTimer = null;
    }
    this.queue = [];
  }

  private startMetricsTracking() {
    if (this.metricsTimer) return;
    this.metricsTimer = setInterval(() => {
      if (this.onMetricsCb) {
        this.onMetricsCb(this.totalMessages, this.messageCountInSecond);
      }
      this.messageCountInSecond = 0;
    }, 1000);
  }

  private stopMetricsTracking() {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = null;
    }
  }

  private clearTimers() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopRestPoller();
    this.stopBatchFlushing();
    this.stopMetricsTracking();
  }

  private updateStatus(state: ConnectionState, error: string | null = null) {
    if (this.onStatusCb) {
      this.onStatusCb(state, error);
    }
  }

  /**
   * Run automated health diagnostics on all Binance & exchange endpoints
   */
  public async runDiagnostics(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    // 1. Binance Futures REST API
    const startFAPI = performance.now();
    try {
      const res = await fetch('https://fapi.binance.com/fapi/v1/ticker/24hr');
      const latency = Math.round(performance.now() - startFAPI);
      if (res.ok) {
        const data = await res.json();
        results.push({
          id: 'binance-futures-rest',
          name: 'Binance Futures REST API',
          type: 'REST',
          url: 'https://fapi.binance.com/fapi/v1/ticker/24hr',
          status: 'ok',
          latencyMs: latency,
          itemCount: Array.isArray(data) ? data.length : 0,
          message: `HTTP 200 OK — ${Array.isArray(data) ? data.length : 0} vadeli coin verisi alındı (${latency}ms)`,
        });
      } else {
        results.push({
          id: 'binance-futures-rest',
          name: 'Binance Futures REST API',
          type: 'REST',
          url: 'https://fapi.binance.com/fapi/v1/ticker/24hr',
          status: 'warning',
          latencyMs: latency,
          itemCount: 0,
          message: `HTTP ${res.status} ${res.statusText}`,
        });
      }
    } catch (err) {
      results.push({
        id: 'binance-futures-rest',
        name: 'Binance Futures REST API',
        type: 'REST',
        url: 'https://fapi.binance.com/fapi/v1/ticker/24hr',
        status: 'error',
        latencyMs: Math.round(performance.now() - startFAPI),
        itemCount: 0,
        message: err instanceof Error ? err.message : 'Bağlantı hatası',
      });
    }

    // 2. Binance Spot REST API
    const startSpotAPI = performance.now();
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      const latency = Math.round(performance.now() - startSpotAPI);
      if (res.ok) {
        const data = await res.json();
        results.push({
          id: 'binance-spot-rest',
          name: 'Binance Spot REST API',
          type: 'REST',
          url: 'https://api.binance.com/api/v3/ticker/24hr',
          status: 'ok',
          latencyMs: latency,
          itemCount: Array.isArray(data) ? data.length : 0,
          message: `HTTP 200 OK — ${Array.isArray(data) ? data.length : 0} spot coin verisi alındı (${latency}ms)`,
        });
      } else {
        results.push({
          id: 'binance-spot-rest',
          name: 'Binance Spot REST API',
          type: 'REST',
          url: 'https://api.binance.com/api/v3/ticker/24hr',
          status: 'warning',
          latencyMs: latency,
          itemCount: 0,
          message: `HTTP ${res.status} ${res.statusText}`,
        });
      }
    } catch (err) {
      results.push({
        id: 'binance-spot-rest',
        name: 'Binance Spot REST API',
        type: 'REST',
        url: 'https://api.binance.com/api/v3/ticker/24hr',
        status: 'error',
        latencyMs: Math.round(performance.now() - startSpotAPI),
        itemCount: 0,
        message: err instanceof Error ? err.message : 'Bağlantı hatası',
      });
    }

    // 3. Binance Spot WebSocket
    const startSpotWS = performance.now();
    const spotWsResult = await new Promise<DiagnosticResult>((resolve) => {
      let resolved = false;
      const testWs = new WebSocket(SPOT_WS_URL);
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          testWs.close();
          resolve({
            id: 'binance-spot-ws',
            name: 'Binance Spot WebSocket (!miniTicker@arr)',
            type: 'WebSocket',
            url: SPOT_WS_URL,
            status: 'warning',
            latencyMs: 3000,
            itemCount: 0,
            message: 'Zaman aşımı (3000ms - paket gelmedi)',
          });
        }
      }, 3000);

      testWs.onopen = () => {};
      testWs.onmessage = (evt) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          const latency = Math.round(performance.now() - startSpotWS);
          testWs.close();
          try {
            const parsed = JSON.parse(evt.data);
            const count = Array.isArray(parsed) ? parsed.length : 1;
            resolve({
              id: 'binance-spot-ws',
              name: 'Binance Spot WebSocket (!miniTicker@arr)',
              type: 'WebSocket',
              url: SPOT_WS_URL,
              status: 'ok',
              latencyMs: latency,
              itemCount: count,
              message: `Canlı WebSocket Verisi Alındı — Pakette ${count} coin (${latency}ms)`,
            });
          } catch {
            resolve({
              id: 'binance-spot-ws',
              name: 'Binance Spot WebSocket (!miniTicker@arr)',
              type: 'WebSocket',
              url: SPOT_WS_URL,
              status: 'ok',
              latencyMs: latency,
              itemCount: 1,
              message: `Canlı WebSocket Bağlantısı Başarılı (${latency}ms)`,
            });
          }
        }
      };
      testWs.onerror = (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          testWs.close();
          resolve({
            id: 'binance-spot-ws',
            name: 'Binance Spot WebSocket (!miniTicker@arr)',
            type: 'WebSocket',
            url: SPOT_WS_URL,
            status: 'error',
            latencyMs: Math.round(performance.now() - startSpotWS),
            itemCount: 0,
            message: 'WebSocket bağlantı hatası',
          });
        }
      };
    });
    results.push(spotWsResult);

    // 4. Bybit Futures REST API
    const startBybit = performance.now();
    try {
      const res = await fetch('https://api.bybit.com/v5/market/tickers?category=linear');
      const latency = Math.round(performance.now() - startBybit);
      if (res.ok) {
        const data = await res.json();
        const count = data?.result?.list?.length || 0;
        results.push({
          id: 'bybit-futures-rest',
          name: 'Bybit Futures REST API',
          type: 'REST',
          url: 'https://api.bybit.com/v5/market/tickers?category=linear',
          status: 'ok',
          latencyMs: latency,
          itemCount: count,
          message: `HTTP 200 OK — ${count} Bybit vadeli çift alındı (${latency}ms)`,
        });
      } else {
        results.push({
          id: 'bybit-futures-rest',
          name: 'Bybit Futures REST API',
          type: 'REST',
          url: 'https://api.bybit.com/v5/market/tickers?category=linear',
          status: 'warning',
          latencyMs: latency,
          itemCount: 0,
          message: `HTTP ${res.status}`,
        });
      }
    } catch (err) {
      results.push({
        id: 'bybit-futures-rest',
        name: 'Bybit Futures REST API',
        type: 'REST',
        url: 'https://api.bybit.com/v5/market/tickers?category=linear',
        status: 'error',
        latencyMs: Math.round(performance.now() - startBybit),
        itemCount: 0,
        message: err instanceof Error ? err.message : 'Bağlantı hatası',
      });
    }

    return results;
  }
}

// Singleton instance
export const socketManager = new BinanceSocketManager();

