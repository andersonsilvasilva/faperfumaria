"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatInstallments, formatPrice, formatVariantLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { addToCartAction, type CartActionState } from "@/modules/cart/actions";
import { useFavorites } from "@/components/store/favorites/favorites-provider";
import { trackEvent, toAnalyticsItem } from "@/lib/analytics";

export interface PlainVariant {
  id: string;
  volumeMl: number | null;
  variantLabel: string | null;
  price: number;
  stockQty: number;
}

const initialState: CartActionState = { status: "idle" };

export function VariantSelector({
  productId,
  productName,
  brandName,
  variants,
}: {
  productId: string;
  productName?: string;
  brandName?: string;
  variants: PlainVariant[];
}) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [state, formAction, isPending] = useActionState(addToCartAction, initialState);
  const { favoriteIds, toggle } = useFavorites();
  const [isTogglingFavorite, startFavoriteTransition] = useTransition();
  const [linkCopied, setLinkCopied] = useState(false);
  const router = useRouter();
  const isFavorited = favoriteIds.has(productId);

  async function handleShare() {
    const url = window.location.href;
    const title = productName ? `${productName} | FA Perfumaria` : "FA Perfumaria";

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // AbortError = usuário fechou a folha de compartilhamento de propósito, sem ação
        // necessária. Qualquer outro erro (share existe mas falha por outro motivo) cai pro
        // fallback de copiar o link, pra sempre dar algum retorno visível ao clique.
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }

    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  function handleFavoriteClick() {
    startFavoriteTransition(async () => {
      const result = await toggle(productId);
      if (result.status === "error" && result.message === "login-required") {
        router.push(`/entrar?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      } else if (result.status === "success" && result.favorited && productName) {
        trackEvent("add_to_wishlist", {
          currency: "BRL",
          items: [toAnalyticsItem({ id: productId, name: productName, brand: brandName })],
        });
      }
    });
  }

  const selected = variants.find((variant) => variant.id === selectedId) ?? variants[0];

  useEffect(() => {
    if (state.status === "success" && selected) {
      window.dispatchEvent(new Event("cart:updated"));
      if (productName) {
        const item = toAnalyticsItem({
          id: selected.id,
          name: productName,
          brand: brandName,
          price: selected.price,
          quantity,
        });
        trackEvent("add_to_cart", { currency: "BRL", value: selected.price * quantity, items: [item] });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!selected) {
    return <p className="text-sm text-red-600">Produto sem variantes disponíveis.</p>;
  }

  const inStock = selected.stockQty > 0;
  const maxQuantity = Math.min(selected.stockQty, 20);

  return (
    <div className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-25px_rgba(11,11,11,0.4)]">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-fa-black">{formatPrice(selected.price)}</span>
      </div>
      <p className="mt-1 text-sm text-fa-black/60">{formatInstallments(selected.price)}</p>

      <fieldset className="mt-5">
        <legend className="text-xs font-semibold uppercase tracking-wide text-fa-black/60">Volume</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => {
                setSelectedId(variant.id);
                setQuantity(1);
              }}
              aria-pressed={variant.id === selectedId}
              className={`rounded-sm border px-4 py-2 text-sm transition-all ${
                variant.id === selectedId
                  ? "border-fa-black bg-fa-black text-fa-white shadow-md"
                  : "border-fa-stone/40 text-fa-black shadow-sm hover:border-fa-black"
              }`}
            >
              {formatVariantLabel(variant)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        {inStock ? <Badge variant="success">Em estoque</Badge> : <Badge variant="danger">Indisponível</Badge>}
      </div>

      {inStock && (
        <div className="mt-5">
          <label htmlFor="quantity" className="text-xs font-semibold uppercase tracking-wide text-fa-black/60">
            Quantidade
          </label>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Diminuir quantidade"
              className="h-9 w-9 rounded-sm border border-fa-stone/40 text-fa-black shadow-sm hover:border-fa-black"
            >
              −
            </button>
            <input
              id="quantity"
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={(e) => {
                const value = Number(e.target.value);
                setQuantity(Number.isFinite(value) ? Math.min(Math.max(1, value), maxQuantity) : 1);
              }}
              className="h-9 w-14 rounded-sm border border-fa-stone/40 text-center text-sm"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              aria-label="Aumentar quantidade"
              className="h-9 w-9 rounded-sm border border-fa-stone/40 text-fa-black shadow-sm hover:border-fa-black"
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <form action={formAction} className="flex-1">
          <input type="hidden" name="variantId" value={selected.id} />
          <input type="hidden" name="quantity" value={quantity} />
          <button
            type="submit"
            disabled={!inStock || isPending}
            className="w-full rounded-sm bg-fa-black py-3 text-sm font-medium uppercase tracking-wide text-fa-white shadow-md transition-colors hover:bg-fa-gold hover:text-fa-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Adicionando..." : state.status === "success" ? "Adicionado ✓" : "Adicionar ao carrinho"}
          </button>
        </form>
        <button
          type="button"
          onClick={handleFavoriteClick}
          disabled={isTogglingFavorite}
          aria-pressed={isFavorited}
          className={`rounded-sm border px-5 py-3 text-sm font-medium uppercase tracking-wide shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${
            isFavorited ? "border-fa-gold text-fa-gold" : "border-fa-black text-fa-black"
          }`}
        >
          {isFavorited ? "Favoritado" : "Favoritar"}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="rounded-sm border border-fa-black px-5 py-3 text-sm font-medium uppercase tracking-wide text-fa-black shadow-sm hover:border-fa-gold hover:text-fa-gold"
        >
          {linkCopied ? "Link copiado!" : "Compartilhar"}
        </button>
      </div>
      {state.status === "error" && <p className="mt-2 text-sm text-red-600">{state.message}</p>}
    </div>
  );
}
