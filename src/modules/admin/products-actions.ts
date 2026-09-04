"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/slug";
import { INTENSITY_ORDER } from "@/lib/labels";
import { sanitizeRichText } from "@/lib/sanitize-html";

export interface ProductActionState {
  status: "idle" | "error" | "success";
  message?: string;
}

const optionalNumber = z
  .string()
  .optional()
  .transform((v) => (v ? Number(v) : undefined))
  .refine((v) => v === undefined || Number.isFinite(v), "Valor numérico inválido.");

function optionalPositiveIntWithMessage(message: string) {
  return z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine((v) => v === undefined || (Number.isInteger(v) && v > 0), message);
}

const optionalPositiveInt = optionalPositiveIntWithMessage("Peso inválido.");

const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v ? new Date(v) : undefined));

const variantSchema = z
  .object({
    id: z.string().optional(),
    volumeMl: optionalPositiveIntWithMessage("Volume inválido."),
    variantLabel: z.string().trim().optional().default(""),
    sku: z.string().trim().min(1, "SKU obrigatório."),
    price: z.coerce.number().positive("Preço da variante inválido."),
    minStockQty: z.coerce.number().int().min(0).default(3),
    barcode: z.string().trim().optional().default(""),
    weightGrams: optionalPositiveInt,
    isActive: z.boolean().default(true),
  })
  .refine((v) => v.volumeMl !== undefined || v.variantLabel, {
    message: "Informe o volume (ml) ou um rótulo para a variante (ex.: tamanho, cor).",
    path: ["volumeMl"],
  });

const imageSchema = z.object({
  url: z.string().trim().min(1, "URL da imagem obrigatória."),
  altText: z.string().trim().optional().default(""),
  isMain: z.boolean().default(false),
});

const productSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do produto."),
  brandId: z.string().min(1, "Selecione a marca."),
  shortDescription: z
    .string()
    .trim()
    .max(500, "Descrição curta deve ter no máximo 500 caracteres.")
    .optional()
    .default(""),
  longDescription: z.string().trim().optional().default(""),
  isActive: z.literal("on").optional(),
  isFeatured: z.literal("on").optional(),

  costPrice: z.coerce.number().min(0, "Informe o custo."),
  price: z.coerce.number().positive("Informe o preço de venda."),
  compareAtPrice: optionalNumber,
  promotionStart: optionalDate,
  promotionEnd: optionalDate,

  olfactoryFamilyId: z.string().optional().default(""),
  intensity: z.enum(INTENSITY_ORDER as [string, ...string[]]).optional().or(z.literal("")),
  fixation: z.string().trim().optional().default(""),
  projection: z.string().trim().optional().default(""),
  concentration: z.string().trim().optional().default(""),

  topNotes: z.string().trim().optional().default(""),
  heartNotes: z.string().trim().optional().default(""),
  baseNotes: z.string().trim().optional().default(""),

  categoryIds: z.array(z.string()).default([]),
  profileTagIds: z.array(z.string()).default([]),

  variantsJson: z.string(),
  imagesJson: z.string(),

  seoTitle: z.string().trim().optional().default(""),
  seoDescription: z.string().trim().optional().default(""),
  canonicalUrl: z.string().trim().optional().default(""),
});

/**
 * `compareAtPrice` só faz sentido como referência riscada MAIOR que `price` (o valor
 * efetivamente cobrado do cliente) — ver seção "Preço" do formulário. Bloquear aqui evita
 * salvar uma "oferta" invertida (preço riscado menor que o preço de venda).
 */
function validateComparePrice(data: { price: number; compareAtPrice?: number }): string | null {
  if (data.compareAtPrice != null && data.compareAtPrice <= data.price) {
    return `Preço "De" (R$ ${data.compareAtPrice.toFixed(2)}) precisa ser maior que o preço "Por" (R$ ${data.price.toFixed(2)}), senão não é uma oferta.`;
  }
  return null;
}

function parseProductFormData(formData: FormData) {
  const raw = {
    ...Object.fromEntries(formData.entries()),
    categoryIds: formData.getAll("categoryIds"),
    profileTagIds: formData.getAll("profileTagIds"),
  };
  return productSchema.safeParse(raw);
}

function splitNoteNames(value: string): string[] {
  return Array.from(new Set(value.split(",").map((n) => n.trim()).filter(Boolean)));
}

