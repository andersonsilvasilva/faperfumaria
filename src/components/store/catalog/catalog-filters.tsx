import Link from "next/link";
import {
  getBrandsWithActiveProducts,
  getCatalogCategories,
  getOccasionTags,
  getOlfactoryFamilies,
} from "@/modules/catalog/queries";
import { PRICE_RANGES, type RawSearchParams } from "@/modules/catalog/params";

const INTENSITY_OPTIONS = [
  { value: "SUAVE", label: "Suave" },
  { value: "MODERADA", label: "Moderada" },
  { value: "MARCANTE", label: "Marcante" },
  { value: "INTENSA", label: "Intensa" },
];

const SORT_OPTIONS = [
  { value: "relevancia", label: "Relevância" },
  { value: "mais-vendidos", label: "Mais vendidos" },
  { value: "novidades", label: "Novidades" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "melhor-avaliados", label: "Melhor avaliados" },
];

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function CatalogFilters({ searchParams }: { searchParams: RawSearchParams }) {
  const [categories, brands, families, occasionTags] = await Promise.all([
    getCatalogCategories(),
    getBrandsWithActiveProducts(),
    getOlfactoryFamilies(),
    getOccasionTags(),
  ]);

  const selectedCategories = toArray(searchParams.categoria);
  const selectedBrands = toArray(searchParams.marca);
  const selectedFamilies = toArray(searchParams.familia);
  const selectedOccasions = toArray(searchParams.ocasiao);
  const selectedIntensities = toArray(searchParams.intensidade);
  const selectedPrice = toArray(searchParams.preco)[0];
  const currentSort = toArray(searchParams.sort)[0] ?? "relevancia";
  const currentSearch = toArray(searchParams.q)[0];

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedFamilies.length > 0 ||
    selectedOccasions.length > 0 ||
    selectedIntensities.length > 0 ||
    Boolean(selectedPrice) ||
    Boolean(currentSearch);

  return (
    <form method="GET" className="space-y-8">
      {currentSearch && <input type="hidden" name="q" value={currentSearch} />}

      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-fa-black/60">Filtros</p>
          <Link href="?" className="text-xs font-medium text-fa-gold underline hover:text-fa-black">
            Limpar filtros
          </Link>
        </div>
      )}

      <div>
        <label htmlFor="sort" className="block text-xs font-semibold uppercase tracking-wide text-fa-black/60">
          Ordenar por
        </label>
        <select
          id="sort"
          name="sort"
          defaultValue={currentSort}
          className="mt-2 w-full border border-fa-stone/40 bg-fa-white px-3 py-2 text-sm"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wide text-fa-black/60">Preço</legend>
        <div className="mt-3 space-y-2">
          {PRICE_RANGES.map((range) => (
            <label key={range.value} className="flex items-center gap-2 text-sm text-fa-black/80">
              <input
                type="radio"
                name="preco"
                value={range.value}
                defaultChecked={selectedPrice === range.value}
              />
              {range.label}
            </label>
          ))}
          {selectedPrice && (
            <label className="flex items-center gap-2 text-xs text-fa-black/50">
              <input type="radio" name="preco" value="" defaultChecked={false} /> Limpar preço
            </label>
          )}
        </div>
      </fieldset>

      {categories.length > 0 && (
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wide text-fa-black/60">Categoria</legend>
          <div className="mt-3 space-y-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm text-fa-black/80">
                <input
                  type="checkbox"
                  name="categoria"
                  value={category.slug}
                  defaultChecked={selectedCategories.includes(category.slug)}
                />
                {category.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {brands.length > 0 && (
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wide text-fa-black/60">Marca</legend>
          <div className="mt-3 space-y-2">
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 text-sm text-fa-black/80">
                <input
                  type="checkbox"
                  name="marca"
                  value={brand.slug}
                  defaultChecked={selectedBrands.includes(brand.slug)}
                />
                {brand.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wide text-fa-black/60">
          Família olfativa
        </legend>
        <div className="mt-3 space-y-2">
          {families.map((family) => (
            <label key={family.id} className="flex items-center gap-2 text-sm text-fa-black/80">
              <input
                type="checkbox"
                name="familia"
                value={family.slug}
                defaultChecked={selectedFamilies.includes(family.slug)}
              />
              {family.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wide text-fa-black/60">Ocasião</legend>
        <div className="mt-3 space-y-2">
          {occasionTags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2 text-sm text-fa-black/80">
              <input
                type="checkbox"
                name="ocasiao"
                value={tag.slug}
                defaultChecked={selectedOccasions.includes(tag.slug)}
              />
              {tag.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wide text-fa-black/60">Intensidade</legend>
        <div className="mt-3 space-y-2">
          {INTENSITY_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm text-fa-black/80">
              <input
                type="checkbox"
                name="intensidade"
                value={option.value}
                defaultChecked={selectedIntensities.includes(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        className="w-full bg-fa-black py-2.5 text-xs font-medium uppercase tracking-wide text-fa-white hover:bg-fa-gold hover:text-fa-black"
      >
        Aplicar filtros
      </button>
    </form>
  );
}
