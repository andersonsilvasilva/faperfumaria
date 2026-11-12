"use client";

import Link from "next/link";
import { setCookieConsent, useCookieConsent } from "@/lib/cookie-consent";

/**
 * Aviso de cookies (LGPD). Cookies essenciais (carrinho, login) não dependem de consentimento;
 * analytics e marketing (Google Analytics, Meta Pixel) só carregam após "Aceitar". Recusar é tão
 * fácil quanto aceitar.
 */
export function CookieBanner() {
  const consent = useCookieConsent();
  // undefined = ainda não leu o navegador (evita piscar no carregamento); null = sem escolha.
  if (consent !== null) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-fa-stone/20 bg-fa-white p-4 shadow-[0_-10px_30px_-15px_rgba(11,11,11,0.35)]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-fa-black/80">
          Usamos cookies essenciais para o funcionamento da loja e, com a sua permissão, cookies de
          análise e marketing (Google Analytics e Meta Pixel) para entender o uso do site e medir
          anúncios. Saiba mais na{" "}
          <Link href="/politica-de-cookies" className="text-fa-gold underline hover:text-fa-black">
            Política de Cookies
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setCookieConsent("declined")}
            className="rounded-sm border border-fa-black px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-fa-black hover:bg-fa-black hover:text-fa-white"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => setCookieConsent("accepted")}
            className="rounded-sm bg-fa-black px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-fa-white hover:bg-fa-gold hover:text-fa-black"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
