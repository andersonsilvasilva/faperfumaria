import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryForAdmin, listCategoryOptions } from "@/modules/admin/categories-queries";
import { updateCategoryAction } from "@/modules/admin/categories-actions";
import { CategoryForm } from "@/components/admin/categories/category-form";

export const metadata: Metadata = {
  title: "Editar categoria | Admin",
};

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, parentOptions] = await Promise.all([
    getCategoryForAdmin(id),
    listCategoryOptions(id),
  ]);
  if (!category) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Editar categoria</h1>
      <div className="mt-6">
        <CategoryForm
          action={updateCategoryAction.bind(null, id)}
          category={category}
          parentOptions={parentOptions}
        />
      </div>
    </div>
  );
}
