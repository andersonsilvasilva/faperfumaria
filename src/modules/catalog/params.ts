import type { Intensity } from "@/generated/prisma/client";
import type { ProductListParams, ProductSort } from "@/modules/catalog/queries";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const VALID_SORTS: ProductSort[] = [
  "relevancia",
  "mais-vendidos",
  "novidades",
  "menor-preco",
  "maior-preco",
  "melhor-avaliados",
];

const VALID_INTENSITIES: Intensity[] = ["SUAVE", "MODERADA", "MARCANTE", "INTENSA"];

export const PRICE_RANGES = [
  { label: "Até R$150", value: "0-150", min: 0, max: 150 },
  { label: "R$150–300", value: "150-300", min: 150, max: 300 },
  { label: "R$300–500", value: "300-500", min: 300, max: 500 },
  { label: "Acima de R$500", value: "500+", min: 500, max: undefined },
] as const;

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseCatalogParams(
  searchParams: RawSearchParams,
  overrides: Partial<ProductListParams> = {},
): ProductListParams {
  const sortParam = toArray(searchParams.sort)[0];
  const sort = VALID_SORTS.includes(sortParam as ProductSort) ? (sortParam as ProductSort) : "relevancia";

  const priceRangeValue = toArray(searchParams.preco)[0];
  const priceRange = PRICE_RANGES.find((range) => range.value === priceRangeValue);

  const intensities = toArray(searchParams.intensidade).filter((value): value is Intensity =>
    VALID_INTENSITIES.includes(value as Intensity),
  );

  const page = Number(toArray(searchParams.pagina)[0] ?? "1");

  return {
    sort,
    brandSlugs: toArray(searchParams.marca),
    olfactoryFamilySlugs: toArray(searchParams.familia),
    tagSlugs: toArray(searchParams.ocasiao),
    intensities: intensities.length ? intensities : undefined,
    priceMin: priceRange?.min,
    priceMax: priceRange?.max,
    search: toArray(searchParams.q)[0],
    page: Number.isFinite(page) && page > 0 ? page : 1,
    ...overrides,
  };
}

export function buildCatalogQueryString(
  searchParams: RawSearchParams,
  patch: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "pagina") continue;
    for (const v of toArray(value)) params.append(key, v);
  }

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    params.set(key, value);
  }

  return params.toString();
}
