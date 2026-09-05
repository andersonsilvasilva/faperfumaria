"use client";

import { useRouter, usePathname } from "next/navigation";
import type { FormEvent } from "react";

/** Filtros aplicam sozinhos ao mudar qualquer campo (checkbox, radio, select) — sem precisar de
 * um botão "Aplicar". Usa o router do Next (não um GET nativo) pra trocar só o resultado, sem
 * recarregar a página inteira. */
export function AutoSubmitFilters({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(event: FormEvent<HTMLFormElement>) {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget)) {
      if (typeof value === "string" && value) params.append(key, value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <form method="GET" onChange={handleChange} className="space-y-8">
      {children}
    </form>
  );
}
