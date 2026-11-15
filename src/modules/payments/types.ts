export type PaymentProviderStatus = "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED" | "CANCELLED";

export interface CreatePixPaymentInput {
  orderId: string;
  orderNumber: string;
  amount: number;
  payerEmail: string;
  payerName: string;
  description: string;
}

export interface CreatePixPaymentResult {
  externalId: string;
  status: PaymentProviderStatus;
  qrCodeBase64?: string;
  qrCodeText?: string;
}

export interface CreateCardPaymentInput {
  orderId: string;
  orderNumber: string;
  amount: number;
  payerEmail: string;
  payerName: string;
  description: string;
  cardToken: string;
  installments: number;
  paymentMethodId: string;
  issuerId?: string;
  /** CPF (só dígitos) do pagador, enviado ao antifraude do provider. */
  payerCpf?: string;
}

export interface CreateCardPaymentResult {
  externalId: string;
  status: PaymentProviderStatus;
}

/** Dados de um pagamento como o provider o conhece (usado por webhook e verificação manual). */
export interface ProviderPaymentDetails {
  externalId: string;
  status: PaymentProviderStatus;
  /** Número do pedido enviado na criação do pagamento (external_reference). */
  externalReference?: string;
  amount: number;
  method: "PIX" | "CARD";
  installments?: number;
}

export interface PaymentProvider {
  readonly name: string;
  createPixPayment(input: CreatePixPaymentInput): Promise<CreatePixPaymentResult>;
  createCardPayment(input: CreateCardPaymentInput): Promise<CreateCardPaymentResult>;
  getPaymentStatus(externalId: string): Promise<PaymentProviderStatus>;
  /** Detalhes de um pagamento, ou null se o provider não o conhece. */
  getPaymentDetails(externalId: string): Promise<ProviderPaymentDetails | null>;
  /** Pagamentos criados para um pedido (pela external_reference = número do pedido). */
  findPaymentsByReference(reference: string): Promise<ProviderPaymentDetails[]>;
  refundPayment(externalId: string): Promise<void>;
}
