"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { hashPassword } from "@/lib/password";

export interface AdminManageActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

const createAdminSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome completo."),
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
});

export async function createAdminAction(
  _prevState: AdminManageActionState,
  formData: FormData,
): Promise<AdminManageActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const parsed = createAdminSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { status: "error", message: "Já existe uma conta com esse e-mail." };
  }

  const passwordHash = await hashPassword(data.password);

  await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { name: data.name, email: data.email, passwordHash, role: "ADMIN" },
    });
    await tx.adminAuditLog.create({
      data: {
        adminId: admin.userId,
        action: "ADMIN_CREATE",
        entityType: "User",
        entityId: created.id,
        afterJson: { name: created.name, email: created.email },
      },
    });
  });

  revalidatePath("/admin/administradores");
  return { status: "success", message: "Administrador criado." };
}

const revokeAdminSchema = z.object({
  userId: z.string().min(1),
});

export async function revokeAdminAction(
  _prevState: AdminManageActionState,
  formData: FormData,
): Promise<AdminManageActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const parsed = revokeAdminSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: "Dados inválidos." };
  const { userId } = parsed.data;

  if (userId === admin.userId) {
    return { status: "error", message: "Você não pode revogar seu próprio acesso." };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.role !== "ADMIN") {
    return { status: "error", message: "Administrador não encontrado." };
  }

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount <= 1) {
    return { status: "error", message: "Não é possível remover o último administrador." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { role: "CUSTOMER" } });
    await tx.adminAuditLog.create({
      data: {
        adminId: admin.userId,
        action: "ADMIN_ACCESS_REVOKED",
        entityType: "User",
        entityId: userId,
        beforeJson: { role: "ADMIN", email: target.email },
        afterJson: { role: "CUSTOMER" },
      },
    });
  });

  revalidatePath("/admin/administradores");
  return { status: "success", message: "Acesso de administrador revogado." };
}
