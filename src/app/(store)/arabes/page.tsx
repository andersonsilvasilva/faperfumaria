import type { Metadata } from "next";
import { CatalogView } from "@/components/store/catalog/catalog-view";
import type { RawSearchParams } from "@/modules/catalog/params";

export const metadata: Metadata = { title: "Perfumes Árabes" };

export default async function ArabesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <CatalogView
      title="Perfumes Árabes"
      basePath="/arabes"
      searchParams={resolvedSearchParams}
      fixedCategorySlug="arabe"
    />
  );
}
