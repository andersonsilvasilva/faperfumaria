import type { Metadata } from "next";
import Link from "next/link";
import { listBrandsForAdmin } from "@/modules/admin/brands-queries";
import { deleteBrandAction } from "@/modules/admin/brands-actions";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Marcas | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const brands = await listBrandsForAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-fa-black">Marcas</h1>
        <ButtonLink href="/admin/marcas/novo" className="px-4 py-2 text-xs">
          Nova marca
        </ButtonLink>
      </div>

      <div className="mt-6 overflow-x-auto rounded-sm border border-fa-stone/15 bg-fa-white shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-fa-stone/15 text-xs uppercase tracking-wide text-fa-black/50">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Produtos</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-fa-stone/10">
            {brands.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-fa-black/50">
                  Nenhuma marca cadastrada.
                </td>
              </tr>
            )}
            {brands.map((brand) => (
              <tr key={brand.id} className="hover:bg-fa-off-white/60">
                <td className="px-4 py-3 text-fa-black">{brand.name}</td>
                <td className="px-4 py-3 text-fa-black/60">{brand._count.products}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/marcas/${brand.id}`} className="text-fa-gold hover:underline">
                    Editar
                  </Link>
                  <form action={deleteBrandAction} className="ml-4 inline">
                    <input type="hidden" name="brandId" value={brand.id} />
                    <button type="submit" className="text-red-600 hover:underline">
                      Excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-fa-black/40">
        Marcas com produtos vinculados não podem ser excluídas — remova ou realoque os produtos
        primeiro.
      </p>
    </div>
  );
}
