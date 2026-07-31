import React, { useRef, useEffect, useState } from 'react';
import { List } from 'react-window';

import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Trophy,
  Flame,
} from 'lucide-react';
import { useMomentumTracker } from '../../hooks/useMomentumTracker';
import { useAppStore } from '../../store/useAppStore';
import { SortField, TickerMomentum } from '../../types/ticker';
import { formatPercent, formatVolume } from '../../utils/formatters';
import { CoinListItemCard } from './CoinListItemCard';
import { CoinListItemRow } from './CoinListItemRow';
import { EmptyState } from '../EmptyState/EmptyState';

export const CoinListContainer: React.FC = () => {
  const { processedList, stats } = useMomentumTracker();

  const mobileViewMode = useAppStore((state) => state.mobileViewMode);
  const timeWindow = useAppStore((state) => state.timeWindow);
  const sortField = useAppStore((state) => state.sortField);
  const sortOrder = useAppStore((state) => state.sortOrder);
  const toggleSort = useAppStore((state) => state.toggleSort);
  const onlyFavorites = useAppStore((state) => state.onlyFavorites);

  const containerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(600);
  const [listWidth, setListWidth] = useState(800);

  // Dynamically calculate virtualized list dimensions with bottom navbar offset
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Subtract bottom navbar height (approx 64px) + padding
        const availableHeight = window.innerHeight - rect.top - 68;
        setListHeight(Math.max(320, availableHeight));
        setListWidth(rect.width);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const renderSortHeader = (field: SortField, label: string, className = '') => {
    const isActive = sortField === field;
    return (
      <button
        onClick={() => toggleSort(field)}
        className={`flex items-center space-x-1 hover:text-white transition-colors text-[11px] font-semibold tracking-wider uppercase ${className} ${
          isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'
        }`}
      >
        <span>{label}</span>
        {isActive ? (
          sortOrder === 'desc' ? (
            <ArrowDown className="w-3 h-3 text-emerald-400" />
          ) : (
            <ArrowUp className="w-3 h-3 text-emerald-400" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60" />
        )}
      </button>
    );
  };

  if (processedList.length === 0) {
    if (onlyFavorites) {
      return <EmptyState reason="no-favorites" />;
    }
    return <EmptyState reason="no-matches" />;
  }

  const isCardView = mobileViewMode === 'cards';
  const itemHeight = isCardView ? 76 : 48;

  // React Window row renderer
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = processedList[index];
    if (!item) return null;

    if (isCardView) {
      return <CoinListItemCard key={item.ticker.rawSymbol} item={item} style={style} />;
    }
    return <CoinListItemRow key={item.ticker.rawSymbol} item={item} style={style} />;
  };

  const windowLabelMap: Record<string, string> = {
    '1m': '1dk Değişim',
    '5m': '5dk Değişim',
    '15m': '15dk Değişim',
    '24h': '24s Değişim',
  };

  return (
    <div className="flex flex-col flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 py-3 space-y-3">
      {/* Summary Stats Header Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-medium uppercase block">Toplam Parite</span>
            <span className="text-sm font-bold text-white font-mono">{stats.totalCount} Coin</span>
          </div>
          <div className="flex space-x-1.5 text-[11px] font-mono shrink-0">
            <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">
              +{stats.gainersCount}
            </span>
            <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded font-bold">
              -{stats.losersCount}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-medium uppercase block">24s Top Hacim</span>
            <span className="text-sm font-bold text-white font-mono">
              {formatVolume(stats.totalVolume)}
            </span>
          </div>
          <BarChart2 className="w-4 h-4 text-teal-400 shrink-0" />
        </div>

        {stats.topGainer && (
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-medium uppercase block flex items-center space-x-1">
                <Flame className="w-3 h-3 text-emerald-400" />
                <span>En Yüksek Momentum</span>
              </span>
              <div className="flex items-center space-x-1.5 font-bold text-white text-xs truncate">
                <span className="text-emerald-400 font-mono">{stats.topGainer.ticker.symbol}</span>
                <span className="font-mono text-emerald-400">
                  +{formatPercent(stats.topGainer.selectedChange)}
                </span>
              </div>
            </div>
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
        )}

        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-medium uppercase block">Aktif Pencere</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mt-0.5">
              {windowLabelMap[timeWindow] || timeWindow}
            </span>
          </div>
        </div>
      </div>

      {/* Sorting bar for Cards view or Table Header for Table view */}
      {isCardView ? (
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border border-slate-800/80 rounded-xl text-xs">
          <span className="text-slate-400 text-xs font-semibold">Sıralama:</span>
          <div className="flex items-center space-x-4">
            {renderSortHeader('change', windowLabelMap[timeWindow] || 'Değişim')}
            {renderSortHeader('volume', 'Hacim')}
            {renderSortHeader('price', 'Fiyat')}
            {renderSortHeader('symbol', 'Sembol')}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 items-center px-7 py-2.5 bg-slate-900/90 border border-slate-800/80 rounded-xl text-xs font-semibold">
          <div className="col-span-3">{renderSortHeader('symbol', 'Sembol')}</div>
          <div className="col-span-3 text-right">{renderSortHeader('price', 'Fiyat', 'justify-end')}</div>
          <div className="col-span-2 text-right">{renderSortHeader('change', windowLabelMap[timeWindow] || 'Değişim', 'justify-end')}</div>
          <div className="col-span-2 text-right">{renderSortHeader('24hChange', '24s Değişim', 'justify-end')}</div>
          <div className="col-span-2 text-right">{renderSortHeader('volume', '24s Hacim', 'justify-end')}</div>
        </div>
      )}

      {/* Virtualized List View Container */}
      <div ref={containerRef} className="flex-1 min-h-[350px] pb-20 sm:pb-4">
        <List
          height={listHeight}
          width={listWidth}
          rowCount={processedList.length}
          rowHeight={itemHeight}
          rowComponent={Row}
          rowProps={{} as any}
          className="scroll-smooth focus:outline-none"
        />
      </div>
    </div>
  );
};
