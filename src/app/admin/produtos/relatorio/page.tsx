import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getProductsReport } from "@/modules/admin/products-queries";
import { formatPrice } from "@/lib/format";
import { PrintButton } from "@/components/admin/print-button";

export const metadata: Metadata = {
  title: "Relatório de produtos | Admin",
};

export const dynamic = "force-dynamic";

function parseDateInput(value: string | undefined, endOfDay = false): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function ProductsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; de?: string; ate?: string }>;
}) {
  const { categoria, de, ate } = await searchParams;

  const [categories, rows] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getProductsReport({
      categoryId: categoria || undefined,
      dateFrom: parseDateInput(de),
      dateTo: parseDateInput(ate, true),
    }),
  ]);

  const totals = rows.reduce(
    (acc, row) => ({
      cost: acc.cost + row.costPrice,
      price: acc.price + row.price,
      margin: acc.margin + row.marginValue,
    }),
    { cost: 0, price: 0, margin: 0 },
  );
  const averageMarginPercent = totals.price > 0 ? (totals.margin / totals.price) * 100 : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-fa-black">Relatório de produtos</h1>
          <p className="mt-1 text-sm text-fa-black/60 print:hidden">{rows.length} produto(s) no filtro atual</p>
          <p className="mt-1 hidden text-sm text-fa-black/60 print:block">
            {rows.length} produto(s) — gerado em{" "}
            {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(new Date())}
          </p>
        </div>
        <div className="flex items-center gap-4 print:hidden">
          <PrintButton />
          <Link
            href="/admin/produtos"
            className="text-xs font-medium uppercase tracking-wide text-fa-black/60 hover:text-fa-gold"
          >
            ← Voltar para produtos
          </Link>
        </div>
      </div>

      <form className="mt-6 flex flex-wrap items-end gap-4 print:hidden" action="/admin/produtos/relatorio">
        <div>
          <label htmlFor="categoria" className="block text-xs font-medium text-fa-black/70">
            Categoria
          </label>
          <select
            id="categoria"
            name="categoria"
            defaultValue={categoria ?? ""}
            className="mt-1 h-10 w-52 rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="de" className="block text-xs font-medium text-fa-black/70">
            Cadastrado de
          </label>
          <input
            id="de"
            type="date"
            name="de"
            defaultValue={de ?? ""}
            className="mt-1 h-10 rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="ate" className="block text-xs font-medium text-fa-black/70">
            até
          </label>
          <input
            id="ate"
            type="date"
            name="ate"
            defaultValue={ate ?? ""}
            className="mt-1 h-10 rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="h-10 rounded-sm bg-fa-black px-5 text-xs font-medium uppercase tracking-wide text-fa-white hover:bg-fa-gold hover:text-fa-black"
        >
          Filtrar
        </button>
        {(categoria || de || ate) && (
          <Link
            href="/admin/produtos/relatorio"
            className="text-xs font-medium text-fa-gold underline hover:text-fa-black"
          >
            Limpar filtros
          </Link>
        )}
      </form>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-sm border border-fa-stone/15 bg-fa-white p-4 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
          <p className="text-xs uppercase tracking-wide text-fa-black/50">Produtos</p>
          <p className="mt-1 text-lg font-semibold text-fa-black">{rows.length}</p>
        </div>
        <div className="rounded-sm border border-fa-stone/15 bg-fa-white p-4 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
          <p className="text-xs uppercase tracking-wide text-fa-black/50">Custo total</p>
          <p className="mt-1 text-lg font-semibold text-fa-black">{formatPrice(totals.cost)}</p>
        </div>
        <div className="rounded-sm border border-fa-stone/15 bg-fa-white p-4 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
          <p className="text-xs uppercase tracking-wide text-fa-black/50">Valor de venda total</p>
          <p className="mt-1 text-lg font-semibold text-fa-black">{formatPrice(totals.price)}</p>
        </div>
        <div className="rounded-sm border border-fa-stone/15 bg-fa-white p-4 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
          <p className="text-xs uppercase tracking-wide text-fa-black/50">Margem média</p>
          <p className="mt-1 text-lg font-semibold text-fa-black">
            {formatPrice(totals.margin)} ({averageMarginPercent.toFixed(1)}%)
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-sm border border-fa-stone/15 bg-fa-white shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)] print:border-none print:shadow-none">
        <table className="w-full min-w-[960px] text-left text-sm print:min-w-0 print:text-xs">
          <thead className="border-b border-fa-stone/15 text-xs uppercase tracking-wide text-fa-black/50">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Marca</th>
              <th className="px-4 py-3">Código de barras</th>
              <th className="px-4 py-3">Custo</th>
              <th className="px-4 py-3">Valor de venda</th>
              <th className="px-4 py-3">Margem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fa-stone/10">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-fa-black/50">
                  Nenhum produto encontrado para esse filtro.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-fa-off-white/60">
                <td className="px-4 py-3 text-fa-black">{row.name}</td>
                <td className="px-4 py-3 text-fa-black/60">
                  {row.categoryNames.length > 0 ? row.categoryNames.join(", ") : "—"}
                </td>
                <td className="px-4 py-3 text-fa-black/60">{row.brandName}</td>
                <td className="px-4 py-3 text-fa-black/60">
                  {row.barcodes.length > 0 ? row.barcodes.join(", ") : "—"}
                </td>
                <td className="px-4 py-3 text-fa-black">{formatPrice(row.costPrice)}</td>
                <td className="px-4 py-3 text-fa-black">{formatPrice(row.price)}</td>
                <td className="px-4 py-3 text-fa-black">
                  {formatPrice(row.marginValue)}{" "}
                  <span className="text-fa-black/50">({row.marginPercent.toFixed(1)}%)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
