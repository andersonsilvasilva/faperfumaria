"use client";

import { useActionState } from "react";
import { adjustStockAction, type StockAdjustActionState } from "@/modules/admin/inventory-actions";

const initialState: StockAdjustActionState = { status: "idle" };

export function StockAdjustForm({ variantId }: { variantId: string }) {
  const [state, formAction, isPending] = useActionState(adjustStockAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="variantId" value={variantId} />
      <input
        type="number"
        name="delta"
        required
        placeholder="+10 ou -5"
        className="h-9 w-24 rounded-sm border border-fa-stone/40 px-2 text-sm focus:border-fa-gold focus:outline-none"
      />
      <input
        type="text"
        name="note"
        placeholder="Motivo (opcional)"
        className="h-9 w-40 rounded-sm border border-fa-stone/40 px-2 text-sm focus:border-fa-gold focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="h-9 rounded-sm bg-fa-black px-3 text-xs font-medium uppercase tracking-wide text-fa-white hover:bg-fa-gold hover:text-fa-black disabled:opacity-50"
      >
        {isPending ? "..." : "Ajustar"}
      </button>
      {state.status !== "idle" && (
        <span className={`text-xs ${state.status === "success" ? "text-green-700" : "text-red-600"}`}>
          {state.message}
        </span>
      )}
    </form>
  );
}
