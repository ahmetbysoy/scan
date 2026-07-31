import { BinanceMiniTickerRaw, ConnectionState } from '../types/ticker';

const PRIMARY_WS_URL = 'wss://fstream.binance.com/ws/!miniTicker@arr';
const FALLBACK_WS_URL = 'wss://fstream.binance.com/market/!miniTicker@arr';

type BatchCallback = (tickers: BinanceMiniTickerRaw[]) => void;
type StatusCallback = (state: ConnectionState, error?: string | null) => void;
type MetricsCallback = (count: number, rate: number) => void;

export class BinanceSocketManager {
  private ws: WebSocket | null = null;
  private isIntentionalDisconnect = false;
  private retryCount = 0;
  private maxRetries = 25;
  private baseDelayMs = 1000;
  private maxDelayMs = 20000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private activeUrlIndex = 0;
  private urls = [PRIMARY_WS_URL, FALLBACK_WS_URL];

  // Batching queue for 250ms UI update cycle
  private queue: BinanceMiniTickerRaw[] = [];
  private flushIntervalTimer: ReturnType<typeof setInterval> | null = null;
  private metricsTimer: ReturnType<typeof setInterval> | null = null;

  private messageCountInSecond = 0;
  private totalMessages = 0;

  private onBatchCb: BatchCallback | null = null;
  private onStatusCb: StatusCallback | null = null;
  private onMetricsCb: MetricsCallback | null = null;

  public subscribe(onBatch: BatchCallback, onStatus: StatusCallback, onMetrics: MetricsCallback) {
    this.onBatchCb = onBatch;
    this.onStatusCb = onStatus;
    this.onMetricsCb = onMetrics;
  }

  public connect() {
    this.isIntentionalDisconnect = false;
    this.clearTimers();
    this.updateStatus('connecting');

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
          if (Array.isArray(data)) {
            this.queue.push(...data);
            this.messageCountInSecond += data.length;
            this.totalMessages += data.length;
          } else if (data && data.e === '24hrMiniTicker') {
            this.queue.push(data);
            this.messageCountInSecond += 1;
            this.totalMessages += 1;
          }
        } catch (err) {
          console.error('[BinanceSocket] JSON Parse Error:', err);
          if (this.onStatusCb) {
            this.onStatusCb('error', 'Veri paketleşme hatası (JSON Parse Error)');
          }
        }
      };

      this.ws.onerror = (evt) => {
        console.warn('[BinanceSocket] WebSocket Error:', evt);
        this.updateStatus('error', 'Binance WebSocket bağlantı hatası');
      };

      this.ws.onclose = (event) => {
        this.stopBatchFlushing();
        this.stopMetricsTracking();

        if (this.isIntentionalDisconnect) {
          this.updateStatus('closed');
          return;
        }

        this.scheduleReconnect(event.reason || 'Bağlantı kesildi');
      };
    } catch (err) {
      console.error('[BinanceSocket] Instant initialization error:', err);
      this.scheduleReconnect(err instanceof Error ? err.message : 'Bağlantı başlatılamadı');
    }
  }

  private scheduleReconnect(reason: string) {
    this.retryCount++;
    if (this.retryCount > this.maxRetries) {
      this.updateStatus('error', `Maksimum yeniden bağlanma denemesi aşıldı (${this.maxRetries}). ${reason}`);
      return;
    }

    // Switch URL if failed multiple times
    if (this.retryCount % 3 === 0) {
      this.activeUrlIndex = (this.activeUrlIndex + 1) % this.urls.length;
    }

    const delay = Math.min(
      this.baseDelayMs * Math.pow(1.5, this.retryCount - 1),
      this.maxDelayMs
    );

    this.updateStatus('reconnecting', `Yeniden bağlanılıyor (${this.retryCount}/${this.maxRetries}) - ${reason}`);

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
    this.stopBatchFlushing();
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
    this.stopMetricsTracking();
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
    this.stopBatchFlushing();
    this.stopMetricsTracking();
  }

  private updateStatus(state: ConnectionState, error: string | null = null) {
    if (this.onStatusCb) {
      this.onStatusCb(state, error);
    }
  }
}

// Singleton instance
export const socketManager = new BinanceSocketManager();
