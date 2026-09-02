import "server-only";
import type { EmailProvider, SendEmailInput } from "@/modules/email/types";

/**
 * Provider mock — não envia e-mails reais, apenas registra no console. Usado por padrão em
 * desenvolvimento para nunca arriscar disparos reais para clientes/testadores enquanto o time
 * ainda está validando os fluxos (ver docs/integrations.md).
 */
export class MockEmailProvider implements EmailProvider {
  readonly name = "mock";

  async sendEmail(input: SendEmailInput): Promise<void> {
    console.log(
      `[email:mock] Para: ${input.toName ? `${input.toName} <${input.to}>` : input.to} | Assunto: ${input.subject}\n${input.text}`,
    );
  }
}
