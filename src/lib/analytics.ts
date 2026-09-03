declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  price?: number;
  item_brand?: string;
  quantity?: number;
}

export function toAnalyticsItem(item: {
  id: string;
  name: string;
  price?: number;
  brand?: string;
  quantity?: number;
}): AnalyticsItem {
  return {
    item_id: item.id,
    item_name: item.name,
    ...(item.price != null ? { price: item.price } : {}),
    ...(item.brand ? { item_brand: item.brand } : {}),
    ...(item.quantity != null ? { quantity: item.quantity } : {}),
  };
}

export type AnalyticsEventName =
  | "view_item"
  | "view_item_list"
  | "search"
  | "add_to_cart"
  | "remove_from_cart"
  | "begin_checkout"
  | "add_payment_info"
  | "purchase"
  | "add_to_wishlist";

/** Nomes de evento padrão do Meta Pixel — nem todo evento GA4 tem equivalente direto. */
const META_PIXEL_EVENT_MAP: Partial<Record<AnalyticsEventName, string>> = {
  view_item: "ViewContent",
  search: "Search",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  add_payment_info: "AddPaymentInfo",
  purchase: "Purchase",
  add_to_wishlist: "AddToWishlist",
};

/**
 * Dispara um evento de e-commerce no GA4 e, quando existe equivalente, no Meta Pixel. Não faz
 * nada se os scripts não estiverem carregados (sem NEXT_PUBLIC_GA_ID/NEXT_PUBLIC_META_PIXEL_ID
 * configurados) — nunca lança erro. Ver seção 52 do CLAUDE.md e docs/integrations.md.
 */
export function trackEvent(name: AnalyticsEventName, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;

  try {
    window.gtag?.("event", name, params);

    const metaEvent = META_PIXEL_EVENT_MAP[name];
    if (metaEvent) {
      window.fbq?.("track", metaEvent, params);
    }
  } catch {
    // Analytics nunca pode quebrar a navegação do cliente.
  }
}
