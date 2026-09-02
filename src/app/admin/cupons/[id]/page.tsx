import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCouponForAdmin, getCouponFormOptions } from "@/modules/admin/coupons-queries";
import { updateCouponAction } from "@/modules/admin/coupons-actions";
import { CouponForm } from "@/components/admin/coupons/coupon-form";

export const metadata: Metadata = {
  title: "Editar cupom | Admin",
};

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [coupon, categoryOptions] = await Promise.all([getCouponForAdmin(id), getCouponFormOptions()]);
  if (!coupon) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Editar cupom</h1>
      <div className="mt-6">
        <CouponForm action={updateCouponAction.bind(null, id)} coupon={coupon} categoryOptions={categoryOptions} />
      </div>
    </div>
  );
}
