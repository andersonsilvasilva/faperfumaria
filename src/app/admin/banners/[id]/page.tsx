import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBannerForAdmin } from "@/modules/admin/banners-queries";
import { updateBannerAction } from "@/modules/admin/banners-actions";
import { BannerForm } from "@/components/admin/banners/banner-form";

export const metadata: Metadata = {
  title: "Editar banner | Admin",
};

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const banner = await getBannerForAdmin(id);
  if (!banner) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Editar banner</h1>
      <div className="mt-6">
        <BannerForm action={updateBannerAction.bind(null, id)} banner={banner} />
      </div>
    </div>
  );
}
