import "server-only";
import { prisma } from "@/lib/prisma";

export async function listBrandsForAdmin() {
  return prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getBrandForAdmin(id: string) {
  return prisma.brand.findUnique({ where: { id } });
}
