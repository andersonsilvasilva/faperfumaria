"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { MAINTENANCE_SETTING_KEY } from "@/modules/settings/maintenance";
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

const maintenanceSchema = z.object({
  enabled: z.literal("on").optional(),
  message: z.string().trim().optional().default(""),
});

export async function setMaintenanceModeAction(
  _prevState: SettingActionState,
  formData: FormData,
): Promise<SettingActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const parsed = maintenanceSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: "Dados inválidos." };
  }

  const enabled = parsed.data.enabled === "on";
  await prisma.storeSetting.upsert({
    where: { key: MAINTENANCE_SETTING_KEY },
    update: { value: { enabled, message: parsed.data.message } },
    create: { key: MAINTENANCE_SETTING_KEY, value: { enabled, message: parsed.data.message } },
  });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");
  return { status: "success", message: enabled ? "Loja em modo de manutenção." : "Loja reaberta ao público." };
}
