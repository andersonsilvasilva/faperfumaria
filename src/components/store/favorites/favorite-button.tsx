"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/components/store/favorites/favorites-provider";

export function FavoriteButton({
  productId,
  className = "",
}: {
  productId: string;
  className?: string;
}) {
  const { favoriteIds, toggle } = useFavorites();
  const [isPending, startTransition] = useTransition();
  const [justErrored, setJustErrored] = useState(false);
  const router = useRouter();

  const isFavorited = favoriteIds.has(productId);

  function handleClick() {
    startTransition(async () => {
      const result = await toggle(productId);
      if (result.status === "error" && result.message === "login-required") {
        setJustErrored(true);
        router.push(`/entrar?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-pressed={isFavorited}
      title={justErrored ? "Entre para favoritar" : undefined}
      className={`${className} ${isFavorited ? "text-fa-gold!" : ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-4 w-4"
      >
        <path d="M12 20s-7-4.35-9.5-8.5C.8 8.2 2.2 4.8 5.6 4.2c2-.35 3.9.6 5 2.3 1.1-1.7 3-2.65 5-2.3 3.4.6 4.8 4 3.1 7.3C19 15.65 12 20 12 20Z" />
      </svg>
    </button>
  );
}
