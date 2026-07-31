import React, { useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  X,
  Server,
  Zap,
  Globe,
  Database,
  Radio,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { socketManager, DiagnosticResult } from '../../services/binanceSocket';

export const DataSourceModal: React.FC = () => {
  const isOpen = useAppStore((state) => state.dataSourceModalOpen);
  const onClose = () => useAppStore.getState().setDataSourceModalOpen(false);

  const diagnosticsResults = useAppStore((state) => state.diagnosticsResults);
  const setDiagnosticsResults = useAppStore((state) => state.setDiagnosticsResults);
  const isTestingDiagnostics = useAppStore((state) => state.isTestingDiagnostics);
  const setIsTestingDiagnostics = useAppStore((state) => state.setIsTestingDiagnostics);

  const connectionState = useAppStore((state) => state.connectionState);
  const messagesPerSec = useAppStore((state) => state.messagesPerSec);
  const totalMessagesReceived = useAppStore((state) => state.totalMessagesReceived);
  const tickersCount = Object.keys(useAppStore((state) => state.tickers) || {}).length;

  const runTests = async () => {
    setIsTestingDiagnostics(true);
    try {
      const results = await socketManager.runDiagnostics();
      setDiagnosticsResults(results);
    } catch (err) {
      console.error('Diagnostics failed:', err);
    } finally {
      setIsTestingDiagnostics(false);
    }
  };

  useEffect(() => {
    if (isOpen && diagnosticsResults.length === 0 && !isTestingDiagnostics) {
      runTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Veri Kaynakları & Canlı Test Paneli
              </h2>
              <p className="text-xs text-slate-400">
                Piyasa veri kaynaklarının bağlantı ve gecikme durumları
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-slate-200">
          {/* Active Stream Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium">Toplam Coin</div>
              <div className="text-lg font-bold text-white mt-1 flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>{tickersCount}</span>
              </div>
              <div className="text-[10px] text-emerald-400/90 mt-0.5">Aktif Vadeli Çiftler</div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium font-sans">Canlı Akış Hızı</div>
              <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{messagesPerSec}/sn</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Paket/Saniye</div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium">İşlenen Paket</div>
              <div className="text-lg font-bold text-white mt-1 flex items-center space-x-1.5">
                <Radio className="w-4 h-4 text-teal-400" />
                <span>{totalMessagesReceived.toLocaleString('tr-TR')}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Açılıştan beri</div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium">Bağlantı Modu</div>
              <div className="text-xs font-bold text-emerald-400 mt-2.5 flex items-center space-x-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>WS + REST Hibrit</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Yedekli Kesintisiz Akış</div>
            </div>
          </div>

          {/* Test Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Endpoint Bağlantı Testleri (Diagnostic)</span>
            </h3>

            <button
              onClick={runTests}
              disabled={isTestingDiagnostics}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 min-h-[36px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingDiagnostics ? 'animate-spin' : ''}`} />
              <span>{isTestingDiagnostics ? 'Test Ediliyor...' : 'Tüm Kaynakları Test Et'}</span>
            </button>
          </div>

          {/* Results List */}
          <div className="space-y-2.5">
            {diagnosticsResults.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-400 text-xs">
                {isTestingDiagnostics ? (
                  <div className="flex flex-col items-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                    <span>Binance & Borsa endpointleri test ediliyor...</span>
                  </div>
                ) : (
                  <span>Test başlatmak için yukarıdaki &quot;Tüm Kaynakları Test Et&quot; butonuna basınız.</span>
                )}
              </div>
            ) : (
              diagnosticsResults.map((item: DiagnosticResult) => (
                <div
                  key={item.id}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start space-x-3">
                    {item.status === 'ok' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : item.status === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{item.name}</span>
                        <span className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded font-mono">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5 break-all">
                        {item.url}
                      </p>
                      <p className="text-[11px] text-slate-300 mt-1 font-sans">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center font-mono text-[11px]">
                    {item.latencyMs !== undefined && (
                      <span className={`px-2 py-1 rounded-lg border ${
                        item.latencyMs < 300
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : item.latencyMs < 1000
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}>
                        {item.latencyMs} ms
                      </span>
                    )}

                    {item.itemCount > 0 && (
                      <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded-lg">
                        {item.itemCount} öge
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Technical Architecture Info Box */}
          <div className="bg-slate-950/90 border border-emerald-500/20 rounded-xl p-3.5 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <Activity className="w-4 h-4" />
              <span>Veri Mimarisi ve Otomatik Kurtarma Sistemi</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Uygulama, <strong>Binance Futures REST API</strong> ile anında tüm 700+ vadeli coin çiftini yükler.
              Aynı zamanda <strong>Spot & Vadeli WebSocket</strong> akışlarına ve 3 saniyelik yedekli REST Poller sistemine bağlıdır.
              Herhangi bir WebSocket bağlantı kesintisi durumunda veri akışı hiç aksamadan otomatik olarak REST poller üzerinden güncellenmeye devam eder.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={() => {
              socketManager.connect();
              runTests();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verileri Tam Sıfırla & Yeniden Bağlan</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-colors"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
