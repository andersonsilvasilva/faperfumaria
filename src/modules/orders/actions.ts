"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getOrCreateCart } from "@/modules/cart/session";
import { getShippingOptions } from "@/modules/shipping/provider";
import { validateCoupon } from "@/modules/coupons/validate";
import { generateOrderNumber } from "@/modules/orders/order-number";
import { getPaymentProvider } from "@/modules/payments";
import { sendOrderEmail } from "@/modules/email/send-order-email";

export interface CheckoutActionState {
  status: "idle" | "error";
  message?: string;
}

const checkoutSchema = z
  .object({
    contactName: z.string().trim().min(3, "Informe seu nome completo."),
    contactCpf: z
      .string()
      .trim()
      .transform((v) => v.replace(/\D/g, ""))
      .refine((v) => v.length === 11, "CPF inválido."),
    contactEmail: z.email("E-mail inválido."),
    contactPhone: z.string().trim().min(8, "Telefone inválido."),
    shippingMethod: z.enum(["LOCAL_PICKUP", "LOCAL_DELIVERY", "NATIONAL"]),
    paymentMethod: z.enum(["PIX", "CARD"]),
    cep: z.string().trim().optional().default(""),
    street: z.string().trim().optional().default(""),
    number: z.string().trim().optional().default(""),
    complement: z.string().trim().optional().default(""),
    neighborhood: z.string().trim().optional().default(""),
    city: z.string().trim().optional().default(""),
    state: z.string().trim().optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.shippingMethod !== "LOCAL_PICKUP") {
      const requiredFields: (keyof typeof data)[] = [
        "cep",
        "street",
        "number",
        "neighborhood",
        "city",
        "state",
      ];
      for (const field of requiredFields) {
        if (!data[field]) {
          ctx.addIssue({ code: "custom", path: [field], message: "Campo obrigatório." });
        }
      }
    }
  });

