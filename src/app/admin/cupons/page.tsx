import type { Metadata } from "next";
import Link from "next/link";
import { listCouponsForAdmin } from "@/modules/admin/coupons-queries";
import { toggleCouponActiveAction } from "@/modules/admin/coupons-actions";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Cupons | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await listCouponsForAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-fa-black">Cupons</h1>
        <ButtonLink href="/admin/cupons/novo" className="px-4 py-2 text-xs">
          Novo cupom
        </ButtonLink>
      </div>

      <div className="mt-6 overflow-x-auto rounded-sm border border-fa-stone/15 bg-fa-white shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-fa-stone/15 text-xs uppercase tracking-wide text-fa-black/50">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Desconto</th>
              <th className="px-4 py-3">Usos</th>
              <th className="px-4 py-3">Validade</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-fa-stone/10">
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-fa-black/50">
                  Nenhum cupom cadastrado.
                </td>
              </tr>
            )}
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-fa-off-white/60">
                <td className="px-4 py-3 font-medium text-fa-black">{coupon.code}</td>
                <td className="px-4 py-3 text-fa-black/70">
                  {coupon.type === "PERCENTAGE" ? `${coupon.value.toString()}%` : formatPrice(coupon.value)}
                </td>
                <td className="px-4 py-3 text-fa-black/60">
                  {coupon._count.usages}
                  {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                </td>
                <td className="px-4 py-3 text-fa-black/60">
                  {coupon.endsAt
                    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(coupon.endsAt)
                    : "Sem validade"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={coupon.isActive ? "success" : "outline"}>
                    {coupon.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/cupons/${coupon.id}`} className="text-fa-gold hover:underline">
                    Editar
                  </Link>
                  <form action={toggleCouponActiveAction} className="ml-4 inline">
                    <input type="hidden" name="couponId" value={coupon.id} />
                    <button type="submit" className="text-fa-black/60 hover:underline">
                      {coupon.isActive ? "Desativar" : "Ativar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
