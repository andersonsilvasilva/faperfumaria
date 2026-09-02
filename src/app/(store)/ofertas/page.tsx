import type { Metadata } from "next";
import { CatalogView } from "@/components/store/catalog/catalog-view";
import type { RawSearchParams } from "@/modules/catalog/params";

export const metadata: Metadata = { title: "Ofertas" };

export default async function OfertasPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <CatalogView
      title="Ofertas"
      basePath="/ofertas"
      searchParams={resolvedSearchParams}
      overrides={{ onSale: true }}
    />
  );
}
