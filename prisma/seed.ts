import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import type { FragranceLayer, Intensity, ProfileTagType } from "@/generated/prisma/client";

// Dados de exemplo para desenvolvimento — nomes de produtos e marcas refletem o estoque real
// fotografado pelo cliente, mas notas/perfil olfativo abaixo são ILUSTRATIVAS (não verificadas
// com o fabricante). Nunca usar este arquivo/dados em produção (seção 54 do CLAUDE.md).

const PLACEHOLDER_IMAGE = "/brand/store-perfumes.jpg";

async function seedAdmin() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@faperfumaria.dev";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "TrocarSenha123";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador FA Perfumaria",
      email: adminEmail,
      passwordHash: await hashPassword(adminPassword),
      role: "ADMIN",
    },
  });

  console.log(`[seed] Admin pronto: ${admin.email}`);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(`[seed] Senha de desenvolvimento padrão: ${adminPassword} (troque em produção)`);
  }
}

const CATEGORIES = [
  { name: "Masculino", slug: "masculino" },
  { name: "Feminino", slug: "feminino" },
  { name: "Unissex", slug: "unissex" },
  { name: "Árabe", slug: "arabe" },
  { name: "Decant", slug: "decant" },
  { name: "Kit", slug: "kit" },
] as const;

const OLFACTORY_FAMILIES = [
  "Amadeirado",
  "Oriental",
  "Floral",
  "Cítrico",
  "Aromático",
  "Gourmand",
  "Frutado",
  "Especiado",
  "Aquático",
] as const;

const FRAGRANCE_NOTES = [
  "Bergamota",
  "Limão Siciliano",
  "Maçã Verde",
  "Pera",
  "Frutas Vermelhas",
  "Lavanda",
  "Rosa",
  "Jasmim",
  "Canela",
  "Cardamomo",
  "Baunilha",
  "Caramelo",
  "Almíscar",
  "Âmbar",
  "Patchouli",
  "Sândalo",
  "Couro",
  "Oud",
] as const;

const PROFILE_TAGS: { name: string; slug: string; type: ProfileTagType }[] = [
  { name: "Dia a dia", slug: "dia-a-dia", type: "OCCASION" },
  { name: "Trabalho", slug: "trabalho", type: "OCCASION" },
  { name: "Encontros", slug: "encontros", type: "OCCASION" },
  { name: "Festas", slug: "festas", type: "OCCASION" },
  { name: "Noite", slug: "noite", type: "OCCASION" },
  { name: "Presente", slug: "presente", type: "OCCASION" },
  { name: "Verão", slug: "verao", type: "SEASON" },
  { name: "Outono", slug: "outono", type: "SEASON" },
  { name: "Inverno", slug: "inverno", type: "SEASON" },
  { name: "Primavera", slug: "primavera", type: "SEASON" },
  { name: "Elegante", slug: "elegante", type: "PERSONALITY" },
  { name: "Sedutora", slug: "sedutora", type: "PERSONALITY" },
  { name: "Fresca", slug: "fresca", type: "PERSONALITY" },
  { name: "Marcante", slug: "marcante", type: "PERSONALITY" },
  { name: "Sofisticada", slug: "sofisticada", type: "PERSONALITY" },
  { name: "Discreta", slug: "discreta", type: "PERSONALITY" },
];

const BRANDS = [
  { name: "Armaf", slug: "armaf" },
  { name: "Rasasi", slug: "rasasi" },
  { name: "Bharara", slug: "bharara" },
  { name: "Afnan", slug: "afnan" },
  { name: "Ard Al Zaafaran", slug: "ard-al-zaafaran" },
  { name: "Selene Parfums", slug: "selene-parfums" },
  { name: "Maison Verde", slug: "maison-verde" },
] as const;

interface SeedVariant {
  volumeMl: number;
  sku: string;
  price: number;
  stockQty: number;
}

