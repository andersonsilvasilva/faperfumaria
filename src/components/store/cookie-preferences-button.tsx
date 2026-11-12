"use client";

import { setCookieConsent } from "@/lib/cookie-consent";

/** Reabre o aviso de cookies para o visitante mudar de ideia (aceitar ou revogar). */
export function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => setCookieConsent(null)} className={className}>
      Preferências de cookies
    </button>
  );
}
