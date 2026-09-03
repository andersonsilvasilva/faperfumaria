"use client";

import { useEffect } from "react";
import { trackEvent, toAnalyticsItem } from "@/lib/analytics";

/**
 * Dispara "purchase" no máximo uma vez por pedido, guardado em localStorage — o cliente pode
 * ver a confirmação do pedido (ou o histórico em "Meus pedidos") várias vezes, mas o evento de
 * conversão só pode contar uma vez. Só é renderizado pelo OrderDetail quando o status já indica
 * pagamento confirmado (nunca antes — ver seção 52 do CLAUDE.md).
 */
export function PurchaseTracker({
  orderNumber,
  value,
  shipping,
  items,
}: {
  orderNumber: string;
  value: number;
  shipping: number;
  items: { id: string; name: string; price: number; quantity: number }[];
}) {
  useEffect(() => {
    const storageKey = `fa_purchase_tracked_${orderNumber}`;
    try {
      if (localStorage.getItem(storageKey)) return;
      trackEvent("purchase", {
        currency: "BRL",
        transaction_id: orderNumber,
        value,
        shipping,
        items: items.map((item) => toAnalyticsItem(item)),
      });
      localStorage.setItem(storageKey, "1");
    } catch {
      // localStorage indisponível (modo privado etc.) — não bloqueia a navegação.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  return null;
}
