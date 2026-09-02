import "server-only";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getFavoriteProductIds(): Promise<string[]> {
  const session = await auth();
  if (!session?.user) return [];

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  return favorites.map((f) => f.productId);
}
