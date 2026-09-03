"use client";

import { useEffect } from "react";
import { trackEvent, toAnalyticsItem } from "@/lib/analytics";

export function ViewItemTracker({
  id,
  name,
  brand,
  price,
}: {
  id: string;
  name: string;
  brand?: string;
  price: number;
}) {
  useEffect(() => {
    trackEvent("view_item", { currency: "BRL", value: price, items: [toAnalyticsItem({ id, name, brand, price })] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
}
