import type { Metadata } from "next";
import { CatalogView } from "@/components/store/catalog/catalog-view";
import type { RawSearchParams } from "@/modules/catalog/params";

export const metadata: Metadata = { title: "Decants" };

export default async function DecantsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <CatalogView
      title="Decants"
      basePath="/decants"
      searchParams={resolvedSearchParams}
      fixedCategorySlug="decant"
    />
  );
}
