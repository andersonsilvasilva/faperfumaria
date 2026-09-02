import { NextResponse, type NextRequest } from "next/server";
import { WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/modules/payments";

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
  const status = await provider.getPaymentStatus(dataId);

  const payment = await prisma.payment.findFirst({ where: { externalId: dataId } });
  if (!payment) {
    // Notificação para um pagamento que não reconhecemos — responde 200 para o MP não reenviar.
    return NextResponse.json({ received: true });
  }

  const mappedStatus =
    status === "APPROVED" ? "APPROVED" : status === "REJECTED" ? "REJECTED" : status === "REFUNDED" ? "REFUNDED" : status === "CANCELLED" ? "CANCELLED" : "PENDING";

  await prisma.payment.update({ where: { id: payment.id }, data: { status: mappedStatus } });

  if (mappedStatus === "APPROVED") {
    const order = await prisma.order.findUnique({ where: { id: payment.orderId }, include: { items: true } });
    if (order && order.status === "PENDING_PAYMENT") {
      await prisma.$transaction([
        prisma.order.update({ where: { id: order.id }, data: { status: "PAID", paidAt: new Date() } }),
        prisma.inventoryMovement.createMany({
          data: order.items.map((item) => ({
            variantId: item.variantId,
            type: "SALE" as const,
            quantity: -item.quantity,
            orderId: order.id,
          })),
        }),
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
