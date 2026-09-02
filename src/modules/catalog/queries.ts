import { prisma } from "@/lib/prisma";
import type { Intensity, Prisma } from "@/generated/prisma/client";

export type ProductSort =
  | "relevancia"
  | "mais-vendidos"
  | "novidades"
  | "menor-preco"
  | "maior-preco"
  | "melhor-avaliados";

export interface ProductListParams {
  categorySlug?: string;
  brandSlugs?: string[];
  olfactoryFamilySlugs?: string[];
  tagSlugs?: string[];
  intensities?: Intensity[];
  priceMin?: number;
  priceMax?: number;
  onSale?: boolean;
  search?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

const productCardInclude = {
  brand: true,
  images: { where: { isMain: true }, take: 1 },
  variants: { orderBy: { volumeMl: "asc" as const } },
  categories: { include: { category: true } },
} satisfies Prisma.ProductInclude;

export type ProductCardData = Prisma.ProductGetPayload<{ include: typeof productCardInclude }>;

function buildOrderBy(sort?: ProductSort): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "menor-preco":
      return [{ price: "asc" }];
    case "maior-preco":
      return [{ price: "desc" }];
    case "novidades":
      return [{ createdAt: "desc" }];
    // "Melhor avaliados" depende de avaliações reais (Fase 4) — hoje cai para relevância.
    case "melhor-avaliados":
    // "Mais vendidos" depende de histórico real de pedidos (Fase 3/5) — placeholder de
    // desenvolvimento: produtos em destaque primeiro, depois os mais antigos no catálogo.
    case "mais-vendidos":
      return [{ isFeatured: "desc" }, { createdAt: "asc" }];
    case "relevancia":
    default:
      return [{ isFeatured: "desc" }, { createdAt: "desc" }];
  }
}

function buildWhere(params: ProductListParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (params.categorySlug) {
    where.categories = { some: { category: { slug: params.categorySlug } } };
  }
  if (params.brandSlugs?.length) {
    where.brand = { slug: { in: params.brandSlugs } };
  }
  if (params.olfactoryFamilySlugs?.length) {
    where.olfactoryFamily = { slug: { in: params.olfactoryFamilySlugs } };
  }
  if (params.tagSlugs?.length) {
    where.profileTags = { some: { tag: { slug: { in: params.tagSlugs } } } };
  }
  if (params.intensities?.length) {
    where.intensity = { in: params.intensities };
  }
  if (params.priceMin != null || params.priceMax != null) {
    where.price = {
      ...(params.priceMin != null ? { gte: params.priceMin } : {}),
      ...(params.priceMax != null ? { lte: params.priceMax } : {}),
    };
  }
  if (params.onSale) {
    where.compareAtPrice = { not: null };
  }
  if (params.search) {
    const q = params.search.trim();
    where.OR = [
      { name: { contains: q } },
      { shortDescription: { contains: q } },
      { brand: { name: { contains: q } } },
      { olfactoryFamily: { name: { contains: q } } },
      { categories: { some: { category: { name: { contains: q } } } } },
      { profileTags: { some: { tag: { name: { contains: q } } } } },
      { fragranceNotes: { some: { note: { name: { contains: q } } } } },
    ];
  }

  return where;
}

export async function listProducts(params: ProductListParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? 12;
  const where = buildWhere(params);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productCardInclude,
      orderBy: buildOrderBy(params.sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getFeaturedProducts(limit = 4) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: productCardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** Placeholder de desenvolvimento até existir histórico real de vendas (ver Fase 3/5). */
export async function getBestSellers(limit = 4) {
  return prisma.product.findMany({
    where: { isActive: true },
    include: productCardInclude,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "asc" }],
    take: limit,
  });
}

export async function getBrandsWithActiveProducts() {
  return prisma.brand.findMany({
    where: { products: { some: { isActive: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getOlfactoryFamilies() {
  return prisma.olfactoryFamily.findMany({ orderBy: { name: "asc" } });
}

export async function getOccasionTags() {
  return prisma.fragranceProfileTag.findMany({
    where: { type: "OCCASION" },
    orderBy: { name: "asc" },
  });
}

const productDetailInclude = {
  brand: true,
  images: { orderBy: { position: "asc" as const } },
  variants: { where: { isActive: true }, orderBy: { volumeMl: "asc" as const } },
  categories: { include: { category: true } },
  olfactoryFamily: true,
  fragranceNotes: { include: { note: true } },
  profileTags: { include: { tag: true } },
} satisfies Prisma.ProductInclude;

export type ProductDetailData = Prisma.ProductGetPayload<{ include: typeof productDetailInclude }>;

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: productDetailInclude,
  });
}

export async function getRelatedProducts(product: ProductDetailData, limit = 4) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
      OR: [
        { brandId: product.brandId },
        { olfactoryFamilyId: product.olfactoryFamilyId },
        { categories: { some: { categoryId: { in: product.categories.map((c) => c.categoryId) } } } },
      ],
    },
    include: productCardInclude,
    take: limit,
  });
}
