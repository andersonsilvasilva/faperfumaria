import "server-only";
import { MercadoPagoConfig, Payment, PaymentRefund } from "mercadopago";
import type {
  CreateCardPaymentInput,
  CreateCardPaymentResult,
  CreatePixPaymentInput,
  CreatePixPaymentResult,
  PaymentProvider,
  PaymentProviderStatus,
} from "@/modules/payments/types";

function mapStatus(mpStatus: string | undefined): PaymentProviderStatus {
  switch (mpStatus) {
    case "approved":
      return "APPROVED";
    case "rejected":
      return "REJECTED";
    case "refunded":
    case "charged_back":
      return "REFUNDED";
    case "cancelled":
      return "CANCELLED";
    default:
      return "PENDING";
  }
}

/**
 * Provider real do Mercado Pago. As credenciais em .env são de PRODUÇÃO — nunca chamar este
 * provider em testes automatizados. Ver docs/integrations.md.
 */
export class MercadoPagoProvider implements PaymentProvider {
  readonly name = "mercadopago";
  private readonly payment: Payment;
  private readonly refund: PaymentRefund;

  constructor(accessToken: string) {
    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 8000 } });
    this.payment = new Payment(client);
    this.refund = new PaymentRefund(client);
  }

  async createPixPayment(input: CreatePixPaymentInput): Promise<CreatePixPaymentResult> {
    const result = await this.payment.create({
      body: {
        transaction_amount: input.amount,
        description: input.description,
        payment_method_id: "pix",
        payer: { email: input.payerEmail, first_name: input.payerName },
        external_reference: input.orderNumber,
      },
      requestOptions: { idempotencyKey: input.orderId },
    });

    return {
      externalId: String(result.id),
      status: mapStatus(result.status),
      qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64,
      qrCodeText: result.point_of_interaction?.transaction_data?.qr_code,
    };
  }

  async createCardPayment(input: CreateCardPaymentInput): Promise<CreateCardPaymentResult> {
    const result = await this.payment.create({
      body: {
        transaction_amount: input.amount,
        description: input.description,
        token: input.cardToken,
        installments: input.installments,
        payment_method_id: input.paymentMethodId,
        payer: { email: input.payerEmail, first_name: input.payerName },
        external_reference: input.orderNumber,
      },
      requestOptions: { idempotencyKey: input.orderId },
    });

    return {
      externalId: String(result.id),
      status: mapStatus(result.status),
    };
  }

  async getPaymentStatus(externalId: string): Promise<PaymentProviderStatus> {
    const result = await this.payment.get({ id: externalId });
    return mapStatus(result.status);
  }

  async refundPayment(externalId: string): Promise<void> {
    await this.refund.create({ payment_id: externalId });
  }
}
