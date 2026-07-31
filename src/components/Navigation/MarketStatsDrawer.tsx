import React from 'react';
import { X, Trophy, Flame, BarChart2, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useMomentumTracker } from '../../hooks/useMomentumTracker';
import { formatPercent, formatVolume, formatPrice } from '../../utils/formatters';
import { TimeWindow } from '../../types/ticker';

export const MarketStatsDrawer: React.FC = () => {
  const isOpen = useAppStore((state) => state.marketStatsModalOpen);
  const setIsOpen = useAppStore((state) => state.setMarketStatsModalOpen);
  const timeWindow = useAppStore((state) => state.timeWindow);
  const setTimeWindow = useAppStore((state) => state.setTimeWindow);

  const { stats } = useMomentumTracker();

  if (!isOpen) return null;

  const windows: { id: TimeWindow; label: string }[] = [
    { id: '1m', label: '1 Dakika' },
    { id: '5m', label: '5 Dakika' },
    { id: '15m', label: '15 Dakika' },
    { id: '24h', label: '24 Saat' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Piyasa Momentum Özeti</h3>
              <p className="text-xs text-slate-400">Canlı vadeli işlemler metrikleri</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Time Window Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aktif Zaman Dilimi</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {windows.map((w) => (
              <button
                key={w.id}
                onClick={() => setTimeWindow(w.id)}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  timeWindow === w.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Total Parity */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-400 font-medium uppercase block">
              Toplam Parite
            </span>
            <div className="text-lg font-black text-white font-mono">
              {stats.totalCount} <span className="text-xs font-normal text-slate-400">Coin</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold pt-1">
              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                +{stats.gainersCount} Yükselen
              </span>
              <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                -{stats.losersCount} Düşen
              </span>
            </div>
          </div>

          {/* 24h Total Volume */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-400 font-medium uppercase block">
              24s Toplam Hacim
            </span>
            <div className="text-lg font-black text-white font-mono">
              {formatVolume(stats.totalVolume)}
            </div>
            <div className="text-[11px] text-teal-400 flex items-center space-x-1 pt-1">
              <Activity className="w-3 h-3" />
              <span>USDT Hacim Akışı</span>
            </div>
          </div>
        </div>

        {/* Top Gainer Spotlight */}
        {stats.topGainer && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-teal-950/40 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400">
                <Flame className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>En Yüksek Momentum ({timeWindow})</span>
              </div>
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xl font-black text-white tracking-tight">
                  {stats.topGainer.ticker.symbol}
                </span>
                <span className="text-xs text-slate-400 ml-1.5 font-normal">USDT</span>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Fiyat: <span className="text-slate-200 font-bold">${formatPrice(stats.topGainer.ticker.price)}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-black text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{formatPercent(stats.topGainer.selectedChange)}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  24s Hacim: {formatVolume(stats.topGainer.ticker.quoteVolume24h)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};
