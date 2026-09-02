"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export interface BannerActionState {
  status: "idle" | "error";
  message?: string;
}

const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v ? new Date(v) : undefined));

const bannerSchema = z.object({
  title: z.string().trim().min(2, "Informe o título."),
  subtitle: z.string().trim().optional().default(""),
  eyebrow: z.string().trim().optional().default(""),
  ctaLabel: z.string().trim().optional().default(""),
  ctaUrl: z.string().trim().optional().default(""),
  desktopImage: z.string().trim().min(1, "Informe a imagem para desktop."),
  mobileImage: z.string().trim().optional().default(""),
  position: z.coerce.number().int().default(0),
  isActive: z.literal("on").optional(),
  startsAt: optionalDate,
  endsAt: optionalDate,
});

export async function createBannerAction(
  _prevState: BannerActionState,
  formData: FormData,
): Promise<BannerActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const parsed = bannerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  await prisma.banner.create({
    data: {
      title: data.title,
      subtitle: data.subtitle || null,
      eyebrow: data.eyebrow || null,
      ctaLabel: data.ctaLabel || null,
      ctaUrl: data.ctaUrl || null,
      desktopImage: data.desktopImage,
      mobileImage: data.mobileImage || null,
      position: data.position,
      isActive: data.isActive === "on",
      startsAt: data.startsAt ?? null,
      endsAt: data.endsAt ?? null,
    },
  });

  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}

export async function updateBannerAction(
  bannerId: string,
  _prevState: BannerActionState,
  formData: FormData,
): Promise<BannerActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const parsed = bannerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  await prisma.banner.update({
    where: { id: bannerId },
    data: {
      title: data.title,
      subtitle: data.subtitle || null,
      eyebrow: data.eyebrow || null,
      ctaLabel: data.ctaLabel || null,
      ctaUrl: data.ctaUrl || null,
      desktopImage: data.desktopImage,
      mobileImage: data.mobileImage || null,
      position: data.position,
      isActive: data.isActive === "on",
      startsAt: data.startsAt ?? null,
      endsAt: data.endsAt ?? null,
    },
  });

  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}

export async function deleteBannerAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin.ok) return;

  const bannerId = formData.get("bannerId")?.toString();
  if (!bannerId) return;

  await prisma.banner.delete({ where: { id: bannerId } });
  revalidatePath("/admin/banners");
}
