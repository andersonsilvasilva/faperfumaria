"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * O snippet do Meta Pixel só dispara PageView no carregamento inicial. Como a loja navega entre
 * páginas sem recarregar (App Router), cada troca de rota precisa de um PageView manual — a
 * primeira renderização é ignorada porque o snippet já a registrou.
 */
export function MetaPixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      window.fbq?.("track", "PageView");
    } catch {
      // Analytics nunca pode quebrar a navegação do cliente.
    }
  }, [pathname, searchParams]);

  return null;
}
