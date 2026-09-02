import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CatalogView } from "@/components/store/catalog/catalog-view";
import type { RawSearchParams } from "@/modules/catalog/params";

export const metadata: Metadata = { title: "Buscar" };

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";

  return (
    <>
      <Container className="pt-10">
        <form method="GET" className="mx-auto flex max-w-xl gap-2">
          <label htmlFor="search-q" className="sr-only">
            Buscar produtos
          </label>
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Buscar por nome, marca, categoria..."
            className="w-full border border-fa-stone/40 bg-fa-white px-4 py-3 text-sm focus:border-fa-gold focus:outline-none"
          />
          <button
            type="submit"
            className="bg-fa-black px-6 text-xs font-medium uppercase tracking-wide text-fa-white hover:bg-fa-gold hover:text-fa-black"
          >
            Buscar
          </button>
        </form>
      </Container>

      {query ? (
        <CatalogView
          title={`Resultados para "${query}"`}
          basePath="/buscar"
          searchParams={resolvedSearchParams}
        />
      ) : (
        <Container className="py-20 text-center text-fa-black/60">
          Digite um termo para buscar perfumes, marcas ou categorias.
        </Container>
      )}
    </>
  );
}
