"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

export interface AccountActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

const profileSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo."),
  phone: z.string().trim().optional().default(""),
});

export async function updateProfileAction(
  _prevState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const session = await auth();
  if (!session?.user) return { status: "error", message: "Não autenticado." };

  const parsed = profileSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
  });

  revalidatePath("/minha-conta/perfil");
  return { status: "success", message: "Perfil atualizado." };
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual."),
    newPassword: z.string().min(8, "A nova senha deve ter ao menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(
  _prevState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const session = await auth();
  if (!session?.user) return { status: "error", message: "Não autenticado." };

  const parsed = passwordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const isValid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!isValid) {
    return { status: "error", message: "Senha atual incorreta." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  return { status: "success", message: "Senha alterada com sucesso." };
}
