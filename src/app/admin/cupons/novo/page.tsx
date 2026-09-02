import type { Metadata } from "next";
import { getCouponFormOptions } from "@/modules/admin/coupons-queries";
import { createCouponAction } from "@/modules/admin/coupons-actions";
import { CouponForm } from "@/components/admin/coupons/coupon-form";

export const metadata: Metadata = {
  title: "Novo cupom | Admin",
};

export default async function NewCouponPage() {
  const categoryOptions = await getCouponFormOptions();

  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Novo cupom</h1>
      <div className="mt-6">
        <CouponForm action={createCouponAction} categoryOptions={categoryOptions} />
      </div>
    </div>
  );
}
