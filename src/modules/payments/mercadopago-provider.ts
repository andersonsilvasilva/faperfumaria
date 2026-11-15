import "server-only";
import { MercadoPagoConfig, Payment, PaymentRefund } from "mercadopago";
import type {
  CreateCardPaymentInput,
  CreateCardPaymentResult,
  CreatePixPaymentInput,
  CreatePixPaymentResult,
  PaymentProvider,
  PaymentProviderStatus,
  ProviderPaymentDetails,
} from "@/modules/payments/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
// Reforço explícito por pagamento — a config de webhook do painel do MP (nível de aplicação)
// às vezes não entrega notificações reais mesmo aparentando estar correta; notification_url
// no corpo da criação do pagamento é suportado oficialmente pela API e não depende dela.
const WEBHOOK_URL = `${SITE_URL}/api/webhooks/mercadopago`;

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

interface MercadoPagoPaymentLike {
  id?: number | string;
  status?: string;
  external_reference?: string;
  transaction_amount?: number;
  payment_type_id?: string;
  payment_method_id?: string;
  installments?: number;
}

function toDetails(p: MercadoPagoPaymentLike): ProviderPaymentDetails {
  const isPix = p.payment_method_id === "pix" || p.payment_type_id === "bank_transfer";
  return {
    externalId: String(p.id),
    status: mapStatus(p.status),
    externalReference: p.external_reference || undefined,
    amount: Number(p.transaction_amount ?? 0),
    method: isPix ? "PIX" : "CARD",
    installments: p.installments && p.installments > 0 ? p.installments : undefined,
  };
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
    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 40000 } });
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
        notification_url: WEBHOOK_URL,
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
        ...(input.issuerId ? { issuer_id: Number(input.issuerId) } : {}),
        payer: {
          email: input.payerEmail,
          first_name: input.payerName,
          ...(input.payerCpf ? { identification: { type: "CPF", number: input.payerCpf } } : {}),
        },
        external_reference: input.orderNumber,
        notification_url: WEBHOOK_URL,
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

  async getPaymentDetails(externalId: string): Promise<ProviderPaymentDetails | null> {
    try {
      const result = await this.payment.get({ id: externalId });
      return result.id ? toDetails(result) : null;
    } catch (error) {
      // 404 = id que o Mercado Pago não conhece (ex.: "Simular notificação" do painel).
      const status = (error as { status?: number })?.status;
      if (status === 404) return null;
      throw error;
    }
  }

  async findPaymentsByReference(reference: string): Promise<ProviderPaymentDetails[]> {
    const result = await this.payment.search({
      options: { external_reference: reference, sort: "date_created", criteria: "desc" },
    });
    return (result.results ?? []).filter((p) => p.id).map(toDetails);
  }

  async refundPayment(externalId: string): Promise<void> {
    await this.refund.create({ payment_id: externalId });
  }
}
