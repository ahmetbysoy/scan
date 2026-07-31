import React from 'react';
import { Header } from './components/Header/Header';
import { ConnectionStatus } from './components/ConnectionStatus/ConnectionStatus';
import { FilterPanel } from './components/FilterPanel/FilterPanel';
import { SettingsDrawer } from './components/SettingsDrawer/SettingsDrawer';
import { AlertToastContainer } from './components/Alerts/AlertToastContainer';
import { CoinListContainer } from './components/CoinList/CoinListContainer';
import { EmptyState } from './components/EmptyState/EmptyState';
import { useBinanceSocket } from './hooks/useBinanceSocket';
import { useAppStore } from './store/useAppStore';

export default function App() {
  // Initialize Binance WebSocket manager & state listeners
  useBinanceSocket();

  const theme = useAppStore((state) => state.theme);
  const tickers = useAppStore((state) => state.tickers);
  const connectionState = useAppStore((state) => state.connectionState);

  const hasTickers = Object.keys(tickers).length > 0;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Header */}
      <Header />

      {/* Connection status banner (shown if disconnected / reconnecting) */}
      <ConnectionStatus />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {!hasTickers && connectionState === 'connecting' ? (
          <EmptyState reason="loading" />
        ) : (
          <CoinListContainer />
        )}
      </main>

      {/* Drawers & Toast Containers */}
      <FilterPanel />
      <SettingsDrawer />
      <AlertToastContainer />

      {/* Minimalist Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-3 text-center text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Binance Futures WebSocket (!miniTicker@arr) Canlı Piyasa Tarayıcısı
          </div>
          <div className="flex items-center space-x-3 font-mono text-[10px]">
            <span className="text-emerald-400">● 60 FPS Virtualized UI</span>
            <span>Rolling 1m/5m/15m Window</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
