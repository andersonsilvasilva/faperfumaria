"use client";

import { useActionState } from "react";
import { formatPrice } from "@/lib/format";
import { maskCep } from "@/lib/masks";
import { calculateShippingAction, type ShippingCalcState } from "@/modules/shipping/actions";

const initialState: ShippingCalcState = { status: "idle" };

export function ShippingCalculator() {
  const [state, formAction, isPending] = useActionState(calculateShippingAction, initialState);

  return (
    <div>
      <form action={formAction} className="flex gap-2">
        <label htmlFor="shipping-cep" className="sr-only">
          CEP
        </label>
        <input
          id="shipping-cep"
          name="cep"
          type="text"
          inputMode="numeric"
          placeholder="Seu CEP"
          maxLength={9}
          onInput={(e) => {
            e.currentTarget.value = maskCep(e.currentTarget.value);
          }}
          className="h-10 flex-1 rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-sm border border-fa-black px-4 text-xs font-medium uppercase tracking-wide text-fa-black hover:bg-fa-black hover:text-fa-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Calculando..." : "Calcular frete"}
        </button>
      </form>

      {state.status === "error" && <p className="mt-2 text-xs text-red-600">{state.message}</p>}

      {state.status === "success" && state.options && (
        <ul className="mt-3 space-y-2">
          {state.options.map((option) => (
            <li
              key={option.method}
              className="flex items-center justify-between rounded-sm border border-fa-stone/20 px-3 py-2 text-sm"
            >
              <span>
                {option.label}
                {option.estimatedDays && (
                  <span className="text-fa-black/50"> — até {option.estimatedDays} dias úteis</span>
                )}
              </span>
              <span className="font-semibold">{option.cost === 0 ? "Grátis" : formatPrice(option.cost)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
