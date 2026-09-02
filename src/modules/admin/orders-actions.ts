"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { sendOrderEmail } from "@/modules/email/send-order-email";

export interface OrderStatusActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

const NEXT_STATUSES = ["PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

/**
 * Transições permitidas pelo admin. PENDING_PAYMENT/PAYMENT_FAILED/REFUNDED não aparecem aqui
 * porque são consequência de pagamento (não uma decisão manual do admin), e não é possível
 * cancelar um pedido já enviado (isso exigiria um fluxo de devolução, fora do escopo do MVP).
 */
const ALLOWED_TRANSITIONS: Partial<Record<string, (typeof NEXT_STATUSES)[number][]>> = {
  PAID: ["PREPARING", "CANCELLED"],
  PREPARING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
};

const schema = z.object({
  orderId: z.string().min(1),
  nextStatus: z.enum(NEXT_STATUSES),
  carrier: z.string().trim().optional().default(""),
  trackingCode: z.string().trim().optional().default(""),
});

export async function updateOrderStatusAction(
  _prevState: OrderStatusActionState,
  formData: FormData,
): Promise<OrderStatusActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { orderId, nextStatus, carrier, trackingCode } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return { status: "error", message: "Pedido não encontrado." };

  const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    return {
      status: "error",
      message: `Não é possível mudar o pedido de "${order.status}" para "${nextStatus}".`,
    };
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        ...(nextStatus === "SHIPPED" ? { shippedAt: now } : {}),
        ...(nextStatus === "DELIVERED" ? { deliveredAt: now } : {}),
        ...(nextStatus === "CANCELLED" ? { cancelledAt: now } : {}),
      },
    });

    if (nextStatus === "SHIPPED") {
      await tx.shipment.upsert({
        where: { orderId },
        create: {
          orderId,
          method: order.shippingMethod,
          carrier: carrier || null,
          trackingCode: trackingCode || null,
          cost: order.shippingTotal,
          shippedAt: now,
        },
        update: { carrier: carrier || null, trackingCode: trackingCode || null, shippedAt: now },
      });
    }

    if (nextStatus === "DELIVERED") {
      await tx.shipment.updateMany({ where: { orderId }, data: { deliveredAt: now } });
    }

    if (nextStatus === "CANCELLED") {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQty: { increment: item.quantity } },
        });
      }
      await tx.inventoryMovement.createMany({
        data: order.items.map((item) => ({
          variantId: item.variantId,
          type: "RELEASE" as const,
          quantity: item.quantity,
          orderId,
          userId: admin.userId,
          note: "Cancelado pelo admin",
        })),
      });
    }

    await tx.adminAuditLog.create({
      data: {
        adminId: admin.userId,
        action: "ORDER_STATUS_UPDATE",
        entityType: "Order",
        entityId: orderId,
        beforeJson: { status: order.status },
        afterJson: { status: nextStatus },
      },
    });
  });

  await sendOrderEmail(orderId, nextStatus);

  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
  revalidatePath(`/pedido/${order.orderNumber}`);

  return { status: "success", message: "Status do pedido atualizado." };
}
