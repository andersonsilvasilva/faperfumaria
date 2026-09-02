"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getOrCreateCart } from "@/modules/cart/session";
import { validateCoupon } from "@/modules/coupons/validate";

export interface CartActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

const addToCartSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
});

export async function addToCartAction(
  _prevState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const parsed = addToCartSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity") ?? 1,
  });

  if (!parsed.success) {
    return { status: "error", message: "Não foi possível adicionar este item ao carrinho." };
  }

  const variant = await prisma.productVariant.findUnique({ where: { id: parsed.data.variantId } });
  if (!variant || !variant.isActive) {
    return { status: "error", message: "Produto indisponível." };
  }
  if (variant.stockQty < parsed.data.quantity) {
    return { status: "error", message: "Estoque insuficiente para a quantidade solicitada." };
  }

  const cart = await getOrCreateCart();

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
  });

  const nextQuantity = (existingItem?.quantity ?? 0) + parsed.data.quantity;
  if (variant.stockQty < nextQuantity) {
    return { status: "error", message: "Estoque insuficiente para a quantidade solicitada." };
  }

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
    update: { quantity: nextQuantity, unitPriceSnapshot: variant.price },
    create: {
      cartId: cart.id,
      variantId: variant.id,
      quantity: parsed.data.quantity,
      unitPriceSnapshot: variant.price,
    },
  });

  revalidatePath("/", "layout");
  return { status: "success", message: "Adicionado ao carrinho." };
}

const updateQuantitySchema = z.object({
  cartItemId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
});

export async function updateCartItemQuantityAction(
  _prevState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const parsed = updateQuantitySchema.safeParse({
    cartItemId: formData.get("cartItemId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Quantidade inválida." };
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: parsed.data.cartItemId },
    include: { variant: true },
  });
  if (!item) {
    return { status: "error", message: "Item não encontrado no carrinho." };
  }

  const quantity = Math.min(parsed.data.quantity, item.variant.stockQty);

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
  });

  revalidatePath("/carrinho");
  revalidatePath("/", "layout");
  return { status: "success" };
}

const removeItemSchema = z.object({ cartItemId: z.string().min(1) });

export async function removeCartItemAction(
  _prevState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const parsed = removeItemSchema.safeParse({ cartItemId: formData.get("cartItemId") });
  if (!parsed.success) {
    return { status: "error", message: "Item inválido." };
  }

  await prisma.cartItem.delete({ where: { id: parsed.data.cartItemId } }).catch(() => null);

  revalidatePath("/carrinho");
  revalidatePath("/", "layout");
  return { status: "success" };
}

const applyCouponSchema = z.object({ code: z.string().min(1) });

export async function applyCouponAction(
  _prevState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const parsed = applyCouponSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { status: "error", message: "Informe um código de cupom." };
  }

  const cart = await getOrCreateCart();
  const cartWithItems = await prisma.cart.findUniqueOrThrow({
    where: { id: cart.id },
    include: {
      items: {
        include: { variant: { include: { product: { include: { categories: true } } } } },
      },
    },
  });

  const subtotal = cartWithItems.items.reduce(
    (sum, item) => sum + Number(item.variant.price.toString()) * item.quantity,
    0,
  );
  const productIds = cartWithItems.items.map((item) => item.variant.product.id);
  const categoryIds = cartWithItems.items.flatMap((item) =>
    item.variant.product.categories.map((c) => c.categoryId),
  );

  const session = await auth();
  const result = await validateCoupon(parsed.data.code, {
    subtotal,
    productIds,
    categoryIds,
    userId: session?.user?.id,
  });

  if (!result.ok) {
    return { status: "error", message: result.message ?? "Cupom inválido." };
  }

  await prisma.cart.update({ where: { id: cart.id }, data: { couponId: result.couponId } });

  revalidatePath("/carrinho");
  return { status: "success", message: "Cupom aplicado!" };
}

export async function removeCouponAction(): Promise<void> {
  const cart = await getOrCreateCart();
  await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } });
  revalidatePath("/carrinho");
}
