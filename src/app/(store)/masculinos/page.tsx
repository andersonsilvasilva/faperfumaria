import type { Metadata } from "next";
import { CatalogView } from "@/components/store/catalog/catalog-view";
import type { RawSearchParams } from "@/modules/catalog/params";

export const metadata: Metadata = { title: "Perfumes Masculinos" };

export default async function MasculinosPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <CatalogView
      title="Perfumes Masculinos"
      basePath="/masculinos"
      searchParams={resolvedSearchParams}
      fixedCategorySlug="masculino"
    />
  );
}
