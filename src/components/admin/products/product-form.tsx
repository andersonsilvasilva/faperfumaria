"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/admin/upload/image-upload-field";
import { RichTextEditor } from "@/components/admin/products/rich-text-editor";
import { INTENSITY_LABELS, INTENSITY_ORDER } from "@/lib/labels";
import type { ProductActionState } from "@/modules/admin/products-actions";
import type { AdminProductDetail } from "@/modules/admin/products-queries";
import type { Intensity } from "@/generated/prisma/client";

interface VariantRow {
  id?: string;
  volumeMl: string;
  variantLabel: string;
  sku: string;
  price: string;
  minStockQty: string;
  barcode: string;
  weightGrams: string;
  isActive: boolean;
}

interface ImageRow {
  url: string;
  altText: string;
  isMain: boolean;
}

interface ProductFormOptions {
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  olfactoryFamilies: { id: string; name: string }[];
  profileTagsByType: {
    OCCASION: { id: string; name: string }[];
    SEASON: { id: string; name: string }[];
    PERSONALITY: { id: string; name: string }[];
  };
}

const initialState: ProductActionState = { status: "idle" };
const inputClass =
  "mt-1 h-10 w-full rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none";
const labelClass = "text-xs font-medium text-fa-black/70";

function notesToCsv(product: AdminProductDetail | undefined, layer: "TOP" | "HEART" | "BASE"): string {
  if (!product) return "";
  return product.fragranceNotes
    .filter((n) => n.layer === layer)
    .map((n) => n.note.name)
    .join(", ");
}

