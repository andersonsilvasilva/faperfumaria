"use client";

import { useActionState, useState } from "react";
import { updateOrderStatusAction, type OrderStatusActionState } from "@/modules/admin/orders-actions";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import type { OrderStatus } from "@/generated/prisma/client";

const NEXT_STATUS_OPTIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PAID: ["PREPARING", "CANCELLED"],
  PREPARING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
};

const initialState: OrderStatusActionState = { status: "idle" };

export function OrderStatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: OrderStatus }) {
  const [state, formAction, isPending] = useActionState(updateOrderStatusAction, initialState);
  const options = NEXT_STATUS_OPTIONS[currentStatus] ?? [];
  const [nextStatus, setNextStatus] = useState<OrderStatus | "">(options[0] ?? "");

  if (options.length === 0) {
    return <p className="text-sm text-fa-black/50">Sem ações disponíveis para este status.</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />

      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className={`cursor-pointer rounded-sm border px-3 py-2 text-sm ${
              nextStatus === option ? "border-fa-gold bg-fa-gold/10 text-fa-black" : "border-fa-stone/30 text-fa-black/70"
            }`}
          >
            <input
              type="radio"
              name="nextStatus"
              value={option}
              checked={nextStatus === option}
              onChange={() => setNextStatus(option)}
              className="sr-only"
            />
            {ORDER_STATUS_LABELS[option]}
          </label>
        ))}
      </div>

      {nextStatus === "SHIPPED" && (
        <div className="grid grid-cols-2 gap-3">
          <input
            name="carrier"
            placeholder="Transportadora"
            className="h-10 rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
          />
          <input
            name="trackingCode"
            placeholder="Código de rastreio"
            className="h-10 rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
          />
        </div>
      )}

      {state.status !== "idle" && (
        <p className={`text-sm ${state.status === "success" ? "text-green-700" : "text-red-600"}`}>
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !nextStatus}
        className="rounded-sm bg-fa-black px-5 py-2 text-xs font-medium uppercase tracking-wide text-fa-white hover:bg-fa-gold hover:text-fa-black disabled:opacity-50"
      >
        {isPending ? "Atualizando..." : "Atualizar status"}
      </button>
    </form>
  );
}
