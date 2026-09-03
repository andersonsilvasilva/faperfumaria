"use client";

import { useActionState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import {
  removeCartItemAction,
  updateCartItemQuantityAction,
  type CartActionState,
} from "@/modules/cart/actions";
import { trackEvent, toAnalyticsItem } from "@/lib/analytics";

const initialState: CartActionState = { status: "idle" };

export interface CartItemRowData {
  id: string;
  quantity: number;
  variant: {
    id: string;
    volumeMl: number;
    price: number;
    stockQty: number;
    product: {
      name: string;
      slug: string;
      brand: { name: string };
      images: { url: string; altText: string | null }[];
    };
  };
}

export function CartItemRow({ item }: { item: CartItemRowData }) {
  const [updateState, updateAction, isUpdating] = useActionState(updateCartItemQuantityAction, initialState);
  const [removeState, removeAction, isRemoving] = useActionState(removeCartItemAction, initialState);

  useEffect(() => {
    if (updateState.status === "success" || removeState.status === "success") {
      window.dispatchEvent(new Event("cart:updated"));
    }
    if (removeState.status === "success") {
      const analyticsItem = toAnalyticsItem({
        id: item.variant.id,
        name: item.variant.product.name,
        brand: item.variant.product.brand.name,
        price: item.variant.price,
        quantity: item.quantity,
      });
      trackEvent("remove_from_cart", {
        currency: "BRL",
        value: item.variant.price * item.quantity,
        items: [analyticsItem],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateState, removeState]);

  const unitPrice = item.variant.price;
  const image = item.variant.product.images[0];
  const maxQuantity = Math.min(item.variant.stockQty, 20);

  return (
    <div className="flex gap-4 border-b border-fa-stone/15 py-5 last:border-0">
      {image && (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-fa-off-white">
          <Image src={image.url} alt={image.altText ?? item.variant.product.name} fill className="object-cover" />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-fa-black/50">{item.variant.product.brand.name}</p>
          <Link
            href={`/produto/${item.variant.product.slug}`}
            className="font-display text-base text-fa-black hover:text-fa-gold"
          >
            {item.variant.product.name}
          </Link>
          <p className="text-xs text-fa-black/50">{item.variant.volumeMl}ml</p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <form action={updateAction} className="flex items-center gap-2">
            <input type="hidden" name="cartItemId" value={item.id} />
            <label htmlFor={`qty-${item.id}`} className="sr-only">
              Quantidade
            </label>
            <select
              id={`qty-${item.id}`}
              name="quantity"
              defaultValue={item.quantity}
              disabled={isUpdating}
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
              className="h-9 rounded-sm border border-fa-stone/40 px-2 text-sm"
            >
              {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </form>

          <form action={removeAction}>
            <input type="hidden" name="cartItemId" value={item.id} />
            <button
              type="submit"
              disabled={isRemoving}
              className="text-xs font-medium text-fa-black/50 underline hover:text-red-600"
            >
              Remover
            </button>
          </form>
        </div>
        {updateState.status === "error" && (
          <p className="mt-1 text-xs text-red-600">{updateState.message}</p>
        )}
      </div>

      <div className="text-right">
        <p className="font-semibold text-fa-black">{formatPrice(unitPrice * item.quantity)}</p>
        <p className="text-xs text-fa-black/50">{formatPrice(unitPrice)} / un.</p>
      </div>
    </div>
  );
}
