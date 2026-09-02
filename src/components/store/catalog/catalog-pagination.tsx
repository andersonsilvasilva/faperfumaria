import Link from "next/link";
import { buildCatalogQueryString, type RawSearchParams } from "@/modules/catalog/params";

interface CatalogPaginationProps {
  basePath: string;
  searchParams: RawSearchParams;
  page: number;
  pageCount: number;
}

export function CatalogPagination({ basePath, searchParams, page, pageCount }: CatalogPaginationProps) {
  if (pageCount <= 1) return null;

  const hrefFor = (targetPage: number) =>
    `${basePath}?${buildCatalogQueryString(searchParams, { pagina: String(targetPage) })}`;

  return (
    <nav aria-label="Paginação" className="mt-10 flex items-center justify-center gap-4">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="text-sm font-medium text-fa-black hover:text-fa-gold">
          ← Anterior
        </Link>
      ) : (
        <span className="text-sm text-fa-black/30">← Anterior</span>
      )}

      <span className="text-sm text-fa-black/60">
        Página {page} de {pageCount}
      </span>

      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className="text-sm font-medium text-fa-black hover:text-fa-gold">
          Próxima →
        </Link>
      ) : (
        <span className="text-sm text-fa-black/30">Próxima →</span>
      )}
    </nav>
  );
}
