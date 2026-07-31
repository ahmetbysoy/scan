import { useEffect } from 'react';
import { socketManager } from '../services/binanceSocket';
import { useAppStore } from '../store/useAppStore';

export function useBinanceSocket() {
  const updateTickersBatch = useAppStore((state) => state.updateTickersBatch);
  const setConnectionState = useAppStore((state) => state.setConnectionState);
  const incrementMessageMetrics = useAppStore((state) => state.incrementMessageMetrics);

  useEffect(() => {
    socketManager.subscribe(
      (batch) => {
        updateTickersBatch(batch);
      },
      (state, error) => {
        setConnectionState(state, error);
      },
      (total, rate) => {
        incrementMessageMetrics(total, rate);
      }
    );

    socketManager.connect();

    return () => {
      socketManager.disconnect();
    };
  }, [updateTickersBatch, setConnectionState, incrementMessageMetrics]);
}
