import type { Metadata } from "next";
import { getProductFormOptions } from "@/modules/admin/products-queries";
import { createProductAction } from "@/modules/admin/products-actions";
import { ProductForm } from "@/components/admin/products/product-form";

export const metadata: Metadata = {
  title: "Novo produto | Admin",
};

export default async function NewProductPage() {
  const options = await getProductFormOptions();

  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Novo produto</h1>
      <div className="mt-6">
        <ProductForm action={createProductAction} options={options} />
      </div>
    </div>
  );
}
