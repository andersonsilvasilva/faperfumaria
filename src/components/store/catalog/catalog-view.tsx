import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/store/product-card";
import { CatalogFilters } from "@/components/store/catalog/catalog-filters";
import { CatalogPagination } from "@/components/store/catalog/catalog-pagination";
import { CatalogTracker } from "@/components/analytics/catalog-tracker";
import { listProducts } from "@/modules/catalog/queries";
import { parseCatalogParams, toCatalogParamArray, type RawSearchParams } from "@/modules/catalog/params";
import type { ProductListParams } from "@/modules/catalog/queries";

interface CatalogViewProps {
  title: string;
  basePath: string;
  searchParams: RawSearchParams;
  fixedCategorySlug?: string;
  overrides?: Partial<ProductListParams>;
}

export async function CatalogView({
  title,
  basePath,
  searchParams,
  fixedCategorySlug,
  overrides,
}: CatalogViewProps) {
  // fixedCategorySlug é só o pré-selecionado ao entrar na página (ex.: /acessorios já chega
  // com "Acessórios" marcado) — se o cliente mexer no filtro de categoria, a escolha dele vale
  // sozinha, sem continuar somando com a categoria fixa por baixo (senão marcar outra categoria
  // só restringe/zera o resultado em vez de trocar o que é mostrado).
  const hasExplicitCategoryFilter = toCatalogParamArray(searchParams.categoria).length > 0;
  const params = parseCatalogParams(searchParams, {
    ...(hasExplicitCategoryFilter ? {} : { categorySlug: fixedCategorySlug }),
    ...overrides,
  });

  const { items, total, page, pageCount } = await listProducts(params);

  return (
    <Container className="py-10">
      <CatalogTracker
        listName={title}
        searchTerm={params.search}
        resultCount={total}
        items={items.map((item) => ({
          id: item.id,
          name: item.name,
          brand: item.brand.name,
          price: Number(item.price.toString()),
        }))}
      />
      <nav aria-label="Breadcrumb" className="text-xs text-fa-black/50">
        <Link href="/" className="hover:text-fa-gold">
          Início
        </Link>{" "}
        / <span className="text-fa-black">{title}</span>
      </nav>

      <div className="mt-3 flex items-baseline justify-between">
        <h1 className="font-display text-3xl text-fa-black">{title}</h1>
        <p className="text-sm text-fa-black/50">
          {total} {total === 1 ? "produto" : "produtos"}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-[240px_1fr]">
        <aside>
          <CatalogFilters searchParams={searchParams} />
        </aside>

        <div>
          {items.length === 0 ? (
            <div className="border border-dashed border-fa-stone/40 py-20 text-center">
              <p className="font-display text-lg text-fa-black">Nenhum produto encontrado</p>
              <p className="mt-2 text-sm text-fa-black/60">
                Tente ajustar os filtros ou buscar por outro termo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
              {items.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index === 0} />
              ))}
            </div>
          )}

          <CatalogPagination basePath={basePath} searchParams={searchParams} page={page} pageCount={pageCount} />
        </div>
      </div>
    </Container>
  );
}
