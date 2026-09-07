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

export interface ProductsReportFilters {
  categoryId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export async function getProductsReport(filters: ProductsReportFilters) {
  const where: Prisma.ProductWhereInput = {
    ...(filters.categoryId ? { categories: { some: { categoryId: filters.categoryId } } } : {}),
    ...(filters.dateFrom || filters.dateTo
      ? {
          createdAt: {
            ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
            ...(filters.dateTo ? { lte: filters.dateTo } : {}),
          },
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    include: {
      brand: { select: { name: true } },
      categories: { include: { category: { select: { name: true } } } },
      variants: { select: { barcode: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  return products.map((product) => {
    const costPrice = Number(product.costPrice.toString());
    const price = Number(product.price.toString());
    const marginValue = price - costPrice;
    const marginPercent = price > 0 ? (marginValue / price) * 100 : 0;

    return {
      id: product.id,
      name: product.name,
      brandName: product.brand.name,
      categoryNames: product.categories.map((c) => c.category.name),
      barcodes: product.variants.map((v) => v.barcode).filter((b): b is string => Boolean(b)),
      costPrice,
      price,
      marginValue,
      marginPercent,
      createdAt: product.createdAt,
    };
  });
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
