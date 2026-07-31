import React from 'react';
import { SearchX, RotateCcw, Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface EmptyStateProps {
  reason: 'no-matches' | 'no-favorites' | 'loading';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ reason }) => {
  const resetFilters = useAppStore((state) => state.resetFilters);
  const setOnlyFavorites = useAppStore((state) => state.setOnlyFavorites);

  if (reason === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 animate-bounce">
          <Zap className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white">Binance Futures Canlı Akışı Bekleniyor</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          WebSocket üzerinden USDT vadeli işlem pariteleri çekiliyor. Birkaç saniye içinde liste güncellenecektir...
        </p>
      </div>
    );
  }

  if (reason === 'no-favorites') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 mb-4">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white">Favori Coin Bulunmuyor</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Henüz hiç coin favorilere eklenmedi. Listeden yıldız ikonuna tıklayarak favorilerinizi seçebilirsiniz.
        </p>
        <button
          onClick={() => setOnlyFavorites(false)}
          className="mt-4 flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
        >
          <span>Tüm Coinleri Göster</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mb-4">
        <SearchX className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-white">Kriterlere Uygun Coin Bulunamadı</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-1">
        Arama sorgunuza veya filtre parametrelerinize (minimum % değişim, hacim vb.) uyan coin bulunamadı.
      </p>
      <button
        onClick={resetFilters}
        className="mt-4 flex items-center space-x-1.5 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/40 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Filtreleri Sıfırla</span>
      </button>
    </div>
  );
};
