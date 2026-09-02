import type { Metadata } from "next";
import { CatalogView } from "@/components/store/catalog/catalog-view";
import type { RawSearchParams } from "@/modules/catalog/params";

export const metadata: Metadata = { title: "Perfumes Femininos" };

export default async function FemininosPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <CatalogView
      title="Perfumes Femininos"
      basePath="/femininos"
      searchParams={resolvedSearchParams}
      fixedCategorySlug="feminino"
    />
  );
}
