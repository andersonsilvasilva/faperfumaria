"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export interface ToggleFavoriteResult {
  status: "success" | "error";
  favorited?: boolean;
  message?: string;
}

export async function toggleFavoriteAction(productId: string): Promise<ToggleFavoriteResult> {
  const session = await auth();
  if (!session?.user) {
    return { status: "error", message: "login-required" };
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/minha-conta/favoritos");
    return { status: "success", favorited: false };
  }

  await prisma.favorite.create({ data: { userId: session.user.id, productId } });
  revalidatePath("/minha-conta/favoritos");
  return { status: "success", favorited: true };
}
