import React from 'react';
import {
  TrendingUp,
  Star,
  BarChart2,
  Server,
  Settings,
  Filter,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const MobileBottomNav: React.FC = () => {
  const onlyFavorites = useAppStore((state) => state.onlyFavorites);
  const setOnlyFavorites = useAppStore((state) => state.setOnlyFavorites);
  const favorites = useAppStore((state) => state.favorites);

  const marketStatsModalOpen = useAppStore((state) => state.marketStatsModalOpen);
  const setMarketStatsModalOpen = useAppStore((state) => state.setMarketStatsModalOpen);

  const dataSourceModalOpen = useAppStore((state) => state.dataSourceModalOpen);
  const setDataSourceModalOpen = useAppStore((state) => state.setDataSourceModalOpen);

  const settingsDrawerOpen = useAppStore((state) => state.settingsDrawerOpen);
  const setSettingsDrawerOpen = useAppStore((state) => state.setSettingsDrawerOpen);
  const setFilterDrawerOpen = useAppStore((state) => state.setFilterDrawerOpen);

  const searchQuery = useAppStore((state) => state.searchQuery);
  const minChangePct = useAppStore((state) => state.minChangePct);
  const minPrice = useAppStore((state) => state.minPrice);
  const minVolume = useAppStore((state) => state.minVolume);
  const positiveOnly = useAppStore((state) => state.positiveOnly);
  const topN = useAppStore((state) => state.topN);

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (minChangePct > 0 ? 1 : 0) +
    (minPrice > 0 ? 1 : 0) +
    (minVolume > 0 ? 1 : 0) +
    (positiveOnly ? 1 : 0) +
    (topN > 0 ? 1 : 0) +
    (onlyFavorites ? 1 : 0);

  // Determine active tab
  let activeTab = 'markets';
  if (onlyFavorites) {
    activeTab = 'favorites';
  } else if (marketStatsModalOpen) {
    activeTab = 'stats';
  } else if (dataSourceModalOpen) {
    activeTab = 'data';
  } else if (settingsDrawerOpen) {
    activeTab = 'settings';
  }

  const handleTabClick = (tabId: string) => {
    if (tabId === 'markets') {
      setOnlyFavorites(false);
      setMarketStatsModalOpen(false);
      setDataSourceModalOpen(false);
      setSettingsDrawerOpen(false);
    } else if (tabId === 'favorites') {
      setOnlyFavorites(true);
      setMarketStatsModalOpen(false);
      setDataSourceModalOpen(false);
      setSettingsDrawerOpen(false);
    } else if (tabId === 'stats') {
      setMarketStatsModalOpen(!marketStatsModalOpen);
      setDataSourceModalOpen(false);
      setSettingsDrawerOpen(false);
    } else if (tabId === 'data') {
      setDataSourceModalOpen(true);
      setMarketStatsModalOpen(false);
      setSettingsDrawerOpen(false);
    } else if (tabId === 'settings') {
      setSettingsDrawerOpen(true);
      setMarketStatsModalOpen(false);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] transition-all">
      <div className="max-w-md mx-auto px-2 py-1 flex items-center justify-around h-14">
        {/* Tab 1: Piyasalar */}
        <button
          onClick={() => handleTabClick('markets')}
          className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 ${
            activeTab === 'markets'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'markets' && (
            <span className="absolute -top-1 w-8 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          )}
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Piyasalar</span>
        </button>

        {/* Tab 2: Favoriler */}
        <button
          onClick={() => handleTabClick('favorites')}
          className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 ${
            activeTab === 'favorites'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'favorites' && (
            <span className="absolute -top-1 w-8 h-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          )}
          <div className="relative">
            <Star className={`w-5 h-5 mb-0.5 ${activeTab === 'favorites' ? 'fill-amber-400' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex h-3.5 min-w-[14px] px-1 items-center justify-center rounded-full bg-amber-500 text-[8px] font-extrabold text-slate-950">
                {favorites.length}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Favoriler</span>
        </button>

        {/* Tab 3: Özet */}
        <button
          onClick={() => handleTabClick('stats')}
          className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 ${
            activeTab === 'stats'
              ? 'text-teal-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'stats' && (
            <span className="absolute -top-1 w-8 h-1 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
          )}
          <BarChart2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Özet</span>
        </button>

        {/* Tab 4: Veri Testi */}
        <button
          onClick={() => handleTabClick('data')}
          className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 ${
            activeTab === 'data'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'data' && (
            <span className="absolute -top-1 w-8 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          )}
          <Server className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Veri Testi</span>
        </button>

        {/* Tab 5: Ayarlar & Filtre */}
        <button
          onClick={() => handleTabClick('settings')}
          className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 ${
            activeTab === 'settings'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'settings' && (
            <span className="absolute -top-1 w-8 h-1 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
          )}
          <div className="relative">
            <Settings className="w-5 h-5 mb-0.5" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-extrabold text-slate-950">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Ayarlar</span>
        </button>
      </div>
    </nav>
  );
};
