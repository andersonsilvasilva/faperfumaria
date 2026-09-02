import "server-only";
import { prisma } from "@/lib/prisma";
import { getEmailProvider } from "@/modules/email";
import {
  orderReceivedEmail,
  paymentApprovedEmail,
  paymentFailedEmail,
  orderPreparingEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
  type OrderEmailContext,
  type EmailTemplate,
} from "@/modules/email/templates";

export type OrderEmailEvent =
  | "ORDER_RECEIVED"
  | "PAYMENT_APPROVED"
  | "PAYMENT_FAILED"
  | "PREPARING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

function buildTemplate(event: OrderEmailEvent, ctx: OrderEmailContext): EmailTemplate {
  switch (event) {
    case "ORDER_RECEIVED":
      return orderReceivedEmail(ctx);
    case "PAYMENT_APPROVED":
      return paymentApprovedEmail(ctx);
    case "PAYMENT_FAILED":
      return paymentFailedEmail(ctx);
    case "PREPARING":
      return orderPreparingEmail(ctx);
    case "SHIPPED":
      return orderShippedEmail(ctx);
    case "DELIVERED":
      return orderDeliveredEmail(ctx);
    case "CANCELLED":
      return orderCancelledEmail(ctx);
  }
}

/**
 * Dispara o e-mail transacional correspondente ao evento do pedido. Nunca lança erro para quem
 * chamou — falha de e-mail não pode interromper o fluxo de pedido/pagamento (só é registrada
 * no console). Ver docs/integrations.md.
 */
export async function sendOrderEmail(orderId: string, event: OrderEmailEvent): Promise<void> {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) return;

    const ctx: OrderEmailContext = {
      orderNumber: order.orderNumber,
      contactName: order.contactName,
      total: Number(order.total.toString()),
      shippingLabel: order.shippingLabel ?? "Retirada na loja",
      items: order.items.map((item) => ({
        name: item.productNameSnapshot,
        variant: item.variantLabelSnapshot,
        quantity: item.quantity,
        totalPrice: Number(item.totalPrice.toString()),
      })),
    };

    const template = buildTemplate(event, ctx);
    const provider = getEmailProvider();
    await provider.sendEmail({ to: order.contactEmail, toName: order.contactName, ...template });
  } catch (error) {
    console.error(`[email] Falha ao enviar e-mail (${event}) do pedido ${orderId}:`, error);
  }
}
