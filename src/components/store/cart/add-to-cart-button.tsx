"use client";

import { useActionState, useEffect } from "react";
import { addToCartAction, type CartActionState } from "@/modules/cart/actions";
import { trackEvent, toAnalyticsItem } from "@/lib/analytics";

const initialState: CartActionState = { status: "idle" };

export function AddToCartButton({
  variantId,
  quantity = 1,
  className = "",
  disabled = false,
  productName,
  brandName,
  price,
}: {
  variantId: string;
  quantity?: number;
  className?: string;
  disabled?: boolean;
  productName?: string;
  brandName?: string;
  price?: number;
}) {
  const [state, formAction, isPending] = useActionState(addToCartAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      window.dispatchEvent(new Event("cart:updated"));
      if (productName) {
        const item = toAnalyticsItem({ id: variantId, name: productName, brand: brandName, price, quantity });
        trackEvent("add_to_cart", { currency: "BRL", value: (price ?? 0) * quantity, items: [item] });
      }
    }
  }, [state, variantId, quantity, productName, brandName, price]);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="variantId" value={variantId} />
        <input type="hidden" name="quantity" value={quantity} />
        <button type="submit" disabled={isPending || disabled} className={className}>
          {isPending ? "Adicionando..." : state.status === "success" ? "Adicionado ✓" : "Adicionar ao carrinho"}
        </button>
      </form>
      {state.status === "error" && <p className="mt-1 text-xs text-red-600">{state.message}</p>}
    </div>
  );
}
