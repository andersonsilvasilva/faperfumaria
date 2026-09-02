import "server-only";
import { prisma } from "@/lib/prisma";

export async function listInventoryForAdmin({
  search = "",
  lowStockOnly = false,
}: {
  search?: string;
  lowStockOnly?: boolean;
} = {}) {
  const variants = await prisma.productVariant.findMany({
    where: {
      isActive: true,
      ...(search
        ? {
            OR: [
              { sku: { contains: search } },
              { product: { name: { contains: search } } },
            ],
          }
        : {}),
    },
    include: { product: { select: { name: true, slug: true, brand: { select: { name: true } } } } },
    orderBy: { stockQty: "asc" },
  });

  // Comparar duas colunas (stockQty <= minStockQty) não é suportado no `where` do Prisma sem
  // SQL cru; o catálogo é pequeno o bastante para filtrar em memória sem custo relevante.
  return lowStockOnly ? variants.filter((v) => v.stockQty <= v.minStockQty) : variants;
}

export async function getInventoryMovements(variantId: string) {
  return prisma.inventoryMovement.findMany({
    where: { variantId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
