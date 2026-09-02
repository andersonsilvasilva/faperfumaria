"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/slug";

export interface CategoryActionState {
  status: "idle" | "error";
  message?: string;
}

const categorySchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da categoria."),
  parentId: z.string().trim().optional().default(""),
});

export async function createCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const parsed = categorySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        parentId: parsed.data.parentId || null,
      },
    });
  } catch {
    return { status: "error", message: "Já existe uma categoria com esse nome." };
  }

  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function updateCategoryAction(
  categoryId: string,
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const parsed = categorySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  if (parsed.data.parentId === categoryId) {
    return { status: "error", message: "Uma categoria não pode ser mãe de si mesma." };
  }

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        parentId: parsed.data.parentId || null,
      },
    });
  } catch {
    return { status: "error", message: "Já existe uma categoria com esse nome." };
  }

  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin.ok) return;

  const categoryId = formData.get("categoryId")?.toString();
  if (!categoryId) return;

  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/categorias");
}
