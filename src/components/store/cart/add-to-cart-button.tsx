"use client";

import { useActionState, useEffect } from "react";
import { addToCartAction, type CartActionState } from "@/modules/cart/actions";

const initialState: CartActionState = { status: "idle" };

export function AddToCartButton({
  variantId,
  quantity = 1,
  className = "",
  disabled = false,
}: {
  variantId: string;
  quantity?: number;
  className?: string;
  disabled?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(addToCartAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      window.dispatchEvent(new Event("cart:updated"));
    }
  }, [state]);

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
