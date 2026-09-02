import "server-only";
import { prisma } from "@/lib/prisma";

export async function listCategoriesForAdmin() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true } },
    },
  });
}

export async function getCategoryForAdmin(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export async function listCategoryOptions(excludeId?: string) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return excludeId ? categories.filter((c) => c.id !== excludeId) : categories;
}
