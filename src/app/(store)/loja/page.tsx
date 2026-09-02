import type { Metadata } from "next";
import { CatalogView } from "@/components/store/catalog/catalog-view";
import type { RawSearchParams } from "@/modules/catalog/params";

export const metadata: Metadata = {
  title: "Loja",
};

export default async function LojaPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  return <CatalogView title="Loja" basePath="/loja" searchParams={resolvedSearchParams} />;
}
