import { TickerMomentum } from '../types/ticker';

export function exportTickersToCSV(list: TickerMomentum[], timeWindow: string) {
  const headers = ['Symbol', 'Price', 'SelectedChangePct', 'Change1m', 'Change5m', 'Change15m', 'Change24h', 'Volume24h'];
  const rows = list.map((item) => [
    item.ticker.symbol,
    item.ticker.price,
    item.selectedChange.toFixed(2),
    item.change1m.toFixed(2),
    item.change5m.toFixed(2),
    item.change15m.toFixed(2),
    item.ticker.change24h.toFixed(2),
    item.ticker.volume24h.toFixed(2),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `futures_momentum_${timeWindow}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
