"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/slug";

export interface BrandActionState {
  status: "idle" | "error";
  message?: string;
}

const brandSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da marca."),
  logoUrl: z.string().trim().optional().default(""),
  description: z.string().trim().optional().default(""),
});

export async function createBrandAction(
  _prevState: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const parsed = brandSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.brand.create({
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        logoUrl: parsed.data.logoUrl || null,
        description: parsed.data.description || null,
      },
    });
  } catch {
    return { status: "error", message: "Já existe uma marca com esse nome." };
  }

  revalidatePath("/admin/marcas");
  redirect("/admin/marcas");
}

export async function updateBrandAction(
  brandId: string,
  _prevState: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const parsed = brandSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.brand.update({
      where: { id: brandId },
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        logoUrl: parsed.data.logoUrl || null,
        description: parsed.data.description || null,
      },
    });
  } catch {
    return { status: "error", message: "Já existe uma marca com esse nome." };
  }

  revalidatePath("/admin/marcas");
  redirect("/admin/marcas");
}

export async function deleteBrandAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin.ok) return;

  const brandId = formData.get("brandId")?.toString();
  if (!brandId) return;

  try {
    await prisma.brand.delete({ where: { id: brandId } });
    revalidatePath("/admin/marcas");
  } catch {
    // Marca com produtos vinculados: a foreign key impede a exclusão (comportamento correto,
    // ver docs/admin.md). O usuário precisa remover/realocar os produtos antes.
  }
}
