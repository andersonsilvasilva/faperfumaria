"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import type { Prisma } from "@/generated/prisma/client";

export interface SettingActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

const schema = z.object({
  key: z.string().trim().min(1, "Informe a chave."),
  valueJson: z.string().trim().min(1, "Informe o valor (JSON)."),
});

export async function saveSettingAction(
  _prevState: SettingActionState,
  formData: FormData,
): Promise<SettingActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  let value: Prisma.InputJsonValue;
  try {
    value = JSON.parse(parsed.data.valueJson) as Prisma.InputJsonValue;
  } catch {
    return { status: "error", message: "JSON inválido." };
  }

  await prisma.storeSetting.upsert({
    where: { key: parsed.data.key },
    update: { value },
    create: { key: parsed.data.key, value },
  });

  revalidatePath("/admin/configuracoes");
  return { status: "success", message: "Configuração salva." };
}
