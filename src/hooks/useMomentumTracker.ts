import { useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { TickerMomentum } from '../types/ticker';
import { calculateRollingMomentum } from '../utils/calculations';
import { playAlertSound, triggerVibration } from '../utils/sound';

export function useMomentumTracker() {
  const tickers = useAppStore((state) => state.tickers);
  const timeWindow = useAppStore((state) => state.timeWindow);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const minChangePct = useAppStore((state) => state.minChangePct);
  const minPrice = useAppStore((state) => state.minPrice);
  const minVolume = useAppStore((state) => state.minVolume);
  const positiveOnly = useAppStore((state) => state.positiveOnly);
  const topN = useAppStore((state) => state.topN);
  const sortField = useAppStore((state) => state.sortField);
  const sortOrder = useAppStore((state) => state.sortOrder);
  const onlyFavorites = useAppStore((state) => state.onlyFavorites);
  const favorites = useAppStore((state) => state.favorites);

  const alertThresholdPct = useAppStore((state) => state.alertThresholdPct);
  const alertCooldownSec = useAppStore((state) => state.alertCooldownSec);
  const soundEnabled = useAppStore((state) => state.soundEnabled);
  const vibrationEnabled = useAppStore((state) => state.vibrationEnabled);
  const addAlert = useAppStore((state) => state.addAlert);
  const lastAlertTimeouts = useAppStore((state) => state.lastAlertTimeouts);

  const prevPricesRef = useRef<Record<string, number>>({});

  // Memoized computation of all ticker momentum objects
  const processedList = useMemo(() => {
    const now = Date.now();
    const rawList = Object.values(tickers || {});
    const result: TickerMomentum[] = [];

    const query = searchQuery.trim().toLowerCase();
    const favoritesSet = new Set(favorites);

    for (let i = 0; i < rawList.length; i++) {
      const item = rawList[i];

      // Quick filter checks to avoid expensive momentum math for hidden coins
      if (onlyFavorites && !favoritesSet.has(item.rawSymbol)) {
        continue;
      }

      if (query && !item.symbol.toLowerCase().includes(query) && !item.rawSymbol.toLowerCase().includes(query)) {
        continue;
      }

      if (minPrice > 0 && item.price < minPrice) {
        continue;
      }

      const volumeMillions = item.quoteVolume24h / 1_000_000;
      if (minVolume > 0 && volumeMillions < minVolume) {
        continue;
      }

      // Calculate rolling momentum
      const { change1m, change5m, change15m, change24h } = calculateRollingMomentum(
        item.price,
        item.open24h,
        item.history,
        now
      );

      let selectedChange = change5m;
      if (timeWindow === '1m') selectedChange = change1m;
      else if (timeWindow === '15m') selectedChange = change15m;
      else if (timeWindow === '24h') selectedChange = change24h;

      if (positiveOnly && selectedChange < 0) {
        continue;
      }

      if (minChangePct > 0 && Math.abs(selectedChange) < minChangePct) {
        continue;
      }

      // Price tick direction
      const prevPrice = prevPricesRef.current[item.rawSymbol] || item.price;
      const priceDirection = item.price > prevPrice ? 'up' : item.price < prevPrice ? 'down' : 'neutral';
      prevPricesRef.current[item.rawSymbol] = item.price;

      result.push({
        ticker: item,
        change1m,
        change5m,
        change15m,
        selectedChange,
        priceDirection,
        isFavorite: favoritesSet.has(item.rawSymbol),
      });
    }

    // Sort list
    result.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortField === 'change') {
        valA = a.selectedChange;
        valB = b.selectedChange;
      } else if (sortField === '24hChange') {
        valA = a.ticker.change24h;
        valB = b.ticker.change24h;
      } else if (sortField === 'price') {
        valA = a.ticker.price;
        valB = b.ticker.price;
      } else if (sortField === 'volume') {
        valA = a.ticker.quoteVolume24h;
        valB = b.ticker.quoteVolume24h;
      } else if (sortField === 'symbol') {
        return sortOrder === 'asc'
          ? a.ticker.symbol.localeCompare(b.ticker.symbol)
          : b.ticker.symbol.localeCompare(a.ticker.symbol);
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    // Top N cutoff
    if (topN > 0 && result.length > topN) {
      return result.slice(0, topN);
    }

    return result;
  }, [
    tickers,
    timeWindow,
    searchQuery,
    minChangePct,
    minPrice,
    minVolume,
    positiveOnly,
    topN,
    sortField,
    sortOrder,
    onlyFavorites,
    favorites,
  ]);

  // Alert Monitor Effect
  useEffect(() => {
    if (alertThresholdPct <= 0 || processedList.length === 0) return;

    const now = Date.now();
    const cooldownMs = alertCooldownSec * 1000;

    for (let i = 0; i < processedList.length; i++) {
      const item = processedList[i];
      const absChange = Math.abs(item.selectedChange);

      if (absChange >= alertThresholdPct) {
        const lastTime = lastAlertTimeouts[item.ticker.rawSymbol] || 0;
        if (now - lastTime >= cooldownMs) {
          const type = item.selectedChange >= 0 ? 'pump' : 'dump';
          
          if (soundEnabled) {
            playAlertSound(type);
          }
          if (vibrationEnabled) {
            triggerVibration(type === 'pump' ? [120, 60, 120] : [200, 100, 200]);
          }

          addAlert({
            id: `${item.ticker.rawSymbol}-${now}`,
            symbol: item.ticker.symbol,
            price: item.ticker.price,
            changePct: item.selectedChange,
            timeWindow,
            timestamp: now,
          });
        }
      }
    }
  }, [processedList, alertThresholdPct, alertCooldownSec, soundEnabled, vibrationEnabled, timeWindow, addAlert, lastAlertTimeouts]);

  // Overall Statistics
  const stats = useMemo(() => {
    let gainers = 0;
    let losers = 0;
    let topGainer: TickerMomentum | null = null;
    let topVolume: TickerMomentum | null = null;
    let totalVolume = 0;

    for (let i = 0; i < processedList.length; i++) {
      const item = processedList[i];
      totalVolume += item.ticker.quoteVolume24h;

      if (item.selectedChange > 0) gainers++;
      else if (item.selectedChange < 0) losers++;

      if (!topGainer || item.selectedChange > topGainer.selectedChange) {
        topGainer = item;
      }
      if (!topVolume || item.ticker.quoteVolume24h > topVolume.ticker.quoteVolume24h) {
        topVolume = item;
      }
    }

    return {
      totalCount: processedList.length,
      gainersCount: gainers,
      losersCount: losers,
      topGainer,
      topVolume,
      totalVolume,
    };
  }, [processedList]);

  return {
    processedList,
    stats,
  };
}