interface SeedProduct {
  name: string;
  slug: string;
  brandSlug: (typeof BRANDS)[number]["slug"];
  categorySlugs: (typeof CATEGORIES)[number]["slug"][];
  olfactoryFamily: (typeof OLFACTORY_FAMILIES)[number];
  intensity: Intensity;
  concentration: string;
  fixation: string;
  projection: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  variants: SeedVariant[];
  notes: { name: (typeof FRAGRANCE_NOTES)[number]; layer: FragranceLayer }[];
  tagSlugs: string[];
  isFeatured?: boolean;
}

const PRODUCTS: SeedProduct[] = [
  {
    name: "Club de Nuit Urban Elixir",
    slug: "club-de-nuit-urban-elixir",
    brandSlug: "armaf",
    categorySlugs: ["masculino", "arabe", "decant"],
    olfactoryFamily: "Amadeirado",
    intensity: "MARCANTE",
    concentration: "Eau de Parfum",
    fixation: "8 a 10 horas",
    projection: "Alta",
    shortDescription: "Fragrância marcante e sofisticada, ideal para a noite.",
    price: 249.9,
    compareAtPrice: 289.9,
    variants: [
      { volumeMl: 105, sku: "ARM-CDNUE-105", price: 249.9, stockQty: 18 },
      { volumeMl: 5, sku: "ARM-CDNUE-005", price: 39.9, stockQty: 30 },
    ],
    notes: [
      { name: "Bergamota", layer: "TOP" },
      { name: "Maçã Verde", layer: "TOP" },
      { name: "Canela", layer: "HEART" },
      { name: "Cardamomo", layer: "HEART" },
      { name: "Âmbar", layer: "BASE" },
      { name: "Patchouli", layer: "BASE" },
    ],
    tagSlugs: ["noite", "festas", "marcante", "sofisticada"],
    isFeatured: true,
  },
  {
    name: "Hawas Black",
    slug: "hawas-black",
    brandSlug: "rasasi",
    categorySlugs: ["masculino", "arabe"],
    olfactoryFamily: "Especiado",
    intensity: "INTENSA",
    concentration: "Eau de Parfum",
    fixation: "6 a 8 horas",
    projection: "Alta",
    shortDescription: "Especiado e intenso, com projeção elevada.",
    price: 189.9,
    variants: [{ volumeMl: 100, sku: "RAS-HAWB-100", price: 189.9, stockQty: 14 }],
    notes: [
      { name: "Cardamomo", layer: "TOP" },
      { name: "Canela", layer: "HEART" },
      { name: "Couro", layer: "HEART" },
      { name: "Âmbar", layer: "BASE" },
      { name: "Oud", layer: "BASE" },
    ],
    tagSlugs: ["noite", "marcante"],
    isFeatured: true,
  },
  {
    name: "Hawas Tropical",
    slug: "hawas-tropical",
    brandSlug: "rasasi",
    categorySlugs: ["masculino", "arabe"],
    olfactoryFamily: "Aquático",
    intensity: "MODERADA",
    concentration: "Eau de Toilette",
    fixation: "4 a 6 horas",
    projection: "Moderada",
    shortDescription: "Fresco e cítrico, perfeito para o dia a dia.",
    price: 179.9,
    variants: [{ volumeMl: 100, sku: "RAS-HAWT-100", price: 179.9, stockQty: 16 }],
    notes: [
      { name: "Limão Siciliano", layer: "TOP" },
      { name: "Bergamota", layer: "TOP" },
      { name: "Lavanda", layer: "HEART" },
      { name: "Almíscar", layer: "BASE" },
    ],
    tagSlugs: ["dia-a-dia", "trabalho", "fresca"],
  },
  {
    name: "Bharara Viking",
    slug: "bharara-viking",
    brandSlug: "bharara",
    categorySlugs: ["masculino", "decant"],
    olfactoryFamily: "Oriental",
    intensity: "MARCANTE",
    concentration: "Eau de Parfum",
    fixation: "8 a 10 horas",
    projection: "Alta",
    shortDescription: "Presença marcante para encontros e ocasiões especiais.",
    price: 229.9,
    variants: [
      { volumeMl: 100, sku: "BHA-VIK-100", price: 229.9, stockQty: 10 },
      { volumeMl: 8, sku: "BHA-VIK-008", price: 34.9, stockQty: 24 },
    ],
    notes: [
      { name: "Pera", layer: "TOP" },
      { name: "Canela", layer: "HEART" },
      { name: "Rosa", layer: "HEART" },
      { name: "Âmbar", layer: "BASE" },
      { name: "Couro", layer: "BASE" },
    ],
    tagSlugs: ["encontros", "noite", "sedutora", "sofisticada"],
    isFeatured: true,
  },
  {
    name: "9 PM",
    slug: "afnan-9pm",
    brandSlug: "afnan",
    categorySlugs: ["masculino"],
    olfactoryFamily: "Gourmand",
    intensity: "MARCANTE",
    concentration: "Eau de Parfum",
    fixation: "6 a 8 horas",
    projection: "Alta",
    shortDescription: "Doce e envolvente, com ótima fixação noturna.",
    price: 169.9,
    compareAtPrice: 199.9,
    variants: [{ volumeMl: 100, sku: "AFN-9PM-100", price: 169.9, stockQty: 20 }],
    notes: [
      { name: "Maçã Verde", layer: "TOP" },
      { name: "Baunilha", layer: "HEART" },
      { name: "Canela", layer: "HEART" },
      { name: "Âmbar", layer: "BASE" },
      { name: "Caramelo", layer: "BASE" },
    ],
    tagSlugs: ["noite", "festas", "sedutora"],
  },
  {
    name: "Axis Signature",
    slug: "axis-signature",
    brandSlug: "ard-al-zaafaran",
    categorySlugs: ["masculino", "arabe"],
    olfactoryFamily: "Amadeirado",
    intensity: "MODERADA",
    concentration: "Eau de Parfum",
    fixation: "5 a 7 horas",
    projection: "Moderada",
    shortDescription: "Amadeirado elegante para o trabalho e o dia a dia.",
    price: 149.9,
    variants: [{ volumeMl: 100, sku: "AAZ-AXSIG-100", price: 149.9, stockQty: 22 }],
    notes: [
      { name: "Bergamota", layer: "TOP" },
      { name: "Cardamomo", layer: "HEART" },
      { name: "Sândalo", layer: "BASE" },
      { name: "Patchouli", layer: "BASE" },
    ],
    tagSlugs: ["trabalho", "dia-a-dia", "elegante"],
  },
  {
    name: "Essência Floral Blush",
    slug: "essencia-floral-blush",
    brandSlug: "selene-parfums",
    categorySlugs: ["feminino"],
    olfactoryFamily: "Floral",
    intensity: "SUAVE",
    concentration: "Eau de Parfum",
    fixation: "4 a 6 horas",
    projection: "Moderada",
    shortDescription: "Floral suave e delicado para o dia a dia.",
    price: 159.9,
    variants: [{ volumeMl: 75, sku: "SEL-FLBL-075", price: 159.9, stockQty: 18 }],
    notes: [
      { name: "Pera", layer: "TOP" },
      { name: "Frutas Vermelhas", layer: "TOP" },
      { name: "Rosa", layer: "HEART" },
      { name: "Jasmim", layer: "HEART" },
      { name: "Almíscar", layer: "BASE" },
    ],
    tagSlugs: ["dia-a-dia", "encontros", "fresca", "discreta"],
    isFeatured: true,
  },
  {
    name: "Âmbar Noturno",
    slug: "ambar-noturno",
    brandSlug: "selene-parfums",
    categorySlugs: ["feminino"],
    olfactoryFamily: "Oriental",
    intensity: "MARCANTE",
    concentration: "Eau de Parfum",
    fixation: "6 a 8 horas",
    projection: "Alta",
    shortDescription: "Oriental marcante para a noite.",
    price: 199.9,
    variants: [{ volumeMl: 90, sku: "SEL-AMNO-090", price: 199.9, stockQty: 12 }],
    notes: [
      { name: "Frutas Vermelhas", layer: "TOP" },
      { name: "Jasmim", layer: "HEART" },
      { name: "Canela", layer: "HEART" },
      { name: "Âmbar", layer: "BASE" },
      { name: "Baunilha", layer: "BASE" },
    ],
    tagSlugs: ["noite", "festas", "sedutora", "marcante"],
  },
  {
    name: "Jardim Cítrico",
    slug: "jardim-citrico",
    brandSlug: "selene-parfums",
    categorySlugs: ["feminino", "unissex"],
    olfactoryFamily: "Cítrico",
    intensity: "SUAVE",
    concentration: "Eau de Toilette",
    fixation: "3 a 5 horas",
    projection: "Moderada",
    shortDescription: "Cítrico leve, ótimo para o trabalho.",
    price: 139.9,
    variants: [{ volumeMl: 75, sku: "SEL-JACI-075", price: 139.9, stockQty: 20 }],
    notes: [
      { name: "Bergamota", layer: "TOP" },
      { name: "Limão Siciliano", layer: "TOP" },
      { name: "Lavanda", layer: "HEART" },
      { name: "Almíscar", layer: "BASE" },
    ],
    tagSlugs: ["dia-a-dia", "trabalho", "fresca"],
  },
  {
    name: "Madeira & Sal",
    slug: "madeira-e-sal",
    brandSlug: "maison-verde",
    categorySlugs: ["unissex"],
    olfactoryFamily: "Aquático",
    intensity: "MODERADA",
    concentration: "Eau de Parfum",
    fixation: "5 a 7 horas",
    projection: "Moderada",
    shortDescription: "Aquático amadeirado, versátil para qualquer momento.",
    price: 189.9,
    variants: [{ volumeMl: 100, sku: "MVE-MASA-100", price: 189.9, stockQty: 15 }],
    notes: [
      { name: "Limão Siciliano", layer: "TOP" },
      { name: "Lavanda", layer: "HEART" },
      { name: "Sândalo", layer: "HEART" },
      { name: "Âmbar", layer: "BASE" },
      { name: "Almíscar", layer: "BASE" },
    ],
    tagSlugs: ["dia-a-dia", "encontros", "elegante", "fresca"],
    isFeatured: true,
  },
  {
    name: "Couro & Especiarias",
    slug: "couro-e-especiarias",
    brandSlug: "maison-verde",
    categorySlugs: ["unissex", "arabe"],
    olfactoryFamily: "Especiado",
    intensity: "INTENSA",
    concentration: "Eau de Parfum",
    fixation: "7 a 9 horas",
    projection: "Alta",
    shortDescription: "Especiado intenso com fundo amadeirado marcante.",
    price: 219.9,
    variants: [{ volumeMl: 100, sku: "MVE-COES-100", price: 219.9, stockQty: 11 }],
    notes: [
      { name: "Cardamomo", layer: "TOP" },
      { name: "Canela", layer: "HEART" },
      { name: "Couro", layer: "HEART" },
      { name: "Oud", layer: "BASE" },
      { name: "Patchouli", layer: "BASE" },
    ],
    tagSlugs: ["noite", "marcante", "sofisticada"],
  },
  {
    name: "Kit Presente Signature",
    slug: "kit-presente-signature",
    brandSlug: "armaf",
    categorySlugs: ["kit"],
    olfactoryFamily: "Amadeirado",
    intensity: "MARCANTE",
    concentration: "Eau de Parfum",
    fixation: "8 a 10 horas",
    projection: "Alta",
    shortDescription: "Club de Nuit Urban Elixir 50ml + decant 10ml, em embalagem de presente.",
    price: 279.9,
    compareAtPrice: 329.9,
    variants: [{ volumeMl: 60, sku: "ARM-KIT-CDNUE", price: 279.9, stockQty: 8 }],
    notes: [
      { name: "Bergamota", layer: "TOP" },
      { name: "Canela", layer: "HEART" },
      { name: "Âmbar", layer: "BASE" },
    ],
    tagSlugs: ["presente", "festas"],
  },
];

