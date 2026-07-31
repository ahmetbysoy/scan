import React from 'react';
import { Star, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { useAppStore } from '../../store/useAppStore';
import { TickerMomentum } from '../../types/ticker';
import { formatPercent, formatPrice, formatVolume } from '../../utils/formatters';

interface CoinListItemCardProps {
  item: TickerMomentum;
  style?: React.CSSProperties;
}

export const CoinListItemCard: React.FC<CoinListItemCardProps> = React.memo(({ item, style }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const timeWindow = useAppStore((state) => state.timeWindow);

  const fav = isFavorite(item.ticker.rawSymbol);
  const isPositive = item.selectedChange >= 0;
  const is24hPositive = item.ticker.change24h >= 0;

  // External Binance futures trade link
  const binanceUrl = `https://www.binance.com/en/futures/${item.ticker.rawSymbol}`;

  return (
    <div style={style} className="px-3 py-1.5">
      <div
        className={`relative p-3.5 rounded-2xl border transition-all duration-200 bg-slate-900/80 backdrop-blur-sm shadow-md hover:shadow-lg hover:border-slate-700/80 ${
          isPositive
            ? 'hover:bg-slate-900/90 border-slate-800/80'
            : 'hover:bg-slate-900/90 border-slate-800/80'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Symbol & Favorite Star */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(item.ticker.rawSymbol);
              }}
              className="p-2 -m-1 rounded-xl hover:bg-slate-800 text-slate-500 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
              title={fav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            >
              <Star
                className={`w-4 h-4 ${
                  fav ? 'fill-amber-400 text-amber-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              />
            </button>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-white text-base tracking-tight truncate">
                  {item.ticker.symbol}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 px-1.5 py-0.2 bg-slate-800 rounded">
                  USDT
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                <span>Hacim: <strong className="text-slate-300 font-mono">{formatVolume(item.ticker.quoteVolume24h)}</strong></span>
              </div>
            </div>
          </div>

          {/* Price & Momentum Change Badge */}
          <div className="flex items-center space-x-3 text-right shrink-0">
            <div className="flex flex-col items-end">
              <span className="font-mono font-bold text-white text-base">
                ${formatPrice(item.ticker.price)}
              </span>

              {/* 24h small pill */}
              <span
                className={`text-[10px] font-mono font-medium ${
                  is24hPositive ? 'text-emerald-400/80' : 'text-rose-400/80'
                }`}
              >
                24s: {formatPercent(item.ticker.change24h)}
              </span>
            </div>

            {/* Selected Window Change Badge Pill */}
            <a
              href={binanceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-xl border text-xs font-mono font-extrabold shadow-sm transition-transform active:scale-95 min-w-[80px] min-h-[44px] ${
                isPositive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                  : 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5 shrink-0" /> : <TrendingDown className="w-3.5 h-3.5 shrink-0" />}
              <span>{formatPercent(item.selectedChange)}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

CoinListItemCard.displayName = 'CoinListItemCard';
