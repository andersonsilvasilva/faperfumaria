"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export interface CouponActionState {
  status: "idle" | "error";
  message?: string;
}

const optionalNumber = z
  .string()
  .optional()
  .transform((v) => (v ? Number(v) : undefined))
  .refine((v) => v === undefined || Number.isFinite(v), "Valor numérico inválido.");

const optionalInt = z
  .string()
  .optional()
  .transform((v) => (v ? Number(v) : undefined))
  .refine((v) => v === undefined || Number.isInteger(v), "Valor inteiro inválido.");

const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v ? new Date(v) : undefined));

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Informe o código do cupom.")
    .transform((v) => v.toUpperCase()),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().positive("Informe o valor do desconto."),
  minOrderValue: optionalNumber,
  startsAt: optionalDate,
  endsAt: optionalDate,
  maxUses: optionalInt,
  maxUsesPerCustomer: optionalInt,
  isActive: z.literal("on").optional(),
  categoryIds: z.array(z.string()).default([]),
  productNames: z.string().trim().optional().default(""),
});

function parseCouponFormData(formData: FormData) {
  const raw = { ...Object.fromEntries(formData.entries()), categoryIds: formData.getAll("categoryIds") };
  return couponSchema.safeParse(raw);
}

async function resolveProductIds(namesCsv: string): Promise<string[]> {
  const names = Array.from(new Set(namesCsv.split(",").map((n) => n.trim()).filter(Boolean)));
  if (names.length === 0) return [];
  const products = await prisma.product.findMany({ where: { name: { in: names } }, select: { id: true } });
  return products.map((p) => p.id);
}

export async function createCouponAction(
  _prevState: CouponActionState,
  formData: FormData,
): Promise<CouponActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const parsed = parseCouponFormData(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;
  const productIds = await resolveProductIds(data.productNames);

  try {
    await prisma.coupon.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minOrderValue: data.minOrderValue ?? null,
        startsAt: data.startsAt ?? null,
        endsAt: data.endsAt ?? null,
        maxUses: data.maxUses ?? null,
        maxUsesPerCustomer: data.maxUsesPerCustomer ?? null,
        isActive: data.isActive === "on",
        categories: { create: data.categoryIds.map((categoryId) => ({ categoryId })) },
        products: { create: productIds.map((productId) => ({ productId })) },
      },
    });
  } catch {
    return { status: "error", message: "Já existe um cupom com esse código." };
  }

  revalidatePath("/admin/cupons");
  redirect("/admin/cupons");
}

export async function updateCouponAction(
  couponId: string,
  _prevState: CouponActionState,
  formData: FormData,
): Promise<CouponActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const parsed = parseCouponFormData(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;
  const productIds = await resolveProductIds(data.productNames);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.coupon.update({
        where: { id: couponId },
        data: {
          code: data.code,
          type: data.type,
          value: data.value,
          minOrderValue: data.minOrderValue ?? null,
          startsAt: data.startsAt ?? null,
          endsAt: data.endsAt ?? null,
          maxUses: data.maxUses ?? null,
          maxUsesPerCustomer: data.maxUsesPerCustomer ?? null,
          isActive: data.isActive === "on",
        },
      });
      await tx.couponCategory.deleteMany({ where: { couponId } });
      await tx.couponCategory.createMany({
        data: data.categoryIds.map((categoryId) => ({ couponId, categoryId })),
      });
      await tx.couponProduct.deleteMany({ where: { couponId } });
      await tx.couponProduct.createMany({ data: productIds.map((productId) => ({ couponId, productId })) });
    });
  } catch {
    return { status: "error", message: "Já existe um cupom com esse código." };
  }

  revalidatePath("/admin/cupons");
  redirect("/admin/cupons");
}

export async function toggleCouponActiveAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin.ok) return;

  const couponId = formData.get("couponId")?.toString();
  if (!couponId) return;

  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon) return;

  await prisma.coupon.update({ where: { id: couponId }, data: { isActive: !coupon.isActive } });
  revalidatePath("/admin/cupons");
}
