import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useFavorites() {
  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);

  const isFavorite = useCallback(
    (rawSymbol: string) => {
      return favorites.includes(rawSymbol);
    },
    [favorites]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  };
}
