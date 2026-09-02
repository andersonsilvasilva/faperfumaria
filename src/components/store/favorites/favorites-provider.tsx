"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toggleFavoriteAction } from "@/modules/favorites/actions";

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  isLoading: boolean;
  toggle: (productId: string) => Promise<{ status: "success" | "error"; message?: string }>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data: { productIds: string[] }) => setFavoriteIds(new Set(data.productIds)))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const toggle = useCallback(async (productId: string) => {
    const result = await toggleFavoriteAction(productId);
    if (result.status === "success") {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (result.favorited) next.add(productId);
        else next.delete(productId);
        return next;
      });
    }
    return result;
  }, []);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isLoading, toggle }}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites deve ser usado dentro de FavoritesProvider");
  return ctx;
}
