"use client";

import { useActionState } from "react";
import { reconcileOrderPaymentAction, type OrderStatusActionState } from "@/modules/admin/orders-actions";

const initialState: OrderStatusActionState = { status: "idle" };

/** Pergunta ao Mercado Pago o estado real do pagamento deste pedido e atualiza o pedido. */
export function ReconcilePaymentButton({ orderId }: { orderId: string }) {
  const [state, formAction, isPending] = useActionState(reconcileOrderPaymentAction, initialState);

  return (
    <form action={formAction} className="mt-4 space-y-2">
      <input type="hidden" name="orderId" value={orderId} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-sm border border-fa-black px-4 py-2 text-xs font-medium uppercase tracking-wide text-fa-black hover:bg-fa-black hover:text-fa-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Consultando..." : "Verificar pagamento no Mercado Pago"}
      </button>
      {state.status !== "idle" && (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-green-700"}`}>{state.message}</p>
      )}
    </form>
  );
}
