import React from 'react';
import {
  Bell,
  Filter,
  Pause,
  Play,
  RefreshCw,
  Search,
  Settings,
  Sun,
  Moon,
  Zap,
  Star,
  Activity,
  X,
  Server,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TimeWindow } from '../../types/ticker';

export const Header: React.FC = () => {
  const timeWindow = useAppStore((state) => state.timeWindow);
  const setTimeWindow = useAppStore((state) => state.setTimeWindow);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);

  const connectionState = useAppStore((state) => state.connectionState);
  const messagesPerSec = useAppStore((state) => state.messagesPerSec);
  const isPaused = useAppStore((state) => state.isPaused);
  const togglePause = useAppStore((state) => state.togglePause);

  const setFilterDrawerOpen = useAppStore((state) => state.setFilterDrawerOpen);
  const setSettingsDrawerOpen = useAppStore((state) => state.setSettingsDrawerOpen);
  const setAlertsDrawerOpen = useAppStore((state) => state.setAlertsDrawerOpen);
  const setDataSourceModalOpen = useAppStore((state) => state.setDataSourceModalOpen);

  const alerts = useAppStore((state) => state.alerts);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  const onlyFavorites = useAppStore((state) => state.onlyFavorites);
  const setOnlyFavorites = useAppStore((state) => state.setOnlyFavorites);
  const favorites = useAppStore((state) => state.favorites);

  const minChangePct = useAppStore((state) => state.minChangePct);
  const minPrice = useAppStore((state) => state.minPrice);
  const minVolume = useAppStore((state) => state.minVolume);
  const positiveOnly = useAppStore((state) => state.positiveOnly);
  const topN = useAppStore((state) => state.topN);

  // Calculate active filters count
  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (minChangePct > 0 ? 1 : 0) +
    (minPrice > 0 ? 1 : 0) +
    (minVolume > 0 ? 1 : 0) +
    (positiveOnly ? 1 : 0) +
    (topN > 0 ? 1 : 0) +
    (onlyFavorites ? 1 : 0);

  const windows: { id: TimeWindow; label: string }[] = [
    { id: '1m', label: '1dk' },
    { id: '5m', label: '5dk' },
    { id: '15m', label: '15dk' },
    { id: '24h', label: '24s' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-3 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col space-y-2">
        {/* Top Row: Title, Status, and Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-white tracking-tight truncate">
                  Futures<span className="text-emerald-400">Momentum</span>
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                  Canlı
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xs:block truncate">
                Binance USDT Vadeli İşlemler Taraması
              </p>
            </div>
          </div>

          {/* Connection Status Badge & Rate */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={() => setDataSourceModalOpen(true)}
              title="Veri Kaynakları Test Paneli"
              className="hidden sm:flex items-center space-x-1 px-2 py-1 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800 rounded-full text-[11px] text-slate-300 transition-colors"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline font-medium">Veri Testi</span>
            </button>

            {connectionState === 'open' ? (
              <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] text-emerald-400 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline">Canlı</span>
                <span className="text-[10px] text-emerald-500/80 font-mono">
                  {messagesPerSec}/s
                </span>
              </div>
            ) : connectionState === 'connecting' || connectionState === 'reconnecting' ? (
              <div className="flex items-center space-x-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[11px] text-amber-400 font-medium animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span className="text-[10px] sm:text-[11px]">Bağlanıyor...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-[11px] text-rose-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                <span className="text-[10px] sm:text-[11px]">Kesildi</span>
              </div>
            )}

            {/* Stream Pause/Resume Toggle */}
            <button
              onClick={togglePause}
              title={isPaused ? 'Canlı Akışı Başlat' : 'Canlı Akışı Duraklat'}
              className={`p-1.5 sm:p-2 rounded-xl border text-xs transition-colors flex items-center justify-center min-w-[34px] min-h-[34px] sm:min-w-[36px] sm:min-h-[36px] ${
                isPaused
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors min-w-[34px] min-h-[34px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
              title="Temayı Değiştir"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Alerts Drawer Button */}
            <button
              onClick={() => setAlertsDrawerOpen(true)}
              className="relative p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors min-w-[34px] min-h-[34px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
              title="Uyarı Geçmişi"
            >
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                  {alerts.length > 99 ? '99+' : alerts.length}
                </span>
              )}
            </button>

            {/* Settings Drawer Button (desktop only since bottom nav handles it on mobile) */}
            <button
              onClick={() => setSettingsDrawerOpen(true)}
              className="hidden sm:flex p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors min-w-[36px] min-h-[36px] items-center justify-center"
              title="Ayarlar"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Bar: Search, Window Pills, Favorites & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Quick Time Window Switcher Pills */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800/80">
            {windows.map((w) => (
              <button
                key={w.id}
                onClick={() => setTimeWindow(w.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all min-h-[32px] ${
                  timeWindow === w.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>

          {/* Search & Action Buttons */}
          <div className="flex items-center space-x-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Coin ara (örn: BTC, SOL, PEPE)..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors min-h-[36px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Only Favorites Quick Toggle */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all min-h-[36px] ${
                onlyFavorites
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Sadece Favorileri Göster"
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Favoriler</span>
              {favorites.length > 0 && (
                <span className="text-[10px] bg-slate-800 px-1 rounded-md text-slate-300">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Filter Panel Open Button */}
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className={`relative flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all min-h-[36px] ${
                activeFiltersCount > 0
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filtrele</span>
              {activeFiltersCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
