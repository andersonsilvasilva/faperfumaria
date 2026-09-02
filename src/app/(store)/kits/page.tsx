import type { Metadata } from "next";
import { CatalogView } from "@/components/store/catalog/catalog-view";
import type { RawSearchParams } from "@/modules/catalog/params";

export const metadata: Metadata = { title: "Kits & Presentes" };

export default async function KitsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <CatalogView
      title="Kits & Presentes"
      basePath="/kits"
      searchParams={resolvedSearchParams}
      fixedCategorySlug="kit"
    />
  );
}
