import "server-only";
import { MockEmailProvider } from "@/modules/email/mock-provider";
import { GmailEmailProvider } from "@/modules/email/gmail-provider";
import { SmtpEmailProvider } from "@/modules/email/smtp-provider";
import type { EmailProvider } from "@/modules/email/types";

let cached: EmailProvider | null = null;

/**
 * Por segurança, o padrão é SEMPRE o provider mock. Só usa um provider real quando
 * EMAIL_PROVIDER for definido explicitamente ("gmail" ou "smtp") e as credenciais
 * correspondentes estiverem completas (uma escolha consciente, nunca acidental) — mesmo padrão
 * usado em getPaymentProvider().
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
  } else if (process.env.EMAIL_PROVIDER === "smtp") {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    const from = process.env.EMAIL_FROM;

    if (!host || !port || !user || !password || !from) {
      throw new Error(
        "SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD e EMAIL_FROM são obrigatórios quando EMAIL_PROVIDER=smtp.",
      );
    }

    cached = new SmtpEmailProvider({
      host,
      port: Number(port),
      secure: process.env.SMTP_SECURE !== "false",
      user,
      password,
      from,
    });
  } else {
    cached = new MockEmailProvider();
  }

  return cached;
}

export type { EmailProvider } from "@/modules/email/types";
