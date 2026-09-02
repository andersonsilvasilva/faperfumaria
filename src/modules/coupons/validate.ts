import "server-only";
import { prisma } from "@/lib/prisma";

export interface CouponValidationContext {
  subtotal: number;
  productIds: string[];
  categoryIds: string[];
  userId?: string;
}

export interface CouponValidationResult {
  ok: boolean;
  message?: string;
  discount: number;
  couponId?: string;
}

export async function validateCoupon(
  rawCode: string,
  context: CouponValidationContext,
): Promise<CouponValidationResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, message: "Informe um código de cupom.", discount: 0 };

  const coupon = await prisma.coupon.findUnique({
    where: { code },
    include: { products: true, categories: true },
  });

  if (!coupon || !coupon.isActive) {
    return { ok: false, message: "Cupom inválido.", discount: 0 };
  }

  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) {
    return { ok: false, message: "Este cupom ainda não está disponível.", discount: 0 };
  }
  if (coupon.endsAt && now > coupon.endsAt) {
    return { ok: false, message: "Este cupom expirou.", discount: 0 };
  }

  if (coupon.minOrderValue && context.subtotal < Number(coupon.minOrderValue.toString())) {
    return {
      ok: false,
      message: `Pedido mínimo de ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Number(coupon.minOrderValue.toString()))} para usar este cupom.`,
      discount: 0,
    };
  }

  if (coupon.maxUses != null) {
    const usageCount = await prisma.couponUsage.count({ where: { couponId: coupon.id } });
    if (usageCount >= coupon.maxUses) {
      return { ok: false, message: "Este cupom atingiu o limite de usos.", discount: 0 };
    }
  }

  if (context.userId && coupon.maxUsesPerCustomer != null) {
    const userUsageCount = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId: context.userId },
    });
    if (userUsageCount >= coupon.maxUsesPerCustomer) {
      return { ok: false, message: "Você já utilizou este cupom o máximo de vezes permitido.", discount: 0 };
    }
  }

  const hasRestriction = coupon.products.length > 0 || coupon.categories.length > 0;
  if (hasRestriction) {
    const productMatch = coupon.products.some((p) => context.productIds.includes(p.productId));
    const categoryMatch = coupon.categories.some((c) => context.categoryIds.includes(c.categoryId));
    if (!productMatch && !categoryMatch) {
      return { ok: false, message: "Este cupom não se aplica aos produtos do carrinho.", discount: 0 };
    }
  }

  const value = Number(coupon.value.toString());
  const discount =
    coupon.type === "PERCENTAGE"
      ? Math.round(((context.subtotal * value) / 100) * 100) / 100
      : Math.min(value, context.subtotal);

  return { ok: true, discount, couponId: coupon.id };
}
