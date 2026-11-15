import { NextResponse, type NextRequest } from "next/server";
import { WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago";
import { getPaymentProvider } from "@/modules/payments";
import { processProviderPayment } from "@/modules/payments/reconcile";

/**
 * Webhook de notificações do Mercado Pago. Só faz efeito quando PAYMENT_PROVIDER=mercadopago
 * está ativo (o provider mock nunca envia notificações reais). Assinatura sempre validada
 * antes de processar qualquer coisa — ver seção 46 do CLAUDE.md.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 503 });
  }

  const searchParams = request.nextUrl.searchParams;
  const dataId = searchParams.get("data.id") ?? searchParams.get("id");

  try {
    WebhookSignatureValidator.validate({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
      secret,
      toleranceSeconds: 300,
    });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
    }
    throw error;
  }

  if (!dataId) {
    return NextResponse.json({ error: "data.id ausente" }, { status: 400 });
  }

  const provider = getPaymentProvider();
  const details = await provider.getPaymentDetails(dataId);
  if (!details) {
    // Id que o Mercado Pago não conhece (inclui os testes de "Simular notificações" do painel,
    // que usam um id fictício) — responde 200 para não gerar reenvio nem erro.
    return NextResponse.json({ received: true });
  }

  // Também reconhece pagamentos que não chegaram a ser gravados por nós (ex.: a nossa chamada
  // expirou depois de o Mercado Pago aprovar), ligando-os ao pedido pela external_reference.
  await processProviderPayment(details);

  return NextResponse.json({ received: true });
}
