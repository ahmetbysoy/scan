import React from 'react';
import { Bell, X, Trash2, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatPercent, formatPrice, formatTime } from '../../utils/formatters';

export const AlertToastContainer: React.FC = () => {
  const alerts = useAppStore((state) => state.alerts);
  const clearAlerts = useAppStore((state) => state.clearAlerts);

  const alertsDrawerOpen = useAppStore((state) => state.alertsDrawerOpen);
  const setAlertsDrawerOpen = useAppStore((state) => state.setAlertsDrawerOpen);

  // Latest 3 alerts as toast popups
  const toastAlerts = alerts.slice(0, 3);

  return (
    <>
      {/* Floating Toast Container */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toastAlerts.map((item, index) => {
          const isPump = item.changePct >= 0;
          return (
            <div
              key={`${item.id}-${index}`}
              className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl backdrop-blur-md flex items-start justify-between space-x-3 transition-all animate-bounce-once ${
                isPump
                  ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10'
                  : 'bg-slate-900/95 border-rose-500/40 text-rose-300 shadow-rose-500/10'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isPump ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {isPump ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{item.symbol}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.timeWindow}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="text-xs font-mono font-semibold">${formatPrice(item.price)}</span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        isPump ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatPercent(item.changePct)}
                    </span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                {formatTime(item.timestamp)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Alerts History Drawer */}
      {alertsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setAlertsDrawerOpen(false)}
          />

          <div className="relative w-full sm:max-w-md bg-slate-900 border-t sm:border-l border-slate-800 shadow-2xl flex flex-col h-[85vh] sm:h-full rounded-t-2xl sm:rounded-t-none mt-auto sm:mt-0 z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Momentum Uyarı Geçmişi</h2>
                  <p className="text-xs text-slate-400">Eşik değerini aşan pump / dump sinyalleri</p>
                </div>
              </div>

              <button
                onClick={() => setAlertsDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                  <Bell className="w-10 h-10 mb-2 stroke-1 opacity-50" />
                  <p className="text-xs font-medium">Henüz tetiklenen uyarı bulunmuyor.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Coinlerin momentum değişimi belirlediğiniz eşiği aştığında burada listelenir.
                  </p>
                </div>
              ) : (
                alerts.map((item, index) => {
                  const isPump = item.changePct >= 0;
                  return (
                    <div
                      key={`${item.id}-${index}`}
                      className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isPump ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {isPump ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-xs">{item.symbol}</span>
                            <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-slate-700 text-slate-300">
                              {item.timeWindow}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-[11px]">
                            <span className="text-slate-300 font-mono">${formatPrice(item.price)}</span>
                            <span className={`font-mono font-bold ${isPump ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {formatPercent(item.changePct)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatTime(item.timestamp)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {alerts.length > 0 && (
              <div className="p-4 border-t border-slate-800 bg-slate-900/95">
                <button
                  onClick={clearAlerts}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-medium rounded-xl text-xs transition-colors min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Geçmişi Temizle</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
