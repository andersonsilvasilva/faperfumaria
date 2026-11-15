import "server-only";
import { prisma } from "@/lib/prisma";
import { sendOrderEmail } from "@/modules/email/send-order-email";
import type { ProviderPaymentDetails } from "@/modules/payments/types";

export type ReconcileOutcome =
  | "ignored" // pagamento que não é nosso (sem pedido correspondente / valor divergente)
  | "unchanged" // nada a fazer (status já refletido)
  | "paid"
  | "failed"
  | "cancelled"
  | "updated";

/**
 * Aplica ao pedido o estado de um pagamento visto no provider (webhook ou verificação manual).
 *
 * Idempotente: pode ser chamado várias vezes para o mesmo pagamento. Quando o pagamento ainda não
 * existe no nosso banco — por exemplo, a cobrança foi aprovada mas a nossa chamada ao provider
 * expirou antes da resposta (caso do pedido FA-2026-000006) — o vínculo é refeito pela
 * `external_reference` (número do pedido), conferindo o valor para nunca ligar um pagamento a
 * um pedido de total diferente.
 */
export async function processProviderPayment(details: ProviderPaymentDetails): Promise<ReconcileOutcome> {
  let payment = await prisma.payment.findFirst({ where: { externalId: details.externalId } });

  if (!payment) {
    if (!details.externalReference) return "ignored";
    const order = await prisma.order.findUnique({ where: { orderNumber: details.externalReference } });
    if (!order) return "ignored";
    if (Math.abs(Number(order.total.toString()) - details.amount) > 0.01) return "ignored";

    payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "mercadopago",
        method: details.method === "PIX" ? "PIX" : "CARD",
        status: "PENDING",
        amount: order.total,
        externalId: details.externalId,
        rawPayload: details.installments ? { installments: details.installments } : undefined,
      },
    });
  }

  const mappedStatus =
    details.status === "APPROVED"
      ? "APPROVED"
      : details.status === "REJECTED"
        ? "REJECTED"
        : details.status === "REFUNDED"
          ? "REFUNDED"
          : details.status === "CANCELLED"
            ? "CANCELLED"
            : "PENDING";

  const statusChanged = payment.status !== mappedStatus;
  if (statusChanged) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: mappedStatus } });
  }

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
      await sendOrderEmail(order.id, "PAYMENT_APPROVED");
      return "paid";
    }
  } else if (mappedStatus === "REJECTED" || mappedStatus === "CANCELLED") {
    // Pagamento recusado/cancelado antes de ser aprovado — libera a reserva de estoque feita
    // na criação do pedido (ver InventoryMovementType.RELEASE) e avisa o cliente por e-mail.
    const order = await prisma.order.findUnique({ where: { id: payment.orderId }, include: { items: true } });
    if (order && order.status === "PENDING_PAYMENT") {
      const newStatus = mappedStatus === "REJECTED" ? "PAYMENT_FAILED" : "CANCELLED";
      await prisma.$transaction([
        prisma.order.update({ where: { id: order.id }, data: { status: newStatus } }),
        ...order.items.map((item) =>
          prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stockQty: { increment: item.quantity } },
          }),
        ),
        prisma.inventoryMovement.createMany({
          data: order.items.map((item) => ({
            variantId: item.variantId,
            type: "RELEASE" as const,
            quantity: item.quantity,
            orderId: order.id,
          })),
        }),
      ]);
      await sendOrderEmail(order.id, mappedStatus === "REJECTED" ? "PAYMENT_FAILED" : "CANCELLED");
      return mappedStatus === "REJECTED" ? "failed" : "cancelled";
    }
  }

  return statusChanged ? "updated" : "unchanged";
}
