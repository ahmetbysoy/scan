import React from 'react';
import { X, Volume2, VolumeX, Smartphone, Bell, Moon, Sun, LayoutGrid, Table, Play, Check } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { playAlertSound, triggerVibration } from '../../utils/sound';

export const SettingsDrawer: React.FC = () => {
  const settingsDrawerOpen = useAppStore((state) => state.settingsDrawerOpen);
  const setSettingsDrawerOpen = useAppStore((state) => state.setSettingsDrawerOpen);

  const alertThresholdPct = useAppStore((state) => state.alertThresholdPct);
  const setAlertThresholdPct = useAppStore((state) => state.setAlertThresholdPct);

  const alertCooldownSec = useAppStore((state) => state.alertCooldownSec);
  const setAlertCooldownSec = useAppStore((state) => state.setAlertCooldownSec);

  const soundEnabled = useAppStore((state) => state.soundEnabled);
  const setSoundEnabled = useAppStore((state) => state.setSoundEnabled);

  const vibrationEnabled = useAppStore((state) => state.vibrationEnabled);
  const setVibrationEnabled = useAppStore((state) => state.setVibrationEnabled);

  const mobileViewMode = useAppStore((state) => state.mobileViewMode);
  const setMobileViewMode = useAppStore((state) => state.setMobileViewMode);

  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  if (!settingsDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setSettingsDrawerOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full sm:max-w-md bg-slate-900 border-t sm:border-l border-slate-800 shadow-2xl flex flex-col h-[85vh] sm:h-full rounded-t-2xl sm:rounded-t-none mt-auto sm:mt-0 z-10 transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Uygulama Ayarları</h2>
              <p className="text-xs text-slate-400">Ses, uyarı eşiği ve görünüm tercihleri</p>
            </div>
          </div>

          <button
            onClick={() => setSettingsDrawerOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Alert Threshold % */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Momemtum Bildirim Eşiği (%)
              </label>
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                %{alertThresholdPct.toFixed(1)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Bir coin seçili zaman diliminde bu yüzde eşiğini aştığında bildirim verilir.
            </p>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {[1.5, 3.0, 5.0, 10.0].map((val) => (
                <button
                  key={val}
                  onClick={() => setAlertThresholdPct(val)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    alertThresholdPct === val
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                  }`}
                >
                  %{val}
                </button>
              ))}
            </div>
          </div>

          {/* Cooldown Period */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Uyarı Cooldown (Bekleme) Süresi
              </label>
              <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                {alertCooldownSec} sn
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Aynı coin için üst üste spam bildirim oluşmasını engellemek için bekleme süresi.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[30, 60, 300].map((val) => (
                <button
                  key={val}
                  onClick={() => setAlertCooldownSec(val)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    alertCooldownSec === val
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {val >= 60 ? `${val / 60} dk` : `${val} sn`}
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Vibration Toggles */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                  <span className="text-xs font-medium text-slate-200">Sesli Uyarı Sentezleyici</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                />
              </div>

              {soundEnabled && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => playAlertSound('pump')}
                    className="flex-1 py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Pump Sesi</span>
                  </button>
                  <button
                    onClick={() => playAlertSound('dump')}
                    className="flex-1 py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Dump Sesi</span>
                  </button>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-teal-400" />
                <div>
                  <span className="text-xs font-medium text-slate-200 block">Mobil Titreşim (Vibration API)</span>
                  <span className="text-[10px] text-slate-400 block">Destekleyen mobil tarayıcılarda</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => triggerVibration([100, 50, 100])}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] rounded-md"
                >
                  Test
                </button>
                <input
                  type="checkbox"
                  checked={vibrationEnabled}
                  onChange={(e) => setVibrationEnabled(e.target.checked)}
                  className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* View Mode & Theme */}
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Görünüm Modu</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMobileViewMode('cards')}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    mobileViewMode === 'cards'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Kart Görünümü</span>
                </button>

                <button
                  onClick={() => setMobileViewMode('table')}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    mobileViewMode === 'table'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span>Tablo Görünümü</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Tema</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Karanlık</span>
                </button>

                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    theme === 'light'
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Aydınlık</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95">
          <button
            onClick={() => setSettingsDrawerOpen(false)}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors min-h-[44px]"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
