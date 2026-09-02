import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductForAdmin, getProductFormOptions } from "@/modules/admin/products-queries";
import { updateProductAction } from "@/modules/admin/products-actions";
import { ProductForm } from "@/components/admin/products/product-form";

export const metadata: Metadata = {
  title: "Editar produto | Admin",
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, options] = await Promise.all([getProductForAdmin(id), getProductFormOptions()]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Editar produto</h1>
      <div className="mt-6">
        <ProductForm action={updateProductAction.bind(null, id)} product={product} options={options} />
      </div>
    </div>
  );
}
