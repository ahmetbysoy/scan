import { create } from 'zustand';
import {
  AlertTriggerEvent,
  BinanceMiniTickerRaw,
  ConnectionState,
  SortField,
  SortOrder,
  TickerData,
  TimeWindow,
} from '../types/ticker';
import { cleanSymbolName } from '../utils/formatters';
import { trimHistory } from '../utils/calculations';

interface AppState {
  // Data
  tickers: Record<string, TickerData>;
  favorites: string[];
  alerts: AlertTriggerEvent[];

  // Filters & Controls
  timeWindow: TimeWindow;
  searchQuery: string;
  minChangePct: number;
  minPrice: number;
  minVolume: number; // in USDT millions
  positiveOnly: boolean;
  topN: number; // 0 = All, 20, 50, 100
  sortField: SortField;
  sortOrder: SortOrder;
  onlyFavorites: boolean;

  // Alerts & Settings
  alertThresholdPct: number;
  alertCooldownSec: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  mobileViewMode: 'cards' | 'table';
  theme: 'dark' | 'light';
  isPaused: boolean;

  // UI state
  filterDrawerOpen: boolean;
  settingsDrawerOpen: boolean;
  alertsDrawerOpen: boolean;
  dataSourceModalOpen: boolean;
  marketStatsModalOpen: boolean;

  // Diagnostics state
  diagnosticsResults: import('../services/binanceSocket').DiagnosticResult[];
  isTestingDiagnostics: boolean;

  // Socket state
  connectionState: ConnectionState;
  lastSocketError: string | null;
  totalMessagesReceived: number;
  messagesPerSec: number;

  // Actions
  updateTickersBatch: (batch: BinanceMiniTickerRaw[]) => void;
  setTimeWindow: (window: TimeWindow) => void;
  setSearchQuery: (q: string) => void;
  setMinChangePct: (v: number) => void;
  setMinPrice: (v: number) => void;
  setMinVolume: (v: number) => void;
  setPositiveOnly: (v: boolean) => void;
  setTopN: (v: number) => void;
  setSort: (field: SortField, order?: SortOrder) => void;
  toggleSort: (field: SortField) => void;
  setOnlyFavorites: (v: boolean) => void;
  toggleFavorite: (rawSymbol: string) => void;
  setAlertThresholdPct: (v: number) => void;
  setAlertCooldownSec: (v: number) => void;
  setSoundEnabled: (v: boolean) => void;
  setVibrationEnabled: (v: boolean) => void;
  setMobileViewMode: (mode: 'cards' | 'table') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  togglePause: () => void;
  setFilterDrawerOpen: (open: boolean) => void;
  setSettingsDrawerOpen: (open: boolean) => void;
  setAlertsDrawerOpen: (open: boolean) => void;
  setDataSourceModalOpen: (open: boolean) => void;
  setMarketStatsModalOpen: (open: boolean) => void;
  setDiagnosticsResults: (results: import('../services/binanceSocket').DiagnosticResult[]) => void;
  setIsTestingDiagnostics: (testing: boolean) => void;
  setConnectionState: (state: ConnectionState, error?: string | null) => void;
  incrementMessageMetrics: (count: number, rate: number) => void;
  addAlert: (alert: AlertTriggerEvent) => void;
  clearAlerts: () => void;
  resetFilters: () => void;
}

const STORAGE_FAVORITES_KEY = 'binance_momentum_favorites';
const STORAGE_SETTINGS_KEY = 'binance_momentum_settings';

function loadInitialFavorites(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_FAVORITES_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore error
  }
  return ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
}

function loadInitialSettings(): Partial<AppState> {
  try {
    const data = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        return {
          timeWindow: parsed.timeWindow || '5m',
          alertThresholdPct: parsed.alertThresholdPct ?? 3.0,
          alertCooldownSec: parsed.alertCooldownSec ?? 60,
          soundEnabled: parsed.soundEnabled ?? true,
          vibrationEnabled: parsed.vibrationEnabled ?? true,
          mobileViewMode: parsed.mobileViewMode || 'cards',
          theme: parsed.theme || 'dark',
        };
      }
    }
  } catch {
    // Ignore JSON errors
  }
  return {};
}

const initialSettings = loadInitialSettings();

