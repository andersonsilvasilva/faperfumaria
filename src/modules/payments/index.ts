import "server-only";
import { MockPaymentProvider } from "@/modules/payments/mock-provider";
import { MercadoPagoProvider } from "@/modules/payments/mercadopago-provider";
import type { PaymentProvider } from "@/modules/payments/types";

let cached: PaymentProvider | null = null;

/**
 * Por segurança, o padrão é SEMPRE o provider mock — mesmo com as credenciais reais do
 * Mercado Pago presentes em .env. Só usa o provider real quando PAYMENT_PROVIDER=mercadopago
 * for definido explicitamente (uma escolha consciente, nunca acidental). Ver docs/integrations.md.
 */
export function getPaymentProvider(): PaymentProvider {
  if (cached) return cached;

  if (process.env.PAYMENT_PROVIDER === "mercadopago") {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado, mas PAYMENT_PROVIDER=mercadopago.");
    }
    cached = new MercadoPagoProvider(accessToken);
  } else {
    cached = new MockPaymentProvider();
  }

  return cached;
}

export type { PaymentProvider } from "@/modules/payments/types";
