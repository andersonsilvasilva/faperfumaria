import type { Metadata } from "next";
import { listCategoryOptions } from "@/modules/admin/categories-queries";
import { createCategoryAction } from "@/modules/admin/categories-actions";
import { CategoryForm } from "@/components/admin/categories/category-form";

export const metadata: Metadata = {
  title: "Nova categoria | Admin",
};

export default async function NewCategoryPage() {
  const parentOptions = await listCategoryOptions();

  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Nova categoria</h1>
      <div className="mt-6">
        <CategoryForm action={createCategoryAction} parentOptions={parentOptions} />
      </div>
    </div>
  );
}
