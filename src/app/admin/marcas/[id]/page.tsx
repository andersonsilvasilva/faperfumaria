import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandForAdmin } from "@/modules/admin/brands-queries";
import { updateBrandAction } from "@/modules/admin/brands-actions";
import { BrandForm } from "@/components/admin/brands/brand-form";

export const metadata: Metadata = {
  title: "Editar marca | Admin",
};

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await getBrandForAdmin(id);
  if (!brand) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Editar marca</h1>
      <div className="mt-6">
        <BrandForm action={updateBrandAction.bind(null, id)} brand={brand} />
      </div>
    </div>
  );
}
