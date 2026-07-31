import React from 'react';
import { Star, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { useAppStore } from '../../store/useAppStore';
import { TickerMomentum } from '../../types/ticker';
import { formatPercent, formatPrice, formatVolume } from '../../utils/formatters';

interface CoinListItemRowProps {
  item: TickerMomentum;
  style?: React.CSSProperties;
}

export const CoinListItemRow: React.FC<CoinListItemRowProps> = React.memo(({ item, style }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const timeWindow = useAppStore((state) => state.timeWindow);

  const fav = isFavorite(item.ticker.rawSymbol);
  const isPositive = item.selectedChange >= 0;
  const is24hPositive = item.ticker.change24h >= 0;

  const binanceUrl = `https://www.binance.com/en/futures/${item.ticker.rawSymbol}`;

  return (
    <div style={style} className="px-3 py-1">
      <div className="grid grid-cols-12 items-center px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-800/50 transition-all text-xs">
        {/* Symbol & Fav Star */}
        <div className="col-span-3 flex items-center space-x-2.5 min-w-0">
          <button
            onClick={() => toggleFavorite(item.ticker.rawSymbol)}
            className="p-1.5 -m-1 rounded-lg text-slate-500 hover:text-amber-400 transition-colors shrink-0"
            title={fav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          >
            <Star
              className={`w-4 h-4 ${
                fav ? 'fill-amber-400 text-amber-400' : 'text-slate-500'
              }`}
            />
          </button>

          <a
            href={binanceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center space-x-1 min-w-0 font-bold text-white hover:text-emerald-400 transition-colors"
          >
            <span className="text-xs sm:text-sm tracking-tight shrink-0 font-extrabold">{item.ticker.symbol}</span>
            <span className="text-[10px] text-slate-500 font-normal shrink-0">USDT</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 shrink-0" />
          </a>
        </div>

        {/* Current Price */}
        <div className="col-span-3 text-right font-mono font-bold text-slate-100 text-sm">
          ${formatPrice(item.ticker.price)}
        </div>

        {/* Selected Window Change % */}
        <div className="col-span-2 text-right">
          <span
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{formatPercent(item.selectedChange)}</span>
          </span>
        </div>

        {/* 24h Change % */}
        <div className="col-span-2 text-right font-mono font-semibold text-xs">
          <span className={is24hPositive ? 'text-emerald-400' : 'text-rose-400'}>
            {formatPercent(item.ticker.change24h)}
          </span>
        </div>

        {/* 24h Volume */}
        <div className="col-span-2 text-right font-mono text-slate-300 font-medium">
          {formatVolume(item.ticker.quoteVolume24h)}
        </div>
      </div>
    </div>
  );
});

CoinListItemRow.displayName = 'CoinListItemRow';
