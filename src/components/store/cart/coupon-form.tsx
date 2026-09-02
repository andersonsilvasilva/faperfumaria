"use client";

import { useActionState, useEffect } from "react";
import { applyCouponAction, removeCouponAction, type CartActionState } from "@/modules/cart/actions";

const initialState: CartActionState = { status: "idle" };

export function CouponForm({ appliedCode }: { appliedCode?: string | null }) {
  const [state, formAction, isPending] = useActionState(applyCouponAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      window.dispatchEvent(new Event("cart:updated"));
    }
  }, [state]);

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between rounded-sm border border-fa-gold/40 bg-fa-gold/10 px-4 py-3">
        <p className="text-sm text-fa-black">
          Cupom <span className="font-semibold">{appliedCode}</span> aplicado
        </p>
        <form
          action={async () => {
            await removeCouponAction();
            window.dispatchEvent(new Event("cart:updated"));
          }}
        >
          <button type="submit" className="text-xs font-medium text-fa-black/60 underline hover:text-red-600">
            Remover
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <form action={formAction} className="flex gap-2">
        <label htmlFor="coupon-code" className="sr-only">
          Código do cupom
        </label>
        <input
          id="coupon-code"
          name="code"
          type="text"
          placeholder="Código do cupom"
          className="h-10 flex-1 rounded-sm border border-fa-stone/40 px-3 text-sm uppercase focus:border-fa-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-sm border border-fa-black px-4 text-xs font-medium uppercase tracking-wide text-fa-black hover:bg-fa-black hover:text-fa-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Aplicando..." : "Aplicar"}
        </button>
      </form>
      {state.status === "error" && <p className="mt-2 text-xs text-red-600">{state.message}</p>}
    </div>
  );
}
