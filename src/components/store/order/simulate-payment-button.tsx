"use client";

import { useTransition } from "react";
import { simulatePixApprovalAction } from "@/modules/orders/actions";

export function SimulatePaymentButton({ orderNumber }: { orderNumber: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => simulatePixApprovalAction(orderNumber))}
      className="rounded-sm border border-dashed border-fa-gold px-4 py-2 text-xs font-medium uppercase tracking-wide text-fa-gold hover:bg-fa-gold/10 disabled:opacity-50"
    >
      {isPending ? "Simulando..." : "[Dev] Simular pagamento aprovado"}
    </button>
  );
}