async function syncFragranceNotes(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  productId: string,
  layer: "TOP" | "HEART" | "BASE",
  namesCsv: string,
) {
  await tx.productFragranceNote.deleteMany({ where: { productId, layer } });
  const names = splitNoteNames(namesCsv);
  for (const name of names) {
    const note = await tx.fragranceNote.upsert({ where: { name }, update: {}, create: { name } });
    await tx.productFragranceNote.create({ data: { productId, fragranceNoteId: note.id, layer } });
  }
}

export async function createProductAction(
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const parsed = parseProductFormData(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const comparePriceError = validateComparePrice(data);
  if (comparePriceError) {
    return { status: "error", message: comparePriceError };
  }

  const variantsResult = z.array(variantSchema).min(1, "Adicione ao menos uma variante.").safeParse(
    JSON.parse(data.variantsJson),
  );
  if (!variantsResult.success) {
    return { status: "error", message: variantsResult.error.issues[0]?.message ?? "Variantes inválidas." };
  }
  const imagesResult = z.array(imageSchema).safeParse(JSON.parse(data.imagesJson));
  if (!imagesResult.success) {
    return { status: "error", message: "Imagens inválidas." };
  }

  let productId: string;
  try {
    productId = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug: slugify(data.name),
          brandId: data.brandId,
          shortDescription: data.shortDescription || null,
          longDescription: data.longDescription ? sanitizeRichText(data.longDescription) : null,
          isActive: data.isActive === "on",
          isFeatured: data.isFeatured === "on",
          costPrice: data.costPrice,
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          promotionStart: data.promotionStart ?? null,
          promotionEnd: data.promotionEnd ?? null,
          olfactoryFamilyId: data.olfactoryFamilyId || null,
          intensity: (data.intensity as (typeof INTENSITY_ORDER)[number]) || null,
          fixation: data.fixation || null,
          projection: data.projection || null,
          concentration: data.concentration || null,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          canonicalUrl: data.canonicalUrl || null,
          categories: { create: data.categoryIds.map((categoryId) => ({ categoryId })) },
          profileTags: { create: data.profileTagIds.map((tagId) => ({ tagId })) },
          variants: {
            create: variantsResult.data.map((v) => ({
              volumeMl: v.volumeMl ?? null,
              variantLabel: v.variantLabel || null,
              sku: v.sku,
              price: v.price,
              minStockQty: v.minStockQty,
              barcode: v.barcode || null,
              weightGrams: v.weightGrams ?? null,
              isActive: v.isActive,
              stockQty: 0,
            })),
          },
          images: {
            create: imagesResult.data.map((img, index) => ({
              url: img.url,
              altText: img.altText || null,
              position: index,
              isMain: img.isMain,
            })),
          },
        },
      });

      await syncFragranceNotes(tx, product.id, "TOP", data.topNotes);
      await syncFragranceNotes(tx, product.id, "HEART", data.heartNotes);
      await syncFragranceNotes(tx, product.id, "BASE", data.baseNotes);

      await tx.adminAuditLog.create({
        data: { adminId: admin.userId, action: "PRODUCT_CREATE", entityType: "Product", entityId: product.id },
      });

      return product.id;
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { status: "error", message: "Já existe um produto ou SKU com esse valor." };
    }
    throw error;
  }

  revalidatePath("/admin/produtos");
  redirect(`/admin/produtos/${productId}`);
}

