"use client";

import { useSyncExternalStore } from "react";

export type CookieConsent = "accepted" | "declined";

interface StoredConsent {
  choice: CookieConsent;
  /** Versão do texto/política aceita — se mudar, o consentimento é pedido de novo. */
  version: string;
  at: string;
}

/** Incrementar quando a Política de Cookies mudar de forma relevante. */
export const COOKIE_POLICY_VERSION = "2026-11";
const STORAGE_KEY = "fa_cookie_consent";
const CHANGE_EVENT = "fa-cookie-consent-change";

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): CookieConsent | null {
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as StoredConsent;
    if (stored.version !== COOKIE_POLICY_VERSION) return null;
    return stored.choice === "accepted" || stored.choice === "declined" ? stored.choice : null;
  } catch {
    return null;
  }
}

export function setCookieConsent(choice: CookieConsent | null): void {
  try {
    if (choice === null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      const stored: StoredConsent = { choice, version: COOKIE_POLICY_VERSION, at: new Date().toISOString() };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }
  } catch {
    // Sem localStorage (modo privado/bloqueado): a escolha vale só até recarregar a página.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/**
 * Escolha de cookies do visitante: "accepted" | "declined" | null (ainda não decidiu).
 * No servidor e na hidratação retorna `undefined` (desconhecido) — nada deve ser carregado
 * nem mostrado até o cliente ler o valor real.
 */
export function useCookieConsent(): CookieConsent | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => parse(readRaw()),
    () => undefined,
  );
}
