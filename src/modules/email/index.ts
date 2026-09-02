import "server-only";
import { MockEmailProvider } from "@/modules/email/mock-provider";
import { GmailEmailProvider } from "@/modules/email/gmail-provider";
import type { EmailProvider } from "@/modules/email/types";

let cached: EmailProvider | null = null;

/**
 * Por segurança, o padrão é SEMPRE o provider mock. Só usa o Gmail real quando
 * EMAIL_PROVIDER=gmail for definido explicitamente e as credenciais OAuth2 estiverem completas
 * (uma escolha consciente, nunca acidental) — mesmo padrão usado em getPaymentProvider().
 */
export function getEmailProvider(): EmailProvider {
  if (cached) return cached;

  if (process.env.EMAIL_PROVIDER === "gmail") {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const from = process.env.EMAIL_FROM;

    if (!clientId || !clientSecret || !refreshToken || !from) {
      throw new Error(
        "GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN e EMAIL_FROM são obrigatórios quando EMAIL_PROVIDER=gmail.",
      );
    }

    cached = new GmailEmailProvider({ clientId, clientSecret, refreshToken, from });
  } else {
    cached = new MockEmailProvider();
  }

  return cached;
}

export type { EmailProvider } from "@/modules/email/types";
