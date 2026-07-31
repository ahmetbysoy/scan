import React from 'react';
import { X, RotateCcw, Filter, Check, TrendingUp, DollarSign, BarChart3, Star, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const FilterPanel: React.FC = () => {
  const filterDrawerOpen = useAppStore((state) => state.filterDrawerOpen);
  const setFilterDrawerOpen = useAppStore((state) => state.setFilterDrawerOpen);

  const minChangePct = useAppStore((state) => state.minChangePct);
  const setMinChangePct = useAppStore((state) => state.setMinChangePct);

  const minPrice = useAppStore((state) => state.minPrice);
  const setMinPrice = useAppStore((state) => state.setMinPrice);

  const minVolume = useAppStore((state) => state.minVolume);
  const setMinVolume = useAppStore((state) => state.setMinVolume);

  const positiveOnly = useAppStore((state) => state.positiveOnly);
  const setPositiveOnly = useAppStore((state) => state.setPositiveOnly);

  const onlyFavorites = useAppStore((state) => state.onlyFavorites);
  const setOnlyFavorites = useAppStore((state) => state.setOnlyFavorites);

  const topN = useAppStore((state) => state.topN);
  const setTopN = useAppStore((state) => state.setTopN);

  const resetFilters = useAppStore((state) => state.resetFilters);

  if (!filterDrawerOpen) return null;

  const quickMinChanges = [0, 0.5, 1.0, 2.0, 3.0, 5.0];
  const quickMinVolumes = [0, 5, 10, 50, 100, 500];
  const topNOptions = [
    { label: 'Tümü', value: 0 },
    { label: 'Top 20', value: 20 },
    { label: 'Top 50', value: 50 },
    { label: 'Top 100', value: 100 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setFilterDrawerOpen(false)}
      />

      {/* Slide-up bottom sheet on mobile, slide-over drawer on desktop */}
      <div className="relative w-full sm:max-w-md bg-slate-900 border-t sm:border-l border-slate-800 shadow-2xl flex flex-col h-[85vh] sm:h-full rounded-t-2xl sm:rounded-t-none mt-auto sm:mt-0 z-10 transition-transform">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Filtreleme Seçenekleri</h2>
              <p className="text-xs text-slate-400">Momentum tarayıcısı detaylı filtreleri</p>
            </div>
          </div>

          <button
            onClick={() => setFilterDrawerOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Minimum Change Percentage Slider & Quick Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Minimum Değişim Oranı (%)</span>
              </label>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                %{minChangePct.toFixed(1)}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="15"
              step="0.1"
              value={minChangePct}
              onChange={(e) => setMinChangePct(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickMinChanges.map((val) => (
                <button
                  key={val}
                  onClick={() => setMinChangePct(val)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                    minChangePct === val
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                  }`}
                >
                  %{val}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum 24h Volume (Millions USDT) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <BarChart3 className="w-4 h-4 text-teal-400" />
                <span>Minimum 24s Hacim ($M USDT)</span>
              </label>
              <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                ${minVolume}M
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="500"
              step="5"
              value={minVolume}
              onChange={(e) => setMinVolume(parseFloat(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickMinVolumes.map((val) => (
                <button
                  key={val}
                  onClick={() => setMinVolume(val)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                    minVolume === val
                      ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                  }`}
                >
                  ${val}M
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Price Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-indigo-400" />
              <span>Minimum Fiyat ($)</span>
            </label>
            <input
              type="number"
              step="0.001"
              value={minPrice || ''}
              onChange={(e) => setMinPrice(parseFloat(e.target.value) || 0)}
              placeholder="0 (Filtresiz)"
              className="w-full bg-slate-800/80 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Top N Limit */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Gösterilecek Maksimum Coin (Top N)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {topNOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTopN(opt.value)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    topN === opt.value
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles: Positive Only & Only Favorites */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
              <span className="text-xs font-medium text-slate-200">Yalnızca Yükselenler (Pozitif %)</span>
              <input
                type="checkbox"
                checked={positiveOnly}
                onChange={(e) => setPositiveOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-medium text-slate-200">Sadece Favoriler</span>
              </div>
              <input
                type="checkbox"
                checked={onlyFavorites}
                onChange={(e) => setOnlyFavorites(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between gap-3">
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-xs font-medium min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Filtreleri Sıfırla</span>
          </button>

          <button
            onClick={() => setFilterDrawerOpen(false)}
            className="flex-1 flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:brightness-110 transition-all text-xs min-h-[44px]"
          >
            <Check className="w-4 h-4" />
            <span>Sonuçları Uygula</span>
          </button>
        </div>
      </div>
    </div>
  );
};
