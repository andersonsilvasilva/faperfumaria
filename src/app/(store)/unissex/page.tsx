import type { Metadata } from "next";
import { CatalogView } from "@/components/store/catalog/catalog-view";
import type { RawSearchParams } from "@/modules/catalog/params";

export const metadata: Metadata = { title: "Perfumes Unissex" };

export default async function UnissexPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <CatalogView
      title="Perfumes Unissex"
      basePath="/unissex"
      searchParams={resolvedSearchParams}
      fixedCategorySlug="unissex"
    />
  );
}