async function seedCatalog() {
  const brandBySlug = new Map<string, string>();
  for (const brand of BRANDS) {
    const record = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name },
      create: brand,
    });
    brandBySlug.set(brand.slug, record.id);
  }

  const categoryBySlug = new Map<string, string>();
  for (const category of CATEGORIES) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
    categoryBySlug.set(category.slug, record.id);
  }

  const familyBySlug = new Map<string, string>();
  for (const name of OLFACTORY_FAMILIES) {
    const slug = name.toLowerCase();
    const record = await prisma.olfactoryFamily.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    familyBySlug.set(name, record.id);
  }

  const noteByName = new Map<string, string>();
  for (const name of FRAGRANCE_NOTES) {
    const record = await prisma.fragranceNote.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    noteByName.set(name, record.id);
  }

  const tagBySlug = new Map<string, string>();
  for (const tag of PROFILE_TAGS) {
    const record = await prisma.fragranceProfileTag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name, type: tag.type },
      create: tag,
    });
    tagBySlug.set(tag.slug, record.id);
  }

  for (const product of PRODUCTS) {
    const brandId = brandBySlug.get(product.brandSlug)!;
    const olfactoryFamilyId = familyBySlug.get(product.olfactoryFamily)!;

    const record = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        brandId,
        olfactoryFamilyId,
        intensity: product.intensity,
        concentration: product.concentration,
        fixation: product.fixation,
        projection: product.projection,
        shortDescription: product.shortDescription,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? null,
        costPrice: product.price * 0.45,
        isFeatured: product.isFeatured ?? false,
        isActive: true,
      },
      create: {
        name: product.name,
        slug: product.slug,
        brandId,
        olfactoryFamilyId,
        intensity: product.intensity,
        concentration: product.concentration,
        fixation: product.fixation,
        projection: product.projection,
        shortDescription: product.shortDescription,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? null,
        costPrice: product.price * 0.45,
        isFeatured: product.isFeatured ?? false,
        isActive: true,
      },
    });

    await prisma.productCategory.deleteMany({ where: { productId: record.id } });
    await prisma.productCategory.createMany({
      data: product.categorySlugs.map((slug) => ({
        productId: record.id,
        categoryId: categoryBySlug.get(slug)!,
      })),
    });

    await prisma.productVariant.deleteMany({ where: { productId: record.id } });
    await prisma.productVariant.createMany({
      data: product.variants.map((variant) => ({
        productId: record.id,
        volumeMl: variant.volumeMl,
        sku: variant.sku,
        price: variant.price,
        stockQty: variant.stockQty,
        minStockQty: 3,
      })),
    });

    await prisma.productImage.deleteMany({ where: { productId: record.id } });
    await prisma.productImage.create({
      data: {
        productId: record.id,
        url: PLACEHOLDER_IMAGE,
        altText: `${product.name} — foto ilustrativa da vitrine FA Perfumaria`,
        position: 0,
        isMain: true,
      },
    });

    await prisma.productFragranceNote.deleteMany({ where: { productId: record.id } });
    await prisma.productFragranceNote.createMany({
      data: product.notes.map((note) => ({
        productId: record.id,
        fragranceNoteId: noteByName.get(note.name)!,
        layer: note.layer,
      })),
    });

    await prisma.productProfileTag.deleteMany({ where: { productId: record.id } });
    await prisma.productProfileTag.createMany({
      data: product.tagSlugs.map((slug) => ({
        productId: record.id,
        tagId: tagBySlug.get(slug)!,
      })),
    });
  }

  console.log(`[seed] Catálogo pronto: ${BRANDS.length} marcas, ${PRODUCTS.length} produtos.`);
}

async function main() {
  await seedAdmin();
  await seedCatalog();
}

main()
  .catch((error) => {
    console.error("[seed] Falhou:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
