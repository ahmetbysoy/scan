import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { socketManager } from '../../services/binanceSocket';
import { useAppStore } from '../../store/useAppStore';

export const ConnectionStatus: React.FC = () => {
  const connectionState = useAppStore((state) => state.connectionState);
  const lastSocketError = useAppStore((state) => state.lastSocketError);

  if (connectionState === 'open') {
    return null;
  }

  return (
    <div className="bg-slate-900/90 border-b border-amber-500/30 px-4 py-2 text-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-amber-200">
        <div className="flex items-center space-x-2 min-w-0">
          {connectionState === 'reconnecting' || connectionState === 'connecting' ? (
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
          ) : (
            <WifiOff className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <div className="truncate">
            <span className="font-semibold text-white">
              {connectionState === 'connecting' && 'Binance Futures WebSocket sunucusuna bağlanılıyor...'}
              {connectionState === 'reconnecting' && 'WebSocket bağlantısı koptu, yeniden bağlanılıyor...'}
              {connectionState === 'closed' && 'WebSocket bağlantısı kapalı.'}
              {connectionState === 'error' && 'WebSocket Bağlantı Hatası!'}
            </span>
            {lastSocketError && (
              <p className="text-[11px] text-amber-300/80 truncate">{lastSocketError}</p>
            )}
          </div>
        </div>

        <button
          onClick={() => socketManager.connect()}
          className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg font-medium transition-colors shrink-0 min-h-[32px]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Yeniden Bağlan</span>
        </button>
      </div>
    </div>
  );
};
