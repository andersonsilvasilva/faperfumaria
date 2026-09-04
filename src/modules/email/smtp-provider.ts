import "server-only";
import { createTransport } from "nodemailer";
import type { EmailProvider, SendEmailInput } from "@/modules/email/types";

export interface SmtpProviderConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

/**
 * Provider real via SMTP genérico (biblioteca "nodemailer") — serve pra qualquer caixa de
 * e-mail com usuário/senha (ex.: e-mail da própria hospedagem, tipo vendas@faperfumaria.com.br
 * na Hostinger), diferente do GmailEmailProvider que exige OAuth2 e só funciona com contas
 * Gmail/Workspace de verdade.
 */
export class SmtpEmailProvider implements EmailProvider {
  readonly name = "smtp";
  private readonly from: string;
  private readonly transporter: ReturnType<typeof createTransport>;

  constructor(config: SmtpProviderConfig) {
    this.from = config.from;
    this.transporter = createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.password },
    });
  }

  async sendEmail(input: SendEmailInput): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: input.toName ? { name: input.toName, address: input.to } : input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
  }
}
