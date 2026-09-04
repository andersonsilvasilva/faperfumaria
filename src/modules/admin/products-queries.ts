import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const ADMIN_PRODUCT_PAGE_SIZE = 20;

export async function listProductsForAdmin({
  search,
  page = 1,
}: {
  search?: string;
  page?: number;
}) {
  const where: Prisma.ProductWhereInput = search
    ? { OR: [{ name: { contains: search } }, { brand: { name: { contains: search } } }] }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        brand: { select: { name: true } },
        images: { where: { isMain: true }, take: 1 },
        variants: { select: { stockQty: true, minStockQty: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PRODUCT_PAGE_SIZE,
      take: ADMIN_PRODUCT_PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, pageCount: Math.max(1, Math.ceil(total / ADMIN_PRODUCT_PAGE_SIZE)) };
}

const adminProductDetailInclude = {
  images: { orderBy: { position: "asc" as const } },
  variants: { orderBy: [{ volumeMl: "asc" as const }, { createdAt: "asc" as const }] },
  categories: true,
  fragranceNotes: { include: { note: true } },
  profileTags: true,
} satisfies Prisma.ProductInclude;

export type AdminProductDetail = Prisma.ProductGetPayload<{ include: typeof adminProductDetailInclude }>;

export async function getProductForAdmin(id: string) {
  return prisma.product.findUnique({ where: { id }, include: adminProductDetailInclude });
}

export async function getProductFormOptions() {
  const [brands, categories, olfactoryFamilies, profileTags] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.olfactoryFamily.findMany({ orderBy: { name: "asc" } }),
    prisma.fragranceProfileTag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return {
    brands,
    categories,
    olfactoryFamilies,
    profileTagsByType: {
      OCCASION: profileTags.filter((t) => t.type === "OCCASION"),
      SEASON: profileTags.filter((t) => t.type === "SEASON"),
      PERSONALITY: profileTags.filter((t) => t.type === "PERSONALITY"),
    },
  };
}
