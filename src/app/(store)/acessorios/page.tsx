import type { Metadata } from "next";
import { CatalogView } from "@/components/store/catalog/catalog-view";
import type { RawSearchParams } from "@/modules/catalog/params";

export const metadata: Metadata = { title: "Acessórios" };

export default async function AcessoriosPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <CatalogView
      title="Acessórios"
      basePath="/acessorios"
      searchParams={resolvedSearchParams}
      fixedCategorySlug="acessorios"
    />
  );
}
