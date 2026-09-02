import type { Metadata } from "next";
import { createBannerAction } from "@/modules/admin/banners-actions";
import { BannerForm } from "@/components/admin/banners/banner-form";

export const metadata: Metadata = {
  title: "Novo banner | Admin",
};

export default function NewBannerPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Novo banner</h1>
      <div className="mt-6">
        <BannerForm action={createBannerAction} />
      </div>
    </div>
  );
}
