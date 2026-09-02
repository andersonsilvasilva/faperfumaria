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
}

export interface CreateCardPaymentResult {
  externalId: string;
  status: PaymentProviderStatus;
}

export interface PaymentProvider {
  readonly name: string;
  createPixPayment(input: CreatePixPaymentInput): Promise<CreatePixPaymentResult>;
  createCardPayment(input: CreateCardPaymentInput): Promise<CreateCardPaymentResult>;
  getPaymentStatus(externalId: string): Promise<PaymentProviderStatus>;
  refundPayment(externalId: string): Promise<void>;
}