export async function updateProductAction(
  productId: string,
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const parsed = parseProductFormData(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const comparePriceError = validateComparePrice(data);
  if (comparePriceError) {
    return { status: "error", message: comparePriceError };
  }

  const variantsResult = z.array(variantSchema).min(1, "Adicione ao menos uma variante.").safeParse(
    JSON.parse(data.variantsJson),
  );
  if (!variantsResult.success) {
    return { status: "error", message: variantsResult.error.issues[0]?.message ?? "Variantes inválidas." };
  }
  const imagesResult = z.array(imageSchema).safeParse(JSON.parse(data.imagesJson));
  if (!imagesResult.success) {
    return { status: "error", message: "Imagens inválidas." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          slug: slugify(data.name),
          brandId: data.brandId,
          shortDescription: data.shortDescription || null,
          longDescription: data.longDescription ? sanitizeRichText(data.longDescription) : null,
          isActive: data.isActive === "on",
          isFeatured: data.isFeatured === "on",
          costPrice: data.costPrice,
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          promotionStart: data.promotionStart ?? null,
          promotionEnd: data.promotionEnd ?? null,
          olfactoryFamilyId: data.olfactoryFamilyId || null,
          intensity: (data.intensity as (typeof INTENSITY_ORDER)[number]) || null,
          fixation: data.fixation || null,
          projection: data.projection || null,
          concentration: data.concentration || null,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          canonicalUrl: data.canonicalUrl || null,
        },
      });

      await tx.productCategory.deleteMany({ where: { productId } });
      await tx.productCategory.createMany({
        data: data.categoryIds.map((categoryId) => ({ productId, categoryId })),
      });

      await tx.productProfileTag.deleteMany({ where: { productId } });
      await tx.productProfileTag.createMany({
        data: data.profileTagIds.map((tagId) => ({ productId, tagId })),
      });

      await syncFragranceNotes(tx, productId, "TOP", data.topNotes);
      await syncFragranceNotes(tx, productId, "HEART", data.heartNotes);
      await syncFragranceNotes(tx, productId, "BASE", data.baseNotes);

      // Variantes: nunca apaga uma variante existente (pode ter OrderItem/InventoryMovement
      // referenciando o id) — só atualiza campos ou cria novas. Estoque (stockQty) não é
      // editável por aqui, só pela tela de Estoque, para manter uma única trilha de auditoria.
      for (const variant of variantsResult.data) {
        if (variant.id) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              volumeMl: variant.volumeMl ?? null,
              variantLabel: variant.variantLabel || null,
              sku: variant.sku,
              price: variant.price,
              minStockQty: variant.minStockQty,
              barcode: variant.barcode || null,
              weightGrams: variant.weightGrams ?? null,
              isActive: variant.isActive,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId,
              volumeMl: variant.volumeMl ?? null,
              variantLabel: variant.variantLabel || null,
              sku: variant.sku,
              price: variant.price,
              minStockQty: variant.minStockQty,
              barcode: variant.barcode || null,
              weightGrams: variant.weightGrams ?? null,
              isActive: variant.isActive,
              stockQty: 0,
            },
          });
        }
      }

      // Imagens não têm histórico dependente — substituição completa é segura e mais simples.
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.productImage.createMany({
        data: imagesResult.data.map((img, index) => ({
          productId,
          url: img.url,
          altText: img.altText || null,
          position: index,
          isMain: img.isMain,
        })),
      });

      await tx.adminAuditLog.create({
        data: { adminId: admin.userId, action: "PRODUCT_UPDATE", entityType: "Product", entityId: productId },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { status: "error", message: "Já existe um produto ou SKU com esse valor." };
    }
    throw error;
  }

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${productId}`);
  redirect(`/admin/produtos/${productId}`);
}

export async function toggleProductActiveAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin.ok) return;

  const productId = formData.get("productId")?.toString();
  if (!productId) return;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  await prisma.product.update({ where: { id: productId }, data: { isActive: !product.isActive } });
  revalidatePath("/admin/produtos");
}

/**
 * Exclui um produto de verdade (não só desativa) — só quando nenhuma variante já foi vendida
 * (OrderItem.variant não tem cascade, exatamente para proteger histórico de pedidos). Se houver
 * pedidos associados, recusa com uma mensagem clara em vez de deixar o erro de FK estourar.
 * Todo o resto (variantes, imagens, categorias, notas, tags, favoritos, avaliações) casca
 * automaticamente pelo schema.
 */
export async function deleteProductAction(
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const admin = await requireAdmin();
  if (!admin.ok) return { status: "error", message: admin.message };

  const productId = formData.get("productId")?.toString();
  if (!productId) return { status: "error", message: "Produto inválido." };

  const orderCount = await prisma.orderItem.count({ where: { variant: { productId } } });
  if (orderCount > 0) {
    return {
      status: "error",
      message: `Não é possível excluir: este produto já tem ${orderCount} item(ns) de pedido associado(s). Desative em vez de excluir.`,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.delete({ where: { id: productId } });
    await tx.adminAuditLog.create({
      data: { adminId: admin.userId, action: "PRODUCT_DELETE", entityType: "Product", entityId: productId },
    });
  });

  revalidatePath("/admin/produtos");
  return { status: "success", message: "Produto excluído." };
}