export function ProductForm({
  action,
  product,
  options,
}: {
  action: (prevState: ProductActionState, formData: FormData) => Promise<ProductActionState>;
  product?: AdminProductDetail;
  options: ProductFormOptions;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  const [variants, setVariants] = useState<VariantRow[]>(
    product && product.variants.length > 0
      ? product.variants.map((v) => ({
          id: v.id,
          volumeMl: v.volumeMl != null ? String(v.volumeMl) : "",
          variantLabel: v.variantLabel ?? "",
          sku: v.sku,
          price: v.price.toString(),
          minStockQty: String(v.minStockQty),
          barcode: v.barcode ?? "",
          weightGrams: v.weightGrams ? String(v.weightGrams) : "",
          isActive: v.isActive,
        }))
      : [
          {
            volumeMl: "",
            variantLabel: "",
            sku: "",
            price: "",
            minStockQty: "3",
            barcode: "",
            weightGrams: "",
            isActive: true,
          },
        ],
  );

  const [images, setImages] = useState<ImageRow[]>(
    product?.images.map((img) => ({ url: img.url, altText: img.altText ?? "", isMain: img.isMain })) ?? [],
  );

  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");

  const selectedCategoryIds = new Set(product?.categories.map((c) => c.categoryId) ?? []);
  const selectedTagIds = new Set(product?.profileTags.map((t) => t.tagId) ?? []);

  function updateVariant(index: number, patch: Partial<VariantRow>) {
    setVariants((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function updateImage(index: number, patch: Partial<ImageRow>) {
    setImages((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <form action={formAction} className="space-y-10">
      <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />
      <input type="hidden" name="imagesJson" value={JSON.stringify(images)} />

      <nav className="flex flex-wrap gap-4 border-b border-fa-stone/15 pb-3 text-sm">
        {["informacoes", "preco", "fragrancia", "variantes", "imagens", "seo"].map((section) => (
          <a key={section} href={`#${section}`} className="capitalize text-fa-black/60 hover:text-fa-gold">
            {section}
          </a>
        ))}
      </nav>

      <section id="informacoes" className="space-y-4">
        <h2 className="font-display text-lg text-fa-black">Informações</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="name">
              Nome
            </label>
            <input id="name" name="name" required defaultValue={product?.name} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="brandId">
              Marca
            </label>
            <select id="brandId" name="brandId" required defaultValue={product?.brandId} className={inputClass}>
              <option value="">Selecione...</option>
              {options.brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="shortDescription">
            Descrição curta
          </label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            rows={2}
            maxLength={500}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className={inputClass.replace("h-10", "py-2")}
          />
          <p className="mt-1 text-right text-xs text-fa-black/40">{shortDescription.length}/500</p>
        </div>
        <div>
          <label className={labelClass}>Descrição longa</label>
          <RichTextEditor name="longDescription" defaultValue={product?.longDescription ?? ""} />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-fa-black/70">
            <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} />
            Ativo
          </label>
          <label className="flex items-center gap-2 text-sm text-fa-black/70">
            <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured ?? false} />
            Destaque
          </label>
        </div>

        <div>
          <p className={labelClass}>Categorias</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {options.categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm text-fa-black/70">
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={category.id}
                  defaultChecked={selectedCategoryIds.has(category.id)}
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section id="preco" className="space-y-4">
        <h2 className="font-display text-lg text-fa-black">Preço</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className={labelClass} htmlFor="costPrice">
              Custo
            </label>
            <input
              id="costPrice"
              name="costPrice"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={product?.costPrice.toString()}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="price">
              Preço &quot;Por&quot; (o que o cliente paga)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={product?.price.toString()}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="compareAtPrice">
              Preço &quot;De&quot; (opcional, riscado)
            </label>
            <input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.compareAtPrice?.toString() ?? ""}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-fa-black/40">
              Precisa ser maior que o preço &quot;Por&quot; — é o valor riscado que mostra o
              desconto.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className={labelClass} htmlFor="promotionStart">
              Início da promoção
            </label>
            <input
              id="promotionStart"
              name="promotionStart"
              type="date"
              defaultValue={product?.promotionStart?.toISOString().slice(0, 10) ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="promotionEnd">
              Fim da promoção
            </label>
            <input
              id="promotionEnd"
              name="promotionEnd"
              type="date"
              defaultValue={product?.promotionEnd?.toISOString().slice(0, 10) ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="maxInstallments">
              Parcelamento (opcional)
            </label>
            <input
              id="maxInstallments"
              name="maxInstallments"
              type="number"
              step="1"
              min="1"
              max="24"
              placeholder="Padrão: 3x"
              defaultValue={product?.maxInstallments ?? ""}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-fa-black/40">
              Em quantas vezes sem juros mostrar na loja. Deixe em branco para usar o padrão (3x).
            </p>
          </div>
        </div>
      </section>

      <section id="fragrancia" className="space-y-4">
        <h2 className="font-display text-lg text-fa-black">Fragrância</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="olfactoryFamilyId">
              Família olfativa
            </label>
            <select
              id="olfactoryFamilyId"
              name="olfactoryFamilyId"
              defaultValue={product?.olfactoryFamilyId ?? ""}
              className={inputClass}
            >
              <option value="">Nenhuma</option>
              {options.olfactoryFamilies.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="intensity">
              Intensidade
            </label>
            <select id="intensity" name="intensity" defaultValue={product?.intensity ?? ""} className={inputClass}>
              <option value="">Nenhuma</option>
              {INTENSITY_ORDER.map((intensity: Intensity) => (
                <option key={intensity} value={intensity}>
                  {INTENSITY_LABELS[intensity]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="fixation">
              Fixação
            </label>
            <input id="fixation" name="fixation" defaultValue={product?.fixation ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="projection">
              Projeção
            </label>
            <input
              id="projection"
              name="projection"
              defaultValue={product?.projection ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="concentration">
              Concentração
            </label>
            <input
              id="concentration"
              name="concentration"
              defaultValue={product?.concentration ?? ""}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className={labelClass} htmlFor="topNotes">
              Notas de saída (separadas por vírgula)
            </label>
            <input
              id="topNotes"
              name="topNotes"
              defaultValue={notesToCsv(product, "TOP")}
              placeholder="Bergamota, Limão"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="heartNotes">
              Notas de coração
            </label>
            <input
              id="heartNotes"
              name="heartNotes"
              defaultValue={notesToCsv(product, "HEART")}
              placeholder="Rosa, Jasmim"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="baseNotes">
              Notas de fundo
            </label>
            <input
              id="baseNotes"
              name="baseNotes"
              defaultValue={notesToCsv(product, "BASE")}
              placeholder="Âmbar, Madeira"
              className={inputClass}
            />
          </div>
        </div>

        {(["OCCASION", "SEASON", "PERSONALITY"] as const).map((type) => (
          <div key={type}>
            <p className={labelClass}>
              {type === "OCCASION" ? "Ocasião" : type === "SEASON" ? "Estação" : "Personalidade"}
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {options.profileTagsByType[type].map((tag) => (
                <label key={tag.id} className="flex items-center gap-2 text-sm text-fa-black/70">
                  <input
                    type="checkbox"
                    name="profileTagIds"
                    value={tag.id}
                    defaultChecked={selectedTagIds.has(tag.id)}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section id="variantes" className="space-y-4">
        <h2 className="font-display text-lg text-fa-black">Variantes</h2>
        <p className="text-xs text-fa-black/50">
          Estoque inicial começa em 0 — ajuste a quantidade na tela de Estoque após salvar, para
          manter o histórico de movimentações correto. Informe o volume (ml) para perfumes, ou um
          rótulo (tamanho, cor...) para produtos sem volume, como acessórios.
        </p>
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div key={index} className="grid grid-cols-2 gap-2 rounded-sm border border-fa-stone/20 p-3 sm:grid-cols-7">
              <input
                placeholder="Volume (ml)"
                type="number"
                value={variant.volumeMl}
                onChange={(e) => updateVariant(index, { volumeMl: e.target.value })}
                className={inputClass}
              />
              <input
                placeholder="Ou rótulo (tamanho, cor...)"
                value={variant.variantLabel}
                onChange={(e) => updateVariant(index, { variantLabel: e.target.value })}
                className={inputClass}
              />
              <input
                placeholder="SKU"
                value={variant.sku}
                onChange={(e) => updateVariant(index, { sku: e.target.value })}
                className={inputClass}
              />
              <input
                placeholder="Preço"
                type="number"
                step="0.01"
                value={variant.price}
                onChange={(e) => updateVariant(index, { price: e.target.value })}
                className={inputClass}
              />
              <input
                placeholder="Estoque mín."
                type="number"
                value={variant.minStockQty}
                onChange={(e) => updateVariant(index, { minStockQty: e.target.value })}
                className={inputClass}
              />
              <input
                placeholder="Código de barras"
                value={variant.barcode}
                onChange={(e) => updateVariant(index, { barcode: e.target.value })}
                className={inputClass}
              />
              <label className="flex items-center gap-2 text-sm text-fa-black/70">
                <input
                  type="checkbox"
                  checked={variant.isActive}
                  onChange={(e) => updateVariant(index, { isActive: e.target.checked })}
                />
                Ativa
              </label>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setVariants((rows) => [
              ...rows,
              {
                volumeMl: "",
                variantLabel: "",
                sku: "",
                price: "",
                minStockQty: "3",
                barcode: "",
                weightGrams: "",
                isActive: true,
              },
            ])
          }
          className="text-sm text-fa-gold hover:underline"
        >
          + Adicionar variante
        </button>
      </section>

      <section id="imagens" className="space-y-4">
        <h2 className="font-display text-lg text-fa-black">Imagens</h2>
        <div className="space-y-3">
          {images.map((image, index) => (
            <div key={index} className="grid grid-cols-1 gap-2 rounded-sm border border-fa-stone/20 p-3 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <ImageUploadField
                  value={image.url}
                  onChange={(url) => updateImage(index, { url })}
                  folder="produtos"
                />
              </div>
              <input
                placeholder="Texto alternativo"
                value={image.altText}
                onChange={(e) => updateImage(index, { altText: e.target.value })}
                className={inputClass}
              />
              <div className="flex items-start gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm text-fa-black/70">
                  <input
                    type="radio"
                    name="mainImage"
                    checked={image.isMain}
                    onChange={() => setImages((rows) => rows.map((row, i) => ({ ...row, isMain: i === index })))}
                  />
                  Principal
                </label>
                <button
                  type="button"
                  onClick={() => setImages((rows) => rows.filter((_, i) => i !== index))}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setImages((rows) => [...rows, { url: "", altText: "", isMain: rows.length === 0 }])}
          className="text-sm text-fa-gold hover:underline"
        >
          + Adicionar imagem
        </button>
      </section>

      <section id="seo" className="space-y-4">
        <h2 className="font-display text-lg text-fa-black">SEO</h2>
        <div>
          <label className={labelClass} htmlFor="seoTitle">
            Title
          </label>
          <input id="seoTitle" name="seoTitle" defaultValue={product?.seoTitle ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="seoDescription">
            Meta description
          </label>
          <textarea
            id="seoDescription"
            name="seoDescription"
            rows={2}
            defaultValue={product?.seoDescription ?? ""}
            className={inputClass.replace("h-10", "py-2")}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="canonicalUrl">
            Canonical (opcional)
          </label>
          <input
            id="canonicalUrl"
            name="canonicalUrl"
            defaultValue={product?.canonicalUrl ?? ""}
            className={inputClass}
          />
        </div>
      </section>

      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : "Salvar produto"}
      </Button>
    </form>
  );
}
