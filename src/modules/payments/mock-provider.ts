import "server-only";
import { randomUUID } from "crypto";
import type {
  CreateCardPaymentInput,
  CreateCardPaymentResult,
  CreatePixPaymentInput,
  CreatePixPaymentResult,
  PaymentProvider,
  PaymentProviderStatus,
} from "@/modules/payments/types";

/**
 * Provider mock — não processa pagamentos reais. Usado por padrão em desenvolvimento para
 * nunca arriscar cobranças reais nas credenciais de produção do Mercado Pago (ver
 * docs/integrations.md). PIX fica "PENDING" até ser simulado manualmente; cartão aprova na hora.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createPixPayment(input: CreatePixPaymentInput): Promise<CreatePixPaymentResult> {
    const externalId = `mock_pix_${randomUUID()}`;
    return {
      externalId,
      status: "PENDING",
      qrCodeText: `00020126MOCKPIX-${input.orderNumber}-${input.amount.toFixed(2)}`,
    };
  }

  async createCardPayment(input: CreateCardPaymentInput): Promise<CreateCardPaymentResult> {
    return {
      externalId: `mock_card_${randomUUID()}`,
      status: input.cardToken === "mock-decline" ? "REJECTED" : "APPROVED",
    };
  }

  async getPaymentStatus(): Promise<PaymentProviderStatus> {
    return "PENDING";
  }

  async refundPayment(): Promise<void> {
    return;
  }
}
