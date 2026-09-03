import type { Metadata } from "next";
import Link from "next/link";
import { listProductsForAdmin } from "@/modules/admin/products-queries";
import { toggleProductActiveAction } from "@/modules/admin/products-actions";
import { ProductDeleteButton } from "@/components/admin/products/product-delete-button";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Produtos | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const { products, total, pageCount } = await listProductsForAdmin({ search: q?.trim(), page: currentPage });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-fa-black">Produtos</h1>
        <ButtonLink href="/admin/produtos/novo" className="px-4 py-2 text-xs">
          Novo produto
        </ButtonLink>
      </div>
      <p className="mt-1 text-sm text-fa-black/60">{total} produto(s)</p>

      <form className="mt-6" action="/admin/produtos">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome ou marca"
          className="h-10 w-72 rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-sm border border-fa-stone/15 bg-fa-white shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-fa-stone/15 text-xs uppercase tracking-wide text-fa-black/50">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Marca</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-fa-stone/10">
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-fa-black/50">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
            {products.map((product) => {
              const totalStock = product.variants.reduce((sum, v) => sum + v.stockQty, 0);
              const isLowStock = product.variants.some((v) => v.stockQty <= v.minStockQty);
              return (
                <tr key={product.id} className="hover:bg-fa-off-white/60">
                  <td className="px-4 py-3 text-fa-black">{product.name}</td>
                  <td className="px-4 py-3 text-fa-black/60">{product.brand.name}</td>
                  <td className="px-4 py-3 text-fa-black">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    {isLowStock ? (
                      <Badge variant="danger">{totalStock} unid.</Badge>
                    ) : (
                      <span className="text-fa-black">{totalStock} unid.</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={product.isActive ? "success" : "outline"}>
                      {product.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/produtos/${product.id}`} className="text-fa-gold hover:underline">
                      Editar
                    </Link>
                    <form action={toggleProductActiveAction} className="ml-4 inline">
                      <input type="hidden" name="productId" value={product.id} />
                      <button type="submit" className="text-fa-black/60 hover:underline">
                        {product.isActive ? "Desativar" : "Ativar"}
                      </button>
                    </form>
                    <span className="ml-4 inline">
                      <ProductDeleteButton productId={product.id} productName={product.name} />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="mt-4 flex justify-center gap-2 text-sm">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/produtos?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`}
              className={`rounded-sm px-3 py-1 ${
                p === currentPage ? "bg-fa-black text-fa-white" : "border border-fa-stone/30 text-fa-black/70"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
