import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentCartId } from "@/modules/cart/session";

const cartInclude = {
  coupon: true,
  items: {
    include: {
      variant: {
        include: {
          product: {
            include: {
              brand: true,
              images: { where: { isMain: true }, take: 1 },
            },
          },
        },
      },
    },
  },
} as const;

export async function getCartWithItems() {
  const cartId = await getCurrentCartId();
  if (!cartId) return null;

  return prisma.cart.findUnique({ where: { id: cartId }, include: cartInclude });
}

export async function getCartItemCount(): Promise<number> {
  const cartId = await getCurrentCartId();
  if (!cartId) return 0;

  const result = await prisma.cartItem.aggregate({
    where: { cartId },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}

export function calculateCartSubtotal(cart: NonNullable<Awaited<ReturnType<typeof getCartWithItems>>>) {
  return cart.items.reduce((sum, item) => sum + Number(item.variant.price.toString()) * item.quantity, 0);
}