export const useAppStore = create<AppState>((set, get) => ({
  tickers: {},
  favorites: loadInitialFavorites(),
  alerts: [],

  // Filters
  timeWindow: initialSettings.timeWindow || '5m',
  searchQuery: '',
  minChangePct: 0,
  minPrice: 0,
  minVolume: 0,
  positiveOnly: false,
  topN: 0,
  sortField: 'change',
  sortOrder: 'desc',
  onlyFavorites: false,

  // Settings
  alertThresholdPct: initialSettings.alertThresholdPct ?? 3.0,
  alertCooldownSec: initialSettings.alertCooldownSec ?? 60,
  soundEnabled: initialSettings.soundEnabled ?? true,
  vibrationEnabled: initialSettings.vibrationEnabled ?? true,
  mobileViewMode: initialSettings.mobileViewMode || 'cards',
  theme: initialSettings.theme || 'dark',
  isPaused: false,

  // UI Drawers
  filterDrawerOpen: false,
  settingsDrawerOpen: false,
  alertsDrawerOpen: false,
  dataSourceModalOpen: false,
  marketStatsModalOpen: false,

  // Diagnostics
  diagnosticsResults: [],
  isTestingDiagnostics: false,

  // Connection
  connectionState: 'connecting',
  lastSocketError: null,
  totalMessagesReceived: 0,
  messagesPerSec: 0,

  // Batch update ticker history from WebSocket
  updateTickersBatch: (batch: BinanceMiniTickerRaw[]) => {
    if (get().isPaused || batch.length === 0) return;

    const now = Date.now();
    const currentMap = get().tickers;
    const nextMap = { ...currentMap };

    for (let i = 0; i < batch.length; i++) {
      const item = batch[i];
      if (!item.s || !item.s.endsWith('USDT')) continue;

      const rawSymbol = item.s;
      const currentPrice = parseFloat(item.c);
      const open24h = parseFloat(item.o);
      const high24h = parseFloat(item.h);
      const low24h = parseFloat(item.l);
      const volume24h = parseFloat(item.v);
      const quoteVolume24h = parseFloat(item.q);

      if (isNaN(currentPrice) || currentPrice <= 0) continue;

      const existing = nextMap[rawSymbol];
      const history = existing ? [...existing.history] : [];

      // Append new snapshot (throttle snapshots to at most 1 per second per symbol to optimize memory)
      const lastSnap = history[history.length - 1];
      if (!lastSnap || now - lastSnap.t >= 1000) {
        history.push({
          t: now,
          c: currentPrice,
          q: quoteVolume24h,
        });
      } else {
        // Update current snapshot
        history[history.length - 1] = {
          t: now,
          c: currentPrice,
          q: quoteVolume24h,
        };
      }

      // Trim history older than 16 minutes
      const trimmedHistory = trimHistory(history, now);

      const change24h = open24h > 0 ? ((currentPrice - open24h) / open24h) * 100 : 0;

      nextMap[rawSymbol] = {
        symbol: cleanSymbolName(rawSymbol),
        rawSymbol,
        price: currentPrice,
        open24h,
        high24h,
        low24h,
        volume24h,
        quoteVolume24h,
        change24h,
        lastUpdate: now,
        history: trimmedHistory,
      };
    }

    set({ tickers: nextMap });
  },

  setTimeWindow: (window) => {
    set({ timeWindow: window });
    saveSettingsToStorage({ timeWindow: window });
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setMinChangePct: (v) => set({ minChangePct: v }),
  setMinPrice: (v) => set({ minPrice: v }),
  setMinVolume: (v) => set({ minVolume: v }),
  setPositiveOnly: (v) => set({ positiveOnly: v }),
  setTopN: (v) => set({ topN: v }),

  setSort: (field, order) => {
    const currentField = get().sortField;
    const currentOrder = get().sortOrder;
    const nextOrder = order || (currentField === field ? (currentOrder === 'desc' ? 'asc' : 'desc') : 'desc');
    set({ sortField: field, sortOrder: nextOrder });
  },

  toggleSort: (field) => {
    const currentField = get().sortField;
    const currentOrder = get().sortOrder;
    if (currentField === field) {
      set({ sortOrder: currentOrder === 'desc' ? 'asc' : 'desc' });
    } else {
      set({ sortField: field, sortOrder: 'desc' });
    }
  },

  setOnlyFavorites: (v) => set({ onlyFavorites: v }),

  toggleFavorite: (rawSymbol) => {
    const current = get().favorites;
    const next = current.includes(rawSymbol)
      ? current.filter((s) => s !== rawSymbol)
      : [...current, rawSymbol];

    set({ favorites: next });
    try {
      localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(next));
    } catch {
      // Storage full/disabled
    }
  },

  setAlertThresholdPct: (v) => {
    set({ alertThresholdPct: v });
    saveSettingsToStorage({ alertThresholdPct: v });
  },

  setAlertCooldownSec: (v) => {
    set({ alertCooldownSec: v });
    saveSettingsToStorage({ alertCooldownSec: v });
  },

  setSoundEnabled: (v) => {
    set({ soundEnabled: v });
    saveSettingsToStorage({ soundEnabled: v });
  },

  setVibrationEnabled: (v) => {
    set({ vibrationEnabled: v });
    saveSettingsToStorage({ vibrationEnabled: v });
  },

  setMobileViewMode: (mode) => {
    set({ mobileViewMode: mode });
    saveSettingsToStorage({ mobileViewMode: mode });
  },

  setTheme: (theme) => {
    set({ theme });
    saveSettingsToStorage({ theme });
  },

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setFilterDrawerOpen: (open) => set({ filterDrawerOpen: open }),
  setSettingsDrawerOpen: (open) => set({ settingsDrawerOpen: open }),
  setAlertsDrawerOpen: (open) => set({ alertsDrawerOpen: open }),
  setDataSourceModalOpen: (open) => set({ dataSourceModalOpen: open }),
  setMarketStatsModalOpen: (open) => set({ marketStatsModalOpen: open }),
  setDiagnosticsResults: (results) => set({ diagnosticsResults: results }),
  setIsTestingDiagnostics: (testing) => set({ isTestingDiagnostics: testing }),

  setConnectionState: (connectionState, error = null) =>
    set({ connectionState, lastSocketError: error }),

  incrementMessageMetrics: (count, rate) =>
    set((state) => ({
      totalMessagesReceived: state.totalMessagesReceived + count,
      messagesPerSec: rate,
    })),

  addAlert: (alert) =>
    set((state) => {
      // Prevent duplicate alert by ID
      if (state.alerts.some((a) => a.id === alert.id)) {
        return state;
      }
      const updatedAlerts = [alert, ...state.alerts].slice(0, 50);
      return {
        alerts: updatedAlerts,
      };
    }),

  clearAlerts: () => set({ alerts: [] }),

  resetFilters: () =>
    set({
      searchQuery: '',
      minChangePct: 0,
      minPrice: 0,
      minVolume: 0,
      positiveOnly: false,
      topN: 0,
      onlyFavorites: false,
      sortField: 'change',
      sortOrder: 'desc',
    }),
}));

function saveSettingsToStorage(partial: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    const updated = { ...(existing && typeof existing === 'object' ? existing : {}), ...partial };
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}
