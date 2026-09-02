import type { Metadata } from "next";
import { listInventoryForAdmin } from "@/modules/admin/inventory-queries";
import { StockAdjustForm } from "@/components/admin/inventory/stock-adjust-form";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Estoque | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; low?: string }>;
}) {
  const { q, low } = await searchParams;
  const variants = await listInventoryForAdmin({ search: q?.trim(), lowStockOnly: low === "1" });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-fa-black">Estoque</h1>
        <p className="text-sm text-fa-black/60">{variants.length} variante(s)</p>
      </div>

      <form className="mt-6 flex flex-wrap items-center gap-3" action="/admin/estoque">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por produto ou SKU"
          className="h-10 w-64 rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        />
        <label className="flex items-center gap-2 text-sm text-fa-black/70">
          <input type="checkbox" name="low" value="1" defaultChecked={low === "1"} />
          Só estoque baixo
        </label>
        <button
          type="submit"
          className="h-10 rounded-sm bg-fa-black px-4 text-xs font-medium uppercase tracking-wide text-fa-white hover:bg-fa-gold hover:text-fa-black"
        >
          Filtrar
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-sm border border-fa-stone/15 bg-fa-white shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-fa-stone/15 text-xs uppercase tracking-wide text-fa-black/50">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Mínimo</th>
              <th className="px-4 py-3">Ajustar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fa-stone/10">
            {variants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-fa-black/50">
                  Nenhuma variante encontrada.
                </td>
              </tr>
            )}
            {variants.map((variant) => {
              const isLow = variant.stockQty <= variant.minStockQty;
              return (
                <tr key={variant.id} className="hover:bg-fa-off-white/60">
                  <td className="px-4 py-3 text-fa-black">
                    {variant.product.name}
                    <span className="ml-2 text-xs text-fa-black/40">{variant.volumeMl}ml</span>
                    <br />
                    <span className="text-xs text-fa-black/40">{variant.product.brand.name}</span>
                  </td>
                  <td className="px-4 py-3 text-fa-black/60">{variant.sku}</td>
                  <td className="px-4 py-3">
                    {isLow ? (
                      <Badge variant="danger">{variant.stockQty} unid.</Badge>
                    ) : (
                      <span className="text-fa-black">{variant.stockQty} unid.</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-fa-black/60">{variant.minStockQty}</td>
                  <td className="px-4 py-3">
                    <StockAdjustForm variantId={variant.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
