"use client";

import { useEffect } from "react";
import { trackEvent, toAnalyticsItem } from "@/lib/analytics";

export function CatalogTracker({
  listName,
  searchTerm,
  resultCount,
  items,
}: {
  listName: string;
  searchTerm?: string;
  resultCount: number;
  items: { id: string; name: string; brand?: string; price?: number }[];
}) {
  const itemIds = items.map((i) => i.id).join(",");

  useEffect(() => {
    if (searchTerm) {
      trackEvent("search", { search_term: searchTerm, results_count: resultCount });
    }
    if (items.length > 0) {
      trackEvent("view_item_list", {
        item_list_name: listName,
        items: items.map((item) => toAnalyticsItem(item)),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listName, searchTerm, itemIds]);

  return null;
}
