import type { Metadata } from "next";
import { createBrandAction } from "@/modules/admin/brands-actions";
import { BrandForm } from "@/components/admin/brands/brand-form";

export const metadata: Metadata = {
  title: "Nova marca | Admin",
};

export default function NewBrandPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Nova marca</h1>
      <div className="mt-6">
        <BrandForm action={createBrandAction} />
      </div>
    </div>
  );
}