export async function createOrderAction(
  _prevState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = checkoutSchema.safeParse(raw);

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const cart = await getOrCreateCart();
  const cartWithItems = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      coupon: true,
      items: {
        include: { variant: { include: { product: { include: { categories: true } } } } },
      },
    },
  });

  if (!cartWithItems || cartWithItems.items.length === 0) {
    return { status: "error", message: "Seu carrinho está vazio." };
  }

  const subtotal = cartWithItems.items.reduce(
    (sum, item) => sum + Number(item.variant.price.toString()) * item.quantity,
    0,
  );

  let discount = 0;
  let couponId: string | null = null;
  if (cartWithItems.coupon) {
    const productIds = cartWithItems.items.map((item) => item.variant.product.id);
    const categoryIds = cartWithItems.items.flatMap((item) =>
      item.variant.product.categories.map((c) => c.categoryId),
    );
    const session = await auth();
    const couponResult = await validateCoupon(cartWithItems.coupon.code, {
      subtotal,
      productIds,
      categoryIds,
      userId: session?.user?.id,
    });
    if (couponResult.ok) {
      discount = couponResult.discount;
      couponId = couponResult.couponId ?? null;
    }
  }

  let shippingCost = 0;
  let shippingLabel = "Retirada na loja";
  if (data.shippingMethod !== "LOCAL_PICKUP") {
    const options = await getShippingOptions(data.cep);
    const selected = options.find((o) => o.method === data.shippingMethod);
    if (!selected) {
      return {
        status: "error",
        message: "A opção de frete selecionada não está disponível para este CEP.",
      };
    }
    shippingCost = selected.cost;
    shippingLabel = selected.label;
  }

  const total = Math.max(0, subtotal - discount) + shippingCost;

  const session = await auth();

  let orderId: string;
  let orderNumber: string;

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const item of cartWithItems.items) {
        const updated = await tx.productVariant.updateMany({
          where: { id: item.variant.id, stockQty: { gte: item.quantity } },
          data: { stockQty: { decrement: item.quantity } },
        });
        if (updated.count !== 1) {
          throw new Error(`Estoque insuficiente para ${item.variant.product.name}.`);
        }
      }

      const orderNumber = await generateOrderNumber(tx);

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id,
          status: "PENDING_PAYMENT",
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          contactCpf: data.contactCpf,
          shippingMethod: data.shippingMethod,
          shippingLabel,
          subtotal,
          discountTotal: discount,
          shippingTotal: shippingCost,
          total,
          giftWrap: cartWithItems.giftWrap,
          giftMessage: cartWithItems.giftWrap ? cartWithItems.giftMessage : null,
          couponId: couponId ?? undefined,
          items: {
            create: cartWithItems.items.map((item) => ({
              variantId: item.variant.id,
              productNameSnapshot: item.variant.product.name,
              variantLabelSnapshot: `${item.variant.volumeMl}ml`,
              unitPrice: item.variant.price,
              quantity: item.quantity,
              totalPrice: Number(item.variant.price.toString()) * item.quantity,
            })),
          },
          inventoryMovements: {
            create: cartWithItems.items.map((item) => ({
              variantId: item.variant.id,
              type: "RESERVATION" as const,
              quantity: -item.quantity,
              userId: session?.user?.id,
            })),
          },
        },
      });

      if (couponId) {
        await tx.couponUsage.create({
          data: { couponId, orderId: createdOrder.id, userId: session?.user?.id },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cartWithItems.id } });
      await tx.cart.update({
        where: { id: cartWithItems.id },
        data: { couponId: null, giftWrap: false, giftMessage: null },
      });

      return createdOrder;
    });

    orderId = order.id;
    orderNumber = order.orderNumber;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Estoque insuficiente")) {
      return { status: "error", message: error.message };
    }
    throw error;
  }

  await sendOrderEmail(orderId, "ORDER_RECEIVED");

  // Pedido já criado e estoque reservado — problemas no pagamento a partir daqui não devem
  // apagar o pedido; o cliente pode tentar pagar novamente a partir da página de confirmação.
  try {
    const provider = getPaymentProvider();

    if (data.paymentMethod === "PIX") {
      const pix = await provider.createPixPayment({
        orderId,
        orderNumber,
        amount: total,
        payerEmail: data.contactEmail,
        payerName: data.contactName,
        description: `Pedido ${orderNumber} — FA Perfumaria`,
      });

      await prisma.payment.create({
        data: {
          orderId,
          provider: provider.name,
          method: "PIX",
          status: pix.status === "APPROVED" ? "APPROVED" : "PENDING",
          amount: total,
          externalId: pix.externalId,
          rawPayload: { qrCodeText: pix.qrCodeText, qrCodeBase64: pix.qrCodeBase64 },
        },
      });
    } else {
      const card = await provider.createCardPayment({
        orderId,
        orderNumber,
        amount: total,
        payerEmail: data.contactEmail,
        payerName: data.contactName,
        description: `Pedido ${orderNumber} — FA Perfumaria`,
        cardToken: String(raw.cardToken ?? "mock-token"),
        installments: Number(raw.installments ?? 1),
        paymentMethodId: String(raw.cardBrand ?? "master"),
      });

      const cardStatus = card.status === "APPROVED" ? "APPROVED" : card.status === "REJECTED" ? "REJECTED" : "PENDING";

      await prisma.payment.create({
        data: {
          orderId,
          provider: provider.name,
          method: "CARD",
          status: cardStatus,
          amount: total,
          externalId: card.externalId,
        },
      });

      if (cardStatus === "APPROVED") {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "PAID", paidAt: new Date() },
        });
        await prisma.inventoryMovement.createMany({
          data: cartWithItems.items.map((item) => ({
            variantId: item.variant.id,
            type: "SALE" as const,
            quantity: -item.quantity,
            orderId,
            userId: session?.user?.id,
          })),
        });
        await sendOrderEmail(orderId, "PAYMENT_APPROVED");
      }
    }
  } catch {
    // Pagamento falhou ao processar (ex.: provider indisponível) — o pedido continua criado
    // como PENDING_PAYMENT; a página de confirmação orienta o cliente a tentar novamente.
  }

  redirect(`/pedido/${orderNumber}`);
}

/**
 * Ferramenta de desenvolvimento: simula a aprovação de um pagamento PIX pendente. Só funciona
 * quando o provider ativo é o mock — nunca aprova pagamentos reais do Mercado Pago.
 */
export async function simulatePixApprovalAction(orderNumber: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { payments: true, items: true },
  });
  if (!order) return;

  const pendingPayment = order.payments.find((p) => p.status === "PENDING" && p.provider === "mock");
  if (!pendingPayment) return;

  await prisma.$transaction([
    prisma.payment.update({ where: { id: pendingPayment.id }, data: { status: "APPROVED" } }),
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
  revalidatePath(`/pedido/${orderNumber}`);
}
