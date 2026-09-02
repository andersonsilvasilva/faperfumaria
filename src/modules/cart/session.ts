import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const CART_COOKIE = "fa_cart_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 dias

/** Retorna o carrinho atual (do usuário logado ou do visitante), criando um se necessário. */
export async function getOrCreateCart() {
  const session = await auth();

  if (session?.user) {
    const existing = await prisma.cart.findUnique({ where: { userId: session.user.id } });
    if (existing) return existing;
    return prisma.cart.create({ data: { userId: session.user.id } });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(CART_COOKIE)?.value;

  if (token) {
    const existing = await prisma.cart.findUnique({ where: { sessionToken: token } });
    if (existing) return existing;
  }

  const newToken = randomUUID();
  const cart = await prisma.cart.create({ data: { sessionToken: newToken } });
  cookieStore.set(CART_COOKIE, newToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return cart;
}

/** Sem criar: usado em contextos de leitura (ex.: contagem no header) para não gravar cookies à toa. */
export async function getCurrentCartId(): Promise<string | null> {
  const session = await auth();

  if (session?.user) {
    const cart = await prisma.cart.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    return cart?.id ?? null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(CART_COOKIE)?.value;
  if (!token) return null;

  const cart = await prisma.cart.findUnique({ where: { sessionToken: token }, select: { id: true } });
  return cart?.id ?? null;
}

/** Migra o carrinho de visitante (cookie) para a conta recém-logada, mesclando itens. */
export async function mergeGuestCartIntoUser(userId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(CART_COOKIE)?.value;
  if (!token) return;

  const guestCart = await prisma.cart.findUnique({
    where: { sessionToken: token },
    include: { items: true },
  });
  if (!guestCart || guestCart.items.length === 0) {
    cookieStore.delete(CART_COOKIE);
    return;
  }

  const userCart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  for (const item of guestCart.items) {
    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
      update: { quantity: { increment: item.quantity } },
      create: {
        cartId: userCart.id,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPriceSnapshot: item.unitPriceSnapshot,
      },
    });
  }

  await prisma.cart.delete({ where: { id: guestCart.id } });
  cookieStore.delete(CART_COOKIE);
}
