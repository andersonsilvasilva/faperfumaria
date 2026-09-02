import "server-only";
import { randomUUID } from "crypto";
import { google } from "googleapis";
import type { EmailProvider, SendEmailInput } from "@/modules/email/types";

export interface GmailProviderConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  from: string;
}

function encodeHeaderText(value: string): string {
  return `=?UTF-8?B?${Buffer.from(value, "utf-8").toString("base64")}?=`;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildRawMessage(input: SendEmailInput & { from: string }): string {
  const boundary = `fa_${randomUUID()}`;
  const toHeader = input.toName
    ? `${encodeHeaderText(input.toName)} <${input.to}>`
    : input.to;

  const message = [
    `From: ${input.from}`,
    `To: ${toHeader}`,
    `Subject: ${encodeHeaderText(input.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(input.text, "utf-8").toString("base64"),
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(input.html, "utf-8").toString("base64"),
    "",
    `--${boundary}--`,
  ].join("\r\n");

  return base64UrlEncode(message);
}

/**
 * Provider real via Gmail API (users.messages.send), seguindo o guia oficial do Google:
 * https://developers.google.com/workspace/gmail/api/guides/sending?hl=pt-br
 *
 * Autenticação por OAuth2 com refresh token de uma conta Gmail/Workspace já autorizada com o
 * escopo "gmail.send" — não há suporte a usuário/senha nem chave de API simples nesse fluxo.
 * Ver docs/integrations.md para o passo a passo de como gerar o refresh token no Google Cloud
 * Console (esse passo exige login manual do dono da conta e não pode ser automatizado por aqui).
 */
export class GmailEmailProvider implements EmailProvider {
  readonly name = "gmail";
  private readonly from: string;
  private readonly auth: InstanceType<typeof google.auth.OAuth2>;

  constructor(config: GmailProviderConfig) {
    this.from = config.from;
    this.auth = new google.auth.OAuth2(config.clientId, config.clientSecret);
    this.auth.setCredentials({ refresh_token: config.refreshToken });
  }

  async sendEmail(input: SendEmailInput): Promise<void> {
    const gmail = google.gmail({ version: "v1", auth: this.auth });
    const raw = buildRawMessage({ ...input, from: this.from });
    await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
  }
}
