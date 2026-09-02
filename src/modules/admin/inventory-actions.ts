"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export interface StockAdjustActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

const schema = z.object({
  variantId: z.string().min(1),
  delta: z.coerce
    .number()
    .int()
    .refine((v) => v !== 0, "Informe uma quantidade diferente de zero."),
  note: z.string().trim().optional().default(""),
});

export async function adjustStockAction(
  _prevState: StockAdjustActionState,
  formData: FormData,
): Promise<StockAdjustActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { variantId, delta, note } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.productVariant.updateMany({
        where: { id: variantId, stockQty: { gte: delta < 0 ? -delta : 0 } },
        data: { stockQty: { increment: delta } },
      });
      if (updated.count !== 1) {
        throw new Error("Estoque insuficiente para essa redução.");
      }
      await tx.inventoryMovement.create({
        data: {
          variantId,
          type: "ADJUSTMENT",
          quantity: delta,
          note: note || null,
          userId: admin.userId,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error) return { status: "error", message: error.message };
    throw error;
  }

  revalidatePath("/admin/estoque");
  return { status: "success", message: "Estoque atualizado." };
}
