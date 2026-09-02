"use client";

import { useState } from "react";
import { formatInstallments, formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export interface PlainVariant {
  id: string;
  volumeMl: number;
  price: number;
  stockQty: number;
}

export function VariantSelector({ variants }: { variants: PlainVariant[] }) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id);
  const selected = variants.find((variant) => variant.id === selectedId) ?? variants[0];

  if (!selected) {
    return <p className="text-sm text-red-600">Produto sem variantes disponíveis.</p>;
  }

  const inStock = selected.stockQty > 0;

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
              onClick={() => setSelectedId(variant.id)}
              aria-pressed={variant.id === selectedId}
              className={`rounded-sm border px-4 py-2 text-sm transition-all ${
                variant.id === selectedId
                  ? "border-fa-black bg-fa-black text-fa-white shadow-md"
                  : "border-fa-stone/40 text-fa-black shadow-sm hover:border-fa-black"
              }`}
            >
              {variant.volumeMl}ml
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        {inStock ? <Badge variant="success">Em estoque</Badge> : <Badge variant="danger">Indisponível</Badge>}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled
          title="Carrinho disponível na Fase 3"
          className="flex-1 rounded-sm bg-fa-black py-3 text-sm font-medium uppercase tracking-wide text-fa-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar ao carrinho
        </button>
        <button
          type="button"
          disabled
          title="Favoritos disponível na Fase 4"
          className="rounded-sm border border-fa-black px-5 py-3 text-sm font-medium uppercase tracking-wide text-fa-black shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          Favoritar
        </button>
      </div>
    </div>
  );
}
